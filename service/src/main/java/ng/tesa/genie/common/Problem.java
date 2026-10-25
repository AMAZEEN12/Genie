package ng.tesa.genie.common;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public record Problem(
        URI type,
        String title,
        int status,
        String detail,
        String code,
        UUID requestId,
        List<FieldError> errors
) {
    public static final URI ABOUT_BLANK = URI.create("about:blank");
    public static final MediaType PROBLEM_JSON = MediaType.parseMediaType("application/problem+json");

    public record FieldError(String field, String message) {
    }

    public static Problem of(ErrorCode code, String detail, UUID requestId, List<FieldError> errors) {
        return new Problem(
                ABOUT_BLANK,
                code.defaultTitle(),
                code.status().value(),
                detail,
                code.name(),
                requestId,
                errors != null && errors.isEmpty() ? null : errors
        );
    }

    public ResponseEntity<Problem> toResponse() {
        return ResponseEntity.status(status).contentType(PROBLEM_JSON).body(this);
    }
}
