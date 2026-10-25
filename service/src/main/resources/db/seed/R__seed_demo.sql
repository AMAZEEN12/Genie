-- Genie Demo Seed (R13: >= 30 requests across all 7 statuses + awkward cases)
-- Only executes when the database has no maintenance requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM maintenance_request LIMIT 1) THEN
        RETURN;
    END IF;

    -- Demo Users (Password for all: Genie-Demo-2026)
    INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES ('20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'employee@genie.test', '$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O', 'Tunde Balogun (Employee)', 'EMPLOYEE') ON CONFLICT (id) DO NOTHING;
    INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES ('0c66451e-efb9-5662-b386-d98005f7a504', 'manager@genie.test', '$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O', 'Chioma Nwosu (Operations Manager)', 'MANAGER') ON CONFLICT (id) DO NOTHING;
    INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES ('01a755a8-ed55-52eb-be2c-6851900a07e3', 'technician@genie.test', '$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O', 'Emeka Obi (Lead Technician)', 'TECHNICIAN') ON CONFLICT (id) DO NOTHING;
    INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES ('8ee1fe13-dc91-5486-93f1-a95e68809973', 'technician2@genie.test', '$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O', 'Fatima Aliyu (HVAC Specialist)', 'TECHNICIAN') ON CONFLICT (id) DO NOTHING;
    INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES ('3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'finance@genie.test', '$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O', 'Babajide Adeleke (Finance Officer)', 'FINANCE') ON CONFLICT (id) DO NOTHING;

    -- Maintenance Requests
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '67518891-24dc-54c5-9885-a00ecc541fa7', 'GEN-001', '3c14b32c-6e6e-5d5b-a41c-6659bdb13732', 'hash-GEN-001', 'Flickering fluorescent tube in reception', 'Reception light fixtures flickering intermittently',
        'Main Tower', 'Ground Floor', 'Fluorescent Fixture', 'Electrical', 'LOW', 'REPORTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', NULL, NULL, NULL,
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('67518891-24dc-54c5-9885-a00ecc541fa7', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'fc9a074c-cf2f-57c1-87fb-5b3d897762c4', 'GEN-002', '05d381bc-7417-546b-85d3-8941bceb9522', 'hash-GEN-002', 'Leaking tap in 3rd floor kitchenette', 'Sink faucet dripping continuously',
        'Annex Building', 'Floor 3', 'Kitchenette Sink', 'Plumbing', 'MEDIUM', 'REPORTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', NULL, NULL, NULL,
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('fc9a074c-cf2f-57c1-87fb-5b3d897762c4', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'c401b210-a4bd-5f4e-b0a5-19d7bff069c9', 'GEN-003', '67e3be54-2399-5ba3-b3f1-cfee6377288d', 'hash-GEN-003', 'Broken caster wheel on executive chair', 'Right rear wheel snapped off chair',
        'Tech Hub', 'Room 204', 'Ergonomic Chair', 'Office Furniture', 'LOW', 'REPORTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', NULL, NULL, NULL,
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c401b210-a4bd-5f4e-b0a5-19d7bff069c9', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'e1e1d0e2-5ae0-5b21-b216-192620ebd0eb', 'GEN-004', '6945277f-32ae-57d9-9e5e-4d844dc2eb8d', 'hash-GEN-004', 'Loose door handle on server room', 'Handle jiggling and difficult to latch',
        'Main Tower', 'Basement', 'Access Door', 'Structural', 'HIGH', 'REPORTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', NULL, NULL, NULL,
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e1e1d0e2-5ae0-5b21-b216-192620ebd0eb', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'a563e039-8b11-5871-addb-7459a91d6b7a', 'GEN-005', '0e180791-36b7-523c-93ed-536340895aba', 'hash-GEN-005', 'Air conditioning unit making rattling noise', 'Split unit rattling loudly when compressor kicks in',
        'Tech Hub', 'Floor 1', 'Split AC Unit', 'HVAC', 'MEDIUM', 'REPORTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', NULL, NULL, NULL,
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a563e039-8b11-5871-addb-7459a91d6b7a', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '3068be38-a6fc-52d1-aafa-9d889e20b7d3', 'GEN-006', 'c4c5212d-2abf-54ee-9f27-120890e279c0', 'hash-GEN-006', 'Conference room projector HDMI port loose', 'HDMI port on ceiling mounted projector intermittently disconnects',
        'Main Tower', 'Boardroom', 'Epson Projector', 'IT Hardware', 'MEDIUM', 'ASSIGNED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('3068be38-a6fc-52d1-aafa-9d889e20b7d3', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('3068be38-a6fc-52d1-aafa-9d889e20b7d3', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'f8ced524-ed5a-5a58-a3e8-ea1dac2bbf1e', 'GEN-007', 'd2bfa26e-cbd2-5f72-a0ee-c030c6c2332b', 'hash-GEN-007', 'Water heater tripping circuit breaker', 'Bathroom water heater trips breaker when powered on',
        'Annex Building', 'Floor 2 Restroom', 'Ariston Heater', 'Electrical', 'HIGH', 'ASSIGNED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f8ced524-ed5a-5a58-a3e8-ea1dac2bbf1e', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f8ced524-ed5a-5a58-a3e8-ea1dac2bbf1e', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'a710e6fe-059f-542e-ba35-83d184931275', 'GEN-008', 'bfc47ba4-0492-59d4-bf82-33ce92a94779', 'hash-GEN-008', 'Clogged stormwater drain outside entrance', 'Leaves and silt clogging drain grate',
        'Logistics Park', 'Gate 1', 'Drainage Grate', 'Plumbing', 'LOW', 'ASSIGNED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a710e6fe-059f-542e-ba35-83d184931275', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a710e6fe-059f-542e-ba35-83d184931275', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '4af08e0c-3ce0-553d-9320-18ee7be2f062', 'GEN-009', '670be1e4-7d77-56cf-8ecd-a73cc5136463', 'hash-GEN-009', 'Window latch broken in accounting', 'Window cannot be securely locked after hours',
        'Main Tower', 'Floor 4', 'Casement Window', 'Structural', 'MEDIUM', 'ASSIGNED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4af08e0c-3ce0-553d-9320-18ee7be2f062', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4af08e0c-3ce0-553d-9320-18ee7be2f062', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'e0df1cee-dc8a-5039-85e2-883639c8eb88', 'GEN-010', 'ed28b66f-b18c-519b-a221-d23d10417f58', 'hash-GEN-010', 'Main corridor lighting replacement', 'Replace 10 old halogen tubes with energy saving LEDs',
        'Annex Building', 'Hallway 1', 'Corridor Lighting', 'Electrical', 'MEDIUM', 'ASSIGNED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e0df1cee-dc8a-5039-85e2-883639c8eb88', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e0df1cee-dc8a-5039-85e2-883639c8eb88', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'e4b2c1a2-387c-5521-bfa6-f988d604643f', 'GEN-011', '9fa84fad-c057-59be-8579-bf21df1b1b8a', 'hash-GEN-011', 'UPS battery replacement in data room', 'UPS unit beep alarm indicates battery bank degradation',
        'Tech Hub', 'Server Room', 'APC Smart-UPS 3000', 'Electrical', 'HIGH', 'ESTIMATE_SUBMITTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e4b2c1a2-387c-5521-bfa6-f988d604643f', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e4b2c1a2-387c-5521-bfa6-f988d604643f', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '7ef1ef28-23d2-52ba-a081-499e1c2ee2ec', 'GEN-012', 'f619a638-c658-523f-941f-65446915fe7a', 'hash-GEN-012', 'Broken glass pane on partition', 'Frosted glass partition cracked during furniture move',
        'Main Tower', 'Floor 2', 'Glass Partition', 'Structural', 'MEDIUM', 'ESTIMATE_SUBMITTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('7ef1ef28-23d2-52ba-a081-499e1c2ee2ec', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('7ef1ef28-23d2-52ba-a081-499e1c2ee2ec', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'ef68b278-ae8c-53de-bb93-21d49f8bdab0', 'GEN-013', '569ac958-0b2d-5a25-a83a-1018cc93c511', 'hash-GEN-013', 'Restroom exhaust fan motor seized', 'Ceiling ventilation fan hums but does not rotate',
        'Annex Building', 'Restroom B', 'Exhaust Fan', 'HVAC', 'LOW', 'ESTIMATE_SUBMITTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ef68b278-ae8c-53de-bb93-21d49f8bdab0', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ef68b278-ae8c-53de-bb93-21d49f8bdab0', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '9038cd0c-e0ed-5e96-a4a1-2730485c6a35', 'GEN-014', 'a99ed474-8e8b-59c1-b550-220e6c7ed494', 'hash-GEN-014', 'Water pump pressure switch malfunctioning', 'Borehole booster pump cycling rapidly every 5 seconds',
        'Logistics Park', 'Pump House', 'Grundfos Pump', 'Plumbing', 'HIGH', 'ESTIMATE_SUBMITTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('9038cd0c-e0ed-5e96-a4a1-2730485c6a35', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('9038cd0c-e0ed-5e96-a4a1-2730485c6a35', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '14f0eefa-3c11-5626-8ab2-f9f495a89791', 'GEN-015', '6d351a93-546c-59fc-be01-aab2545fec00', 'hash-GEN-015', 'Executive desk drawer lock jammed', 'Key stuck in cylinder, cannot lock drawer',
        'Main Tower', 'Suite 501', 'Executive Desk', 'Office Furniture', 'LOW', 'ESTIMATE_SUBMITTED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14f0eefa-3c11-5626-8ab2-f9f495a89791', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14f0eefa-3c11-5626-8ab2-f9f495a89791', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '0c43ea40-4eb8-506c-bf43-b5427e5fae99', 'GEN-016', 'be16f8bc-7827-5e3f-b5ab-59714e83c7bb', 'hash-GEN-016', 'Main distribution board surge protector blown', 'Surge protection device cartridge flag is red',
        'Main Tower', 'Switchgear Room', 'Schneider SPD', 'Electrical', 'HIGH', 'ESTIMATE_APPROVED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0c43ea40-4eb8-506c-bf43-b5427e5fae99', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0c43ea40-4eb8-506c-bf43-b5427e5fae99', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '14cedace-b865-56d4-b931-9581dcf25042', 'GEN-017', '4978be6b-01ee-5de3-9582-f71974ee5903', 'hash-GEN-017', 'Cafeteria commercial microwave sparking', 'Microwave interior sparking around waveguide cover',
        'Annex Building', 'Cafeteria', 'Panasonic Commercial Oven', 'Electrical', 'MEDIUM', 'ESTIMATE_APPROVED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14cedace-b865-56d4-b931-9581dcf25042', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14cedace-b865-56d4-b931-9581dcf25042', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '0d203076-c930-5892-9fd1-2a95c914cadb', 'GEN-018', '28ded36a-5676-5505-8025-7fbc08847a3f', 'hash-GEN-018', 'Overhead garage door roller off track', 'Warehouse loading bay shutter jammed halfway',
        'Warehouse East', 'Bay 3', 'Roller Shutter', 'Structural', 'HIGH', 'ESTIMATE_APPROVED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0d203076-c930-5892-9fd1-2a95c914cadb', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0d203076-c930-5892-9fd1-2a95c914cadb', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'fed63f7f-b511-599d-b308-8e053f62f93b', 'GEN-019', '7579318b-2101-5f95-8a76-5c8349956638', 'hash-GEN-019', 'Server rack cooling fan replacement', 'Top intake fan on Rack 4 failing RPM check',
        'Tech Hub', 'Server Room', 'Rack Fan Unit', 'HVAC', 'MEDIUM', 'ESTIMATE_APPROVED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('fed63f7f-b511-599d-b308-8e053f62f93b', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('fed63f7f-b511-599d-b308-8e053f62f93b', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '33889476-0cdb-52c3-b391-502c33fd5048', 'GEN-020', 'c051e777-1603-5fc3-98db-3911c0cd170f', 'hash-GEN-020', 'Executive boardroom table surface refinishing', 'Deep scratch across walnut veneer table',
        'Main Tower', 'Boardroom', 'Boardroom Table', 'Office Furniture', 'LOW', 'ESTIMATE_APPROVED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('33889476-0cdb-52c3-b391-502c33fd5048', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('33889476-0cdb-52c3-b391-502c33fd5048', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '45fb1315-af15-5638-addc-39613f5555fa', 'GEN-021', '9704d1df-b24b-5585-ae56-08b46aab38e8', 'hash-GEN-021', 'HVAC central chiller refrigerant leak', 'Gas sensor alert in mechanical penthouse',
        'Main Tower', 'Rooftop Plant', 'Daikin Chiller', 'HVAC', 'HIGH', 'IN_PROGRESS',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('45fb1315-af15-5638-addc-39613f5555fa', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('45fb1315-af15-5638-addc-39613f5555fa', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 'GEN-022', '09de901f-5b1e-509e-a884-a4e4ada23690', 'hash-GEN-022', 'Main sewer line blockage', 'Ground floor toilets backing up into inspection chamber',
        'Main Tower', 'External Drain', 'Main Sewer Manhole', 'Plumbing', 'HIGH', 'IN_PROGRESS',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '6626031c-bde4-5517-9ee9-3484315cd05a', 'GEN-023', '046d61e9-4c22-5979-9206-d50c8f13a6be', 'hash-GEN-023', 'Emergency exit signage illumination failure', 'Backlit emergency signs unlit on fire escape',
        'Warehouse East', 'Fire Exit 2', 'LED Emergency Sign', 'Electrical', 'MEDIUM', 'IN_PROGRESS',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('6626031c-bde4-5517-9ee9-3484315cd05a', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('6626031c-bde4-5517-9ee9-3484315cd05a', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '8253aa5d-f6ff-5be1-a016-1141e10288a1', 'GEN-024', '87edf702-8a78-5769-a995-4e6841f4c61a', 'hash-GEN-024', 'Network rack cable tray sagging', 'Cable basket overloaded above switch rack 2',
        'Tech Hub', 'MDF Room', 'Cable Tray', 'Structural', 'MEDIUM', 'IN_PROGRESS',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('8253aa5d-f6ff-5be1-a016-1141e10288a1', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('8253aa5d-f6ff-5be1-a016-1141e10288a1', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '982b6a70-cb77-555d-a7d6-700b8cc90424', 'GEN-025', '89213f57-8392-5c19-a7f4-c255b8de0376', 'hash-GEN-025', 'Catastrophic server room water pipe burst', 'Overhead chilled water pipe ruptured directly above server rack B',
        'Tech Hub', 'Server Room', 'Chilled Water Pipe', 'Plumbing', 'URGENT', 'IN_PROGRESS',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        true, 'Flood risk to active core switches; immediate containment required before quote approval', '0c66451e-efb9-5662-b386-d98005f7a504', NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('982b6a70-cb77-555d-a7d6-700b8cc90424', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('982b6a70-cb77-555d-a7d6-700b8cc90424', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'a44f7d7d-ab5b-5975-b536-d843895ae884', 'GEN-026', '88a637db-4187-50a9-8351-3254922a8198', 'hash-GEN-026', 'Security gate boom barrier motor burnt', 'Boom barrier failed to lift for staff entry',
        'Logistics Park', 'Main Gate', 'CAME Barrier Motor', 'Electrical', 'HIGH', 'COMPLETED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Replaced 24V DC motor and tuned end-stop limit switches', 8500000, '2026-10-24', NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '950a1517-8f74-519b-9637-de554b61ef6d', 'GEN-027', 'f1c2ac9f-4d7f-5256-8487-c23e7f77215b', 'hash-GEN-027', 'Ceiling water stain inspection and repair', 'Acoustic ceiling tiles damp from condensation drip',
        'Main Tower', 'Floor 3', 'Ceiling Tiles & Tray', 'HVAC', 'MEDIUM', 'COMPLETED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Cleared blocked drain line, insulated pipe, replaced 4 tiles', 3200000, '2026-10-24', NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'f7155a65-bbae-58ec-b364-3dec34248617', 'GEN-028', '0cdce402-a7a3-5069-9440-41536bc3a4ba', 'hash-GEN-028', 'Generator fuel transfer pump seal replacement', 'Diesel leaking from transfer pump gland',
        'Warehouse East', 'Generator House', 'Cat C15 Genset Pump', 'Electrical', 'HIGH', 'COMPLETED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Fitted new Viton mechanical seal and pressure tested', 14500000, '2026-10-23', NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '84f57b04-b919-5445-bd3a-ecaf8341a247', 'GEN-029', 'd38d923a-9012-5cf4-b476-25cc583ebca3', 'hash-GEN-029', 'Fire extinguisher bracket detachment', 'CO2 extinguisher wall bracket pulled out from drywall',
        'Annex Building', 'Hallway 2', 'Fire Point Bracket', 'Structural', 'MEDIUM', 'COMPLETED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Mounted plywood backer and re-anchored bracket with heavy-duty bolts', 1800000, '2026-10-24', NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'GEN-030', '13d04ede-7d55-56cd-8c79-2cf5123d8572', 'hash-GEN-030', 'Training room smart display audio distortion', 'Right channel speaker buzzing loudly',
        'Tech Hub', 'Training Room', 'Samsung 75 Interactive Board', 'IT Hardware', 'LOW', 'COMPLETED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Replaced internal audio amplifier board and verified stereo playback', 5200000, '2026-10-24', NULL, NULL, 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'GEN-031', '6159456c-1a13-51ab-b9bb-8d716f2cf0f9', 'hash-GEN-031', 'Basement sump pump total failure', 'Heavy rain caused water ingress, sump pump seized',
        'Main Tower', 'Basement', 'Ebara Sump Pump', 'Plumbing', 'HIGH', 'VERIFIED_CLOSED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Full impeller overhaul and rewound stator coils', 28500000, '2026-10-22', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp(), 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'c70fcbe0-56bb-55ab-8265-1acffa698f04', 'GEN-032', '5f9a0fa7-96d6-578a-a334-82748083e460', 'hash-GEN-032', 'Main electrical intake cable short circuit', 'Cable smoking at busbar connection during morning peak load',
        'Main Tower', 'Substation', '11kV Transformer Cable', 'Electrical', 'URGENT', 'VERIFIED_CLOSED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        true, 'Risk of transformer fire and total blackout; immediate cable re-termination required', '0c66451e-efb9-5662-b386-d98005f7a504', 'ACCEPTED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Appropriate emergency containment confirmed',
        'Re-terminated 185mm2 4-core armoured cable with heat-shrink lugs', 42000000, '2026-10-21', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp(), 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '42e5dde9-6c77-5f17-a629-643e503ef9fa', 'GEN-033', 'ef0c91a8-04bb-514d-b020-017af3902da4', 'hash-GEN-033', 'Kitchen grease trap overflow', 'Commercial grease trap clogged causing foul odor',
        'Annex Building', 'Canteen', 'Grease Interceptor', 'Plumbing', 'HIGH', 'VERIFIED_CLOSED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Mechanically cleared blockage and dosed enzyme treatment', 7500000, '2026-10-20', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp(), 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'GEN-034', '9f169199-425d-5ddf-8846-6a64d6d09395', 'hash-GEN-034', 'CCTV outdoor camera PTZ motor failure', 'Perimeter camera stuck facing boundary wall',
        'Logistics Park', 'North Fence', 'Hikvision PTZ', 'IT Hardware', 'MEDIUM', 'VERIFIED_CLOSED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '01a755a8-ed55-52eb-be2c-6851900a07e3', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Replaced PTZ gearbox and restored preset scan tour', 9600000, '2026-10-21', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp(), 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        'ffde950e-0a51-53f0-8065-a618b4e87770', 'GEN-035', '59886fe4-4160-574e-90ee-ac549aaf3986', 'hash-GEN-035', 'Main entry turnstile optical sensor misalignment', 'Turnstile refusing visitor badge tap',
        'Main Tower', 'Lobby', 'Boon Edam Turnstile', 'Structural', 'LOW', 'VERIFIED_CLOSED',
        '20f89bc1-9ac5-5637-8cf7-90d23a80f420', clock_timestamp() - INTERVAL '5 days', '8ee1fe13-dc91-5486-93f1-a95e68809973', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp() + INTERVAL '2 days',
        false, NULL, NULL, NULL, NULL, NULL,
        'Realigned optical emitter/receiver pairs and cleaned lenses', 2400000, '2026-10-22', '0c66451e-efb9-5662-b386-d98005f7a504', clock_timestamp(), 1
    );
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', NULL, 'REPORTED', '20f89bc1-9ac5-5637-8cf7-90d23a80f420', 'Fault reported');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'REPORTED', 'ASSIGNED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Assigned to technician');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decision_reason, decided_by, decided_at)
    VALUES ('64243da2-21f2-5243-8268-b026a8b41c89', 'e0df1cee-dc8a-5039-85e2-883639c8eb88', 18000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'REJECTED', 'Quotation is 30% above standard framework rates', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '2 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e0df1cee-dc8a-5039-85e2-883639c8eb88', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Initial estimate submitted: 18000000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e0df1cee-dc8a-5039-85e2-883639c8eb88', 'ESTIMATE_SUBMITTED', 'ASSIGNED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate rejected by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('d9e10124-fe44-5db5-84a3-a23b014808f3', 'e4b2c1a2-387c-5521-bfa6-f988d604643f', 6500000, '01a755a8-ed55-52eb-be2c-6851900a07e3');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('e4b2c1a2-387c-5521-bfa6-f988d604643f', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 6500000 kobo');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('7b498c66-0482-583c-a593-d7f873e0474f', '7ef1ef28-23d2-52ba-a081-499e1c2ee2ec', 4200000, '01a755a8-ed55-52eb-be2c-6851900a07e3');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('7ef1ef28-23d2-52ba-a081-499e1c2ee2ec', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 4200000 kobo');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('e236dafb-f5ff-5288-8786-1c96b1fcaf90', 'ef68b278-ae8c-53de-bb93-21d49f8bdab0', 1500000, '01a755a8-ed55-52eb-be2c-6851900a07e3');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ef68b278-ae8c-53de-bb93-21d49f8bdab0', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 1500000 kobo');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('99e2cc96-e885-5743-ba10-4b9a8eead4f5', '9038cd0c-e0ed-5e96-a4a1-2730485c6a35', 8800000, '01a755a8-ed55-52eb-be2c-6851900a07e3');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('9038cd0c-e0ed-5e96-a4a1-2730485c6a35', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 8800000 kobo');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('fb19eb51-c8fa-512a-ab34-98b009ae386e', '14f0eefa-3c11-5626-8ab2-f9f495a89791', 950000, '01a755a8-ed55-52eb-be2c-6851900a07e3');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14f0eefa-3c11-5626-8ab2-f9f495a89791', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 950000 kobo');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('9e50fca8-174a-56e9-a1f7-59394541cdb3', '0c43ea40-4eb8-506c-bf43-b5427e5fae99', 12000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '1 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0c43ea40-4eb8-506c-bf43-b5427e5fae99', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 12000000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0c43ea40-4eb8-506c-bf43-b5427e5fae99', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('50f5552c-5c19-5616-ac02-136b63682bb6', '14cedace-b865-56d4-b931-9581dcf25042', 3500000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '1 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14cedace-b865-56d4-b931-9581dcf25042', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 3500000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('14cedace-b865-56d4-b931-9581dcf25042', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('355f406d-fc5c-59fe-8d5d-cd9ddf71ee6c', '0d203076-c930-5892-9fd1-2a95c914cadb', 15000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '1 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0d203076-c930-5892-9fd1-2a95c914cadb', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 15000000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('0d203076-c930-5892-9fd1-2a95c914cadb', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('23ea5065-fc76-5575-8346-449770f0cacf', 'fed63f7f-b511-599d-b308-8e053f62f93b', 2800000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '1 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('fed63f7f-b511-599d-b308-8e053f62f93b', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 2800000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('fed63f7f-b511-599d-b308-8e053f62f93b', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('b92259ef-ba36-5777-bb05-42fa08a0a29a', '33889476-0cdb-52c3-b391-502c33fd5048', 4500000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '1 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('33889476-0cdb-52c3-b391-502c33fd5048', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted: 4500000 kobo');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('33889476-0cdb-52c3-b391-502c33fd5048', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved by finance');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('899bbf0f-bd6d-5747-b91b-b29c02f908ed', '45fb1315-af15-5638-addc-39613f5555fa', 22000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '2 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('45fb1315-af15-5638-addc-39613f5555fa', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('45fb1315-af15-5638-addc-39613f5555fa', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('45fb1315-af15-5638-addc-39613f5555fa', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('beab053b-d6dd-5dfb-8caa-f82dd157a6c0', '4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 9500000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '2 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('4dcc7b5c-fae9-5ee4-bdf0-9c6fbb1b4450', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('5f7aade2-9352-503b-942a-5fe12bbc886e', '6626031c-bde4-5517-9ee9-3484315cd05a', 2600000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '2 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('6626031c-bde4-5517-9ee9-3484315cd05a', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('6626031c-bde4-5517-9ee9-3484315cd05a', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('6626031c-bde4-5517-9ee9-3484315cd05a', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('3d24b541-ef87-5d8a-b6d4-b2f9a8edbb68', '8253aa5d-f6ff-5be1-a016-1141e10288a1', 3800000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '2 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('8253aa5d-f6ff-5be1-a016-1141e10288a1', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('8253aa5d-f6ff-5be1-a016-1141e10288a1', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('8253aa5d-f6ff-5be1-a016-1141e10288a1', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('982b6a70-cb77-555d-a7d6-700b8cc90424', 'ASSIGNED', 'IN_PROGRESS', '0c66451e-efb9-5662-b386-d98005f7a504', 'Urgent override started by operations manager');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('9831a4af-4624-5b6a-b3b9-bc3c1b5c2c50', 'a44f7d7d-ab5b-5975-b536-d843895ae884', 8000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '3 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('a44f7d7d-ab5b-5975-b536-d843895ae884', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Repair completed');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('ac3a5998-0f59-5029-9671-9adee256c0af', '950a1517-8f74-519b-9637-de554b61ef6d', 3200000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '3 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('950a1517-8f74-519b-9637-de554b61ef6d', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Repair completed');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('00d9a32e-47c3-595b-8451-e7e09c328303', 'f7155a65-bbae-58ec-b364-3dec34248617', 14000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '3 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('f7155a65-bbae-58ec-b364-3dec34248617', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Repair completed');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('6bc7f0d7-486e-53bd-a5a9-833b2e116e94', '84f57b04-b919-5445-bd3a-ecaf8341a247', 1800000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '3 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('84f57b04-b919-5445-bd3a-ecaf8341a247', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Repair completed');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('cc986268-95f2-5199-82d4-0c1c3a342ce6', '330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 5000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '3 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('330e2bbf-8ff3-5a90-b2ff-8bc78bb5a81b', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Repair completed');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('f628058c-dbd2-5f90-98b4-198d33a29148', '664f90d5-9809-55f0-a2ce-bdde1c8389a3', 25000000, '01a755a8-ed55-52eb-be2c-6851900a07e3', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '4 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Pump overhauled');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('664f90d5-9809-55f0-a2ce-bdde1c8389a3', 'COMPLETED', 'VERIFIED_CLOSED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Verified and closed by manager');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', 'ASSIGNED', 'IN_PROGRESS', '0c66451e-efb9-5662-b386-d98005f7a504', 'Urgent override started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', 'IN_PROGRESS', 'COMPLETED', '01a755a8-ed55-52eb-be2c-6851900a07e3', 'Emergency cable repair completed');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', 'COMPLETED', 'COMPLETED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Override reviewed by finance: ACCEPTED');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('c70fcbe0-56bb-55ab-8265-1acffa698f04', 'COMPLETED', 'VERIFIED_CLOSED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Verified and closed by manager');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('a5a40876-29f1-525c-8db0-213d289baf2a', '42e5dde9-6c77-5f17-a629-643e503ef9fa', 7500000, '8ee1fe13-dc91-5486-93f1-a95e68809973', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '4 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'IN_PROGRESS', 'COMPLETED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work completed');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('42e5dde9-6c77-5f17-a629-643e503ef9fa', 'COMPLETED', 'VERIFIED_CLOSED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Verified and closed by manager');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('a74311c5-13fd-5b43-8196-fbd1628bb5b9', '744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 9600000, '8ee1fe13-dc91-5486-93f1-a95e68809973', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '4 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'IN_PROGRESS', 'COMPLETED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work completed');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('744fcd66-95f1-5ac9-9dd1-99b0e5e505fb', 'COMPLETED', 'VERIFIED_CLOSED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Verified and closed by manager');
    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('9f4b4f66-dc5b-5d86-8145-344cbce61343', 'ffde950e-0a51-53f0-8065-a618b4e87770', 2400000, '8ee1fe13-dc91-5486-93f1-a95e68809973', 'APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', clock_timestamp() - INTERVAL '4 days');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Estimate submitted');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '3b5c8178-a7ad-57c3-856c-39835fbbd27c', 'Estimate approved');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work started');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'IN_PROGRESS', 'COMPLETED', '8ee1fe13-dc91-5486-93f1-a95e68809973', 'Work completed');
    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) VALUES ('ffde950e-0a51-53f0-8065-a618b4e87770', 'COMPLETED', 'VERIFIED_CLOSED', '0c66451e-efb9-5662-b386-d98005f7a504', 'Verified and closed by manager');
END $$;
