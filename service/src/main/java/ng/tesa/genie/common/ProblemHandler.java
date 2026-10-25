package ng.tesa.genie.common;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import ng.tesa.genie.config.RequestIdFilter;
import tools.jackson.core.JacksonException;

@RestControllerAdvice
public class ProblemHandler {

    private static final Logger log = LoggerFactory.getLogger(ProblemHandler.class);

    private static ResponseEntity<Problem> problem(HttpServletRequest request, ErrorCode code, String detail,
                                                   List<Problem.FieldError> errors) {
        return Problem.of(code, detail, RequestIdFilter.of(request), errors).toResponse();
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Problem> notFound(NotFoundException e, HttpServletRequest request) {
        return problem(request, ErrorCode.NOT_FOUND, e.getMessage(), null);
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<Problem> conflict(ConflictException e, HttpServletRequest request) {
        return problem(request, e.code(), e.getMessage(), null);
    }

    @ExceptionHandler(ForbiddenException.class)
    ResponseEntity<Problem> forbidden(ForbiddenException e, HttpServletRequest request) {
        return problem(request, e.code(), e.getMessage(), null);
    }

    @ExceptionHandler(IdempotencyKeyReusedException.class)
    ResponseEntity<Problem> idempotencyKeyReused(IdempotencyKeyReusedException e, HttpServletRequest request) {
        return problem(request, ErrorCode.IDEMPOTENCY_KEY_REUSED, e.getMessage(), null);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Problem> unauthenticated(AuthenticationException e, HttpServletRequest request) {
        return problem(request, ErrorCode.UNAUTHENTICATED, e.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Problem> invalidBody(MethodArgumentNotValidException e, HttpServletRequest request) {
        List<Problem.FieldError> errors = e.getBindingResult().getFieldErrors().stream()
                .map(f -> new Problem.FieldError(f.getField(), f.getDefaultMessage()))
                .sorted(java.util.Comparator.comparing(Problem.FieldError::field))
                .toList();
        return problem(request, ErrorCode.VALIDATION_FAILED, "The request body is not valid.", errors);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<Problem> invalidParameters(HandlerMethodValidationException e, HttpServletRequest request) {
        List<Problem.FieldError> errors = new ArrayList<>();
        e.getParameterValidationResults().forEach(result -> {
            String name = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(error -> errors.add(new Problem.FieldError(name, error.getDefaultMessage())));
        });
        return problem(request, ErrorCode.VALIDATION_FAILED, "A parameter is not valid.", errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Problem> unreadable(HttpMessageNotReadableException e, HttpServletRequest request) {
        String field = "body";
        String message = "is not valid JSON for this request";
        if (e.getCause() instanceof JacksonException jackson && !jackson.getPath().isEmpty()) {
            field = jackson.getPath().stream()
                    .map(ref -> ref.getPropertyName() != null ? "." + ref.getPropertyName() : "[" + ref.getIndex() + "]")
                    .collect(Collectors.joining()).replaceFirst("^\\.", "");
            message = jackson.getClass().getSimpleName().startsWith("UnrecognizedProperty")
                    ? "is not a known field" : "has the wrong type (numbers must be whole numbers)";
        }
        return problem(request, ErrorCode.VALIDATION_FAILED, "The request body could not be read.",
                List.of(new Problem.FieldError(field, message)));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<Problem> typeMismatch(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        return problem(request, ErrorCode.VALIDATION_FAILED, "A parameter has the wrong format.",
                List.of(new Problem.FieldError(e.getName(), "has the wrong format")));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    ResponseEntity<Problem> missingHeader(MissingRequestHeaderException e, HttpServletRequest request) {
        return problem(request, ErrorCode.VALIDATION_FAILED, "A required header is missing.",
                List.of(new Problem.FieldError(e.getHeaderName(), "is required")));
    }

    @ExceptionHandler({CannotGetJdbcConnectionException.class, DataAccessResourceFailureException.class})
    ResponseEntity<Problem> databaseDown(RuntimeException e, HttpServletRequest request) {
        log.warn("Database unavailable: {}", e.getMessage());
        return problem(request, ErrorCode.DATABASE_UNAVAILABLE, "The database can't be reached. Try again shortly.", null);
    }

    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class,
            HttpMediaTypeNotSupportedException.class, HttpMediaTypeNotAcceptableException.class,
            ErrorResponseException.class})
    ResponseEntity<Problem> framework(Exception e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.resolve(((ErrorResponse) e).getStatusCode().value());
        if (status == HttpStatus.NOT_FOUND) {
            return problem(request, ErrorCode.NOT_FOUND, "No such address.", null);
        }
        Problem p = Problem.of(ErrorCode.VALIDATION_FAILED, e.getMessage(), RequestIdFilter.of(request), null);
        int code = status != null ? status.value() : 400;
        return new Problem(p.type(), p.title(), code, p.detail(), p.code(), p.requestId(), null).toResponse();
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Problem> unexpected(Exception e, HttpServletRequest request) {
        log.error("Unexpected error", e);
        return problem(request, ErrorCode.INTERNAL_ERROR, "Something went wrong. The request ID helps us find it.", null);
    }
}
