package ng.tesa.genie.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class PasswordTest {

    @Test
    void hashDemoPassword() {
        var encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("Genie-Demo-2026");
        System.out.println("HASH_GENIE_DEMO: " + hash);
        assertThat(encoder.matches("Genie-Demo-2026", hash)).isTrue();
    }
}
