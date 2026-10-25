"""Generates service/src/main/resources/db/seed/R__seed_demo.sql for Genie (R13).

Run from the genie directory: python tools/seed/generate_demo_seed.py
"""
import uuid
from pathlib import Path

OUT = Path("service/src/main/resources/db/seed/R__seed_demo.sql")
NS = uuid.UUID("a8d1e345-72bc-4fa8-b23c-9d0e1f2a3b4c")

def uid(name):
    return str(uuid.uuid5(NS, name))

HASH = "$2a$10$y..3twpMMSJdgUcRIhmUyOHtLYh9CRco///Me4HEXgwyyMhOSx.2O"

USERS = [
    ("employee", "employee@genie.test", "Tunde Balogun (Employee)", "EMPLOYEE", uid("user:employee")),
    ("manager", "manager@genie.test", "Chioma Nwosu (Operations Manager)", "MANAGER", uid("user:manager")),
    ("tech1", "technician@genie.test", "Emeka Obi (Lead Technician)", "TECHNICIAN", uid("user:tech1")),
    ("tech2", "technician2@genie.test", "Fatima Aliyu (HVAC Specialist)", "TECHNICIAN", uid("user:tech2")),
    ("finance", "finance@genie.test", "Babajide Adeleke (Finance Officer)", "FINANCE", uid("user:finance")),
]

def make_req(ref, title, desc, bldg, loc, equip, cat, prio, status,
             tech=None, asgn=None,
             override=False, override_reason=None, override_by=None,
             override_review=None, override_reviewed_by=None, override_review_note=None,
             work_done=None, actual_cost_kobo=None, completed_on=None,
             verified_by=None):
    return {
        "ref": ref, "title": title, "desc": desc, "bldg": bldg, "loc": loc,
        "equip": equip, "cat": cat, "prio": prio, "status": status,
        "tech": tech, "asgn": asgn,
        "override": override, "override_reason": override_reason, "override_by": override_by,
        "override_review": override_review, "override_reviewed_by": override_reviewed_by,
        "override_review_note": override_review_note,
        "work_done": work_done, "actual_cost_kobo": actual_cost_kobo,
        "completed_on": completed_on, "verified_by": verified_by,
    }

def generate():
    lines = [
        "-- Genie Demo Seed (R13: >= 30 requests across all 7 statuses + awkward cases)",
        "-- Only executes when the database has no maintenance requests",
        "DO $$",
        "BEGIN",
        "    IF EXISTS (SELECT 1 FROM maintenance_request LIMIT 1) THEN",
        "        RETURN;",
        "    END IF;",
        "",
        "    -- Demo Users (Password for all: Genie-Demo-2026)"
    ]

    for label, email, name, role, u_id in USERS:
        lines.append(f"    INSERT INTO app_user (id, email, password_hash, display_name, role) "
                     f"VALUES ('{u_id}', '{email}', '{HASH}', '{name}', '{role}') "
                     f"ON CONFLICT (id) DO NOTHING;")

    lines.append("")
    lines.append("    -- Maintenance Requests")

    emp_id = uid("user:employee")
    mgr_id = uid("user:manager")
    tech1_id = uid("user:tech1")
    tech2_id = uid("user:tech2")
    fin_id = uid("user:finance")

    # We need >= 30 requests across all statuses:
    # REPORTED: 5
    # ASSIGNED: 5
    # ESTIMATE_SUBMITTED: 5
    # ESTIMATE_APPROVED: 5
    # IN_PROGRESS: 5 (including an urgent override in progress)
    # COMPLETED: 5
    # VERIFIED_CLOSED: 5 (including one with actual cost > estimate, and one verified urgent override with ACCEPTED review)
    # Total: 35 requests

    requests = [
        # --- REPORTED (5) ---
        make_req("GEN-001", "Flickering fluorescent tube in reception", "Reception light fixtures flickering intermittently", "Main Tower", "Ground Floor", "Fluorescent Fixture", "Electrical", "LOW", "REPORTED"),
        make_req("GEN-002", "Leaking tap in 3rd floor kitchenette", "Sink faucet dripping continuously", "Annex Building", "Floor 3", "Kitchenette Sink", "Plumbing", "MEDIUM", "REPORTED"),
        make_req("GEN-003", "Broken caster wheel on executive chair", "Right rear wheel snapped off chair", "Tech Hub", "Room 204", "Ergonomic Chair", "Office Furniture", "LOW", "REPORTED"),
        make_req("GEN-004", "Loose door handle on server room", "Handle jiggling and difficult to latch", "Main Tower", "Basement", "Access Door", "Structural", "HIGH", "REPORTED"),
        make_req("GEN-005", "Air conditioning unit making rattling noise", "Split unit rattling loudly when compressor kicks in", "Tech Hub", "Floor 1", "Split AC Unit", "HVAC", "MEDIUM", "REPORTED"),

        # --- ASSIGNED (5, including a rejected estimate case that went back to ASSIGNED) ---
        make_req("GEN-006", "Conference room projector HDMI port loose", "HDMI port on ceiling mounted projector intermittently disconnects", "Main Tower", "Boardroom", "Epson Projector", "IT Hardware", "MEDIUM", "ASSIGNED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-007", "Water heater tripping circuit breaker", "Bathroom water heater trips breaker when powered on", "Annex Building", "Floor 2 Restroom", "Ariston Heater", "Electrical", "HIGH", "ASSIGNED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-008", "Clogged stormwater drain outside entrance", "Leaves and silt clogging drain grate", "Logistics Park", "Gate 1", "Drainage Grate", "Plumbing", "LOW", "ASSIGNED", tech=tech2_id, asgn=mgr_id),
        make_req("GEN-009", "Window latch broken in accounting", "Window cannot be securely locked after hours", "Main Tower", "Floor 4", "Casement Window", "Structural", "MEDIUM", "ASSIGNED", tech=tech1_id, asgn=mgr_id),
        # Awkward case 1: Rejected estimate returned to ASSIGNED
        make_req("GEN-010", "Main corridor lighting replacement", "Replace 10 old halogen tubes with energy saving LEDs", "Annex Building", "Hallway 1", "Corridor Lighting", "Electrical", "MEDIUM", "ASSIGNED", tech=tech1_id, asgn=mgr_id),

        # --- ESTIMATE_SUBMITTED (5) ---
        make_req("GEN-011", "UPS battery replacement in data room", "UPS unit beep alarm indicates battery bank degradation", "Tech Hub", "Server Room", "APC Smart-UPS 3000", "Electrical", "HIGH", "ESTIMATE_SUBMITTED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-012", "Broken glass pane on partition", "Frosted glass partition cracked during furniture move", "Main Tower", "Floor 2", "Glass Partition", "Structural", "MEDIUM", "ESTIMATE_SUBMITTED", tech=tech2_id, asgn=mgr_id),
        make_req("GEN-013", "Restroom exhaust fan motor seized", "Ceiling ventilation fan hums but does not rotate", "Annex Building", "Restroom B", "Exhaust Fan", "HVAC", "LOW", "ESTIMATE_SUBMITTED", tech=tech2_id, asgn=mgr_id),
        make_req("GEN-014", "Water pump pressure switch malfunctioning", "Borehole booster pump cycling rapidly every 5 seconds", "Logistics Park", "Pump House", "Grundfos Pump", "Plumbing", "HIGH", "ESTIMATE_SUBMITTED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-015", "Executive desk drawer lock jammed", "Key stuck in cylinder, cannot lock drawer", "Main Tower", "Suite 501", "Executive Desk", "Office Furniture", "LOW", "ESTIMATE_SUBMITTED", tech=tech2_id, asgn=mgr_id),

        # --- ESTIMATE_APPROVED (5) ---
        make_req("GEN-016", "Main distribution board surge protector blown", "Surge protection device cartridge flag is red", "Main Tower", "Switchgear Room", "Schneider SPD", "Electrical", "HIGH", "ESTIMATE_APPROVED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-017", "Cafeteria commercial microwave sparking", "Microwave interior sparking around waveguide cover", "Annex Building", "Cafeteria", "Panasonic Commercial Oven", "Electrical", "MEDIUM", "ESTIMATE_APPROVED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-018", "Overhead garage door roller off track", "Warehouse loading bay shutter jammed halfway", "Warehouse East", "Bay 3", "Roller Shutter", "Structural", "HIGH", "ESTIMATE_APPROVED", tech=tech2_id, asgn=mgr_id),
        make_req("GEN-019", "Server rack cooling fan replacement", "Top intake fan on Rack 4 failing RPM check", "Tech Hub", "Server Room", "Rack Fan Unit", "HVAC", "MEDIUM", "ESTIMATE_APPROVED", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-020", "Executive boardroom table surface refinishing", "Deep scratch across walnut veneer table", "Main Tower", "Boardroom", "Boardroom Table", "Office Furniture", "LOW", "ESTIMATE_APPROVED", tech=tech2_id, asgn=mgr_id),

        # --- IN_PROGRESS (5, including Awkward case 2: Urgent Override in progress) ---
        make_req("GEN-021", "HVAC central chiller refrigerant leak", "Gas sensor alert in mechanical penthouse", "Main Tower", "Rooftop Plant", "Daikin Chiller", "HVAC", "HIGH", "IN_PROGRESS", tech=tech2_id, asgn=mgr_id),
        make_req("GEN-022", "Main sewer line blockage", "Ground floor toilets backing up into inspection chamber", "Main Tower", "External Drain", "Main Sewer Manhole", "Plumbing", "HIGH", "IN_PROGRESS", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-023", "Emergency exit signage illumination failure", "Backlit emergency signs unlit on fire escape", "Warehouse East", "Fire Exit 2", "LED Emergency Sign", "Electrical", "MEDIUM", "IN_PROGRESS", tech=tech1_id, asgn=mgr_id),
        make_req("GEN-024", "Network rack cable tray sagging", "Cable basket overloaded above switch rack 2", "Tech Hub", "MDF Room", "Cable Tray", "Structural", "MEDIUM", "IN_PROGRESS", tech=tech2_id, asgn=mgr_id),
        # Awkward case 2: Urgent Override in progress (no approved estimate; override=true)
        make_req("GEN-025", "Catastrophic server room water pipe burst", "Overhead chilled water pipe ruptured directly above server rack B", "Tech Hub", "Server Room", "Chilled Water Pipe", "Plumbing", "URGENT", "IN_PROGRESS", tech=tech1_id, asgn=mgr_id, override=True, override_reason="Flood risk to active core switches; immediate containment required before quote approval", override_by=mgr_id),

        # --- COMPLETED (5) ---
        make_req("GEN-026", "Security gate boom barrier motor burnt", "Boom barrier failed to lift for staff entry", "Logistics Park", "Main Gate", "CAME Barrier Motor", "Electrical", "HIGH", "COMPLETED", tech=tech1_id, asgn=mgr_id, work_done="Replaced 24V DC motor and tuned end-stop limit switches", actual_cost_kobo=8500000, completed_on="2026-10-24"),
        make_req("GEN-027", "Ceiling water stain inspection and repair", "Acoustic ceiling tiles damp from condensation drip", "Main Tower", "Floor 3", "Ceiling Tiles & Tray", "HVAC", "MEDIUM", "COMPLETED", tech=tech2_id, asgn=mgr_id, work_done="Cleared blocked drain line, insulated pipe, replaced 4 tiles", actual_cost_kobo=3200000, completed_on="2026-10-24"),
        make_req("GEN-028", "Generator fuel transfer pump seal replacement", "Diesel leaking from transfer pump gland", "Warehouse East", "Generator House", "Cat C15 Genset Pump", "Electrical", "HIGH", "COMPLETED", tech=tech1_id, asgn=mgr_id, work_done="Fitted new Viton mechanical seal and pressure tested", actual_cost_kobo=14500000, completed_on="2026-10-23"),
        make_req("GEN-029", "Fire extinguisher bracket detachment", "CO2 extinguisher wall bracket pulled out from drywall", "Annex Building", "Hallway 2", "Fire Point Bracket", "Structural", "MEDIUM", "COMPLETED", tech=tech2_id, asgn=mgr_id, work_done="Mounted plywood backer and re-anchored bracket with heavy-duty bolts", actual_cost_kobo=1800000, completed_on="2026-10-24"),
        make_req("GEN-030", "Training room smart display audio distortion", "Right channel speaker buzzing loudly", "Tech Hub", "Training Room", "Samsung 75 Interactive Board", "IT Hardware", "LOW", "COMPLETED", tech=tech1_id, asgn=mgr_id, work_done="Replaced internal audio amplifier board and verified stereo playback", actual_cost_kobo=5200000, completed_on="2026-10-24"),

        # --- VERIFIED_CLOSED (5, including Awkward case 3: Actual cost above estimate, and Awkward case 4: Urgent override verified with finance review) ---
        # Awkward case 3: Actual cost (₦285,000 = 28,500,000 kobo) above approved estimate (₦250,000 = 25,000,000 kobo)
        make_req("GEN-031", "Basement sump pump total failure", "Heavy rain caused water ingress, sump pump seized", "Main Tower", "Basement", "Ebara Sump Pump", "Plumbing", "HIGH", "VERIFIED_CLOSED", tech=tech1_id, asgn=mgr_id, work_done="Full impeller overhaul and rewound stator coils", actual_cost_kobo=28500000, completed_on="2026-10-22", verified_by=mgr_id),
        # Awkward case 4: Urgent override completed and verified with finance review ACCEPTED
        make_req("GEN-032", "Main electrical intake cable short circuit", "Cable smoking at busbar connection during morning peak load", "Main Tower", "Substation", "11kV Transformer Cable", "Electrical", "URGENT", "VERIFIED_CLOSED", tech=tech1_id, asgn=mgr_id, override=True, override_reason="Risk of transformer fire and total blackout; immediate cable re-termination required", override_by=mgr_id, override_review="ACCEPTED", override_reviewed_by=fin_id, override_review_note="Appropriate emergency containment confirmed", work_done="Re-terminated 185mm2 4-core armoured cable with heat-shrink lugs", actual_cost_kobo=42000000, completed_on="2026-10-21", verified_by=mgr_id),
        make_req("GEN-033", "Kitchen grease trap overflow", "Commercial grease trap clogged causing foul odor", "Annex Building", "Canteen", "Grease Interceptor", "Plumbing", "HIGH", "VERIFIED_CLOSED", tech=tech2_id, asgn=mgr_id, work_done="Mechanically cleared blockage and dosed enzyme treatment", actual_cost_kobo=7500000, completed_on="2026-10-20", verified_by=mgr_id),
        make_req("GEN-034", "CCTV outdoor camera PTZ motor failure", "Perimeter camera stuck facing boundary wall", "Logistics Park", "North Fence", "Hikvision PTZ", "IT Hardware", "MEDIUM", "VERIFIED_CLOSED", tech=tech1_id, asgn=mgr_id, work_done="Replaced PTZ gearbox and restored preset scan tour", actual_cost_kobo=9600000, completed_on="2026-10-21", verified_by=mgr_id),
        make_req("GEN-035", "Main entry turnstile optical sensor misalignment", "Turnstile refusing visitor badge tap", "Main Tower", "Lobby", "Boon Edam Turnstile", "Structural", "LOW", "VERIFIED_CLOSED", tech=tech2_id, asgn=mgr_id, work_done="Realigned optical emitter/receiver pairs and cleaned lenses", actual_cost_kobo=2400000, completed_on="2026-10-22", verified_by=mgr_id),
    ]

    for r in requests:
        ref = r["ref"]
        r_id = uid(f"req:{ref}")
        r_hash = f"hash-{ref}"

        tech_sql = f"'{r['tech']}'" if r['tech'] else "NULL"
        asgn_sql = f"'{r['asgn']}'" if r['asgn'] else "NULL"
        ovr_sql = "true" if r['override'] else "false"
        ovr_reas_sql = f"'{r['override_reason']}'" if r['override_reason'] else "NULL"
        ovr_by_sql = f"'{r['override_by']}'" if r['override_by'] else "NULL"
        ovr_rev_sql = f"'{r['override_review']}'" if r['override_review'] else "NULL"
        ovr_rev_by_sql = f"'{r['override_reviewed_by']}'" if r['override_reviewed_by'] else "NULL"
        ovr_rev_note_sql = f"'{r['override_review_note']}'" if r['override_review_note'] else "NULL"
        work_sql = f"'{r['work_done']}'" if r['work_done'] else "NULL"
        cost_sql = str(r['actual_cost_kobo']) if r['actual_cost_kobo'] is not None else "NULL"
        comp_on_sql = f"'{r['completed_on']}'" if r['completed_on'] else "NULL"
        ver_by_sql = f"'{r['verified_by']}'" if r['verified_by'] else "NULL"
        ver_at_sql = "clock_timestamp()" if r['verified_by'] else "NULL"
        deadline_sql = "clock_timestamp() + INTERVAL '2 days'" if r['tech'] else "NULL"

        lines.append(f"""    INSERT INTO maintenance_request (
        id, reference, idempotency_key, request_hash, title, description,
        building, location, equipment, category, priority, status,
        reported_by, reported_at, technician_id, assigned_by, deadline,
        override, override_reason, override_by, override_review, override_reviewed_by, override_review_note,
        work_done, actual_cost_kobo, completed_on, verified_by, verified_at, version
    ) VALUES (
        '{r_id}', '{ref}', '{uid("key:" + ref)}', '{r_hash}', '{r['title']}', '{r['desc']}',
        '{r['bldg']}', '{r['loc']}', '{r['equip']}', '{r['cat']}', '{r['prio']}', '{r['status']}',
        '{emp_id}', clock_timestamp() - INTERVAL '5 days', {tech_sql}, {asgn_sql}, {deadline_sql},
        {ovr_sql}, {ovr_reas_sql}, {ovr_by_sql}, {ovr_rev_sql}, {ovr_rev_by_sql}, {ovr_rev_note_sql},
        {work_sql}, {cost_sql}, {comp_on_sql}, {ver_by_sql}, {ver_at_sql}, 1
    );""")

        # Add initial REPORTED history
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{r_id}', NULL, 'REPORTED', '{emp_id}', 'Fault reported');")

        if r['tech']:
            lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                         f"VALUES ('{r_id}', 'REPORTED', 'ASSIGNED', '{mgr_id}', 'Assigned to technician');")

    # Add estimates:
    # 1. GEN-010: Rejected estimate (Awkward case 1)
    r10_id = uid("req:GEN-010")
    e10_id = uid("est:GEN-010")
    lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decision_reason, decided_by, decided_at)
    VALUES ('{e10_id}', '{r10_id}', 18000000, '{tech1_id}', 'REJECTED', 'Quotation is 30% above standard framework rates', '{fin_id}', clock_timestamp() - INTERVAL '2 days');""")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r10_id}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Initial estimate submitted: 18000000 kobo');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r10_id}', 'ESTIMATE_SUBMITTED', 'ASSIGNED', '{fin_id}', 'Estimate rejected by finance');")

    # 2. ESTIMATE_SUBMITTED requests (GEN-011 .. GEN-015)
    for ref, amt in [("GEN-011", 6500000), ("GEN-012", 4200000), ("GEN-013", 1500000), ("GEN-014", 8800000), ("GEN-015", 950000)]:
        rid = uid(f"req:{ref}")
        eid = uid(f"est:{ref}")
        lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by)
    VALUES ('{eid}', '{rid}', {amt}, '{tech1_id}');""")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Estimate submitted: {amt} kobo');")

    # 3. ESTIMATE_APPROVED requests (GEN-016 .. GEN-020)
    for ref, amt in [("GEN-016", 12000000), ("GEN-017", 3500000), ("GEN-018", 15000000), ("GEN-019", 2800000), ("GEN-020", 4500000)]:
        rid = uid(f"req:{ref}")
        eid = uid(f"est:{ref}")
        lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('{eid}', '{rid}', {amt}, '{tech1_id}', 'APPROVED', '{fin_id}', clock_timestamp() - INTERVAL '1 days');""")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Estimate submitted: {amt} kobo');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '{fin_id}', 'Estimate approved by finance');")

    # 4. IN_PROGRESS requests (GEN-021 .. GEN-024)
    for ref, amt in [("GEN-021", 22000000), ("GEN-022", 9500000), ("GEN-023", 2600000), ("GEN-024", 3800000)]:
        rid = uid(f"req:{ref}")
        eid = uid(f"est:{ref}")
        lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('{eid}', '{rid}', {amt}, '{tech1_id}', 'APPROVED', '{fin_id}', clock_timestamp() - INTERVAL '2 days');""")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Estimate submitted');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '{fin_id}', 'Estimate approved');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '{tech1_id}', 'Work started');")

    # GEN-025: Urgent override in progress
    r25_id = uid("req:GEN-025")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r25_id}', 'ASSIGNED', 'IN_PROGRESS', '{mgr_id}', 'Urgent override started by operations manager');")

    # 5. COMPLETED requests (GEN-026 .. GEN-030)
    for ref, amt in [("GEN-026", 8000000), ("GEN-027", 3200000), ("GEN-028", 14000000), ("GEN-029", 1800000), ("GEN-030", 5000000)]:
        rid = uid(f"req:{ref}")
        eid = uid(f"est:{ref}")
        lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('{eid}', '{rid}', {amt}, '{tech1_id}', 'APPROVED', '{fin_id}', clock_timestamp() - INTERVAL '3 days');""")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Estimate submitted');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '{fin_id}', 'Estimate approved');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '{tech1_id}', 'Work started');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'IN_PROGRESS', 'COMPLETED', '{tech1_id}', 'Repair completed');")

    # 6. VERIFIED_CLOSED requests (GEN-031 .. GEN-035)
    # GEN-031 Awkward case: estimate 25,000,000, actual cost 28,500,000 (above estimate)
    r31_id = uid("req:GEN-031")
    lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('{uid("est:GEN-031")}', '{r31_id}', 25000000, '{tech1_id}', 'APPROVED', '{fin_id}', clock_timestamp() - INTERVAL '4 days');""")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r31_id}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech1_id}', 'Estimate submitted');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r31_id}', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '{fin_id}', 'Estimate approved');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r31_id}', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '{tech1_id}', 'Work started');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r31_id}', 'IN_PROGRESS', 'COMPLETED', '{tech1_id}', 'Pump overhauled');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r31_id}', 'COMPLETED', 'VERIFIED_CLOSED', '{mgr_id}', 'Verified and closed by manager');")

    # GEN-032 Awkward case: urgent override verified and closed with finance review ACCEPTED
    r32_id = uid("req:GEN-032")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r32_id}', 'ASSIGNED', 'IN_PROGRESS', '{mgr_id}', 'Urgent override started');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r32_id}', 'IN_PROGRESS', 'COMPLETED', '{tech1_id}', 'Emergency cable repair completed');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r32_id}', 'COMPLETED', 'COMPLETED', '{fin_id}', 'Override reviewed by finance: ACCEPTED');")
    lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                 f"VALUES ('{r32_id}', 'COMPLETED', 'VERIFIED_CLOSED', '{mgr_id}', 'Verified and closed by manager');")

    for ref, amt in [("GEN-033", 7500000), ("GEN-034", 9600000), ("GEN-035", 2400000)]:
        rid = uid(f"req:{ref}")
        lines.append(f"""    INSERT INTO estimate (id, request_id, amount_kobo, submitted_by, decision, decided_by, decided_at)
    VALUES ('{uid("est:" + ref)}', '{rid}', {amt}, '{tech2_id}', 'APPROVED', '{fin_id}', clock_timestamp() - INTERVAL '4 days');""")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ASSIGNED', 'ESTIMATE_SUBMITTED', '{tech2_id}', 'Estimate submitted');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', '{fin_id}', 'Estimate approved');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'ESTIMATE_APPROVED', 'IN_PROGRESS', '{tech2_id}', 'Work started');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'IN_PROGRESS', 'COMPLETED', '{tech2_id}', 'Work completed');")
        lines.append(f"    INSERT INTO status_history (request_id, from_status, to_status, actor_id, note) "
                     f"VALUES ('{rid}', 'COMPLETED', 'VERIFIED_CLOSED', '{mgr_id}', 'Verified and closed by manager');")

    lines.append("END $$;")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Generated {len(requests)} requests into {OUT}")

if __name__ == "__main__":
    generate()
