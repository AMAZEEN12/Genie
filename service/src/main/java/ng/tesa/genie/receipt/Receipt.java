package ng.tesa.genie.receipt;

import java.time.Instant;
import java.util.UUID;

public record Receipt(
        UUID id,
        UUID orgId,
        UUID uploadedBy,
        UUID managerId,
        String publicId,
        String resourceType,
        String format,
        ReceiptStatus status,
        String originalName,
        long bytes,
        Instant createdAt,
        UUID decidedBy,
        Instant decidedAt,
        UUID reimbursedBy,
        Instant reimbursedAt,
        int version
) {
}
