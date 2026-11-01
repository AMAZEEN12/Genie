package ng.tesa.genie.receipt;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ng.tesa.genie.auth.CurrentUser;

@RestController
@RequestMapping({"/api/v1/receipts", "/api/receipts"})
public class ReceiptController {

    private final ReceiptService service;

    public ReceiptController(ReceiptService service) {
        this.service = service;
    }

    public record DecisionRequest(
            @NotNull ReceiptStatus status
    ) {
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ReceiptResponse upload(
            @AuthenticationPrincipal CurrentUser user,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        return service.uploadReceipt(user, clientIp, file);
    }

    @GetMapping
    public List<ReceiptResponse> list(@AuthenticationPrincipal CurrentUser user) {
        return service.listReceipts(user);
    }

    @GetMapping("/{id}")
    public ReceiptResponse get(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id
    ) {
        return service.getReceipt(user, id);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id
    ) {
        ReceiptService.ReceiptStreamResult result = service.getReceiptFile(user, id);

        HttpHeaders headers = new HttpHeaders();
        // Section 4 requirement: Set Cache-Control: private, no-store and X-Content-Type-Options: nosniff
        headers.set(HttpHeaders.CACHE_CONTROL, "private, no-store");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.setContentType(MediaType.parseMediaType(result.contentType()));
        headers.setContentDispositionFormData("inline", result.filename());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(result.stream()));
    }

    @PutMapping("/{id}/decision")
    public ReceiptResponse decide(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id,
            @Valid @RequestBody DecisionRequest body
    ) {
        return service.decideReceipt(user, id, body.status());
    }

    @PostMapping("/{id}/decision")
    public ReceiptResponse decidePost(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id,
            @Valid @RequestBody DecisionRequest body
    ) {
        return service.decideReceipt(user, id, body.status());
    }

    @PutMapping("/{id}/reimburse")
    public ReceiptResponse reimburse(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id
    ) {
        return service.reimburseReceipt(user, id);
    }

    @PostMapping("/{id}/reimburse")
    public ReceiptResponse reimbursePost(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id
    ) {
        return service.reimburseReceipt(user, id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal CurrentUser user,
            @PathVariable("id") UUID id
    ) {
        service.deleteReceipt(user, id);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
