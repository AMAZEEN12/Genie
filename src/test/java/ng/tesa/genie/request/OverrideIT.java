package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import ng.tesa.genie.support.ApiTestSupport;

class OverrideIT extends ApiTestSupport {

    @Test
    void nonUrgentOverrideIsRefused() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);

        Response reported = reportFault(empToken, "Kitchen Light", "MEDIUM", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Attempt override on MEDIUM priority request
        Response attempt = post("/api/v1/requests/" + reqId + "/transitions", mgrToken,
                "{\"type\":\"OVERRIDE_START\",\"reason\":\"Manager in a hurry\"}");

        assertThat(attempt.status()).isEqualTo(409);
        assertThat(attempt.code()).isEqualTo("OVERRIDE_NOT_ALLOWED");
    }

    @Test
    void urgentOverrideRequiresReason() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);

        Response reported = reportFault(empToken, "Burst Pipe Flooding", "URGENT", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Missing reason -> 400 (R7)
        Response attempt = post("/api/v1/requests/" + reqId + "/transitions", mgrToken,
                "{\"type\":\"OVERRIDE_START\",\"reason\":\"\"}");

        assertThat(attempt.status()).isEqualTo(400);
    }

    @Test
    void closingWithUnreviewedOverrideReturns409AndSucceedsAfterFinanceReview() {
        String empToken = login(EMPLOYEE_EMAIL);
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);
        String finToken = login(FINANCE_EMAIL);

        Response reported = reportFault(empToken, "Server Room Overheating", "URGENT", UUID.randomUUID());
        String reqId = reported.body().get("id").asString();

        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-10-30T12:00:00Z\",\"version\":1}");

        // Manager triggers urgent override
        Response override = post("/api/v1/requests/" + reqId + "/transitions", mgrToken,
                "{\"type\":\"OVERRIDE_START\",\"reason\":\"Data center temperature exceeding safe threshold\"}");
        assertThat(override.status()).isEqualTo(200);
        assertThat(override.body().get("override").asBoolean()).isTrue();
        assertThat(override.body().get("status").asString()).isEqualTo("IN_PROGRESS");

        // Technician completes work
        Response completed = post("/api/v1/requests/" + reqId + "/transitions", techToken,
                "{\"type\":\"COMPLETE\",\"workDone\":\"Portable chillers installed\",\"actualCostKobo\":4500000,\"completedOn\":\"2026-10-25\"}");
        assertThat(completed.status()).isEqualTo(200);

        // Manager attempts to verify and close before finance review -> 409 CANNOT_CLOSE
        Response closeAttempt = post("/api/v1/requests/" + reqId + "/transitions", mgrToken, "{\"type\":\"VERIFY\"}");
        assertThat(closeAttempt.status()).isEqualTo(409);
        assertThat(closeAttempt.code()).isEqualTo("CANNOT_CLOSE");

        // Finance reviews override
        Response reviewResp = put("/api/v1/requests/" + reqId + "/override-review", finToken,
                "{\"review\":\"ACCEPTED\",\"note\":\"Emergency justified to prevent server shutdown\"}");
        assertThat(reviewResp.status()).isEqualTo(200);
        assertThat(reviewResp.body().get("overrideReview").asString()).isEqualTo("ACCEPTED");

        // Now manager can verify and close
        Response closeSuccess = post("/api/v1/requests/" + reqId + "/transitions", mgrToken, "{\"type\":\"VERIFY\"}");
        assertThat(closeSuccess.status()).isEqualTo(200);
        assertThat(closeSuccess.body().get("status").asString()).isEqualTo("VERIFIED_CLOSED");

        // Filter by override=true
        Response filterResp = get("/api/v1/requests?override=true", mgrToken);
        assertThat(filterResp.status()).isEqualTo(200);
        assertThat(filterResp.body().size()).isGreaterThanOrEqualTo(1);
    }
}
