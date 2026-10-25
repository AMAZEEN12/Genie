package ng.tesa.genie.request;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.estimate.Estimate;

public record MaintenanceRequest(
        UUID id,
        String reference,
        UUID idempotencyKey,
        String requestHash,
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
    public MaintenanceRequest withEstimatesAndHistory(List<Estimate> estimates, List<StatusHistoryEntry> history) {
        return new MaintenanceRequest(
                id, reference, idempotencyKey, requestHash, title, description,
                building, location, equipment, category, priority, status,
                reportedBy, reportedAt, technician, assignedBy, deadline,
                override, overrideReason, overrideBy, overrideReview,
                overrideReviewedBy, overrideReviewNote, workDone,
                actualCostKobo, completedOn, verifiedBy, verifiedAt, version,
                estimates, history
        );
    }
}
