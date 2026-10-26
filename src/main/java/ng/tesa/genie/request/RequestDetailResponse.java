package ng.tesa.genie.request;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;
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
