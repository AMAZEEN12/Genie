package ng.tesa.genie.auth;

import java.util.UUID;

public record CurrentUser(
        UUID id,
        String email,
        String displayName,
        Role role
) {
}
