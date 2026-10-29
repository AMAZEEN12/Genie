package ng.tesa.genie.request;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.common.ConflictException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.common.ForbiddenException;
import ng.tesa.genie.common.NotFoundException;

@RestController
@RequestMapping("/api/v1/requests")
public class RequestController {

    private final RequestWorkflowService workflow;
    private final RequestRepository requests;
    private final HistoryRepository history;

    public RequestController(RequestWorkflowService workflow, RequestRepository requests,
                             HistoryRepository history) {
        this.workflow = workflow;
        this.requests = requests;
        this.history = history;
    }

    public record CreateRequestDto(
            @NotBlank(message = "is required") @Size(min = 3, max = 200, message = "must be between 3 and 200 characters") String title,
            @NotBlank(message = "is required") @Size(min = 3, message = "must be at least 3 characters") String description,
            @NotBlank(message = "is required") @Size(max = 100, message = "must be at most 100 characters") String building,
            @NotBlank(message = "is required") @Size(max = 100, message = "must be at most 100 characters") String location,
            @NotBlank(message = "is required") @Size(max = 100, message = "must be at most 100 characters") String equipment,
            @NotBlank(message = "is required") @Size(max = 50, message = "must be at most 50 characters") String category,
            @NotBlank(message = "is required") String priority
    ) {
    }

    public record AssignRequestDto(
            @NotNull(message = "is required") UUID technicianId,
            @NotNull(message = "is required") Instant deadline,
            @NotNull(message = "is required") @Min(value = 1, message = "must be >= 1") Integer version
    ) {
    }

    public record TransitionDto(
            @NotBlank(message = "is required") String type,
            String reason,
            String workDone,
            Long actualCostKobo,
            LocalDate completedOn
    ) {
    }

    public record OverrideReviewDto(
            @NotBlank(message = "is required") String review,
            String note
    ) {
    }

    @GetMapping
    public List<RequestSummaryResponse> listRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID technicianId,
            @RequestParam(required = false) Boolean override,
            @AuthenticationPrincipal CurrentUser user) {
        UUID reportedBy = null;
        if (user.role() == Role.EMPLOYEE) {
            reportedBy = user.id();
        }
        return requests.search(status, category, priority, technicianId, override, reportedBy).stream()
                .map(RequestSummaryResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RequestDetailResponse> createRequest(
            @RequestHeader("Idempotency-Key") UUID idempotencyKey,
            @Valid @RequestBody CreateRequestDto body,
            @AuthenticationPrincipal CurrentUser user) {
        MaintenanceRequest created = workflow.createRequest(
                body.title(), body.description(), body.building(), body.location(),
                body.equipment(), body.category(), body.priority(), idempotencyKey, user
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(RequestDetailResponse.forViewer(created, user));
    }

    @GetMapping("/{id}")
    public RequestDetailResponse getRequest(@PathVariable UUID id, @AuthenticationPrincipal CurrentUser user) {
        MaintenanceRequest req = workflow.getRequestWithDetails(id);
        assertCanView(req, user);
        return RequestDetailResponse.forViewer(req, user);
    }

    @PutMapping("/{id}/assignment")
    public RequestDetailResponse assignTechnician(
            @PathVariable UUID id,
            @Valid @RequestBody AssignRequestDto body,
            @AuthenticationPrincipal CurrentUser user) {
        if (user.role() != Role.MANAGER) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only managers can assign technicians.");
        }
        return RequestDetailResponse.forViewer(
                workflow.assignTechnician(id, body.technicianId(), body.deadline(), body.version(), user), user);
    }

    @PostMapping("/{id}/transitions")
    public RequestDetailResponse applyTransition(
            @PathVariable UUID id,
            @Valid @RequestBody TransitionDto body,
            @AuthenticationPrincipal CurrentUser user) {
        String type = body.type().trim().toUpperCase();
        MaintenanceRequest request = switch (type) {
            case "START" -> {
                if (user.role() != Role.TECHNICIAN) {
                    throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only technicians can start work.");
                }
                yield workflow.startWork(id, user);
            }
            case "OVERRIDE_START" -> {
                if (user.role() != Role.MANAGER) {
                    throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only managers can initiate an urgent override.");
                }
                yield workflow.startUrgentOverride(id, body.reason(), user);
            }
            case "COMPLETE" -> {
                if (user.role() != Role.TECHNICIAN) {
                    throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only technicians can complete work.");
                }
                if (body.workDone() == null || body.workDone().isBlank()) {
                    throw new ConflictException(ErrorCode.VALIDATION_FAILED, "workDone is required.");
                }
                if (body.actualCostKobo() == null || body.actualCostKobo() < 0) {
                    throw new ConflictException(ErrorCode.VALIDATION_FAILED, "actualCostKobo must be >= 0.");
                }
                if (body.completedOn() == null) {
                    throw new ConflictException(ErrorCode.VALIDATION_FAILED, "completedOn is required.");
                }
                yield workflow.completeWork(id, body.workDone(), body.actualCostKobo(), body.completedOn(), user);
            }
            case "VERIFY" -> {
                if (user.role() != Role.MANAGER) {
                    throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only managers can verify and close requests.");
                }
                yield workflow.verifyAndClose(id, user);
            }
            default -> throw new ConflictException(ErrorCode.VALIDATION_FAILED, "Unknown transition type: " + body.type());
        };
        return RequestDetailResponse.forViewer(request, user);
    }

    @PutMapping("/{id}/override-review")
    public RequestDetailResponse reviewOverride(
            @PathVariable UUID id,
            @Valid @RequestBody OverrideReviewDto body,
            @AuthenticationPrincipal CurrentUser user) {
        if (user.role() != Role.FINANCE) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN, "Only finance can review overrides.");
        }
        return RequestDetailResponse.forViewer(workflow.reviewOverride(id, body.review(), body.note(), user), user);
    }

    @GetMapping("/{id}/history")
    public List<StatusHistoryEntry> getHistory(
            @PathVariable UUID id,
            @AuthenticationPrincipal CurrentUser user) {
        MaintenanceRequest request = requests.findById(id)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found: " + id));
        assertCanView(request, user);
        return history.findByRequestId(id).stream().map(entry -> entry.visibleTo(user)).toList();
    }

    private static void assertCanView(MaintenanceRequest request, CurrentUser user) {
        if (user.role() == Role.EMPLOYEE && !request.reportedBy().id().equals(user.id())) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN,
                    "Employees can only view their own reported requests.");
        }
    }
}
