package ng.tesa.genie.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * A wrong email and a wrong password must look the same from outside: the same 401 message and
 * the same work (one bcrypt check), so response times don't reveal which accounts exist.
 * Fails if AuthController stops checking the dummy hash for unknown emails.
 */
class LoginTimingTest {

    /** Wraps a real BCrypt encoder and counts its password checks; strength 4 keeps the test fast. */
    static final class CountingEncoder implements PasswordEncoder {
        private final PasswordEncoder bcrypt = new BCryptPasswordEncoder(4);
        int checks;

        @Override
        public String encode(CharSequence rawPassword) {
            return bcrypt.encode(rawPassword);
        }

        @Override
        public boolean matches(CharSequence rawPassword, String encodedPassword) {
            checks++;
            return bcrypt.matches(rawPassword, encodedPassword);
        }
    }

    /** A user store with at most one user and no database. */
    static final class OneUserRepository extends UserRepository {
        private final UserWithPassword user;

        OneUserRepository(UserWithPassword user) {
            super(null);
            this.user = user;
        }

        @Override
        public Optional<UserWithPassword> findByEmail(String email) {
            return user != null && user.email().equalsIgnoreCase(email) ? Optional.of(user) : Optional.empty();
        }
    }

    private final CountingEncoder encoder = new CountingEncoder();

    /** The token service is never reached when login fails, so none is needed. */
    private AuthController controllerWith(UserRepository.UserWithPassword user) {
        return new AuthController(new OneUserRepository(user), null, encoder);
    }

    @Test
    void unknownEmailStillChecksAPassword() {
        AuthController controller = controllerWith(null);

        assertThatThrownBy(() -> controller.createSession(
            new AuthController.LoginRequest("nobody@genie.test", "Wrong-Password-1")))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessage("Invalid email or password.");
        assertThat(encoder.checks).isEqualTo(1);
    }

    @Test
    void wrongPasswordGivesTheSameAnswerAfterTheSameWork() {
        var manager = new UserRepository.UserWithPassword(UUID.randomUUID(), "manager@genie.test",
            encoder.encode("Genie-Demo-2026"), "Chioma Manager", Role.MANAGER);
        AuthController controller = controllerWith(manager);

        assertThatThrownBy(() -> controller.createSession(
            new AuthController.LoginRequest("manager@genie.test", "Wrong-Password-1")))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessage("Invalid email or password.");
        assertThat(encoder.checks).isEqualTo(1);
    }
}
