package ng.tesa.genie.common;

public class FileValidationException extends RuntimeException {
    private final ErrorCode code;

    public FileValidationException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }
}
