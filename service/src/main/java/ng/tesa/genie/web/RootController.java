package ng.tesa.genie.web;

import java.time.Instant;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The walking skeleton's two addresses (deploy-plan): {@code /} answers the host's health
 * check, and {@code /api/v1/health} also reports whether the database answers.
 * Both are public and always 200, so a database outage shows as DEGRADED, not as a dead service.
 */
@RestController
public class RootController {

    private final JdbcClient jdbc;

    public RootController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of("service", "genie", "status", "UP");
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
                "status", "UP".equals(database) ? "UP" : "DEGRADED",
                "database", database,
                "checkedAt", Instant.now().toString());
    }
}
