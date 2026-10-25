package ng.tesa.genie.common;

public class ConflictException extends RuntimeException {
    private final ErrorCode code;

    public ConflictException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }
}
