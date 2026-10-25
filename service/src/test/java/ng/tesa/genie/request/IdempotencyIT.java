package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

class IdempotencyIT extends ApiTestSupport {

    @Test
    void duplicateKeyWithSameBodyReturnsOriginalRequest() {
        String empToken = login(EMPLOYEE_EMAIL);
        UUID key = UUID.randomUUID();

        Response first = reportFault(empToken, "Water Dispenser Fault", "LOW", key);
        assertThat(first.status()).isEqualTo(201);
        String id1 = first.body().get("id").asString();

        Response second = reportFault(empToken, "Water Dispenser Fault", "LOW", key);
        assertThat(second.status()).isEqualTo(201);
        String id2 = second.body().get("id").asString();

        assertThat(id1).isEqualTo(id2);
        assertThat(jdbc.sql("SELECT count(*) FROM maintenance_request WHERE idempotency_key = :key")
                .param("key", key).query(Long.class).single()).isEqualTo(1);
    }

    @Test
    void duplicateKeyWithDifferentBodyReturns422() {
        String empToken = login(EMPLOYEE_EMAIL);
        UUID key = UUID.randomUUID();

        Response first = reportFault(empToken, "Ceiling Leak", "LOW", key);
        assertThat(first.status()).isEqualTo(201);

        // Send different title with same key
        Response second = reportFault(empToken, "Different Title Entirely", "HIGH", key);
        assertThat(second.status()).isEqualTo(422);
        assertThat(second.code()).isEqualTo("IDEMPOTENCY_KEY_REUSED");
    }
}
