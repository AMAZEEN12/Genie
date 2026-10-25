-- V2: Maintenance requests table with domain constraints
CREATE TABLE maintenance_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(32) NOT NULL UNIQUE,
    idempotency_key UUID UNIQUE,
    request_hash VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    building VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'REPORTED',
        'ASSIGNED',
        'ESTIMATE_SUBMITTED',
        'ESTIMATE_APPROVED',
        'IN_PROGRESS',
        'COMPLETED',
        'VERIFIED_CLOSED'
    )),
    reported_by UUID NOT NULL REFERENCES app_user(id),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    technician_id UUID REFERENCES app_user(id),
    assigned_by UUID REFERENCES app_user(id),
    deadline TIMESTAMPTZ,
    override BOOLEAN NOT NULL DEFAULT false,
    override_reason TEXT,
    override_by UUID REFERENCES app_user(id),
    override_review VARCHAR(20) CHECK (override_review IS NULL OR override_review IN ('ACCEPTED', 'FLAGGED')),
    override_reviewed_by UUID REFERENCES app_user(id),
    override_review_note TEXT,
    work_done TEXT,
    actual_cost_kobo BIGINT CHECK (actual_cost_kobo IS NULL OR actual_cost_kobo >= 0),
    completed_on DATE,
    verified_by UUID REFERENCES app_user(id),
    verified_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_request_override_urgent CHECK (NOT override OR priority = 'URGENT'),
    CONSTRAINT chk_request_override_reason CHECK (override = (override_reason IS NOT NULL)),
    CONSTRAINT chk_request_close_completion CHECK (
        status <> 'VERIFIED_CLOSED' OR (
            work_done IS NOT NULL AND actual_cost_kobo IS NOT NULL AND completed_on IS NOT NULL
        )
    ),
    CONSTRAINT chk_request_close_override_review CHECK (
        status <> 'VERIFIED_CLOSED' OR NOT override OR override_review IS NOT NULL
    ),
    CONSTRAINT chk_request_no_self_verify CHECK (
        verified_by IS NULL OR verified_by <> technician_id
    )
);

CREATE INDEX idx_maintenance_request_status ON maintenance_request(status);
CREATE INDEX idx_maintenance_request_reported_by ON maintenance_request(reported_by);
CREATE INDEX idx_maintenance_request_technician_id ON maintenance_request(technician_id);
