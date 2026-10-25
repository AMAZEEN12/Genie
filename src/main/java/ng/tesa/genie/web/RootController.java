package ng.tesa.genie.web;

import java.time.Instant;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import ng.tesa.genie.config.AppProperties;

/**
 * The walking skeleton's two addresses (deploy-plan): {@code /} answers the host's health
 * check, and {@code /api/v1/health} also reports whether the database answers.
 */
@RestController
public class RootController {

    private final JdbcClient jdbc;
    private final AppProperties properties;

    public RootController(JdbcClient jdbc, AppProperties properties) {
        this.jdbc = jdbc;
        this.properties = properties;
    }

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of("service", "genie", "status", "UP", "version", properties.version());
    }

    @GetMapping("/api/v1/health")
    public Map<String, Object> health() {
        String database;
        try {
            jdbc.sql("SELECT 1").query(Integer.class).single();
            database = "UP";
        } catch (RuntimeException e) {
            database = "DOWN";
        }
        return Map.of(
                "service", "genie",
                "status", "UP".equals(database) ? "UP" : "DEGRADED",
                "database", database,
                "version", properties.version(),
                "checkedAt", Instant.now().toString());
    }
}
