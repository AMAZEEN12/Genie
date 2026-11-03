# Test plan: Genie, maintenance requests from fault to verified repair

Derived from: [intent.md](intent.md) (accepted 2026-10-23), [plan.md](plan.md) · Status: accepted (2026-10-23 for Victor Oyeleke, confirmed by Nnaemeka Chukwuma)
Decisions in force: [decisions.md](../decisions.md) DM5 (Stockwise test rules reused: 80% coverage on rule packages, CI test guard plus CODEOWNERS, real Postgres via Testcontainers, no AI in CI)
Supporting skills: none

## Feedback loop
| Check | Command | Passing looks like |
|-------|---------|--------------------|
| Service build, unit, integration, contract, coverage | `cd service && ./mvnw verify` | `BUILD SUCCESS`, `Failures: 0, Errors: 0`, JaCoCo checks met (rule packages `request`, `estimate` ≥ 80%) |
| Contract lint | `npx @redocly/cli lint contract/openapi.yaml` | valid |
| Web | `cd web && npm run lint && npm run typecheck && npm test -- --run` | zero errors, all green |
| E2E + accessibility | `cd web && npx playwright test` | journey green at 360 px and desktop; axe 0 serious or critical |
| Secrets | `gitleaks detect --no-banner` | no leaks |

## Done-targets
**Monday 26 Oct (side-project MVP)**
- `AssignmentConcurrencyIT` passes on `main` and **fails** on `evidence/no-assignment-guard`. Both logs are saved (S2).
- `StartWithoutApprovalIT` passes (a direct call is refused) (S3).
- `AuthorizationIT` passes, including employee → assign → 403 (S4).
- `ci.yml` is green and `deploy.yml` has deployed both tiers. The Monday journey runs end to end from a clean browser on the deployed address (S1, S5).
- `SeedVerificationIT` (Monday subset) is green and includes a rejected estimate, an actual cost above the estimate, and an urgent override.

**Final (Tue 3 Nov)**
- All tests in the traceability table pass. Coverage gate met.
- Each rule test has been run once with its guard removed and seen to fail, logged in `docs/rule-removal-log.md`.
- Full seed of ≥ 30 requests. DR-1 and DR-2 written. Genie reported as "meets" its MVP definition of done.
- Not required (side-project standard): load test, screen-reader report, Core Web Vitals, visual baselines, evals.

## Traceability
| Requirement | Test(s) | Type |
|-------------|---------|------|
| R1 roles | `AuthorizationIT` (each role × each write endpoint; fails when the check is removed) | integration |
| R2 report | `RequestIT` | integration |
| R3 create once | `IdempotencyIT` (sequential and parallel; same key with a different body → 422) | integration |
| R4 one assignment | `AssignmentConcurrencyIT` (two managers, `CountDownLatch` start, looped 20 times locally; asserts one 200, one 409, one stored assignment, one history row) | integration, evidence |
| R5 estimates | `EstimateIT` (float → 400; self-approval → 403 by direct call and by direct SQL against the CHECK; reject → ASSIGNED) | integration |
| R6 no start without approval | `StartWithoutApprovalIT` | integration |
| R7 urgent override | `OverrideIT` (non-urgent → 409; no reason → 400; closing with an unreviewed override → 409; review then close OK; filter and count) | integration |
| R8 completion required | `CloseRulesIT#cannotCloseWithoutCompletion` (API and direct SQL against the CHECK) | integration |
| R9 no self-verify | `CloseRulesIT#technicianCannotVerifyOwnJob` | integration |
| R10 history append-only | `HistoryAppendOnlyIT` (UPDATE and DELETE raise) | integration |
| R11 search and filter | `RequestSearchIT`; Playwright filter-and-clear | integration, e2e |
| R12 five states, keyboard, phone | `e2e/genie-journey.spec.ts` (360 px, keyboard-only run, axe); per-screen state checklist | e2e, manual |
| R13 seed | `SeedVerificationIT` | integration |
| R14 README | clean-browser checklist | manual |
| Money exactness | `NoFloatSchemaIT`, Jackson strict-number test | integration, unit |
| Migrations | `MigrationRollbackIT` (up, down, up) | integration |
| Contract | `ContractIT` (responses validated against `openapi.yaml`) | contract |

## Bug fixes: test first
1. Reproduce the bug as a failing test, and confirm it fails for the expected reason.
2. Commit the test on `fix/<slug>`.
3. Fix the code without editing the test (CI `test-guard`, DM5).

## Protecting the loop
- CI `test-guard` on `fix/*` and `bug`-labelled PRs, as for Stockwise.
- CODEOWNERS: `service/src/test/**/request/**` and `**/estimate/**` → Nnaemeka Chukwuma; `**/auth/**` and `contract/**` → Isaac Bassey; `.github/**` → Blessing Nwafor; `web/**` → Victor Oyeleke.

## Evals (ongoing agent work)
Not applicable for Genie: a side project with a lighter standard. AI-assisted work is recorded in the team AI log. Stockwise's eval suite (Stockwise DM25) covers the team's agent configuration.

## Open questions
- [ ] Is the same Spring Boot 4 contract-validator question as Stockwise answered? Genie follows whatever Stockwise decides. (owner: Isaac Bassey) · UNRESOLVED

## Measurement
- Leading: first-pass CI success rate.
- Lagging: regressions caught in CI versus at the checkpoint; the Genie MVP assessment (meets / partly meets / does not yet meet).

## Addendum 2026-10-29: MVP feedback (R15-R21)
Proposed by **Victor Oyeleke** (product owner) as MVP feedback; implemented by **Nnaemeka Chukwuma**. Added 2026-10-29 as an addendum to the accepted artifacts, at Nnaemeka's direction (DM17), instead of a separate change folder.

### Traceability
| Requirement | Test(s) | Type |
|----|----|----|
| R15 employees see no billing | `EmployeeBillingIT` (3: detail, history endpoint, other roles still see costs); `RequestDetailPage.roles.test.tsx` (employee page text, manager control); `StatusBadge.test.tsx` | integration (HTTP, Postgres) + unit |
| R16 navbar right-aligned | `HomeLayout.test.tsx` | unit (class check; jsdom has no layout) |
| R17 logo "i" scales | `GenieLogo.test.tsx` (5 sizes) | unit |
| R18 hero centred on small screens | `HomeLayout.test.tsx` | unit |
| R19 refresh works | `app/vercelConfig.test.ts`; manual: refresh `/requests` on the deployed site gives 200 | unit + manual (deployed) |
| R20 estimate breakdown | `EstimateBreakdownIT` (5: stored in order and shown to Finance; mismatch refused, nothing recorded; bad lines; no-lines still works; database refuses mismatch by direct SQL); `SubmitEstimateModal.test.tsx` (form, validation, limits, `parseNairaToKobo`); `MigrationRollbackIT` (V5/U5 up, down, up) | integration + unit |
| R21 Finance actions never blank | `RequestDetailPage.roles.test.tsx` (7 statuses x 3 override variants) | unit |

### Results 2026-10-29 (Nnaemeka Chukwuma's machine, agent-run)
- `cd service && ./mvnw clean verify`: **54 tests, 0 failures** (Docker, Postgres 17).
- `cd web && npm run lint && npm run typecheck && npm test -- --run && npm run build`: lint and typecheck clean, **91 tests passed**, build OK.
- `npx @redocly/cli@2 lint contract/openapi.yaml --config contract/redocly.yaml`: valid.
- **New tests seen failing on the old code:** the R16-R19 web tests (8 failed, `vercel.json` missing) and the R15 employee page test, run against `origin/main`'s files. R21's tests pass on `main` too: the blank box was in an older local branch and PR #12 had already fixed it; they now guard it.
- **Rule removals** (see `docs/rule-removal-log.md` rows 11-13): R15 service redaction removed: `EmployeeBillingIT` fails; R20 service sum check removed: `EstimateBreakdownIT` fails (500 instead of 400, because the database trigger still refuses); R20 trigger condition removed: the direct-SQL test fails.

## Addendum 2026-11-01: Receipt Uploads with Cloudinary (R22-R30)
Proposed by **Victor Oyeleke** and the specification `Receipt Uploads with Cloudinary: Role-Based Backend Summary`; implemented, verified, and signed by **Nnaemeka Chukwuma** (Data and rules owner, implementer). Branch `feat/receipt-uploads`.

### Traceability
| Requirement | Test(s) | Type |
|---|---|---|
| R22 Private Upload & Metadata Stripping | `ReceiptWorkflowIT.test7_upload_renamed_exe_or_oversized_file_rejected_before_reaching_storage`, `ReceiptWorkflowIT.test8_phone_photo_metadata_stripped_on_upload_and_download` | integration (HTTP + Byte analysis) |
| R23 Access-Controlled Streaming | `ReceiptWorkflowIT.test8_phone_photo_metadata_stripped_on_upload_and_download` (checks `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`) | integration (HTTP streaming) |
| R24 Tenant & Role Isolation | `ReceiptWorkflowIT.test1_technician_requests_another_technicians_receipt_returns_404`, `ReceiptWorkflowIT.test2_manager_requests_receipt_from_outside_their_team_returns_404`, `ReceiptWorkflowIT.test3_finance_requests_receipt_from_another_organisation_returns_404` | integration (Multi-tenant HTTP) |
| R25 Manager Decision Protection | `ReceiptWorkflowIT.test4_manager_approves_their_own_receipt_returns_403`, `ReceiptWorkflowIT.test5_technician_calls_decision_or_reimburse_route_returns_403`, `ReceiptWorkflowIT.test10_full_status_flow_submitted_to_approved_to_reimbursed` | integration (Role transitions) |
| R26 Finance Reimbursement Guard | `ReceiptWorkflowIT.test6_finance_reimburses_receipt_that_is_not_approved_returns_409`, `ReceiptWorkflowIT.test10_full_status_flow_submitted_to_approved_to_reimbursed` | integration (Business guard) |
| R27 Deletion Policy | `ReceiptWorkflowIT.test11_deletion_rules_for_uploader_and_finance` (uploader deletes submitted -> 204; uploader deletes approved -> 403; finance deletes -> 204) | integration (HTTP DELETE) |
| R28 Upload Rate Limiting | `ReceiptWorkflowIT.test12_rate_limiting_enforced_per_user` (10 uploads pass, 11th triggers 429 `RATE_LIMIT_EXCEEDED`) | integration (Rate limiter) |
| R29 Audit Trail Logging | `ReceiptWorkflowIT.test13_audit_trail_logging` (asserts `UPLOAD`, `VIEW`, `DECISION`, `REIMBURSE`, `DELETE` logged to `receipt_audit_log`) | integration (Database audit trail) |
| R30 Leak Prevention | `ReceiptWorkflowIT.test9_inspect_responses_no_secret_no_api_key_no_cloudinary_url` | integration (Response payload audit) |
| Migration Rollback (V6/U6) | `MigrationRollbackIT` (V6/U6 schema restoration up/down/up verified) | integration (Flyway / Postgres 17) |
| Frontend Role Screens & Modals (R22-R30) | `ReceiptsPage.test.tsx` (8 tests: technician upload, validation, stream preview, manager decision & self-approval guard, finance reimburse & CSV export, deletion) | unit & integration (Vitest, React Testing Library) |

### Results 2026-11-01 (Nnaemeka Chukwuma's machine, agent-run)
- `cd service && ./mvnw clean verify`: **60 tests passed, 0 failures, BUILD SUCCESS** (Postgres 17 Testcontainers, JaCoCo coverage rules met).
- `cd web && npm test`: **99 tests passed across 13 test files, 0 failures**.
- `cd web && npm run lint`: **0 errors, 0 warnings (clean)**.
- `cd web && npm run typecheck`: **0 errors (clean)**.
- `cd web && npm run build`: **production build clean, zero bundle leaks**.
- `cd genie && cmd.exe /c "npx @redocly/cli lint contract/openapi.yaml"`: **0 errors, contract valid**.
- **Section 8 Scenarios:** All 9 testing points from the summary document verified passing in `ReceiptWorkflowIT`.

## Addendum 2026-11-03: Receipt Storage Persistence & Preview Resilience (R34-R38)
Proposed following production incident where container restarts wiped in-memory fallback receipt binaries; designed and implemented by **Nnaemeka Chukwuma**.

### Traceability
| Requirement | Test(s) | Type |
|---|---|---|
| R34 Persistent Database Storage Fallback | `MigrationRollbackIT` (V7/U7 up/down/up verified), `ReceiptWorkflowIT` (file streaming via DB fallback) | integration (Flyway / PostgreSQL) |
| R35 Flexible Cloudinary Config | Backend compilation & configuration verification | unit / integration |
| R36 Error Transparency | `ReceiptsPage.test.tsx` (propagates API error to error boundary / view alert) | unit / integration |
| R37 Resilient Viewer & Error Handling | `ReceiptsPage.test.tsx` (broken image detection via `onError`, valid SVG XML in mock) | unit (React Testing Library) |
| R38 Orphaned Receipt Cleanup | `ReceiptsPage.test.tsx` (inline delete and re-upload trigger on missing binary) | unit & integration |

