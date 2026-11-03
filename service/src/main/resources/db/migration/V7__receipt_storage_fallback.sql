-- V7: Persistent database fallback storage for receipt file binaries
CREATE TABLE receipt_file (
    receipt_id UUID PRIMARY KEY REFERENCES receipt(id) ON DELETE CASCADE,
    file_bytes BYTEA NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_receipt_file_receipt_id ON receipt_file(receipt_id);
