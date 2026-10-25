package ng.tesa.genie.config;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "genie")
public record AppProperties(
        @DefaultValue("0.1.0-SNAPSHOT") String version,
        @DefaultValue("Africa/Lagos") String timezone,
        Security security,
        Cors cors
) {
    public record Security(
            String jwtSecret,
            @DefaultValue("8h") Duration tokenLifetime
    ) {
    }

    public record Cors(
            @DefaultValue("") String allowedOrigins
    ) {
        public List<String> originsList() {
            if (allowedOrigins == null || allowedOrigins.isBlank()) {
                return List.of();
            }
            return Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
