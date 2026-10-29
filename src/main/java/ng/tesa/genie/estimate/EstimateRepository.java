package ng.tesa.genie.estimate;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;

@Repository
public class EstimateRepository {

    private final JdbcClient jdbc;

    public EstimateRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Instant getInstant(ResultSet rs, String column) throws SQLException {
        java.sql.Timestamp ts = rs.getTimestamp(column);
        return ts != null ? ts.toInstant() : null;
    }

    private static Estimate mapRow(ResultSet rs, int rowNum) throws SQLException {
        CurrentUser submittedBy = new CurrentUser(
                rs.getObject("sub_id", UUID.class),
                rs.getString("sub_email"),
                rs.getString("sub_name"),
                Role.valueOf(rs.getString("sub_role"))
        );

        CurrentUser decidedBy = null;
        UUID decId = rs.getObject("dec_id", UUID.class);
        if (decId != null) {
            decidedBy = new CurrentUser(
                    decId,
                    rs.getString("dec_email"),
                    rs.getString("dec_name"),
                    Role.valueOf(rs.getString("dec_role"))
            );
        }

        return new Estimate(
                rs.getObject("id", UUID.class),
                rs.getObject("request_id", UUID.class),
                rs.getLong("amount_kobo"),
                submittedBy,
                getInstant(rs, "submitted_at"),
                rs.getString("decision"),
                rs.getString("decision_reason"),
                decidedBy,
                getInstant(rs, "decided_at"),
                List.of()
        );
    }

    private static final String SELECT_ESTIMATE = """
            SELECT e.id, e.request_id, e.amount_kobo, e.submitted_at, e.decision, e.decision_reason, e.decided_at,
                   su.id AS sub_id, su.email AS sub_email, su.display_name AS sub_name, su.role AS sub_role,
                   du.id AS dec_id, du.email AS dec_email, du.display_name AS dec_name, du.role AS dec_role
            FROM estimate e
            JOIN app_user su ON e.submitted_by = su.id
            LEFT JOIN app_user du ON e.decided_by = du.id
            """;

    public Optional<Estimate> findById(UUID id) {
        return jdbc.sql(SELECT_ESTIMATE + " WHERE e.id = :id")
                .param("id", id)
                .query(EstimateRepository::mapRow)
                .optional()
                .map(e -> withLines(List.of(e)).getFirst());
    }

    public List<Estimate> findByRequestId(UUID requestId) {
        return withLines(jdbc.sql(SELECT_ESTIMATE + " WHERE e.request_id = :requestId ORDER BY e.submitted_at ASC")
                .param("requestId", requestId)
                .query(EstimateRepository::mapRow)
                .list());
    }

    public Optional<Estimate> findPendingByRequestId(UUID requestId) {
        return jdbc.sql(SELECT_ESTIMATE + " WHERE e.request_id = :requestId AND e.decision IS NULL")
                .param("requestId", requestId)
                .query(EstimateRepository::mapRow)
                .optional()
                .map(e -> withLines(List.of(e)).getFirst());
    }

    /** Loads the cost breakdown (V5 {@code estimate_line}) of all the given estimates in one query. */
    private List<Estimate> withLines(List<Estimate> found) {
        if (found.isEmpty()) {
            return found;
        }
        Map<UUID, List<EstimateLine>> byEstimate = new LinkedHashMap<>();
        found.forEach(e -> byEstimate.put(e.id(), new ArrayList<>()));
        jdbc.sql("""
                SELECT estimate_id, category, description, amount_kobo FROM estimate_line
                WHERE estimate_id IN (:ids) ORDER BY estimate_id, position
                """)
                .param("ids", List.copyOf(byEstimate.keySet()))
                .query(rs -> {
                    byEstimate.get(rs.getObject("estimate_id", UUID.class)).add(new EstimateLine(
                            rs.getString("category"), rs.getString("description"), rs.getLong("amount_kobo")));
                });
        return found.stream().map(e -> e.withLines(byEstimate.get(e.id()))).toList();
    }

    /**
     * Writes the breakdown in entry order. The deferred V5 trigger {@code estimate_lines_match_total}
     * checks at commit that the lines add up to the estimate's amount.
     */
    public void insertLines(UUID estimateId, List<EstimateLine> lines) {
        for (int i = 0; i < lines.size(); i++) {
            EstimateLine line = lines.get(i);
            jdbc.sql("""
                    INSERT INTO estimate_line (estimate_id, position, category, description, amount_kobo)
                    VALUES (:estimateId, :position, :category, :description, :amountKobo)
                    """)
                    .param("estimateId", estimateId)
                    .param("position", i + 1)
                    .param("category", line.category())
                    .param("description", line.description().trim())
                    .param("amountKobo", line.amountKobo())
                    .update();
        }
    }

    public UUID insert(UUID requestId, long amountKobo, UUID submittedBy) {
        return jdbc.sql("""
                INSERT INTO estimate (request_id, amount_kobo, submitted_by)
                VALUES (:requestId, :amountKobo, :submittedBy)
                RETURNING id
                """)
                .param("requestId", requestId)
                .param("amountKobo", amountKobo)
                .param("submittedBy", submittedBy)
                .query(UUID.class)
                .single();
    }

    public int recordDecision(UUID id, String decision, String reason, UUID decidedBy) {
        return jdbc.sql("""
                UPDATE estimate
                SET decision = :decision,
                    decision_reason = :reason,
                    decided_by = :decidedBy,
                    decided_at = clock_timestamp()
                WHERE id = :id AND decision IS NULL
                """)
                .param("id", id)
                .param("decision", decision)
                .param("reason", reason)
                .param("decidedBy", decidedBy)
                .update();
    }
}
