-- V5: estimate cost breakdown (MVP feedback item 6, proposed by Victor Oyeleke).
-- Undo: db/rollback/U5__estimate_lines.sql
--
-- An estimate may carry up to 20 lines, each Labour, Materials or Other with a description and an
-- amount. Estimates submitted before V5 have no lines and keep working unchanged.

CREATE TABLE estimate_line (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID        NOT NULL REFERENCES estimate(id) ON DELETE CASCADE,
    position    SMALLINT    NOT NULL,
    category    VARCHAR(20) NOT NULL,
    description TEXT        NOT NULL,
    amount_kobo BIGINT      NOT NULL,
    CONSTRAINT estimate_line_category_valid      CHECK (category IN ('LABOUR', 'MATERIALS', 'OTHER')),
    CONSTRAINT estimate_line_description_length  CHECK (length(trim(description)) BETWEEN 1 AND 120),
    CONSTRAINT estimate_line_amount_positive     CHECK (amount_kobo > 0),
    CONSTRAINT estimate_line_position_range      CHECK (position BETWEEN 1 AND 20),
    CONSTRAINT estimate_line_position_uq         UNIQUE (estimate_id, position)
);

-- Rule: when an estimate has lines, they add up exactly to its amount_kobo. Checked at commit
-- (deferred), so the estimate and all its lines can be written in one transaction first.
CREATE FUNCTION fn_estimate_lines_match_total() RETURNS TRIGGER AS $$
DECLARE
    est_id     UUID;
    total      BIGINT;
    line_count INT;
    line_sum   BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'estimate' THEN
        est_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        est_id := OLD.estimate_id;
    ELSE
        est_id := NEW.estimate_id;
    END IF;

    SELECT amount_kobo INTO total FROM estimate WHERE id = est_id;
    IF total IS NULL THEN
        RETURN NULL; -- the estimate itself was deleted
    END IF;

    SELECT count(*), coalesce(sum(amount_kobo), 0) INTO line_count, line_sum
    FROM estimate_line WHERE estimate_id = est_id;

    IF line_count > 0 AND line_sum <> total THEN
        RAISE EXCEPTION 'estimate % lines add up to % kobo, but amount_kobo is %', est_id, line_sum, total
            USING ERRCODE = 'check_violation', CONSTRAINT = 'estimate_lines_match_total';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER estimate_lines_match_total
    AFTER INSERT OR UPDATE OR DELETE ON estimate_line
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION fn_estimate_lines_match_total();

CREATE CONSTRAINT TRIGGER estimate_total_matches_lines
    AFTER UPDATE OF amount_kobo ON estimate
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION fn_estimate_lines_match_total();
