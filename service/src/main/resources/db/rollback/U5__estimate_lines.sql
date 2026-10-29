-- Undo of V5__estimate_lines.sql (DM13). Run by MigrationUndo, never by Flyway.
DROP TRIGGER IF EXISTS estimate_total_matches_lines ON estimate;
DROP TRIGGER IF EXISTS estimate_lines_match_total ON estimate_line;
DROP FUNCTION IF EXISTS fn_estimate_lines_match_total();
DROP TABLE IF EXISTS estimate_line;
