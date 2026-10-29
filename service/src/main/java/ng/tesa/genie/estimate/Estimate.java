package ng.tesa.genie.estimate;

import java.time.Instant;
import java.util.List;
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
        Instant decidedAt,
        List<EstimateLine> lines
) {
    /** The cost breakdown, in the order the technician entered it; empty for estimates without lines. */
    public Estimate {
        lines = lines == null ? List.of() : List.copyOf(lines);
    }

    public Estimate withLines(List<EstimateLine> newLines) {
        return new Estimate(id, requestId, amountKobo, submittedBy, submittedAt, decision, decisionReason,
                decidedBy, decidedAt, newLines);
    }
}
