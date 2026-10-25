package ng.tesa.genie.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class TokenServiceTest {

    @Test
    void signingKeySucceedsWithValid32ByteSecret() {
        var key = TokenService.signingKey("01234567890123456789012345678901");
        assertThat(key).isNotNull();
        assertThat(key.getAlgorithm()).isEqualTo("HmacSHA256");
    }

    @Test
    void signingKeyFailsWhenSecretIsNull() {
        assertThatThrownBy(() -> TokenService.signingKey(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret must be configured");
    }

    @Test
    void signingKeyFailsWhenSecretIsBlank() {
        assertThatThrownBy(() -> TokenService.signingKey("   "))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT secret must be configured");
    }

    @Test
    void signingKeyFailsWhenSecretIsTooShort() {
        assertThatThrownBy(() -> TokenService.signingKey("too-short-secret"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }
}
