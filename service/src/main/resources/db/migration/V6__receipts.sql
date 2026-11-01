-- V6: Receipts and role-based private Cloudinary storage with audit trail

-- Multi-tenancy and reporting hierarchy for app users
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES app_user(id);

UPDATE app_user SET org_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE org_id IS NULL;

-- Wire seeded technicians to the operations manager (Chioma Nwosu)
UPDATE app_user
SET manager_id = '0c66451e-efb9-5662-b386-d98005f7a504'
WHERE id IN ('01a755a8-ed55-52eb-be2c-6851900a07e3', '8ee1fe13-dc91-5486-93f1-a95e68809973');

CREATE TABLE receipt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES app_user(id),
    manager_id UUID REFERENCES app_user(id),
    public_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    format VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('submitted', 'approved', 'rejected', 'reimbursed')),
    original_name VARCHAR(255) NOT NULL,
    bytes BIGINT NOT NULL CHECK (bytes > 0 AND bytes <= 10485760),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    decided_by UUID REFERENCES app_user(id),
    decided_at TIMESTAMPTZ,
    reimbursed_by UUID REFERENCES app_user(id),
    reimbursed_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_receipt_manager_decision CHECK (
        (status NOT IN ('approved', 'rejected')) OR (decided_by IS NOT NULL AND decided_at IS NOT NULL)
    ),
    CONSTRAINT chk_receipt_no_self_approve CHECK (
        decided_by IS NULL OR decided_by <> uploaded_by
    ),
    CONSTRAINT chk_receipt_reimbursed CHECK (
        (status <> 'reimbursed') OR (reimbursed_by IS NOT NULL AND reimbursed_at IS NOT NULL)
    )
);

CREATE INDEX idx_receipt_org_id ON receipt(org_id);
CREATE INDEX idx_receipt_uploaded_by ON receipt(uploaded_by);
CREATE INDEX idx_receipt_manager_id ON receipt(manager_id);
CREATE INDEX idx_receipt_status ON receipt(status);

CREATE TABLE receipt_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID,
    org_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES app_user(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('UPLOAD', 'VIEW', 'DECISION', 'REIMBURSE', 'DELETE')),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_receipt_audit_receipt_id ON receipt_audit_log(receipt_id);
CREATE INDEX idx_receipt_audit_org_id ON receipt_audit_log(org_id);
