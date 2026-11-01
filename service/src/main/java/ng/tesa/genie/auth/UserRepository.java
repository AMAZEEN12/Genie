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
            Role role,
            UUID orgId,
            UUID managerId
    ) {
        public UserWithPassword(UUID id, String email, String passwordHash, String displayName, Role role) {
            this(id, email, passwordHash, displayName, role, CurrentUser.DEFAULT_ORG_ID, null);
        }

        public CurrentUser toCurrentUser() {
            return new CurrentUser(id, email, displayName, role, orgId, managerId);
        }
    }

    public Optional<CurrentUser> findById(UUID id) {
        return jdbc.sql("""
                SELECT id, email, display_name, role, org_id, manager_id
                FROM app_user
                WHERE id = :id
                """)
                .param("id", id)
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role")),
                        rs.getObject("org_id", UUID.class) != null ? rs.getObject("org_id", UUID.class) : CurrentUser.DEFAULT_ORG_ID,
                        rs.getObject("manager_id", UUID.class)
                ))
                .optional();
    }

    public Optional<UserWithPassword> findByEmail(String email) {
        return jdbc.sql("""
                SELECT id, email, password_hash, display_name, role, org_id, manager_id
                FROM app_user
                WHERE lower(email) = lower(:email)
                """)
                .param("email", email)
                .query((rs, rowNum) -> new UserWithPassword(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role")),
                        rs.getObject("org_id", UUID.class) != null ? rs.getObject("org_id", UUID.class) : CurrentUser.DEFAULT_ORG_ID,
                        rs.getObject("manager_id", UUID.class)
                ))
                .optional();
    }

    public List<CurrentUser> findByRole(Role role) {
        return jdbc.sql("""
                SELECT id, email, display_name, role, org_id, manager_id
                FROM app_user
                WHERE role = :role
                ORDER BY display_name ASC
                """)
                .param("role", role.name())
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role")),
                        rs.getObject("org_id", UUID.class) != null ? rs.getObject("org_id", UUID.class) : CurrentUser.DEFAULT_ORG_ID,
                        rs.getObject("manager_id", UUID.class)
                ))
                .list();
    }

    public List<CurrentUser> findAll() {
        return jdbc.sql("""
                SELECT id, email, display_name, role, org_id, manager_id
                FROM app_user
                ORDER BY display_name ASC
                """)
                .query((rs, rowNum) -> new CurrentUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        Role.valueOf(rs.getString("role")),
                        rs.getObject("org_id", UUID.class) != null ? rs.getObject("org_id", UUID.class) : CurrentUser.DEFAULT_ORG_ID,
                        rs.getObject("manager_id", UUID.class)
                ))
                .list();
    }

    public UUID insert(String email, String passwordHash, String displayName, Role role) {
        return insert(email, passwordHash, displayName, role, CurrentUser.DEFAULT_ORG_ID, null);
    }

    public UUID insert(String email, String passwordHash, String displayName, Role role, UUID orgId, UUID managerId) {
        return jdbc.sql("""
                INSERT INTO app_user (email, password_hash, display_name, role, org_id, manager_id)
                VALUES (:email, :passwordHash, :displayName, :role, :orgId, :managerId)
                RETURNING id
                """)
                .param("email", email.trim().toLowerCase())
                .param("passwordHash", passwordHash)
                .param("displayName", displayName.trim())
                .param("role", role.name())
                .param("orgId", orgId != null ? orgId : CurrentUser.DEFAULT_ORG_ID)
                .param("managerId", managerId)
                .query(UUID.class)
                .single();
    }
}
