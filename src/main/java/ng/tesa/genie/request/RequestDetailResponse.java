package ng.tesa.genie.request;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.estimate.Estimate;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RequestDetailResponse(
        UUID id,
        String reference,
        String title,
        String description,
        String building,
        String location,
        String equipment,
        String category,
        String priority,
        String status,
        CurrentUser reportedBy,
        Instant reportedAt,
        CurrentUser technician,
        CurrentUser assignedBy,
        Instant deadline,
        boolean override,
        String overrideReason,
        CurrentUser overrideBy,
        String overrideReview,
        CurrentUser overrideReviewedBy,
        String overrideReviewNote,
        String workDone,
        Long actualCostKobo,
        LocalDate completedOn,
        CurrentUser verifiedBy,
        Instant verifiedAt,
        int version,
        List<Estimate> estimates,
        List<StatusHistoryEntry> history
) {
    /**
     * The response for one caller. MVP feedback item 1: an EMPLOYEE gets no cost data: no
     * estimates (an empty list, since the contract requires the field), no actual cost, no finance
     * review of an override, and only their own history notes. Other roles get everything.
     */
    public static RequestDetailResponse forViewer(MaintenanceRequest request, CurrentUser viewer) {
        RequestDetailResponse full = from(request);
        if (viewer == null || viewer.role() != Role.EMPLOYEE) {
            return full;
        }
        return new RequestDetailResponse(
                full.id(), full.reference(), full.title(), full.description(), full.building(), full.location(),
                full.equipment(), full.category(), full.priority(), full.status(), full.reportedBy(),
                full.reportedAt(), full.technician(), full.assignedBy(), full.deadline(), full.override(),
                full.overrideReason(), full.overrideBy(), null, null, null, full.workDone(),
                null, full.completedOn(), full.verifiedBy(), full.verifiedAt(), full.version(),
                List.of(),
                full.history().stream().map(entry -> entry.visibleTo(viewer)).toList()
        );
    }

    public static RequestDetailResponse from(MaintenanceRequest request) {
        return new RequestDetailResponse(
                request.id(), request.reference(), request.title(), request.description(),
                request.building(), request.location(), request.equipment(), request.category(),
                request.priority(), request.status(), request.reportedBy(), request.reportedAt(),
                request.technician(), request.assignedBy(), request.deadline(), request.override(),
                request.overrideReason(), request.overrideBy(), request.overrideReview(),
                request.overrideReviewedBy(), request.overrideReviewNote(), request.workDone(),
                request.actualCostKobo(), request.completedOn(), request.verifiedBy(),
                request.verifiedAt(), request.version(), List.copyOf(request.estimates()),
                List.copyOf(request.history())
        );
    }
}
