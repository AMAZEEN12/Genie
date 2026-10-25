package ng.tesa.genie.support;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import ng.tesa.genie.GenieApplication;

@SpringBootTest(classes = GenieApplication.class)
public abstract class DatabaseTestSupport {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.hikari.maximum-pool-size", () -> "20");
        registry.add("genie.security.jwt-secret", () -> TEST_JWT_SECRET);
        registry.add("genie.cors.allowed-origins", () -> "http://localhost:5173");
    }

    protected static final String TEST_JWT_SECRET = "test-only-signing-key-0123456789-abcdefghijklmnop";

    public static org.flywaydb.core.api.configuration.FluentConfiguration flywayConfiguration() {
        return org.flywaydb.core.Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    @Autowired
    protected JdbcClient jdbc;

    @BeforeEach
    void emptyTables() {
        jdbc.sql("TRUNCATE status_history, estimate, maintenance_request, app_user CASCADE").update();
    }
}
