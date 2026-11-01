package ng.tesa.genie.auth;

import java.util.UUID;

public record CurrentUser(
        UUID id,
        String email,
        String displayName,
        Role role,
        UUID orgId,
        UUID managerId
) {
    public static final UUID DEFAULT_ORG_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    public CurrentUser(UUID id, String email, String displayName, Role role) {
        this(id, email, displayName, role, DEFAULT_ORG_ID, null);
    }
}
