# Plan: Genie, maintenance requests from fault to verified repair

Derived from: [intent.md](intent.md) (accepted 2026-10-23; holds requirements R1-R14 on the short path) · Status: accepted
Accepted by: 2026-10-23 for Victor Oyeleke (product owner), confirmed by Nnaemeka Chukwuma · Higher-risk sign-off: Isaac Bassey (team lead) for the assignment guard, the override rules and every migration
Decisions in force: [decisions.md](../decisions.md) DM1-DM9 · Deployment: [deploy-plan.md](../deploy-plan.md)
Supporting skills: none

All paths are relative to the **Genie repository root** (the local `genie/` folder). Java package root: `ng.tesa.genie`. Structure and conventions mirror Stockwise (DM5), so the team switches between repos without relearning.

## Area owners (DM4)
| Area | Owner | Owns in this plan |
|----|----|----|
| Data and rules | Nnaemeka Chukwuma | `db/**`, repositories, `RequestWorkflowService`, rule tests, seed |
| API and access | Isaac Bassey | `contract/**`, controllers, security, problem details, idempotency, contract tests |
| Delivery and evidence | Blessing Nwafor | `.github/**`, Dockerfile, deploys, logging, README evidence. Also the fallback builder of basic screens (DM9) |
| Interface | Victor Oyeleke | `web/**` |

## Design summary (short path: in place of spec.md)

**Data model** (money columns are `BIGINT` kobo; timestamps are `timestamptz` UTC):
- `app_user(id, email UNIQUE, password_hash, display_name, role CHECK IN ('EMPLOYEE','MANAGER','TECHNICIAN','FINANCE'))`
- `maintenance_request(id, reference UNIQUE, idempotency_key UUID UNIQUE, request_hash, title, description, building, location, equipment, category, priority CHECK IN ('LOW','MEDIUM','HIGH','URGENT'), status CHECK IN (7 statuses), reported_by, reported_at, technician_id NULL, assigned_by NULL, deadline NULL, override BOOL DEFAULT false, override_reason NULL, override_by NULL, override_review NULL CHECK IN ('ACCEPTED','FLAGGED'), override_reviewed_by NULL, work_done NULL, actual_cost_kobo NULL CHECK >= 0, completed_on NULL, verified_by NULL, verified_at NULL, version INT)`, with these constraints:
  - `CHECK (NOT override OR priority = 'URGENT')`: an override is only possible on an urgent request (R7)
  - `CHECK (override = (override_reason IS NOT NULL))`: an override always carries a reason (R7)
  - `CHECK (status <> 'VERIFIED_CLOSED' OR (work_done IS NOT NULL AND actual_cost_kobo IS NOT NULL AND completed_on IS NOT NULL))`: no closing without completion details (R8)
  - `CHECK (status <> 'VERIFIED_CLOSED' OR NOT override OR override_review IS NOT NULL)`: no closing with an unreviewed override (R7)
  - `CHECK (verified_by IS NULL OR verified_by <> technician_id)`: a technician can't verify their own job (R9)
- `estimate(id, request_id FK, amount_kobo BIGINT CHECK > 0, submitted_by, submitted_at, decision NULL CHECK IN ('APPROVED','REJECTED'), decided_by NULL, decided_at NULL, CHECK (decided_by IS NULL OR decided_by <> submitted_by))`, plus a partial unique index allowing one undecided estimate per request (R5)
- `status_history(id, request_id, from_status, to_status, actor_id, note, at)`, append-only via a trigger that raises on UPDATE or DELETE (R10)

**Guards** (each is one SQL statement; zero rows updated means a 409 with a specific code):
| Rule | Statement | Code on refusal |
|----|----|----|
| R4 one assignment | `UPDATE maintenance_request SET status='ASSIGNED', technician_id=:t, deadline=:d, assigned_by=:m, version=version+1 WHERE id=:id AND status='REPORTED' AND version=:v RETURNING id` | 409 `ALREADY_ASSIGNED` |
| R6 no start without approval | `… SET status='IN_PROGRESS' WHERE id=:id AND status='ESTIMATE_APPROVED' AND technician_id=:me` | 409 `ESTIMATE_NOT_APPROVED` |
| R7 urgent override | `… SET status='IN_PROGRESS', override=true, override_reason=:r, override_by=:m WHERE id=:id AND priority='URGENT' AND status IN ('ASSIGNED','ESTIMATE_SUBMITTED')` | 409 `OVERRIDE_NOT_ALLOWED` |
| R5 estimate decision | `UPDATE estimate SET decision=:d, decided_by=:f … WHERE id=:id AND decision IS NULL`, with the `decided_by <> submitted_by` CHECK as a backstop | 409 `ALREADY_DECIDED` / 403 `SELF_APPROVAL` |
| R8/R9 close | `… SET status='VERIFIED_CLOSED', verified_by=:m WHERE id=:id AND status='COMPLETED'`, with the CHECKs as backstop | 409 `CANNOT_CLOSE` |

Every successful guard inserts a `status_history` row in the same transaction.

**Endpoints** (`/api/v1`, problem+json errors, resources named as nouns):
| Method & path | Roles | Notes |
|----|----|----|
| `POST /auth/sessions`, `GET /me` | public / any | as Stockwise |
| `GET /users?role=TECHNICIAN` | MANAGER | for the assignment picker |
| `GET /requests` | any (EMPLOYEE sees own) | `?status=&category=&priority=&technicianId=&override=` (R11) |
| `POST /requests` | EMPLOYEE, MANAGER | `Idempotency-Key` required (R3) |
| `GET /requests/{id}` | any with access | includes estimates and history |
| `PUT /requests/{id}/assignment` | MANAGER | Body includes `version`; conditional update returns 409 `ALREADY_ASSIGNED` when the request was already assigned (R4) |
| `POST /requests/{id}/estimates` | assigned TECHNICIAN | kobo integer (R5) |
| `PUT /estimates/{id}/decision` | FINANCE | `{decision, reason?}` (R5) |
| `POST /requests/{id}/transitions` | per transition type | `{type: START\|OVERRIDE_START\|COMPLETE\|VERIFY, …}`. Each transition is a history-record resource (R6-R9) |
| `PUT /requests/{id}/override-review` | FINANCE | `{review: ACCEPTED\|FLAGGED, note}` (R7) |
| `GET /requests/{id}/history` | any with access | R10 |
| `GET /health`, `GET /` | public | as Stockwise |

**Screens:** Login · Report a fault · My requests (employee) · Request list with filters · Request detail (actions shown by role and status, with history) · Assign (manager) · Estimate form (technician) · Approvals queue (finance: estimates and overrides) · Complete form (technician). Five states on the MVP journey; works at 360 px; keyboard operable.

## Files that change
All **new** (separate repository). The file layout mirrors the Stockwise plan.

| File(s) | Requirements |
|----|----|
| `README.md`, `AGENTS.md`, `REVIEW.md` (copied from Stockwise and adapted to Genie's rules), `decisions.md`, `deploy-plan.md`, `docs/decision-records/DR-1-urgent-override.md`, `DR-2-assignment-guard.md`, `docs/ai-log.md` | R14, the side-project standard |
| `contract/openapi.yaml` (MVP paths and the status sequence documented as an enum with allowed transitions), `contract/README.md` (Prism mock, DM8) | all |
| `service/pom.xml`, `mvnw`, `Dockerfile`, `application.yml` | DM5 |
| `…/config/*` (security, Jackson strict numbers, request ID, CORS), `…/common/*` (problem handler, idempotency) | R1, R3 |
| `…/auth/*`, `…/user/UserController.java` | R1 |
| `…/request/RequestController.java`, `RequestRepository.java`, `RequestWorkflowService.java` (all guards), `TransitionController.java`, `HistoryRepository.java` | R2-R4, R6-R11 |
| `…/estimate/EstimateController.java`, `EstimateRepository.java` | R5 |
| `db/migration/V1__users.sql`, `V2__requests.sql`, `V3__estimates_history.sql`, `V4__append_only.sql`, plus `db/rollback/U1-U4` | R4-R10 |
| `db/seed/R__seed_demo.sql` | R13 |
| `src/test/**`: `AssignmentConcurrencyIT`, `StartWithoutApprovalIT`, `AuthorizationIT`, `EstimateIT` (self-approval, reject → Assigned), `OverrideIT`, `CloseRulesIT`, `IdempotencyIT`, `HistoryAppendOnlyIT`, `NoFloatSchemaIT`, `MigrationRollbackIT`, `SeedVerificationIT`, `ContractIT` | R1-R13 |
| `web/**`: Vite app, generated types, TanStack Query (DM7), screens above, `e2e/genie-journey.spec.ts` | R11, R12 |
| `.github/workflows/ci.yml`, `deploy.yml`, `concurrency-evidence.yml`, `CODEOWNERS` | DM5, S2, S5 |

## Order of work (DM9; Stockwise always takes priority)
**Fri 23 Oct**
1. Genie repository plus protections (copy the Stockwise setup). (Blessing)
2. `contract/openapi.yaml` with the MVP paths and the status enum, the Prism mock, and the first line in the change log signed by two engineers. (Isaac + Nnaemeka)
3. Schema sketch reviewed against the guards table above. (Nnaemeka)
4. Walking skeleton (`/`, `/api/v1/health`) deployed through GitHub Actions on Stack V (Stack Q in parallel per DM5). (Blessing)

**Sat 24 Oct**
5. Migrations V1-V4 with undo scripts. (Nnaemeka)
6. **Assignment guard plus `AssignmentConcurrencyIT`** (the Monday rule), and `StartWithoutApprovalIT`. (Nnaemeka; Isaac approves)
7. Auth and roles plus `AuthorizationIT`. Request, estimate and transition endpoints. (Isaac)

**Sun 25 Oct**
8. Screens for the MVP journey against the mock, with five states. **Check at Sun 12:00:** if Victor is behind, Blessing builds the basic screens (report, list, detail with action buttons) and logs it. (Victor / Blessing)
9. Seed subset with the awkward cases (rejected estimate, actual cost above estimate, urgent override). The README with credentials and simulated-feature labels. Deploy. (Nnaemeka + Blessing)
10. Evidence: the `AssignmentConcurrencyIT` failing log on `evidence/no-assignment-guard`. (Nnaemeka)
11. Full Monday journey from a clean browser on the deployed site. (all)

**Mon 26 Oct:** slides 6 and 7 (problem, users and MVP; live demo).

**After Monday:** override review screens polished, full seed (≥ 30 requests), DR-1 and DR-2 written, keyboard and phone pass, Shoulds (photos via Cloudinary) only if Stockwise is on track.

## Parallelization
- **Independent:** steps 1, 2, 3 and 4 on Friday. On Sunday, screens (8) alongside seed (9).
- **Sequential:** contract (2) → endpoints (7) · migrations (5) → guards (6) → evidence (10) · auth (7) → role tests.
- **Across repos:** a Stockwise step always wins a conflict for the same person's time (DM9).

## Risks
| Risk | What it could break | Mitigation |
|------|---------------------|------------|
| Team capacity (two products by Monday) | Genie MVP incomplete; Stockwise slips | DM9 schedule and fallback. Isaac tells Goodnews **today** if doubtful (intent open question) |
| Victor carrying two interfaces | Genie screens missing | Mock (DM8), shared components, Blessing fallback at Sun 12:00 |
| Seven-state workflow with role and override rules | Wrong transitions accepted | Every transition is one guarded UPDATE plus CHECK constraints. One integration test per transition rule |
| Free-tier quotas with four services | Suspended services (Render 750 h per workspace) | Genie's own Neon project and Render service (DM5); PD5c is decided on the Stockwise side |

**Riskiest step:** step 8, Genie's screens. Its owner is the most loaded person on the team.

## Alternatives considered
- **Generic `PATCH /requests/{id} {status}`:** rejected. One endpoint for every transition hides the per-transition rules. A typed `transitions` resource keeps each guard explicit and testable.
- **`SELECT … FOR UPDATE` for assignment:** rejected, for the same reason as Stockwise. A single conditional UPDATE with a version check is atomic.
- **No mock:** rejected (DM8).
- **Redux Toolkit:** rejected (DM7).

## Proof
| Requirement | Test or check |
|----|----|
| R1 | `AuthorizationIT` (employee assigning → 403; fails with the check removed) |
| R2 | `RequestIT` (create, validation) |
| R3 | `IdempotencyIT` |
| R4 | `AssignmentConcurrencyIT` (two managers in parallel → one 200, one 409; one stored); failing log on `evidence/no-assignment-guard` |
| R5 | `EstimateIT` (kobo only, self-approval refused via direct call, reject → Assigned) |
| R6 | `StartWithoutApprovalIT` (direct call → 409) |
| R7 | `OverrideIT` (non-urgent → 409, missing reason → 400, closing unreviewed → 409, filter and count) |
| R8, R9 | `CloseRulesIT` |
| R10 | `HistoryAppendOnlyIT` |
| R11 | `RequestSearchIT`; Playwright filter check |
| R12 | `e2e/genie-journey.spec.ts` at 360 px plus axe; five-state checklist |
| R13 | `SeedVerificationIT` |
| R14 | Clean-browser checklist |

## Plan maintenance
If implementation departs from this plan, update this file in the same commit as the code.

## Measurement
- Leading: share of changes that merge from the first implementation pass; time from plan acceptance to merged PR.
- Lagging: rework cycles per change; whether the merged diff still matches this plan.
