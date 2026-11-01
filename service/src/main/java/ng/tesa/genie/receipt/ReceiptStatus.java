package ng.tesa.genie.receipt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ReceiptStatus {
    SUBMITTED("submitted"),
    APPROVED("approved"),
    REJECTED("rejected"),
    REIMBURSED("reimbursed");

    private final String value;

    ReceiptStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String value() {
        return value;
    }

    @JsonCreator
    public static ReceiptStatus fromString(String text) {
        if (text == null) {
            return null;
        }
        for (ReceiptStatus s : ReceiptStatus.values()) {
            if (s.value.equalsIgnoreCase(text) || s.name().equalsIgnoreCase(text)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown receipt status: " + text);
    }
}
