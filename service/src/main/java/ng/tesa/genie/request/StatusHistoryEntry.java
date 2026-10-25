package ng.tesa.genie.request;

import java.time.Instant;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;

public record StatusHistoryEntry(
        UUID id,
        UUID requestId,
        String fromStatus,
        String toStatus,
        CurrentUser actor,
        String note,
        Instant at
) {
}
