package ng.tesa.genie.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

/**
 * The end-to-end Monday journey (intent.md):
 * 1. Employee reports a fault -> REPORTED
 * 2. Operations manager assigns technician -> ASSIGNED
 * 3. Technician submits cost estimate -> ESTIMATE_SUBMITTED
 * 4. Finance approves estimate -> ESTIMATE_APPROVED
 * 5. Technician starts work -> IN_PROGRESS
 * 6. Technician completes repair -> COMPLETED
 * 7. Operations manager verifies and closes -> VERIFIED_CLOSED
 */
class MondayJourneyIT extends ApiTestSupport {

    @Test
    void mondayJourneyFromFaultToVerifiedRepair() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);
        String finToken = login(FINANCE_EMAIL);

        // Step 1: Employee reports fault
        UUID key = UUID.randomUUID();
        Response reportResp = reportFault(empToken, "Executive Boardroom AC Failure", "HIGH", key);
        assertThat(reportResp.status()).isEqualTo(201);
        String reqId = reportResp.body().get("id").asString();
        assertThat(reportResp.body().get("status").asString()).isEqualTo("REPORTED");

        // Step 2: Manager assigns technician
        String assignBody = """
                {
                    "technicianId": "%s",
                    "deadline": "2026-10-31T17:00:00Z",
                    "version": 1
                }
                """.formatted(technicianId);
        Response assignResp = put("/api/v1/requests/" + reqId + "/assignment", mgrToken, assignBody);
        assertThat(assignResp.status()).isEqualTo(200);
        assertThat(assignResp.body().get("status").asString()).isEqualTo("ASSIGNED");

        // Step 3: Technician submits estimate (₦85,000 = 8,500,000 kobo)
        Response estResp = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 8500000}");
        assertThat(estResp.status()).isEqualTo(201);
        String estId = estResp.body().get("id").asString();

        Response afterEst = get("/api/v1/requests/" + reqId, techToken);
        assertThat(afterEst.body().get("status").asString()).isEqualTo("ESTIMATE_SUBMITTED");

        // Step 4: Finance approves estimate
        Response decResp = put("/api/v1/estimates/" + estId + "/decision", finToken, "{\"decision\":\"APPROVED\"}");
        assertThat(decResp.status()).isEqualTo(200);

        Response afterApprove = get("/api/v1/requests/" + reqId, techToken);
        assertThat(afterApprove.body().get("status").asString()).isEqualTo("ESTIMATE_APPROVED");

        // Step 5: Technician starts work
        Response startResp = post("/api/v1/requests/" + reqId + "/transitions", techToken, "{\"type\":\"START\"}");
        assertThat(startResp.status()).isEqualTo(200);
        assertThat(startResp.body().get("status").asString()).isEqualTo("IN_PROGRESS");

        // Step 6: Technician completes repair
        String completeBody = """
                {
                    "type": "COMPLETE",
                    "workDone": "Replaced faulty capacitor and recharged R410A refrigerant",
                    "actualCostKobo": 8200000,
                    "completedOn": "2026-10-25"
                }
                """;
        Response compResp = post("/api/v1/requests/" + reqId + "/transitions", techToken, completeBody);
        assertThat(compResp.status()).isEqualTo(200);
        assertThat(compResp.body().get("status").asString()).isEqualTo("COMPLETED");

        // Step 7: Manager verifies and closes repair
        Response verifyResp = post("/api/v1/requests/" + reqId + "/transitions", mgrToken, "{\"type\":\"VERIFY\"}");
        assertThat(verifyResp.status()).isEqualTo(200);
        assertThat(verifyResp.body().get("status").asString()).isEqualTo("VERIFIED_CLOSED");

        // Verify history has full audit trail
        Response historyResp = get("/api/v1/requests/" + reqId + "/history", empToken);
        assertThat(historyResp.status()).isEqualTo(200);
        assertThat(historyResp.body().size()).isGreaterThanOrEqualTo(6);
    }
}
