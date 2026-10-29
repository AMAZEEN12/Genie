package ng.tesa.genie.estimate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

import ng.tesa.genie.support.ApiTestSupport;

/**
 * MVP feedback item 6 (proposed by Victor Oyeleke): an estimate carries a cost breakdown of
 * Labour, Materials and Other lines that add up to its total. The rule holds in the service
 * (400) and in the database (deferred trigger estimate_lines_match_total).
 */
class EstimateBreakdownIT extends ApiTestSupport {

    private String assignedRequest() {
        String reqId = reportFault(login(EMPLOYEE_EMAIL), "Generator service", "MEDIUM", UUID.randomUUID())
                .body().get("id").asString();
        put("/api/v1/requests/" + reqId + "/assignment", login(MANAGER_EMAIL),
                "{\"technicianId\":\"" + technicianId + "\",\"deadline\":\"2026-11-30T12:00:00Z\",\"version\":1}");
        return reqId;
    }

    private Response estimate(String reqId, String body) {
        return post("/api/v1/requests/" + reqId + "/estimates", login(TECHNICIAN_EMAIL), body);
    }

    private long estimateRows(String reqId) {
        return jdbc.sql("SELECT count(*) FROM estimate WHERE request_id = :id")
                .param("id", UUID.fromString(reqId)).query(Long.class).single();
    }

    @Test
    void breakdownIsStoredInOrderAndShownToFinance() {
        String reqId = assignedRequest();

        Response created = estimate(reqId, """
                {"amountKobo": 4850000, "lines": [
                  {"category": "LABOUR", "description": "Service visit, 3 hours", "amountKobo": 1500000},
                  {"category": "MATERIALS", "description": "Oil filter and 20L engine oil", "amountKobo": 3100000},
                  {"category": "OTHER", "description": "Transport", "amountKobo": 250000}]}""");

        assertThat(created.status()).isEqualTo(201);
        JsonNode lines = created.body().get("lines");
        assertThat(lines.size()).isEqualTo(3);
        assertThat(lines.get(0).get("category").asString()).isEqualTo("LABOUR");
        assertThat(lines.get(1).get("description").asString()).isEqualTo("Oil filter and 20L engine oil");
        assertThat(lines.get(2).get("amountKobo").asLong()).isEqualTo(250000L);

        JsonNode seenByFinance = get("/api/v1/requests/" + reqId, login(FINANCE_EMAIL)).body().get("estimates").get(0);
        assertThat(seenByFinance.get("amountKobo").asLong()).isEqualTo(4850000L);
        assertThat(seenByFinance.get("lines").size()).isEqualTo(3);
    }

    @Test
    void totalThatDoesNotMatchTheLinesIsRefusedAndNothingIsRecorded() {
        String reqId = assignedRequest();

        Response refused = estimate(reqId, """
                {"amountKobo": 5000000, "lines": [
                  {"category": "LABOUR", "description": "Visit", "amountKobo": 1500000},
                  {"category": "MATERIALS", "description": "Parts", "amountKobo": 3000000}]}""");

        assertThat(refused.status()).isEqualTo(400);
        assertThat(refused.code()).isEqualTo("VALIDATION_FAILED");
        assertThat(refused.body().get("detail").asString()).contains("4500000");
        assertThat(estimateRows(reqId)).isZero();
        assertThat(get("/api/v1/requests/" + reqId, login(MANAGER_EMAIL)).body().get("status").asString())
                .isEqualTo("ASSIGNED");
    }

    @Test
    void badLinesAreRefusedWithTheField() {
        String reqId = assignedRequest();

        assertThat(estimate(reqId, """
                {"amountKobo": 100, "lines": [{"category": "TIPS", "description": "x", "amountKobo": 100}]}""").status())
                .isEqualTo(400);
        assertThat(estimate(reqId, """
                {"amountKobo": 100, "lines": [{"category": "OTHER", "description": "  ", "amountKobo": 100}]}""").status())
                .isEqualTo(400);
        assertThat(estimate(reqId, """
                {"amountKobo": 100, "lines": [{"category": "OTHER", "description": "x", "amountKobo": 0}]}""").status())
                .isEqualTo(400);
        assertThat(estimate(reqId, """
                {"amountKobo": 100, "lines": [{"category": "OTHER", "description": "x", "amountKobo": 99.5}]}""").status())
                .isEqualTo(400);
        assertThat(estimate(reqId, "{\"amountKobo\": 100, \"lines\": []}").status()).isEqualTo(400);

        StringBuilder many = new StringBuilder("{\"amountKobo\": 21, \"lines\": [");
        for (int i = 0; i < 21; i++) {
            many.append(i == 0 ? "" : ",").append("{\"category\":\"OTHER\",\"description\":\"Item ").append(i).append("\",\"amountKobo\":1}");
        }
        assertThat(estimate(reqId, many.append("]}").toString()).status()).isEqualTo(400);
        assertThat(estimateRows(reqId)).isZero();
    }

    /** Backward compatible: an estimate without lines works exactly as before V5. */
    @Test
    void estimateWithoutLinesStillWorks() {
        String reqId = assignedRequest();

        Response created = estimate(reqId, "{\"amountKobo\": 1200000}");

        assertThat(created.status()).isEqualTo(201);
        assertThat(created.body().get("lines").size()).isZero();
    }

    /** The database rule on its own: lines that don't add up are refused even by direct SQL. */
    @Test
    void databaseRefusesLinesThatDoNotAddUp() {
        String reqId = assignedRequest();
        UUID estimateId = jdbc.sql("""
                        INSERT INTO estimate (request_id, amount_kobo, submitted_by)
                        VALUES (:req, 100000, :tech) RETURNING id
                        """)
                .param("req", UUID.fromString(reqId)).param("tech", technicianId)
                .query(UUID.class).single();

        assertThatThrownBy(() -> jdbc.sql("""
                        INSERT INTO estimate_line (estimate_id, position, category, description, amount_kobo)
                        VALUES (:est, 1, 'LABOUR', 'Half the cost', 50000)
                        """)
                .param("est", estimateId).update())
                .hasMessageContaining("estimate_lines_match_total");
    }
}
