package ng.tesa.genie.receipt;

import java.time.Instant;
import java.util.UUID;

public record ReceiptResponse(
        UUID id,
        UUID orgId,
        UUID uploadedBy,
        UUID managerId,
        ReceiptStatus status,
        String originalName,
        long bytes,
        Instant createdAt,
        UUID decidedBy,
        Instant decidedAt,
        UUID reimbursedBy,
        Instant reimbursedAt
) {
    public static ReceiptResponse from(Receipt r) {
        return new ReceiptResponse(
                r.id(),
                r.orgId(),
                r.uploadedBy(),
                r.managerId(),
                r.status(),
                r.originalName(),
                r.bytes(),
                r.createdAt(),
                r.decidedBy(),
                r.decidedAt(),
                r.reimbursedBy(),
                r.reimbursedAt()
        );
    }
}
