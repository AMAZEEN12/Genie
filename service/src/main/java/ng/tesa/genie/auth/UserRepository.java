package ng.tesa.genie.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcClient jdbc;

    public UserRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record UserWithPassword(
            UUID id,
            String email,
            String passwordHash,
            String displayName,
            Role role
    ) {
        public CurrentUser toCurrentUser() {
            return new CurrentUser(id, email, displayName, role);
        }
    }

    public Optional<CurrentUser> findById(UUID id) {
        return jdbc.sql("""
                SELECT id, email, display_name, role
                FROM app_user
                WHERE id = :id
                """)
                .param("id", id)
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role"))
                ))
                .optional();
    }

    public Optional<UserWithPassword> findByEmail(String email) {
        return jdbc.sql("""
                SELECT id, email, password_hash, display_name, role
                FROM app_user
                WHERE lower(email) = lower(:email)
                """)
                .param("email", email)
                .query((rs, rowNum) -> new UserWithPassword(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role"))
                ))
                .optional();
    }

    public List<CurrentUser> findByRole(Role role) {
        return jdbc.sql("""
                SELECT id, email, display_name, role
                FROM app_user
                WHERE role = :role
                ORDER BY display_name ASC
                """)
                .param("role", role.name())
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role"))
                ))
                .list();
    }

    public List<CurrentUser> findAll() {
        return jdbc.sql("""
                SELECT id, email, display_name, role
                FROM app_user
                ORDER BY display_name ASC
                """)
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role"))
                ))
                .list();
    }

    public UUID insert(String email, String passwordHash, String displayName, Role role) {
        return jdbc.sql("""
                INSERT INTO app_user (email, password_hash, display_name, role)
                VALUES (:email, :passwordHash, :displayName, :role)
                RETURNING id
                """)
                .param("email", email.trim().toLowerCase())
                .param("passwordHash", passwordHash)
                .param("displayName", displayName.trim())
                .param("role", role.name())
                .query(UUID.class)
                .single();
    }
}
