package ng.tesa.genie.support;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;

import ng.tesa.genie.GenieApplication;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(classes = GenieApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class ApiTestSupport extends DatabaseTestSupport {

    public static final String PASSWORD = "Genie-Demo-2026";
    public static final String EMPLOYEE_EMAIL = "employee@genie.test";
    public static final String MANAGER_EMAIL = "manager@genie.test";
    public static final String TECHNICIAN_EMAIL = "technician@genie.test";
    public static final String FINANCE_EMAIL = "finance@genie.test";

    private final HttpClient http = HttpClient.newHttpClient();

    @LocalServerPort
    protected int port;

    @Autowired
    protected JsonMapper json;

    @Autowired
    protected PasswordEncoder passwords;

    protected UUID employeeId;
    protected UUID managerId;
    protected UUID technicianId;
    protected UUID financeId;

    @BeforeEach
    void setupUsers() {
        String hash = passwords.encode(PASSWORD);
        employeeId = createUser(EMPLOYEE_EMAIL, "Tunde Employee", "EMPLOYEE", hash);
        managerId = createUser(MANAGER_EMAIL, "Chioma Manager", "MANAGER", hash);
        technicianId = createUser(TECHNICIAN_EMAIL, "Emeka Technician", "TECHNICIAN", hash);
        financeId = createUser(FINANCE_EMAIL, "Babajide Finance", "FINANCE", hash);
    }

    protected UUID createUser(String email, String name, String role, String hash) {
        return jdbc.sql("""
                INSERT INTO app_user (email, password_hash, display_name, role)
                VALUES (:email, :hash, :name, :role)
                RETURNING id
                """)
                .param("email", email)
                .param("hash", hash)
                .param("name", name)
                .param("role", role)
                .query(UUID.class)
                .single();
    }

    public record Response(int status, HttpResponse<String> raw, JsonNode body) {
        public String header(String name) {
            return raw.headers().firstValue(name).orElse(null);
        }

        public String code() {
            return body == null || body.get("code") == null ? null : body.get("code").asString();
        }
    }

    protected Response send(String method, String path, String token, String body, String... headers) {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        if (body != null) {
            request.header("Content-Type", "application/json");
        }
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        for (int i = 0; i < headers.length; i += 2) {
            request.header(headers[i], headers[i + 1]);
        }
        try {
            HttpResponse<String> response = http.send(request.build(), HttpResponse.BodyHandlers.ofString());
            boolean isJson = response.headers().firstValue("Content-Type").map(t -> t.contains("json")).orElse(false);
            JsonNode parsed = !isJson || response.body() == null || response.body().isBlank() ? null : json.readTree(response.body());
            return new Response(response.statusCode(), response, parsed);
        } catch (Exception e) {
            throw new IllegalStateException(method + " " + path + " failed", e);
        }
    }

    protected Response get(String path, String token) {
        return send("GET", path, token, null);
    }

    protected Response post(String path, String token, String body, String... headers) {
        return send("POST", path, token, body, headers);
    }

    protected Response put(String path, String token, String body, String... headers) {
        return send("PUT", path, token, body, headers);
    }

    protected String login(String email) {
        Response session = post("/api/v1/auth/sessions", null,
                "{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}");
        if (session.status() != 201) {
            throw new IllegalStateException("login failed: " + session.status() + " " + session.body());
        }
        return session.body().get("token").asString();
    }

    protected Response reportFault(String token, String title, String priority, UUID idempotencyKey) {
        String body = """
                {
                    "title": "%s",
                    "description": "Detailed description of %s",
                    "building": "Main Tower",
                    "location": "Floor 2",
                    "equipment": "AC-201",
                    "category": "HVAC",
                    "priority": "%s"
                }
                """.formatted(title, title, priority);
        return post("/api/v1/requests", token, body, "Idempotency-Key", idempotencyKey.toString());
    }
}
