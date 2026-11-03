-- U6: Rollback receipts and tenant hierarchy
DROP TABLE IF EXISTS receipt_audit_log CASCADE;
DROP TABLE IF EXISTS receipt CASCADE;
ALTER TABLE app_user DROP COLUMN IF EXISTS manager_id;
ALTER TABLE app_user DROP COLUMN IF EXISTS org_id;
