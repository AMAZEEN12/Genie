package ng.tesa.genie.estimate;

/**
 * One line of an estimate's cost breakdown (MVP feedback item 6; contract {@code EstimateLine}).
 * {@code category} is LABOUR, MATERIALS or OTHER. Money is integer kobo.
 */
public record EstimateLine(String category, String description, long amountKobo) {
}
