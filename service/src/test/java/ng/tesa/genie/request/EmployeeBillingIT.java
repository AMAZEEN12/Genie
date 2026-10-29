package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

import ng.tesa.genie.support.ApiTestSupport;

/**
 * MVP feedback item 1 (proposed by Victor Oyeleke): employees see nothing about billing. The
 * service decides, not only the screen: an employee's responses carry no estimates, no costs, no
 * finance review and no notes written by others, while every other role still gets them.
 */
class EmployeeBillingIT extends ApiTestSupport {

    /** Takes one request all the way to COMPLETED, with an itemised estimate, approval and a final cost. */
    private String completedRequest(String empToken) {
        String mgrToken = login(MANAGER_EMAIL);
        String techToken = login(TECHNICIAN_EMAIL);
        String finToken = login(FINANCE_EMAIL);

        String reqId = reportFault(empToken, "Server room AC leaking", "HIGH", UUID.randomUUID()).body().get("id").asString();
        put("/api/v1/requests/" + reqId + "/assignment", mgrToken,
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-11-30T12:00:00Z\",\"version\":1}");
        Response estimate = post("/api/v1/requests/" + reqId + "/estimates", techToken, """
                {"amountKobo": 6500000, "lines": [
                  {"category": "LABOUR", "description": "Two hours, two technicians", "amountKobo": 2000000},
                  {"category": "MATERIALS", "description": "Drain pump", "amountKobo": 4500000}]}""");
        assertThat(estimate.status()).isEqualTo(201);
        put("/api/v1/estimates/" + estimate.body().get("id").asString() + "/decision", finToken,
                "{\"decision\":\"APPROVED\"}");
        assertThat(post("/api/v1/requests/" + reqId + "/transitions", techToken, "{\"type\":\"START\"}").status()).isEqualTo(200);
        Response completed = post("/api/v1/requests/" + reqId + "/transitions", techToken, """
                {"type":"COMPLETE","workDone":"Replaced the drain pump","actualCostKobo":7250000,"completedOn":"2026-10-28"}""");
        assertThat(completed.status()).isEqualTo(200);
        return reqId;
    }

    @Test
    void employeeGetsNoCostDataInTheRequestDetail() {
        String empToken = login(EMPLOYEE_EMAIL);
        String reqId = completedRequest(empToken);

        Response detail = get("/api/v1/requests/" + reqId, empToken);

        assertThat(detail.status()).isEqualTo(200);
        JsonNode body = detail.body();
        assertThat(body.get("status").asString()).isEqualTo("COMPLETED");
        assertThat(body.get("estimates").isArray()).isTrue();
        assertThat(body.get("estimates").size()).as("estimates for an employee").isZero();
        assertThat(body.has("actualCostKobo")).isFalse();
        assertThat(body.has("overrideReviewNote")).isFalse();
        assertThat(body.get("workDone").asString()).isEqualTo("Replaced the drain pump");
        // Nothing priced anywhere in the raw JSON: not the estimate, the lines or the final cost.
        assertThat(detail.raw().body()).doesNotContain("Kobo").doesNotContain("kobo")
                .doesNotContain("6500000").doesNotContain("7250000").doesNotContain("Drain pump");
        // The status steps stay; notes written by others are gone.
        for (JsonNode entry : body.get("history")) {
            if (!entry.get("actor").get("role").asString().equals("EMPLOYEE")) {
                assertThat(entry.has("note")).as("note on %s", entry.get("toStatus")).isFalse();
            }
        }
        assertThat(body.get("history").size()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void employeeHistoryEndpointHasNoCostNotes() {
        String empToken = login(EMPLOYEE_EMAIL);
        String reqId = completedRequest(empToken);

        Response history = get("/api/v1/requests/" + reqId + "/history", empToken);

        assertThat(history.status()).isEqualTo(200);
        assertThat(history.raw().body()).doesNotContain("kobo").doesNotContain("6500000");
        assertThat(history.body().size()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void otherRolesStillSeeTheCosts() {
        String empToken = login(EMPLOYEE_EMAIL);
        String reqId = completedRequest(empToken);

        for (String email : new String[] {MANAGER_EMAIL, FINANCE_EMAIL}) {
            JsonNode body = get("/api/v1/requests/" + reqId, login(email)).body();
            assertThat(body.get("estimates").size()).as(email).isEqualTo(1);
            assertThat(body.get("estimates").get(0).get("lines").size()).as(email).isEqualTo(2);
            assertThat(body.get("actualCostKobo").asLong()).as(email).isEqualTo(7250000L);
            assertThat(get("/api/v1/requests/" + reqId + "/history", login(email)).raw().body())
                    .as(email).contains("Estimate submitted: 6500000 kobo (2 lines)");
        }
    }
}
