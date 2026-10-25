package ng.tesa.genie.estimate;

import java.time.Instant;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;

public record Estimate(
        UUID id,
        UUID requestId,
        long amountKobo,
        CurrentUser submittedBy,
        Instant submittedAt,
        String decision,
        String decisionReason,
        CurrentUser decidedBy,
        Instant decidedAt
) {
}
