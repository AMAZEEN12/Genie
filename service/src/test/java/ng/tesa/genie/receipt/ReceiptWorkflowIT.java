package ng.tesa.genie.receipt;

import static org.assertj.core.api.Assertions.assertThat;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import javax.imageio.ImageIO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import ng.tesa.genie.support.ApiTestSupport;
import tools.jackson.databind.JsonNode;

class ReceiptWorkflowIT extends ApiTestSupport {

    @Autowired
    private UploadRateLimiter rateLimiter;

    private String managerToken;
    private String technicianToken;
    private String financeToken;

    private UUID tech2Id;
    private String tech2Token;

    private UUID manager2Id;
    private String manager2Token;

    private UUID otherOrgId;
    private UUID otherFinanceId;
    private String otherFinanceToken;

    private byte[] validJpegBytes;
    private byte[] validPngBytes;
    private byte[] validPdfBytes;

    @BeforeEach
    void setupReceiptTests() throws Exception {
        rateLimiter.reset();

        // Connect technician to Chioma Manager
        jdbc.sql("UPDATE app_user SET manager_id = :managerId WHERE id = :techId")
                .param("managerId", managerId)
                .param("techId", technicianId)
                .update();

        // Create tech 2 under the same manager
        String hash = passwords.encode(PASSWORD);
        tech2Id = createUser("tech2@genie.test", "Fatima Tech", "TECHNICIAN", hash);
        jdbc.sql("UPDATE app_user SET manager_id = :managerId WHERE id = :techId")
                .param("managerId", managerId)
                .param("techId", tech2Id)
                .update();

        // Create manager 2 in the same org but with different direct reports
        manager2Id = createUser("manager2@genie.test", "Other Manager", "MANAGER", hash);

        // Create another organization and a finance officer in that other organization
        otherOrgId = UUID.randomUUID();
        otherFinanceId = jdbc.sql("""
                INSERT INTO app_user (email, password_hash, display_name, role, org_id)
                VALUES ('finance_other@genie.test', :hash, 'Foreign Finance', 'FINANCE', :orgId)
                RETURNING id
                """)
                .param("hash", hash)
                .param("orgId", otherOrgId)
                .query(UUID.class)
                .single();

        managerToken = login(MANAGER_EMAIL);
        technicianToken = login(TECHNICIAN_EMAIL);
        financeToken = login(FINANCE_EMAIL);
        tech2Token = login("tech2@genie.test");
        manager2Token = login("manager2@genie.test");
        otherFinanceToken = login("finance_other@genie.test");

        // Generate valid test images & pdf
        BufferedImage img = new BufferedImage(80, 80, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(0, 0, 80, 80);
        g.dispose();

        ByteArrayOutputStream baosJpg = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", baosJpg);
        validJpegBytes = baosJpg.toByteArray();

        ByteArrayOutputStream baosPng = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baosPng);
        validPngBytes = baosPng.toByteArray();

        validPdfBytes = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF".getBytes(StandardCharsets.UTF_8);
    }

    private Response uploadMultipart(String path, String token, String filename, byte[] content, String contentType) {
        String boundary = "Boundary-" + UUID.randomUUID();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            baos.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
            baos.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n").getBytes(StandardCharsets.UTF_8));
            baos.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            baos.write(content);
            baos.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .header("Authorization", "Bearer " + token)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(baos.toByteArray()))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            boolean isJson = response.headers().firstValue("Content-Type").map(t -> t.contains("json")).orElse(false);
            JsonNode parsed = !isJson || response.body() == null || response.body().isBlank() ? null : json.readTree(response.body());
            return new Response(response.statusCode(), response, parsed);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void test1_technician_requests_another_technicians_receipt_returns_404() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "oil_receipt.jpg", validJpegBytes, "image/jpeg");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Technician 2 attempts to view Technician 1's receipt
        Response view = get("/api/v1/receipts/" + receiptId, tech2Token);
        assertThat(view.status()).isEqualTo(404);

        // Technician 2 attempts to download Technician 1's receipt file
        Response viewFile = get("/api/v1/receipts/" + receiptId + "/file", tech2Token);
        assertThat(viewFile.status()).isEqualTo(404);
    }

    @Test
    void test2_manager_requests_receipt_from_outside_their_team_returns_404() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "filter_receipt.png", validPngBytes, "image/png");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Manager 1 (direct manager) can see it
        Response mgr1View = get("/api/v1/receipts/" + receiptId, managerToken);
        assertThat(mgr1View.status()).isEqualTo(200);

        // Manager 2 (outside team) gets 404
        Response mgr2View = get("/api/v1/receipts/" + receiptId, manager2Token);
        assertThat(mgr2View.status()).isEqualTo(404);
    }

    @Test
    void test3_finance_requests_receipt_from_another_organisation_returns_404() {
        // Uploaded in default organisation
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "hvac_part.pdf", validPdfBytes, "application/pdf");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Finance in same organisation gets 200
        Response fin1View = get("/api/v1/receipts/" + receiptId, financeToken);
        assertThat(fin1View.status()).isEqualTo(200);

        // Finance in another organisation gets 404
        Response otherFinView = get("/api/v1/receipts/" + receiptId, otherFinanceToken);
        assertThat(otherFinView.status()).isEqualTo(404);
    }

    @Test
    void test4_manager_approves_their_own_receipt_returns_403() {
        // Manager uploads their own receipt
        Response upload = uploadMultipart("/api/v1/receipts", managerToken, "manager_tools.jpg", validJpegBytes, "image/jpeg");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Manager attempts to approve their own receipt
        Response decision = put("/api/v1/receipts/" + receiptId + "/decision", managerToken, "{\"status\":\"approved\"}");
        assertThat(decision.status()).isEqualTo(403);
    }

    @Test
    void test5_technician_calls_decision_or_reimburse_route_returns_403() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "wrench.jpg", validJpegBytes, "image/jpeg");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Technician calling decision endpoint
        Response decision = put("/api/v1/receipts/" + receiptId + "/decision", technicianToken, "{\"status\":\"approved\"}");
        assertThat(decision.status()).isEqualTo(403);

        // Technician calling reimburse endpoint
        Response reimburse = put("/api/v1/receipts/" + receiptId + "/reimburse", technicianToken, "{}");
        assertThat(reimburse.status()).isEqualTo(403);
    }

    @Test
    void test6_finance_reimburses_receipt_that_is_not_approved_returns_409() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "screws.pdf", validPdfBytes, "application/pdf");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Receipt is still in 'submitted' status
        Response reimburse = put("/api/v1/receipts/" + receiptId + "/reimburse", financeToken, "{}");
        assertThat(reimburse.status()).isEqualTo(409);
    }

    @Test
    void test7_upload_renamed_exe_or_oversized_file_rejected_before_reaching_storage() {
        // Fake exe with magic bytes MZ
        byte[] fakeExe = new byte[] { 0x4D, 0x5A, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04 };
        Response exeUpload = uploadMultipart("/api/v1/receipts", technicianToken, "malicious.jpg", fakeExe, "image/jpeg");
        assertThat(exeUpload.status()).isEqualTo(400);

        // Oversized file > 10MB
        byte[] oversized = new byte[10 * 1024 * 1024 + 1024];
        Response oversizedUpload = uploadMultipart("/api/v1/receipts", technicianToken, "huge.jpg", oversized, "image/jpeg");
        assertThat(oversizedUpload.status()).isEqualTo(400);
    }

    @Test
    void test8_phone_photo_and_download_file_streaming_and_headers() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "phone_photo.jpg", validJpegBytes, "image/jpeg");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        // Download receipt file
        Response download = get("/api/v1/receipts/" + receiptId + "/file", technicianToken);
        assertThat(download.status()).isEqualTo(200);

        // Check required security and privacy headers from Section 4
        assertThat(download.header("Cache-Control")).isEqualTo("private, no-store");
        assertThat(download.header("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(download.header("Content-Type")).contains("image/jpeg");
        assertThat(download.raw().body()).isNotEmpty();
    }

    @Test
    void test9_inspect_responses_no_secret_no_api_key_no_cloudinary_url() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "clean_check.png", validPngBytes, "image/png");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();

        String uploadJson = upload.raw().body();
        assertThat(uploadJson).doesNotContain("cloudinary", "api_key", "api_secret", "cloud_name", "public_id");

        Response detail = get("/api/v1/receipts/" + receiptId, technicianToken);
        String detailJson = detail.raw().body();
        assertThat(detailJson).doesNotContain("cloudinary", "api_key", "api_secret", "cloud_name", "public_id");

        Response list = get("/api/v1/receipts", technicianToken);
        String listJson = list.raw().body();
        assertThat(listJson).doesNotContain("cloudinary", "api_key", "api_secret", "cloud_name", "public_id");
    }

    @Test
    void test10_full_status_flow_submitted_to_approved_to_reimbursed() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "invoice.pdf", validPdfBytes, "application/pdf");
        assertThat(upload.status()).isEqualTo(201);
        String receiptId = upload.body().get("id").asString();
        assertThat(upload.body().get("status").asString()).isEqualTo("submitted");

        // Manager approves direct report's receipt
        Response approve = put("/api/v1/receipts/" + receiptId + "/decision", managerToken, "{\"status\":\"approved\"}");
        assertThat(approve.status()).isEqualTo(200);
        assertThat(approve.body().get("status").asString()).isEqualTo("approved");
        assertThat(approve.body().get("decidedBy").asString()).isEqualTo(managerId.toString());

        // Finance marks approved receipt as reimbursed
        Response reimburse = put("/api/v1/receipts/" + receiptId + "/reimburse", financeToken, "{}");
        assertThat(reimburse.status()).isEqualTo(200);
        assertThat(reimburse.body().get("status").asString()).isEqualTo("reimbursed");
        assertThat(reimburse.body().get("reimbursedBy").asString()).isEqualTo(financeId.toString());

        // Invalid transition: cannot approve an already reimbursed receipt
        Response repeatDecision = put("/api/v1/receipts/" + receiptId + "/decision", managerToken, "{\"status\":\"approved\"}");
        assertThat(repeatDecision.status()).isEqualTo(409);
    }

    @Test
    void test11_deletion_rules_for_uploader_and_finance() {
        // Case A: Uploader deletes while still submitted -> 204
        Response uploadA = uploadMultipart("/api/v1/receipts", technicianToken, "delete_me.jpg", validJpegBytes, "image/jpeg");
        String idA = uploadA.body().get("id").asString();

        Response deleteA = send("DELETE", "/api/v1/receipts/" + idA, technicianToken, null);
        assertThat(deleteA.status()).isEqualTo(204);

        // Verify it is gone
        Response getA = get("/api/v1/receipts/" + idA, technicianToken);
        assertThat(getA.status()).isEqualTo(404);

        // Case B: Uploader tries to delete once approved -> 403
        Response uploadB = uploadMultipart("/api/v1/receipts", technicianToken, "keep_me.jpg", validJpegBytes, "image/jpeg");
        String idB = uploadB.body().get("id").asString();
        put("/api/v1/receipts/" + idB + "/decision", managerToken, "{\"status\":\"approved\"}");

        Response deleteB = send("DELETE", "/api/v1/receipts/" + idB, technicianToken, null);
        assertThat(deleteB.status()).isEqualTo(403);

        // Case C: Finance can delete any receipt in org -> 204
        Response deleteC = send("DELETE", "/api/v1/receipts/" + idB, financeToken, null);
        assertThat(deleteC.status()).isEqualTo(204);
    }

    @Test
    void test12_rate_limiting_enforced_per_user() {
        for (int i = 0; i < 10; i++) {
            Response resp = uploadMultipart("/api/v1/receipts", technicianToken, "batch_" + i + ".png", validPngBytes, "image/png");
            assertThat(resp.status()).isEqualTo(201);
        }

        // 11th upload should trigger 429
        Response rateLimited = uploadMultipart("/api/v1/receipts", technicianToken, "batch_11.png", validPngBytes, "image/png");
        assertThat(rateLimited.status()).isEqualTo(429);
    }

    @Test
    void test13_audit_trail_logging() {
        Response upload = uploadMultipart("/api/v1/receipts", technicianToken, "audit_test.pdf", validPdfBytes, "application/pdf");
        String receiptId = upload.body().get("id").asString();

        get("/api/v1/receipts/" + receiptId + "/file", technicianToken);
        put("/api/v1/receipts/" + receiptId + "/decision", managerToken, "{\"status\":\"approved\"}");
        put("/api/v1/receipts/" + receiptId + "/reimburse", financeToken, "{}");
        send("DELETE", "/api/v1/receipts/" + receiptId, financeToken, null);

        // Verify audit log has UPLOAD, VIEW, DECISION, REIMBURSE, DELETE entries
        Integer count = jdbc.sql("""
                SELECT count(*)
                FROM receipt_audit_log
                WHERE receipt_id = :receiptId
                """)
                .param("receiptId", UUID.fromString(receiptId))
                .query(Integer.class)
                .single();

        assertThat(count).isGreaterThanOrEqualTo(5);
    }
}
