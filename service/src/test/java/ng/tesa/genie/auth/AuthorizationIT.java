package ng.tesa.genie.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

class AuthorizationIT extends ApiTestSupport {

    @Test
    void employeeCannotAssignTechnician() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);

        Response reported = reportFault(empToken, "Blown Fuse", "MEDIUM", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        String assignBody = """
                {
                    "technicianId": "%s",
                    "deadline": "2026-10-30T12:00:00Z",
                    "version": 1
                }
                """.formatted(technicianId);

        // Employee attempting to assign -> 403
        Response empAssign = put("/api/v1/requests/" + reqId + "/assignment", empToken, assignBody);
        assertThat(empAssign.status()).isEqualTo(403);
        assertThat(empAssign.code()).isEqualTo("FORBIDDEN");

        // Manager assigning -> 200
        Response mgrAssign = put("/api/v1/requests/" + reqId + "/assignment", mgrToken, assignBody);
        assertThat(mgrAssign.status()).isEqualTo(200);
    }

    @Test
    void nonTechnicianCannotSubmitEstimate() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);

        Response reported = reportFault(empToken, "Broken Fan", "LOW", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Manager attempting to submit estimate -> 403
        Response estAttempt = post("/api/v1/requests/" + reqId + "/estimates", mgrToken, "{\"amountKobo\": 2500000}");
        assertThat(estAttempt.status()).isEqualTo(403);
        assertThat(estAttempt.code()).isEqualTo("FORBIDDEN");
    }

    @Test
    void nonFinanceCannotDecideEstimate() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);

        Response reported = reportFault(empToken, "Water Leak", "MEDIUM", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        Response estResp = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 3000000}");
        String estId = estResp.body().get("id").asString();

        // Technician attempting to approve own/any estimate -> 403
        Response techApprove = put("/api/v1/estimates/" + estId + "/decision", techToken, "{\"decision\":\"APPROVED\"}");
        assertThat(techApprove.status()).isEqualTo(403);
        assertThat(techApprove.code()).isEqualTo("FORBIDDEN");

        // Manager attempting to approve estimate -> 403
        Response mgrApprove = put("/api/v1/estimates/" + estId + "/decision", mgrToken, "{\"decision\":\"APPROVED\"}");
        assertThat(mgrApprove.status()).isEqualTo(403);
        assertThat(mgrApprove.code()).isEqualTo("FORBIDDEN");
    }

    @Test
    void nonManagerCannotVerifyAndClose() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);
        String finToken = login(FINANCE_EMAIL);

        Response reported = reportFault(empToken, "Lift Malfunction", "HIGH", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        Response est = post("/api/v1/requests/" + reqId + "/estimates", techToken, "{\"amountKobo\": 10000000}");
        String estId = est.body().get("id").asString();

        put("/api/v1/estimates/" + estId + "/decision", finToken, "{\"decision\":\"APPROVED\"}");
        post("/api/v1/requests/" + reqId + "/transitions", techToken, "{\"type\":\"START\"}");
        post("/api/v1/requests/" + reqId + "/transitions", techToken,
                "{\"type\":\"COMPLETE\",\"workDone\":\"Replaced drive belt\",\"actualCostKobo\":9800000,\"completedOn\":\"2026-10-25\"}");

        // Technician attempting to verify -> 403
        Response techVerify = post("/api/v1/requests/" + reqId + "/transitions", techToken, "{\"type\":\"VERIFY\"}");
        assertThat(techVerify.status()).isEqualTo(403);

        // Employee attempting to verify -> 403
        Response empVerify = post("/api/v1/requests/" + reqId + "/transitions", empToken, "{\"type\":\"VERIFY\"}");
        assertThat(empVerify.status()).isEqualTo(403);

        // Manager verifying -> 200
        Response mgrVerify = post("/api/v1/requests/" + reqId + "/transitions", mgrToken, "{\"type\":\"VERIFY\"}");
        assertThat(mgrVerify.status()).isEqualTo(200);
        assertThat(mgrVerify.body().get("status").asString()).isEqualTo("VERIFIED_CLOSED");
    }

    @Test
    void financeCannotReportFault() {
        String finToken = login(FINANCE_EMAIL);
        Response resp = reportFault(finToken, "Unauthorized Report", "LOW", UUID.randomUUID());
        assertThat(resp.status()).isEqualTo(403);
    }
}
