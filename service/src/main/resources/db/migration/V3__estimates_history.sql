-- V3: Estimates and status history
CREATE TABLE estimate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES maintenance_request(id) ON DELETE CASCADE,
    amount_kobo BIGINT NOT NULL CHECK (amount_kobo > 0),
    submitted_by UUID NOT NULL REFERENCES app_user(id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    decision VARCHAR(20) CHECK (decision IS NULL OR decision IN ('APPROVED', 'REJECTED')),
    decision_reason TEXT,
    decided_by UUID REFERENCES app_user(id),
    decided_at TIMESTAMPTZ,
    CONSTRAINT chk_estimate_no_self_approval CHECK (
        decided_by IS NULL OR decided_by <> submitted_by
    )
);

CREATE UNIQUE INDEX uq_estimate_pending ON estimate(request_id) WHERE decision IS NULL;
CREATE INDEX idx_estimate_request_id ON estimate(request_id);

CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES maintenance_request(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    actor_id UUID NOT NULL REFERENCES app_user(id),
    note TEXT,
    at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_status_history_request_id ON status_history(request_id);
