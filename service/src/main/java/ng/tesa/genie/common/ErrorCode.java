package ng.tesa.genie.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Forbidden"),
    SELF_APPROVAL(HttpStatus.FORBIDDEN, "Self approval is forbidden"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Not found"),
    ALREADY_ASSIGNED(HttpStatus.CONFLICT, "Request already assigned"),
    ESTIMATE_NOT_APPROVED(HttpStatus.CONFLICT, "Work cannot start without an approved estimate"),
    OVERRIDE_NOT_ALLOWED(HttpStatus.CONFLICT, "Urgent override not allowed"),
    ALREADY_DECIDED(HttpStatus.CONFLICT, "Estimate already decided"),
    CANNOT_CLOSE(HttpStatus.CONFLICT, "Request cannot be verified and closed"),
    INVALID_TRANSITION(HttpStatus.CONFLICT, "Invalid transition"),
    RECEIPT_NOT_FOUND(HttpStatus.NOT_FOUND, "Receipt not found"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Invalid file type. Only JPEG, PNG, WebP, and PDF are accepted"),
    FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "File exceeds maximum size of 10MB"),
    RECEIPT_INVALID_TRANSITION(HttpStatus.CONFLICT, "Invalid receipt status transition"),
    RECEIPT_NOT_APPROVED(HttpStatus.CONFLICT, "Receipt is not approved for reimbursement"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Upload rate limit exceeded"),
    RECEIPT_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Error communicating with storage provider"),
    IDEMPOTENCY_KEY_REUSED(HttpStatus.UNPROCESSABLE_ENTITY, "Idempotency key reused with different payload"),
    DATABASE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Database unavailable"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus status;
    private final String defaultTitle;

    ErrorCode(HttpStatus status, String defaultTitle) {
        this.status = status;
        this.defaultTitle = defaultTitle;
    }

    public HttpStatus status() {
        return status;
    }

    public String defaultTitle() {
        return defaultTitle;
    }
}
