package ng.tesa.genie.seed;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.SQLException;
import java.util.List;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import ng.tesa.genie.GenieApplication;

@SpringBootTest(classes = GenieApplication.class)
@ActiveProfiles("demo")
class SeedVerificationIT {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("genie.security.jwt-secret", () -> "test-only-signing-key-0123456789-abcdefghijklmnop");
    }

    @Autowired
    private JdbcClient jdbc;

    @BeforeEach
    void migrateDemoSeed() {
        Flyway flyway = Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration", "classpath:db/seed")
                .load();
        flyway.migrate();
    }

    @Test
    void seedMeetsRequirementR13() {
        // >= 30 requests total
        long count = jdbc.sql("SELECT count(*) FROM maintenance_request").query(Long.class).single();
        assertThat(count).isGreaterThanOrEqualTo(30);

        // All 7 statuses exist
        List<String> statuses = jdbc.sql("SELECT DISTINCT status FROM maintenance_request ORDER BY status")
                .query(String.class).list();
        assertThat(statuses).containsExactlyInAnyOrder(
                "REPORTED", "ASSIGNED", "ESTIMATE_SUBMITTED", "ESTIMATE_APPROVED",
                "IN_PROGRESS", "COMPLETED", "VERIFIED_CLOSED"
        );

        // Awkward case 1: Rejected estimate returned to ASSIGNED (GEN-010)
        long rejectedCount = jdbc.sql("SELECT count(*) FROM estimate WHERE decision = 'REJECTED'").query(Long.class).single();
        assertThat(rejectedCount).isGreaterThanOrEqualTo(1);

        // Awkward case 2: Urgent override in progress (GEN-025)
        long urgentOverrideCount = jdbc.sql("SELECT count(*) FROM maintenance_request WHERE override = true AND status = 'IN_PROGRESS'")
                .query(Long.class).single();
        assertThat(urgentOverrideCount).isGreaterThanOrEqualTo(1);

        // Awkward case 3: Actual cost above approved estimate (GEN-031)
        long higherCostCount = jdbc.sql("""
                SELECT count(*)
                FROM maintenance_request r
                JOIN estimate e ON r.id = e.request_id AND e.decision = 'APPROVED'
                WHERE r.status = 'VERIFIED_CLOSED' AND r.actual_cost_kobo > e.amount_kobo
                """).query(Long.class).single();
        assertThat(higherCostCount).isGreaterThanOrEqualTo(1);

        // Awkward case 4: Urgent override verified with finance review ACCEPTED (GEN-032)
        long reviewedOverrideCount = jdbc.sql("""
                SELECT count(*)
                FROM maintenance_request
                WHERE override = true AND override_review = 'ACCEPTED' AND status = 'VERIFIED_CLOSED'
                """).query(Long.class).single();
        assertThat(reviewedOverrideCount).isGreaterThanOrEqualTo(1);
    }
}
