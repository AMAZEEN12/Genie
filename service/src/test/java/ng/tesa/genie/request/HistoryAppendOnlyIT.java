package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import ng.tesa.genie.support.ApiTestSupport;

class HistoryAppendOnlyIT extends ApiTestSupport {

    @Test
    void statusHistoryUpdateAndDeleteAreForbiddenByTrigger() {
        String empToken = login(EMPLOYEE_EMAIL);
        UUID key = UUID.randomUUID();

        Response resp = reportFault(empToken, "Generator Sensor", "MEDIUM", key);
        assertThat(resp.status()).isEqualTo(201);
        UUID reqId = UUID.fromString(resp.body().get("id").asString());

        // Attempt direct UPDATE on status_history
        assertThatThrownBy(() -> {
            jdbc.sql("UPDATE status_history SET note = 'Tampered' WHERE request_id = :id")
                    .param("id", reqId)
                    .update();
        }).isInstanceOf(org.springframework.dao.DataAccessException.class)
          .hasMessageContaining("status_history is append-only");

        // Attempt direct DELETE on status_history
        assertThatThrownBy(() -> {
            jdbc.sql("DELETE FROM status_history WHERE request_id = :id")
                    .param("id", reqId)
                    .update();
        }).isInstanceOf(org.springframework.dao.DataAccessException.class)
          .hasMessageContaining("status_history is append-only");
    }
}
