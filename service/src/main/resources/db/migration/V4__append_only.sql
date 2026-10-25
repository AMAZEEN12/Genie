-- V4: status_history is append-only
CREATE OR REPLACE FUNCTION fn_status_history_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'status_history is append-only: updates and deletes are forbidden';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_status_history_append_only
BEFORE UPDATE OR DELETE ON status_history
FOR EACH ROW
EXECUTE FUNCTION fn_status_history_append_only();
