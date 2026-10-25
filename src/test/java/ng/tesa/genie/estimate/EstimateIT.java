package ng.tesa.genie.estimate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import ng.tesa.genie.support.ApiTestSupport;

class EstimateIT extends ApiTestSupport {

    @Test
    void floatAmountIsRejectedWith400() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);

        Response reported = reportFault(empToken, "Generator Check", "MEDIUM", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Attempting to submit float amount 45000.50
        Response floatEstimate = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 45000.50}");
        assertThat(floatEstimate.status()).isEqualTo(400);
        assertThat(floatEstimate.code()).isEqualTo("VALIDATION_FAILED");
    }

    @Test
    void selfApprovalIsRefusedByDirectCallAndDatabaseCheck() {
        String empToken = login(EMPLOYEE_EMAIL);
        Response reported = reportFault(empToken, "Dual Capability Estimate Test", "LOW", UUID.randomUUID());
        UUID reqId = UUID.fromString(reported.body().get("id").asString());

        // Direct SQL test against the database CHECK constraint chk_estimate_no_self_approval
        assertThatThrownBy(() -> {
            jdbc.sql("""
                    INSERT INTO estimate (request_id, amount_kobo, submitted_by, decision, decided_by)
                    VALUES (
                        :reqId,
                        100000,
                        :userId,
                        'APPROVED',
                        :userId
                    )
                    """)
                    .param("reqId", reqId)
                    .param("userId", financeId)
                    .update();
        }).isInstanceOf(DataIntegrityViolationException.class)
          .hasMessageContaining("chk_estimate_no_self_approval");
    }

    @Test
    void estimateRejectionMovesRequestBackToAssigned() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);
        String finToken = login(FINANCE_EMAIL);

        Response reported = reportFault(empToken, "Chiller Overhaul", "HIGH", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        Response est = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 15000000}");
        String estId = est.body().get("id").asString();

        // Reject estimate
        Response rejectResp = put("/api/v1/estimates/" + estId + "/decision", finToken,
                "{\"decision\":\"REJECTED\",\"reason\":\"Exceeds department budget\"}");
        assertThat(rejectResp.status()).isEqualTo(200);
        assertThat(rejectResp.body().get("decision").asString()).isEqualTo("REJECTED");

        // Verify request moved back to ASSIGNED
        Response reqDetail = get("/api/v1/requests/" + reqId, mgrToken);
        assertThat(reqDetail.body().get("status").asString()).isEqualTo("ASSIGNED");

        // Technician can now submit a revised estimate
        Response revisedEst = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 12000000}");
        assertThat(revisedEst.status()).isEqualTo(201);

        Response reqAfterRevised = get("/api/v1/requests/" + reqId, mgrToken);
        assertThat(reqAfterRevised.body().get("status").asString()).isEqualTo("ESTIMATE_SUBMITTED");
    }
}
