package ng.tesa.genie.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

class NoFloatSchemaIT extends ApiTestSupport {

    @Test
    void fractionalKoboAndMalformedMoneyAreRefused() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);

        Response reported = reportFault(empToken, "Circuit Breaker", "HIGH", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Fractional float in amountKobo
        Response floatEstimate = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 1500.75}");
        assertThat(floatEstimate.status()).isEqualTo(400);
        assertThat(floatEstimate.code()).isEqualTo("VALIDATION_FAILED");

        // String instead of integer in amountKobo
        Response stringEstimate = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": \"150075\"}");
        assertThat(stringEstimate.status()).isEqualTo(400);
        assertThat(stringEstimate.code()).isEqualTo("VALIDATION_FAILED");
    }
}
