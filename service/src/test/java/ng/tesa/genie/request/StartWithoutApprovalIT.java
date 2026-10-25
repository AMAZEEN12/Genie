package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

class StartWithoutApprovalIT extends ApiTestSupport {

    @Test
    void directCallToStartWithoutApprovedEstimateReturns409() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);

        // 1. Report fault
        Response reported = reportFault(empToken, "Generator Fault", "HIGH", UUID.randomUUID());
        assertThat(reported.status()).isEqualTo(201);
        String reqId = reported.body().get("id").asString();

        // 2. Manager assigns technician
        String assignBody = """
                {
                    "technicianId": "%s",
                    "deadline": "2026-10-30T12:00:00Z",
                    "version": 1
                }
                """.formatted(technicianId);
        Response assigned = put("/api/v1/requests/" + reqId + "/assignment", mgrToken, assignBody);
        assertThat(assigned.status()).isEqualTo(200);

        // 3. Technician submits estimate (not yet approved)
        Response estResp = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 5000000}");
        assertThat(estResp.status()).isEqualTo(201);

        // 4. Technician directly attempts to start work while estimate is only SUBMITTED (not APPROVED)
        String startBody = "{\"type\": \"START\"}";
        Response startAttempt = post("/api/v1/requests/" + reqId + "/transitions", techToken, startBody);

        assertThat(startAttempt.status()).isEqualTo(409);
        assertThat(startAttempt.code()).isEqualTo("ESTIMATE_NOT_APPROVED");

        // Verify status is still ESTIMATE_SUBMITTED
        Response reqDetail = get("/api/v1/requests/" + reqId, techToken);
        assertThat(reqDetail.body().get("status").asString()).isEqualTo("ESTIMATE_SUBMITTED");
    }
}
