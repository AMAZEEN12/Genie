package ng.tesa.genie.receipt;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ReceiptRepository {

    private final JdbcClient jdbc;

    public ReceiptRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private Receipt mapRow(ResultSet rs, int rowNum) throws SQLException {
        Timestamp createdTs = rs.getTimestamp("created_at");
        Timestamp decidedTs = rs.getTimestamp("decided_at");
        Timestamp reimbursedTs = rs.getTimestamp("reimbursed_at");

        return new Receipt(
                rs.getObject("id", UUID.class),
                rs.getObject("org_id", UUID.class),
                rs.getObject("uploaded_by", UUID.class),
                rs.getObject("manager_id", UUID.class),
                rs.getString("public_id"),
                rs.getString("resource_type"),
                rs.getString("format"),
                ReceiptStatus.fromString(rs.getString("status")),
                rs.getString("original_name"),
                rs.getLong("bytes"),
                createdTs != null ? createdTs.toInstant() : null,
                rs.getObject("decided_by", UUID.class),
                decidedTs != null ? decidedTs.toInstant() : null,
                rs.getObject("reimbursed_by", UUID.class),
                reimbursedTs != null ? reimbursedTs.toInstant() : null,
                rs.getInt("version")
        );
    }

    public Receipt insert(Receipt r) {
        Timestamp createdTs = r.createdAt() != null ? Timestamp.from(r.createdAt()) : Timestamp.from(Instant.now());
        UUID id = jdbc.sql("""
                INSERT INTO receipt (
                    id, org_id, uploaded_by, manager_id, public_id, resource_type,
                    format, status, original_name, bytes, created_at, version
                ) VALUES (
                    COALESCE(:id, gen_random_uuid()), :orgId, :uploadedBy, :managerId, :publicId, :resourceType,
                    :format, :status, :originalName, :bytes, :createdAt, 1
                )
                RETURNING id
                """)
                .param("id", r.id())
                .param("orgId", r.orgId())
                .param("uploadedBy", r.uploadedBy())
                .param("managerId", r.managerId())
                .param("publicId", r.publicId())
                .param("resourceType", r.resourceType())
                .param("format", r.format())
                .param("status", r.status().value())
                .param("originalName", r.originalName())
                .param("bytes", r.bytes())
                .param("createdAt", createdTs)
                .query(UUID.class)
                .single();

        return findById(id).orElseThrow();
    }

    public Optional<Receipt> findById(UUID id) {
        return jdbc.sql("""
                SELECT id, org_id, uploaded_by, manager_id, public_id, resource_type,
                       format, status, original_name, bytes, created_at,
                       decided_by, decided_at, reimbursed_by, reimbursed_at, version
                FROM receipt
                WHERE id = :id
                """)
                .param("id", id)
                .query(this::mapRow)
                .optional();
    }

    public List<Receipt> findByOrg(UUID orgId) {
        return jdbc.sql("""
                SELECT id, org_id, uploaded_by, manager_id, public_id, resource_type,
                       format, status, original_name, bytes, created_at,
                       decided_by, decided_at, reimbursed_by, reimbursed_at, version
                FROM receipt
                WHERE org_id = :orgId
                ORDER BY created_at DESC
                """)
                .param("orgId", orgId)
                .query(this::mapRow)
                .list();
    }

    public List<Receipt> findByUploader(UUID uploaderId) {
        return jdbc.sql("""
                SELECT id, org_id, uploaded_by, manager_id, public_id, resource_type,
                       format, status, original_name, bytes, created_at,
                       decided_by, decided_at, reimbursed_by, reimbursed_at, version
                FROM receipt
                WHERE uploaded_by = :uploaderId
                ORDER BY created_at DESC
                """)
                .param("uploaderId", uploaderId)
                .query(this::mapRow)
                .list();
    }

    public List<Receipt> findByManagerTeam(UUID orgId, UUID managerId) {
        return jdbc.sql("""
                SELECT id, org_id, uploaded_by, manager_id, public_id, resource_type,
                       format, status, original_name, bytes, created_at,
                       decided_by, decided_at, reimbursed_by, reimbursed_at, version
                FROM receipt
                WHERE org_id = :orgId AND (uploaded_by = :managerId OR manager_id = :managerId)
                ORDER BY created_at DESC
                """)
                .param("orgId", orgId)
                .param("managerId", managerId)
                .query(this::mapRow)
                .list();
    }

    public boolean updateDecision(UUID id, int version, ReceiptStatus status, UUID decidedBy, Instant decidedAt) {
        int updated = jdbc.sql("""
                UPDATE receipt
                SET status = :status,
                    decided_by = :decidedBy,
                    decided_at = :decidedAt,
                    version = version + 1
                WHERE id = :id AND version = :version AND status = 'submitted'
                """)
                .param("status", status.value())
                .param("decidedBy", decidedBy)
                .param("decidedAt", Timestamp.from(decidedAt))
                .param("id", id)
                .param("version", version)
                .update();
        return updated > 0;
    }

    public boolean updateReimbursed(UUID id, int version, UUID reimbursedBy, Instant reimbursedAt) {
        int updated = jdbc.sql("""
                UPDATE receipt
                SET status = 'reimbursed',
                    reimbursed_by = :reimbursedBy,
                    reimbursed_at = :reimbursedAt,
                    version = version + 1
                WHERE id = :id AND version = :version AND status = 'approved'
                """)
                .param("reimbursedBy", reimbursedBy)
                .param("reimbursedAt", Timestamp.from(reimbursedAt))
                .param("id", id)
                .param("version", version)
                .update();
        return updated > 0;
    }

    public boolean deleteById(UUID id) {
        int deleted = jdbc.sql("""
                DELETE FROM receipt
                WHERE id = :id
                """)
                .param("id", id)
                .update();
        return deleted > 0;
    }

    public void logAudit(UUID receiptId, UUID orgId, UUID userId, String action, String details) {
        jdbc.sql("""
                INSERT INTO receipt_audit_log (receipt_id, org_id, user_id, action, details)
                VALUES (:receiptId, :orgId, :userId, :action, :details)
                """)
                .param("receiptId", receiptId)
                .param("orgId", orgId)
                .param("userId", userId)
                .param("action", action)
                .param("details", details)
                .update();
    }
}
