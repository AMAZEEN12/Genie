package ng.tesa.genie.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Every request has an {@code X-Request-Id}. The client's UUID is kept; anything else is replaced
 * with a new one. It is echoed on every response (errors included, so this runs before security),
 * put in the log context, and copied into problem responses.
 *
 * <p>Each request also writes one log line, {@code METHOD /path STATUS in Nms}, carrying the
 * request ID, so one user journey can be followed through the service logs. Only the method,
 * path (never the query string), status and duration are logged: no headers, tokens, passwords
 * or bodies. {@code GET /} is not logged, because the host's health check calls it constantly.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    public static final String ATTRIBUTE = RequestIdFilter.class.getName() + ".id";

    private static final Logger log = LoggerFactory.getLogger(RequestIdFilter.class);

    public static UUID of(HttpServletRequest request) {
        Object existing = request.getAttribute(ATTRIBUTE);
        if (existing instanceof UUID id) {
            return id;
        }
        return UUID.randomUUID();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String incoming = request.getHeader(HEADER);
        UUID id = parseOrGenerate(incoming);
        request.setAttribute(ATTRIBUTE, id);
        response.setHeader(HEADER, id.toString());
        MDC.put("requestId", id.toString());
        long started = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (!"/".equals(request.getRequestURI())) {
                log.info("{} {} {} in {}ms", request.getMethod(), request.getRequestURI(), response.getStatus(),
                    (System.nanoTime() - started) / 1_000_000);
            }
            MDC.remove("requestId");
        }
    }

    private static UUID parseOrGenerate(String header) {
        if (header != null && !header.isBlank()) {
            try {
                return UUID.fromString(header.trim());
            } catch (IllegalArgumentException ignored) {
                // Ignore malformed and generate a fresh one
            }
        }
        return UUID.randomUUID();
    }
}
