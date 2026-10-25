package ng.tesa.genie.request;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;

@Repository
public class HistoryRepository {

    private final JdbcClient jdbc;

    public HistoryRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private static Instant getInstant(ResultSet rs, String column) throws SQLException {
        java.sql.Timestamp ts = rs.getTimestamp(column);
        return ts != null ? ts.toInstant() : null;
    }

    private static StatusHistoryEntry mapRow(ResultSet rs, int rowNum) throws SQLException {
        CurrentUser actor = new CurrentUser(
                rs.getObject("actor_id", UUID.class),
                rs.getString("actor_email"),
                rs.getString("actor_name"),
                Role.valueOf(rs.getString("actor_role"))
        );

        return new StatusHistoryEntry(
                rs.getObject("id", UUID.class),
                rs.getObject("request_id", UUID.class),
                rs.getString("from_status"),
                rs.getString("to_status"),
                actor,
                rs.getString("note"),
                getInstant(rs, "at")
        );
    }

    public List<StatusHistoryEntry> findByRequestId(UUID requestId) {
        return jdbc.sql("""
                SELECT h.id, h.request_id, h.from_status, h.to_status, h.note, h.at,
                       u.id AS actor_id, u.email AS actor_email, u.display_name AS actor_name, u.role AS actor_role
                FROM status_history h
                JOIN app_user u ON h.actor_id = u.id
                WHERE h.request_id = :requestId
                ORDER BY h.at ASC
                """)
                .param("requestId", requestId)
                .query(HistoryRepository::mapRow)
                .list();
    }

    public void append(UUID requestId, String fromStatus, String toStatus, UUID actorId, String note) {
        jdbc.sql("""
                INSERT INTO status_history (request_id, from_status, to_status, actor_id, note)
                VALUES (:requestId, :fromStatus, :toStatus, :actorId, :note)
                """)
                .param("requestId", requestId)
                .param("fromStatus", fromStatus)
                .param("toStatus", toStatus)
                .param("actorId", actorId)
                .param("note", note)
                .update();
    }
}
