package ng.tesa.genie.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.common.Problem;
import tools.jackson.databind.json.JsonMapper;

@Component
public class ProblemSecurityHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final JsonMapper json;

    public ProblemSecurityHandlers(JsonMapper json) {
        this.json = json;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
            throws IOException {
        write(request, response, ErrorCode.UNAUTHENTICATED, "Log in again: the token is missing, invalid or expired.");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e)
            throws IOException {
        write(request, response, ErrorCode.FORBIDDEN, "Your role cannot perform this action.");
    }

    private void write(HttpServletRequest request, HttpServletResponse response, ErrorCode code, String detail)
            throws IOException {
        Problem problem = Problem.of(code, detail, RequestIdFilter.of(request), null);
        response.setStatus(problem.status());
        response.setContentType(Problem.PROBLEM_JSON.toString());
        if (code == ErrorCode.UNAUTHENTICATED) {
            response.setHeader("WWW-Authenticate", "Bearer");
        }
        json.writeValue(response.getOutputStream(), problem);
    }
}
