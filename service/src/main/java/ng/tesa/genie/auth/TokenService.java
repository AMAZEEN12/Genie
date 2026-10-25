package ng.tesa.genie.auth;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import ng.tesa.genie.config.AppProperties;

@Service
public class TokenService {

    public static final String ISSUER = "genie";

    private final JwtEncoder encoder;
    private final AppProperties.Security settings;
    private final Clock clock;

    public TokenService(AppProperties properties, Clock clock) {
        this.settings = properties.security();
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(signingKey(settings.jwtSecret())));
        this.clock = clock;
    }

    public static SecretKey signingKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured via genie.security.jwt-secret or JWT_SECRET environment variable");
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes for HMAC-SHA256, got " + bytes.length);
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    public record IssuedToken(String value, Instant expiresAt) {
    }

    public IssuedToken issue(CurrentUser user) {
        Instant now = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = now.plus(settings.tokenLifetime());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(user.id().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("role", user.role().name())
                .build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new IssuedToken(token, expiresAt);
    }
}
