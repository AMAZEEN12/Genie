-- V1: User directory and authentication
CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'TECHNICIAN', 'FINANCE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_user_display_name_length CHECK (char_length(display_name) >= 2)
);

CREATE UNIQUE INDEX uq_app_user_email_lower ON app_user (lower(email));
