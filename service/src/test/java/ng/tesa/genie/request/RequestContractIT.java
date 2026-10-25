package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;
import tools.jackson.databind.JsonNode;

class RequestContractIT extends ApiTestSupport {

    @Test
    void requestResponsesMatchThePublicContractAndHideInternalFields() {
        String employeeToken = login(EMPLOYEE_EMAIL);

        Response created = reportFault(employeeToken, "Leaking Pipe", "HIGH", UUID.randomUUID());

        assertThat(created.status()).isEqualTo(201);
        assertPublicDetail(created.body());
        assertThat(created.body().get("estimates").size()).isZero();
        assertThat(created.body().get("history").size()).isEqualTo(1);
        assertThat(created.body().get("technician")).isNull();

        Response listed = get("/api/v1/requests", employeeToken);

        assertThat(listed.status()).isEqualTo(200);
        assertThat(listed.body().size()).isEqualTo(1);
        JsonNode summary = listed.body().get(0);
        assertThat(summary.get("idempotencyKey")).isNull();
        assertThat(summary.get("requestHash")).isNull();
        assertThat(summary.get("description")).isNull();
        assertThat(summary.get("estimates")).isNull();
        assertThat(summary.get("history")).isNull();
    }

    @Test
    void employeeCannotReadAnotherEmployeesDetailOrHistory() {
        String ownerToken = login(EMPLOYEE_EMAIL);
        String otherEmail = "other.employee@genie.test";
        createUser(otherEmail, "Other Employee", "EMPLOYEE", passwords.encode(PASSWORD));
        String otherToken = login(otherEmail);

        Response created = reportFault(ownerToken, "Broken Window", "LOW", UUID.randomUUID());
        String requestId = created.body().get("id").asString();

        assertThat(get("/api/v1/requests/" + requestId, ownerToken).status()).isEqualTo(200);
        assertThat(get("/api/v1/requests/" + requestId + "/history", ownerToken).status()).isEqualTo(200);

        Response forbiddenDetail = get("/api/v1/requests/" + requestId, otherToken);
        Response forbiddenHistory = get("/api/v1/requests/" + requestId + "/history", otherToken);

        assertThat(forbiddenDetail.status()).isEqualTo(403);
        assertThat(forbiddenDetail.code()).isEqualTo("FORBIDDEN");
        assertThat(forbiddenHistory.status()).isEqualTo(403);
        assertThat(forbiddenHistory.code()).isEqualTo("FORBIDDEN");
    }

    @Test
    void missingRequestHistoryReturnsNotFound() {
        String employeeToken = login(EMPLOYEE_EMAIL);

        Response response = get("/api/v1/requests/" + UUID.randomUUID() + "/history", employeeToken);

        assertThat(response.status()).isEqualTo(404);
        assertThat(response.code()).isEqualTo("NOT_FOUND");
    }

    private static void assertPublicDetail(JsonNode detail) {
        assertThat(detail.get("idempotencyKey")).isNull();
        assertThat(detail.get("requestHash")).isNull();
        assertThat(detail.get("reference").asString()).isNotBlank();
    }
}
