package ng.tesa.genie.request;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;

@Repository
public class RequestRepository {

    private final JdbcClient jdbc;

    public RequestRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Instant getInstant(ResultSet rs, String column) throws SQLException {
        java.sql.Timestamp ts = rs.getTimestamp(column);
        return ts != null ? ts.toInstant() : null;
    }

    private static CurrentUser mapUser(ResultSet rs, String prefix) throws SQLException {
        UUID id = rs.getObject(prefix + "_id", UUID.class);
        if (id == null) {
            return null;
        }
        return new CurrentUser(
                id,
                rs.getString(prefix + "_email"),
                rs.getString(prefix + "_name"),
                Role.valueOf(rs.getString(prefix + "_role"))
        );
    }

    private static MaintenanceRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        CurrentUser reportedBy = mapUser(rs, "rep");
        CurrentUser technician = mapUser(rs, "tech");
        CurrentUser assignedBy = mapUser(rs, "asgn");
        CurrentUser overrideBy = mapUser(rs, "ovr");
        CurrentUser overrideReviewedBy = mapUser(rs, "ovrev");
        CurrentUser verifiedBy = mapUser(rs, "ver");

        return new MaintenanceRequest(
                rs.getObject("id", UUID.class),
                rs.getString("reference"),
                rs.getObject("idempotency_key", UUID.class),
                rs.getString("request_hash"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("building"),
                rs.getString("location"),
                rs.getString("equipment"),
                rs.getString("category"),
                rs.getString("priority"),
                rs.getString("status"),
                reportedBy,
                getInstant(rs, "reported_at"),
                technician,
                assignedBy,
                getInstant(rs, "deadline"),
                rs.getBoolean("override"),
                rs.getString("override_reason"),
                overrideBy,
                rs.getString("override_review"),
                overrideReviewedBy,
                rs.getString("override_review_note"),
                rs.getString("work_done"),
                rs.getObject("actual_cost_kobo", Long.class),
                rs.getObject("completed_on", LocalDate.class),
                verifiedBy,
                getInstant(rs, "verified_at"),
                rs.getInt("version"),
                List.of(),
                List.of()
        );
    }

    private static final String SELECT_BASE = """
            SELECT r.id, r.reference, r.idempotency_key, r.request_hash, r.title, r.description,
                   r.building, r.location, r.equipment, r.category, r.priority, r.status,
                   r.reported_at, r.deadline, r.override, r.override_reason, r.override_review,
                   r.override_review_note, r.work_done, r.actual_cost_kobo, r.completed_on,
                   r.verified_at, r.version,
                   rep.id AS rep_id, rep.email AS rep_email, rep.display_name AS rep_name, rep.role AS rep_role,
                   tech.id AS tech_id, tech.email AS tech_email, tech.display_name AS tech_name, tech.role AS tech_role,
                   asgn.id AS asgn_id, asgn.email AS asgn_email, asgn.display_name AS asgn_name, asgn.role AS asgn_role,
                   ovr.id AS ovr_id, ovr.email AS ovr_email, ovr.display_name AS ovr_name, ovr.role AS ovr_role,
                   ovrev.id AS ovrev_id, ovrev.email AS ovrev_email, ovrev.display_name AS ovrev_name, ovrev.role AS ovrev_role,
                   ver.id AS ver_id, ver.email AS ver_email, ver.display_name AS ver_name, ver.role AS ver_role
            FROM maintenance_request r
            JOIN app_user rep ON r.reported_by = rep.id
            LEFT JOIN app_user tech ON r.technician_id = tech.id
            LEFT JOIN app_user asgn ON r.assigned_by = asgn.id
            LEFT JOIN app_user ovr ON r.override_by = ovr.id
            LEFT JOIN app_user ovrev ON r.override_reviewed_by = ovrev.id
            LEFT JOIN app_user ver ON r.verified_by = ver.id
            """;

    public Optional<MaintenanceRequest> findById(UUID id) {
        return jdbc.sql(SELECT_BASE + " WHERE r.id = :id")
                .param("id", id)
                .query(RequestRepository::mapRow)
                .optional();
    }

    public Optional<MaintenanceRequest> findByIdempotencyKey(UUID key) {
        return jdbc.sql(SELECT_BASE + " WHERE r.idempotency_key = :key")
                .param("key", key)
                .query(RequestRepository::mapRow)
                .optional();
    }

    public List<MaintenanceRequest> search(String status, String category, String priority,
                                          UUID technicianId, Boolean override, UUID reportedBy) {
        StringBuilder sql = new StringBuilder(SELECT_BASE).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isBlank()) {
            sql.append(" AND r.status = ? ");
            params.add(status.trim());
        }
        if (category != null && !category.isBlank()) {
            sql.append(" AND r.category = ? ");
            params.add(category.trim());
        }
        if (priority != null && !priority.isBlank()) {
            sql.append(" AND r.priority = ? ");
            params.add(priority.trim());
        }
        if (technicianId != null) {
            sql.append(" AND r.technician_id = ? ");
            params.add(technicianId);
        }
        if (override != null) {
            sql.append(" AND r.override = ? ");
            params.add(override);
        }
        if (reportedBy != null) {
            sql.append(" AND r.reported_by = ? ");
            params.add(reportedBy);
        }

        sql.append(" ORDER BY r.reported_at DESC ");

        var query = jdbc.sql(sql.toString());
        for (int i = 0; i < params.size(); i++) {
            query = query.param(i + 1, params.get(i));
        }
        return query.query(RequestRepository::mapRow).list();
    }

    public UUID insert(String reference, UUID idempotencyKey, String requestHash,
                        String title, String description, String building, String location,
                        String equipment, String category, String priority, UUID reportedBy) {
        return jdbc.sql("""
                INSERT INTO maintenance_request (
                    reference, idempotency_key, request_hash, title, description,
                    building, location, equipment, category, priority, status,
                    reported_by
                ) VALUES (
                    :reference, :idempotencyKey, :requestHash, :title, :description,
                    :building, :location, :equipment, :category, :priority, 'REPORTED',
                    :reportedBy
                )
                RETURNING id
                """)
                .param("reference", reference)
                .param("idempotencyKey", idempotencyKey)
                .param("requestHash", requestHash)
                .param("title", title)
                .param("description", description)
                .param("building", building)
                .param("location", location)
                .param("equipment", equipment)
                .param("category", category)
                .param("priority", priority)
                .param("reportedBy", reportedBy)
                .query(UUID.class)
                .single();
    }

    public int assignTechnician(UUID id, UUID technicianId, Instant deadline, UUID assignedBy, int expectedVersion) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = 'ASSIGNED',
                    technician_id = :technicianId,
                    deadline = :deadline,
                    assigned_by = :assignedBy,
                    version = version + 1
                WHERE id = :id AND status = 'REPORTED' AND version = :expectedVersion
                """)
                .param("id", id)
                .param("technicianId", technicianId)
                .param("deadline", deadline != null ? java.sql.Timestamp.from(deadline) : null)
                .param("assignedBy", assignedBy)
                .param("expectedVersion", expectedVersion)
                .update();
    }

    public int updateStatus(UUID id, String status) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = :status,
                    version = version + 1
                WHERE id = :id
                """)
                .param("id", id)
                .param("status", status)
                .update();
    }

    public int startWork(UUID id, UUID technicianId) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = 'IN_PROGRESS',
                    version = version + 1
                WHERE id = :id AND status = 'ESTIMATE_APPROVED' AND technician_id = :technicianId
                """)
                .param("id", id)
                .param("technicianId", technicianId)
                .update();
    }

    public int startUrgentOverride(UUID id, String reason, UUID managerId) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = 'IN_PROGRESS',
                    override = true,
                    override_reason = :reason,
                    override_by = :managerId,
                    version = version + 1
                WHERE id = :id AND priority = 'URGENT' AND status IN ('ASSIGNED', 'ESTIMATE_SUBMITTED')
                """)
                .param("id", id)
                .param("reason", reason)
                .param("managerId", managerId)
                .update();
    }

    public int completeWork(UUID id, UUID technicianId, String workDone, long actualCostKobo, LocalDate completedOn) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = 'COMPLETED',
                    work_done = :workDone,
                    actual_cost_kobo = :actualCostKobo,
                    completed_on = :completedOn,
                    version = version + 1
                WHERE id = :id AND status = 'IN_PROGRESS' AND technician_id = :technicianId
                """)
                .param("id", id)
                .param("workDone", workDone)
                .param("actualCostKobo", actualCostKobo)
                .param("completedOn", completedOn)
                .param("technicianId", technicianId)
                .update();
    }

    public int verifyAndClose(UUID id, UUID managerId) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET status = 'VERIFIED_CLOSED',
                    verified_by = :managerId,
                    verified_at = clock_timestamp(),
                    version = version + 1
                WHERE id = :id AND status = 'COMPLETED' AND (technician_id IS NULL OR technician_id <> :managerId)
                """)
                .param("id", id)
                .param("managerId", managerId)
                .update();
    }

    public int reviewOverride(UUID id, String review, String note, UUID financeId) {
        return jdbc.sql("""
                UPDATE maintenance_request
                SET override_review = :review,
                    override_review_note = :note,
                    override_reviewed_by = :financeId,
                    version = version + 1
                WHERE id = :id AND override = true AND override_review IS NULL
                """)
                .param("id", id)
                .param("review", review)
                .param("note", note)
                .param("financeId", financeId)
                .update();
    }
}
