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
