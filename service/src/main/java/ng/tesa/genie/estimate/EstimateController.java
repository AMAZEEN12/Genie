package ng.tesa.genie.estimate;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.common.ForbiddenException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.request.RequestWorkflowService;

@RestController
@RequestMapping("/api/v1")
public class EstimateController {

    private final RequestWorkflowService workflow;

    public EstimateController(RequestWorkflowService workflow) {
        this.workflow = workflow;
    }

    /**
     * Contract {@code CreateEstimateRequest}. {@code lines} (MVP feedback item 6) is optional for
     * backward compatibility; when present, the lines must add up to {@code amountKobo}.
     */
    public record CreateEstimateDto(
            @NotNull(message = "is required") @Min(value = 1, message = "must be > 0") Long amountKobo,
            @Size(min = 1, max = 20, message = "must have between 1 and 20 lines") List<@Valid @NotNull LineDto> lines
    ) {
    }

    /** Contract {@code EstimateLineInput}. */
    public record LineDto(
            @NotNull(message = "is required")
            @Pattern(regexp = "LABOUR|MATERIALS|OTHER", message = "must be LABOUR, MATERIALS or OTHER") String category,
            @NotBlank(message = "is required") @Size(max = 120, message = "must be at most 120 characters") String description,
            @NotNull(message = "is required") @Min(value = 1, message = "must be > 0") Long amountKobo
    ) {
        EstimateLine toLine() {
            return new EstimateLine(category, description.trim(), amountKobo);
        }
    }

    public record EstimateDecisionDto(
            @NotBlank(message = "is required") String decision,
            String reason
    ) {
    }

    @PostMapping("/requests/{id}/estimates")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Estimate> submitEstimate(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEstimateDto body,
            @AuthenticationPrincipal CurrentUser user) {
        if (user.role() != Role.TECHNICIAN) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only technicians can submit estimates.");
        }
        List<EstimateLine> lines = body.lines() == null ? List.of()
                : body.lines().stream().map(LineDto::toLine).toList();
        Estimate estimate = workflow.submitEstimate(id, body.amountKobo(), lines, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(estimate);
    }

    @PutMapping("/estimates/{id}/decision")
    public Estimate decideEstimate(
            @PathVariable UUID id,
            @Valid @RequestBody EstimateDecisionDto body,
            @AuthenticationPrincipal CurrentUser user) {
        if (user.role() != Role.FINANCE) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only finance can approve or reject estimates.");
        }
        return workflow.decideEstimate(id, body.decision(), body.reason(), user);
    }
}
