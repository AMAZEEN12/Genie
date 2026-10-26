package ng.tesa.genie.request;

import java.time.Instant;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RequestSummaryResponse(
        UUID id,
        String reference,
        String title,
        String building,
        String location,
        String equipment,
        String category,
        String priority,
        String status,
        CurrentUser reportedBy,
        Instant reportedAt,
        CurrentUser technician,
        Instant deadline,
        boolean override,
        int version
) {
    public static RequestSummaryResponse from(MaintenanceRequest request) {
        return new RequestSummaryResponse(
                request.id(), request.reference(), request.title(), request.building(),
                request.location(), request.equipment(), request.category(), request.priority(),
                request.status(), request.reportedBy(), request.reportedAt(), request.technician(),
                request.deadline(), request.override(), request.version()
        );
    }
}
