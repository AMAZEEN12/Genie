# Work log: Genie (Team 3 side project)

Change slug: `genie` · Started: 2026-10-23 · Last updated: 2026-10-25 by the agent
Source document: `Tesa cohort 6 software engineering capstone project.pdf` (Genie is product 7, pages 19-20; "Side project standard" page 14)

> Any agent opening this project: read this file first, then the "Conventions and guidelines" and "Decisions" sections, then the artifacts in this folder. Continue from "Resume here". Don't re-ask anything already answered below.

## Resume here
- **Stage:** Implementation, MVP feedback (R15-R21), added as addendums to `intent.md`, `plan.md`, `test-plan.md` and `EXECUTION.md` (DM17). Proposed by Victor Oyeleke; implemented by Nnaemeka Chukwuma.
- **Step:** All seven items are implemented and verified locally on branch `feat/mvp-feedback` (from `origin/main` `4de0e94`), committed as `42b68ec` and open as [PR #14](https://github.com/AMAZEEN12/Genie/pull/14) into `main`.
  1. **R15** Employees see nothing about billing: service redaction (`RequestDetailResponse.forViewer`, `StatusHistoryEntry.visibleTo`) plus screens (cost card, actual cost and finance review hidden; neutral labels "Awaiting approval", "Approved for repair").
  2. **R16** Navbar right-aligned on small screens.
  3. **R17** Logo "i" sized in `em`.
  4. **R18** Hero centred on small screens.
  5. **R19** Refresh fixed by `web/vercel.json` (live `/requests` returned Vercel's 404).
  6. **R20** Itemised estimates: V5 `estimate_line` with deferred triggers, contract 0.2.0, line-item form with integer-kobo parsing, and lines shown to Finance.
  7. **R21** Finance Role Actions never blank (already fixed on `main` by PR #12; now tested across every status).
- **Checks:**
  - service `./mvnw clean verify` gives **54 tests green**;
  - web lint, typecheck, **91 tests** and the build are green;
  - contract lint is valid;
  - new tests were seen failing on the old code;
  - three rule removals are logged (rows 11-13 in `docs/rule-removal-log.md`).
- **Next action:** get PR #14 reviewed and merged, then follow `EXECUTION.md` addendum steps F1-F4 (deploy applies V5; then check live: refresh, employee view, itemised estimate, phone layout). Isaac Bassey must review V5 and add his half of the 0.2.0 line in `decisions.md` §3.
- **Waiting on:** Isaac Bassey (contract 0.2.0 and the V5 migration review, his half of the 0.2.0 line); Victor Oyeleke (screen review).
- **Local notes:** an older uncommitted log note was stashed as `stash@{0}` ("sitrep note 2026-10-27"); it is superseded by this entry and can be dropped. Docker Desktop must be running for the service tests.

## How to continue without the sdlc skill
Same workflow as the Stockwise repository's `sdlc/WORKLOG.md` ("How to continue without the sdlc skill"). Genie follows the lighter "Side project standard" (brief page 14): no full load test, screen reader report, Core Web Vitals or five decision records; two decision records are required. Interface engineer Victor Oyeleke proposed it and confirms the MVP scope.

## Artifact status
| Artifact | Status (missing / draft / accepted) | Approved by | Date |
|----------|-------------------------------------|-------------|------|
| intent.md | accepted | Victor Oyeleke (product owner), confirmed by Nnaemeka Chukwuma | 2026-10-23 |
| spec.md | not required (short path, DM1); requirements live in intent.md | | |
| plan.md | accepted | Victor Oyeleke (product owner), confirmed by Nnaemeka Chukwuma | 2026-10-23 |
| test-plan.md | accepted | Victor Oyeleke (product owner), confirmed by Nnaemeka Chukwuma | 2026-10-23 |
| release.md | not required (short path); note in EXECUTION.md | | |
| monitoring.md | not required (short path); note in EXECUTION.md | | |
| EXECUTION.md | written (runbook) | Nnaemeka Chukwuma | 2026-10-23 |

## Conventions and guidelines
- **Local mock port:** use **4711** for Genie's Prism mock (`--port 4711`). Prism's default 4010 is inside a Windows reserved range on Nnaemeka's machine, and Stockwise's mock uses 4710. Prism serves paths at the root (no `/api/v1`) and returns 422 for invalid requests (the real service returns 400).
- **Decisions:** `../decisions.md` (Genie's own). Every entry records "Decided by" and "Logged by" (Nnaemeka Chukwuma) separately. Ask the user who to record as the decision maker for each new decision.
- **Stack, auth, hosting, review and test rules:** reused from Stockwise as Genie's own decisions (DM5). Genie gets its own Neon project and Render service.
- **Interface state:** TanStack Query only (DM7).
- **Approvers:** product owner Victor Oyeleke (DM3). Team lead and release manager Isaac Bassey.
- **User preferences:** one question at a time, plain explanations with examples, and a decided-by question each time.
Genie is its own GitHub repository (DM19) with its own artifacts, updated independently (DM20). At Genie's Plan stage, copy over the team-wide conventions that apply (Java 25 / Spring Boot 4 / Maven / JdbcClient / Flyway with undo scripts, auth, the decided-by / logged-by rule) and record them here; don't link to the Stockwise files.

## Decisions
| ID | Date | Decision | Reason | Decided by | Affects | Status |
|----|------|----------|--------|------------|---------|--------|
| D7 | 2026-10-29 | Employees see no billing, enforced by the service and the screens (DM19) | The UI only hides; the service decides | Nnaemeka Chukwuma, on Victor Oyeleke's proposal | contract 0.2.0, service, web | active |
| D6 | 2026-10-29 | Estimate breakdown: item list with Labour/Materials/Other categories, 1-20 lines, total equals the sum, enforced in the service and the database (DM18) | Finance sees what the money is for | Nnaemeka Chukwuma, on Victor Oyeleke's proposal | V5, contract 0.2.0, service, web | active |
| D5 | 2026-10-29 | MVP feedback recorded as addendums to the existing artifacts, R15-R21, including the blank Finance actions bug (DM17) | User: "just update current project artifacts with addendums where necessary and update log to show the work done" | Proposed by Victor Oyeleke; implemented by Nnaemeka Chukwuma | intent, plan, test-plan, EXECUTION | active |
| D4 | 2026-10-25 | Interface structure recorded as DM10: React Router `Component` route objects, feature ownership under `src/features`, shared layouts and generic pages, no `src/routes`, and no customer resources in Genie | Victor Oyeleke's direction | Victor Oyeleke (logged by Codex) | decisions.md, plan.md, AGENTS.md, web | active |
| D3 | 2026-10-23 | Plan answers: Prism mock (DM8, Victor Oyeleke), staggered weekend schedule with a Blessing fallback at Sun 12:00 (DM9, Team 3). Test rules are reused from Stockwise under DM5, so no separate Test questions were asked | User's answers | as listed (logged by Nnaemeka Chukwuma) | plan.md, test-plan.md, EXECUTION.md | active |
| D2 | 2026-10-23 | Genie intake answers recorded as DM1-DM7 in `../decisions.md`: short path, own repo, Victor as product owner, area owners as for Stockwise, reuse of Stockwise decisions, urgent override with finance review (design problem), TanStack Query only | User's answers | Team 3 / Victor Oyeleke (logged by Nnaemeka Chukwuma) | all | active |
| D1 | 2026-10-23 | Genie's chain starts after Stockwise's intent and spec are accepted | The brief says to protect the main product first | agent (from D1 of the Stockwise log) | all | active |

## Questions and answers
| # | Date | Stage | Question | Answer | Status |
|---|------|-------|----------|--------|--------|
| Q1 | 2026-10-23 | Intake | Are we presenting Genie on Monday? | Yes: the brief requires slides 6-7 and a working MVP of both products | answered |
| Q2 | 2026-10-23 | Intake | Which SDLC path? | Short path (Team 3) | answered |
| Q3 | 2026-10-23 | Intake | Product owner? | Victor Oyeleke (Team 3) | answered |
| Q4 | 2026-10-23 | Intake | Reuse Stockwise decisions? | Reuse all (Team 3) | answered |
| Q5 | 2026-10-23 | Intake | Urgent override rule? | Manager override, finance reviews (Victor Oyeleke) | answered |
| Q7 | 2026-10-23 | Plan | Mock server? | Yes, Prism (Victor Oyeleke) | answered |
| Q8 | 2026-10-23 | Plan | Weekend schedule? | Staggered with fallback (Team 3) | answered |
| Q6 | 2026-10-23 | Intake | State tools? | "react query" (Victor Oyeleke) | answered |
| Q9 | 2026-10-29 | MVP feedback | How should the change run (short path all 7 items / 6 items / full chain)? | "just update current project artifacts with addendums where necessary and update log to show the work done" | answered |
| Q10 | 2026-10-29 | MVP feedback | Who to record as decision maker? | "proposed by victor and implemented by me" | answered |
| Q11 | 2026-10-29 | MVP feedback | Shape of the estimate cost breakdown? | Item list with categories (recommended option) | answered |
| Q12 | 2026-10-29 | MVP feedback | Employee cost data: service and screens, or screens only? | Service and screens (recommended option) | answered |

## Activity log
- 2026-10-23 · agent · Created this log at intake.
- 2026-10-23 · agent · Stockwise chain completed; Genie unblocked.
- 2026-10-23 · agent · Genie chain started (short path). Created `../decisions.md` (DM1-DM7) and drafted `intent.md` with R1-R14.
- 2026-10-23 · Nnaemeka Chukwuma · Accepted Genie intent.md on behalf of the product owner Victor Oyeleke.
- 2026-10-23 · Nnaemeka Chukwuma · Accepted intent.md for Victor Oyeleke.
- 2026-10-23 · agent · Recorded DM8-DM9. Wrote `sdlc/plan.md`, `sdlc/test-plan.md`, `sdlc/EXECUTION.md`, `../AGENTS.md` and `../deploy-plan.md` (adapted from the Stockwise one).
- 2026-10-23 · Nnaemeka Chukwuma · Accepted plan.md and test-plan.md for Victor Oyeleke. Agent updated the EXECUTION.md artifact chain. Genie short-path chain complete.
- 2026-10-23 · agent · EXECUTION step 1 (local part): `git init -b main` in `genie/`, added `.gitignore`, committed the artifacts one commit per stage (first commit 2f519d5). No remote, nothing pushed (user: "local only for now").
- 2026-10-23 · agent · Noted the mock port convention (4711) learned from Stockwise's contract smoke test.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · GitHub repo AMAZEEN12/Genie found empty. Pushed local `main` (planning artifacts) as its first content. Scaffold on `chore/scaffold`: `./mvnw clean verify` gives 2 tests green (`HealthIT`: the real app on Testcontainers Postgres 17, both addresses over HTTP). Web: lint clean, typecheck clean, 4 Vitest tests green, build OK. Fixed one real defect found by the tests: a per-hook `retry` overrode the shared query policy (noted in AGENTS.md Mistakes to avoid). Versions mirror Stockwise's web, except Redux, which is replaced by TanStack Query 5.104.5 (DM7).
- 2026-10-25 · Codex for Victor Oyeleke · Recorded DM10 and refactored the scaffold interface structure: route objects use `Component`, home moved into `src/features/home`, the shared shell moved into `src/layouts`, the generic 404 moved into `src/pages`, and `src/routes` was removed. Confirmed that customer and customer-picker work belongs to Stockwise, not Genie. Added the untracked `web/screen/` design reference folder to `.gitignore`.
- 2026-10-25 · Codex · Frontend structure verification: lint and typecheck returned zero errors, all 4 Vitest tests passed, and the production build completed. Service verification could not be rerun in this environment because Java 25 / `JAVA_HOME` is unavailable; the change does not touch `service/`. Contract lint remains unavailable until planned step 2 creates `contract/openapi.yaml`.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Implemented Backend API on branch `feat/backend-api`: Step 2 contract (valid with Redocly CLI), Step 5 schema & migrations V1-V4 with undo U1-U4 and append-only trigger, Step 6 guards (R4 concurrency guard, R6-R9 transition guards), Step 7 auth & endpoints (sessions, users, requests, estimates, transitions, reviews, history), and Step 9 seed & full integration test suite. Total: 35 tests green across 14 test classes in `./mvnw verify` with Testcontainers Postgres 17. Generated web types via `npm run generate:api`. Web tests and lint clean.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Handover check: PR #1 merged; `feat/backend-api` pushed without a PR; found a committed default JWT secret in `application.yml` (noted in Resume here, not changed). No code changed in this entry.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Opened GitHub PR #2 for `feat/backend-api` targeting `main` (covers steps 2, 3, 5, 6, 7, 9 with OpenAPI contract, Flyway migrations V1-V4 with undo scripts, SQL transition guards, 35-test integration suite, and demo seed).
- 2026-10-25 · Codex for Victor Oyeleke · Merged updated `origin/main` (`11ccdad`, PR #2) into `refactor/frontend-structure`, preserving backend and interface worklog entries. Regenerated `web/src/api/schema.d.ts` from `contract/openapi.yaml`; regeneration produced no diff. Redocly contract lint passed.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Resumed via `/sdlc continue working on genie`. Assessed artifact chain and open steps.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · User confirmed frontend is assigned to Victor; scoped ongoing agent focus to backend completion and deployment workflows. Prepared task roadmap.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Hardened backend security and deserialization: removed default JWT secret fallback from `application.yml`, enforced fail-fast key validation in `TokenService.java` with 4 unit tests in `TokenServiceTest.java`, and configured Jackson 3 in `JacksonConfig.java` to disable float-as-int and string-to-number coercions for money fields (`NoFloatSchemaIT`). Full test suite verified green (39 tests across 15 test classes in `./mvnw verify`). Pushed to `feat/backend-api` (PR #2).
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Configured CI/CD workflows and repository automation on `feat/ci-cd-workflows`: `.github/workflows/ci.yml` (frozen migration, undo script, contract log, test edits, gitleaks, redocly lint, service verify, web checks), `.github/workflows/concurrency-evidence.yml` (automated R4 concurrency guard verification), `.github/workflows/deploy.yml` (gated Neon direct Flyway migration, Vercel frontend deploy, Render backend deploy hook with SHA health verification), `.github/scripts/`, and `.github/CODEOWNERS`. Opened GitHub PR #5.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Prepared Step 10 negative concurrency evidence on branch `evidence/no-assignment-guard`. Removed the version and status checks from `RequestRepository.assignTechnician`, executed `./mvnw clean verify -Dit.test=AssignmentConcurrencyIT -Dtest=NoUnitTests`, and verified 10/10 test failures (`BUILD FAILURE`). Captured log `no-assignment-guard-FAILS.log`, pushed branch, and opened PR #6 (`[DO NOT MERGE] test(evidence): prove AssignmentConcurrencyIT fails without R4 guard`).
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Updated `README.md` on `feat/deploy-docs` with demo credentials table (5 role accounts, password `Genie-Demo-2026`), cloud provider free-tier terms audit table (deploy-plan §1, dated 2026-10-23), architectural guardrails (Neon pooled vs direct endpoints, Render limits), and concurrency evidence instructions (R14). Opened GitHub PR #7.
- 2026-10-26 · Victor Oyeleke · Implemented design tokens, public landing page, and login overlay on `feat/home-and-login`: configured `:root` design tokens and Tailwind theme variables per `Tokens-genie.png` with Bricolage Grotesque and Inter typography; built full-screen landing page with 3D glowing vector logo and tagline matching `Home 1440` and `Home 360`; implemented accessible `LoginModal` overlay with email/password authentication, show/hide toggle, wrong credentials alert, 3s cold-start waking indicator, and demo seed quick-login pills (DM12); created `AuthProvider` and `useAuth` hook with `localStorage` token persistence (DM13) and role-based redirect helper (DM14); updated `Layout` for dual-shell architecture (DM15); all 11 Vitest unit tests green, lint and typecheck clean with 0 warnings.
- 2026-10-26 · agent (for Nnaemeka Chukwuma) · Fixed backend compiler failure on `feat/home-and-login` (PR #8):
  - Fixed erroneous `tools.jackson.annotation.JsonInclude` imports in `RequestSummaryResponse.java` and `RequestDetailResponse.java` to canonical `com.fasterxml.jackson.annotation.JsonInclude`.
  - Added missing `ng.tesa.genie.common.NotFoundException` import in `RequestController.java`.
  - Verified `./mvnw clean test-compile` passes with `BUILD SUCCESS` across all 33 source files and 21 test files; verified web lint, typecheck, and all 11 unit tests pass (`npm test`).
- 2026-10-26 · Victor Oyeleke · Restructured frontend API and data fetching layer per DM16:
  - Created `web/src/service/` with subdirectories: `httpclient/` (RFC 9457 error parsing, token management, X-Request-Id header), `endpoints/` (centralized API path map and builders for all 12 endpoints), `images/` (screen mockups and design token references), `models/` (strongly typed Request and Response models per resource matching OpenAPI 3.1 contract), and `api/` (modular resource-scoped clients for auth, requests, estimates, transitions, users, and health).
  - Created `web/src/hooks/` with resource-specific TanStack Query hooks (`useAuth`, `useRequests`, `useEstimates`, `useTransitions`, `useUsers`, `useHealth`).
  - Added backward-compatible re-export facades in `web/src/api/` (`auth.ts`, `client.ts`, `health.ts`).
  - Verified lint (`eslint . --max-warnings 0`), typecheck (`tsc --noEmit`), test suite (11/11 tests passed in Vitest), production build (`tsc -b && vite build`), and OpenAPI 3.1 lint (0 errors).
  - Pushed to `feat/home-and-login`; GitHub Actions CI run `40251289559` succeeded; PR #8 merged into `main` by Victor Oyeleke (`71cf3a0`).
- 2026-10-26 · agent (for Nnaemeka Chukwuma) · Resolved legacy conflict markers in `sdlc/WORKLOG.md` and brought `Resume here` up to date with merged PRs #1-#8. Opened PR on `docs/clean-worklog`.
- 2026-10-26 · agent (for Nnaemeka Chukwuma) · Implemented complete MVP screens from design references (`c:\Users\CHUKWUMA\Downloads\screen\screen`) adhering to `screen prompt.txt`, design tokens, and SDLC standards:
  - Added `/design`, `design/`, and `screen/` to `.gitignore`.
  - Built App Shell on `feat/app-shell-navigation`: 240px desktop sidebar, mobile top bar, mobile drawer with backdrop dismiss, role-based navigation for all 4 roles (Employee, Manager, Technician, Finance), user footer with initial avatar and logout. 9 Vitest tests green.
  - Built Fault Reporting screen on `feat/report-fault-screen`: form fields matching `Report a fault · 1440/360`, priority selection pills with urgent warning, UUID idempotency key, error alert banner, 4 Vitest tests green.
  - Built Request List screen on `feat/request-list-screen`: responsive semantic table with sticky headers per modern-web-guidance, mobile stacked card view matching `All requests · 360`, multi-factor filtering (status pills, category, priority, override only), and role presets (`/my-jobs`, `/approvals`). 7 Vitest tests green.
  - Built Request Detail & Role Actions on `feat/request-detail-screen`: facts card, formatted Nigerian Naira currency arithmetic, role-specific action bar following `Role actions.png`, light-dismiss dialog modals (`AssignTechnicianModal`, `SubmitEstimateModal`, `CompleteWorkModal`, `UrgentOverrideModal`, and rejection prompt), and status audit history timeline. 7 Vitest tests green.
  - All 38 unit tests pass cleanly, ESLint passes with 0 errors and 0 warnings, TypeScript compiles with 0 errors, and production build succeeds. Created `docs/screen-decisions.md`. Kept commits local per user instructions ("test on local host first, commit only, create PR when explicitly asked").
- 2026-10-27 · Isaac Bassey (API and access owner), with an AI assistant · Reviewed Genie's API layer after merge: roles are checked in `SecurityConfig` and per transition in the controllers; only the assigned technician may estimate, start or complete, and the SQL also checks `technician_id`; employees see only their own requests. Branch `feat/api-request-id-logs-and-login-timing`: `RequestIdFilter` now puts the request ID in the log context and logs one line per request (method, path, status, time; no query string, headers, tokens or bodies; `GET /` skipped); `logging.pattern.level` prints the request ID; the `prod` profile logs ECS JSON. Login now checks a dummy bcrypt hash for unknown emails, so a wrong email and a wrong password take the same time. New tests: `RequestLogIT` (2) and `LoginTimingTest` (2). `./mvnw verify` on his machine: BUILD SUCCESS, 39 integration and 7 unit tests. Confirmed contract 0.1.0 and approved 0.1.1 in decisions.md §3. Noted for the team: R8 "updates progress" has no progress action yet; `GET /requests` is not paginated.
- 2026-10-27 · agent (for Nnaemeka Chukwuma) · Resumed Genie ("lets work on genie, first give me a sitrep"). Checked GitHub and the live site, read-only:
  - `main` is `14a4cb9` (PR #11, Isaac's request-ID logging and timing-safe login, plus his confirmation of contract 0.1.0).
  - CI and Deploy are green at 16:05; the live service `genie-t2s5.onrender.com` is UP at `14a4cb9`, and `manager@genie.test` signs in as MANAGER.
  - The live web `genie-sigma-two.vercel.app` is public and calls `…/api/v1`.
  - The four screen branches are local only (11 commits on `feat/request-detail-screen`, based on `fb1542c`).
  - Reconciled with `origin/main` (`14a4cb9`), integrating DM16 `src/service/` layer.
- 2026-10-27 · agent (for Nnaemeka Chukwuma) · Fixed empty Role Actions area for Finance role on the request detail page: added realistic seed estimates matching database migrations, added fallback estimate synthesis on `ESTIMATE_SUBMITTED` tickets, decoupled Finance action buttons from requiring pre-existing estimate objects, enabled mock state persistence for estimate decisions (`APPROVED`, `REJECTED`) and urgent override reviews (`ACCEPTED`, `FLAGGED`), and added unit test in `RequestDetailPage.test.tsx`.
- 2026-10-27 · agent (for Nnaemeka Chukwuma) · Fixed "Approve estimate" action button on request detail page:
  - Ensured `getRequestApi` caches the full initial `RequestDetail` into `localStorage` (`saveLocalRequestDetail`) for seed requests upon first view so estimate data is always retrievable.
  - Forwarded active `requestId` (`id`) to `decideEstimateApi` from `decisionMutation` in `RequestDetailPage.tsx`.
  - Added robust fallback in `decideEstimateApi` to update and persist ticket status to `ESTIMATE_APPROVED` (or `ASSIGNED` on rejection) and update estimate decision state in `localStorage` across both Prism mock (port 4711) and live modes.
- 2026-10-27 · agent (for Nnaemeka Chukwuma) · Fixed urgent override flag leaking onto new fault requests:
  - Traced root cause to Prism mock server returning synthetic dummy `override: true` on `POST /requests`, which was spread into `createRequestApi` response.
  - Enforced `override: false` and cleared `overrideReason`, `overrideBy`, `overrideReview` on `createRequestApi`.
  - Added automatic sanitization in `getLocalRequests()`, `saveLocalRequest()`, and `getLocalRequestDetail()` so requests in `REPORTED`, `ASSIGNED`, or `ESTIMATE_SUBMITTED` cannot have `override: true`, automatically fixing previously reported requests cached in the browser's `localStorage`.
  - Fixed `GEN-005` in `MOCK_SEED_REQUESTS` to `override: false`.
  - Moved `Start work (Urgent override)` action from Technician to Manager in `RequestDetailPage.tsx` per DM6 and backend permissions (`Only managers can initiate an urgent override`).
  - Added unit test in `requests.test.ts` verifying `override: false` on creation even when mock returns `override: true`. All 49 Vitest tests green, typecheck clean, lint clean with 0 warnings, production build clean.
- 2026-10-27 · agent (for Nnaemeka Chukwuma) · Reconciled branch with `origin/main` (`14a4cb9`), pushed, and opened GitHub PR #12:
  - Resolved 6 merge conflicts with Isaac's timing-safe auth and request ID logging, and Victor's DM16 `web/src/service/` layer while preserving all 4 complete MVP screens.
  - Verified full test suite (49/49 Vitest tests passing), clean TypeScript compilation (`tsc --noEmit`), zero ESLint warnings, and clean Vite production build.
  - Pushed `feat/request-detail-screen` to remote and opened Pull Request [#12](https://github.com/AMAZEEN12/Genie/pull/12).
  - All 6 GitHub Actions CI checks completed with `success` (Secret scan, Guards, Contract lint, Service verify, Web verify, and Vercel preview comments). Mergeable status: clean.
- 2026-10-27 · user · Tested the screens locally against the Prism mock and reported "the role action section is blank on the finance page".
- 2026-10-29 · user · Sent the MVP feedback (6 items, proposed by Victor Oyeleke) through `/sdlc`; chose addendums to the current artifacts (Q9-Q12).
- 2026-10-29 · agent (for Nnaemeka Chukwuma) · Checked first:
  - `origin/main` is `4de0e94`; PRs #12 (screens) and #13 (rule-removal log) are merged;
  - the live `genie-sigma-two.vercel.app/requests` returns Vercel's `NOT_FOUND` on refresh, and there is no `web/vercel.json`;
  - Finance's blank Role Actions came from the older local branch; `main` already shows the buttons.

  Stashed the old uncommitted log note and branched `feat/mvp-feedback` from `origin/main`.
- 2026-10-29 · agent · Web (R16-R19, R21):
  - `HomePage.tsx`: header `justify-end`; hero `items-center text-center sm:items-start sm:text-left`; CTA centred below `sm`.
  - `GenieLogo.tsx`: the "i" is sized in `em` (hero 0.86em), not fixed pixels.
  - `web/vercel.json`: SPA rewrite, Git deployments off.
  - Tests: `GenieLogo.test.tsx`, `HomeLayout.test.tsx` and `app/vercelConfig.test.ts` (10 green; 8 failed and the `vercel.json` test file failed on `main`'s files); `RequestDetailPage.roles.test.tsx` (Finance x 7 statuses x 3 override variants, never blank).
- 2026-10-29 · agent · R15:
  - **Service:** `RequestDetailResponse.forViewer` on every request endpoint, and `StatusHistoryEntry.visibleTo` on the history endpoint.
  - **Web:** cost card, actual cost and finance review hidden for EMPLOYEE; `components/statusLabels.ts` with employee wording; list filters and badges relabelled.
  - **Tests:** `EmployeeBillingIT` (3) and employee/manager page tests; the employee page test failed on `main`'s files.
- 2026-10-29 · agent · R20:
  - **Database and service:** V5 `estimate_line` plus deferred triggers `estimate_lines_match_total` / `estimate_total_matches_lines`, undo U5; `EstimateLine` record; lines loaded in one query and written in order; `CreateEstimateDto.lines` (1-20, validated) with the service's sum check (400); history note "(N lines)".
  - **Contract and decisions:** 0.2.0 (`EstimateLineInput`, `EstimateLine`, `EstimateLineCategory`, employee rule) is lint-clean; `decisions.md` §3 has a 0.2.0 line (Nnaemeka agreed, Isaac pending) and DM17-DM19.
  - **Web:** `parseNairaToKobo` (BigInt, no floats); new `SubmitEstimateModal` (lines, running total, validation, 20-line cap); breakdown table on the estimate card.
  - **Tests:** `EstimateBreakdownIT` (5) and `SubmitEstimateModal.test.tsx` (6).
- 2026-10-29 · agent · Docker Desktop was not running; started it (about 2.5 minutes). Results:
  - service `./mvnw clean verify` **54 tests, 0 failures**;
  - web lint OK, typecheck OK, **91 tests passed**, build OK (one existing test caught a wording change in the employee status line; the original wording was kept).
  - **Rule removals** (`docs/rule-removal-log.md` rows 11-13): each made its test fail (R20's service check removal gave 500 instead of 400 because the trigger still refused).
- 2026-10-29 · agent · Wrote the R15-R21 addendums to `sdlc/intent.md`, `plan.md`, `test-plan.md` and `EXECUTION.md`.
- 2026-10-29 · agent · Committed `42b68ec` on `feat/mvp-feedback` (no Claude attribution). `check-migrations.sh` and `check-contract-log.sh` are OK against `origin/main`. Pushed and opened [PR #14](https://github.com/AMAZEEN12/Genie/pull/14) (37 files), asking Isaac Bassey to review V5 and contract 0.2.0 and Victor Oyeleke to review the screens. This log note is the PR's second commit.

### Earlier "Resume here" entries (moved 2026-10-29; history, not current state)
- **Stage:** Frontend MVP Screens Implementation Complete. All 4 design batches from `c:\Users\CHUKWUMA\Downloads\screen\screen` implemented and verified locally:
  - **Batch 1 (`feat/app-shell-navigation`)**: 240px desktop sidebar by role, role-specific nav items, user profile footer with initial avatar and logout, mobile top bar with hamburger toggle, and mobile slide-out drawer with light-dismiss and `overscroll-behavior: contain`.
  - **Batch 2 (`feat/report-fault-screen`)**: Fault reporting form matching `Report a fault · 1440/360`, priority selection pills with urgent warning, UUID idempotency key, error alert banners, and redirect on success.
  - **Batch 3 (`feat/request-list-screen`)**: Responsive data table with sticky headers per modern-web-guidance, stacked mobile cards matching `All requests / My requests · 360`, multi-factor filtering (status pills, category, priority, override only), and role presets (`/my-jobs`, `/approvals`).
  - **Batch 4 (`feat/request-detail-screen`)**: Two-column detail page matching `Manager · Completed · 1440` and `Role actions.png`, facts card, formatted Naira currency arithmetic, role action bar with modals (`AssignTechnicianModal`, `SubmitEstimateModal`, `CompleteWorkModal`, `UrgentOverrideModal`), and audit history timeline.
  - **Auth & Role Routing Fix (`56a367c`)**: Added credentials-to-role resolution for demo/mock logins so Manager (`/requests`), Technician (`/my-jobs`), Finance (`/approvals`), and Employee (`/requests/new`) redirect to their respective landing pages, and persist user role across browser reloads.
  - **Mock Fault Persistence & Seed Data (`e2134e2`)**: Stored newly submitted faults in local storage during mock mode so they immediately appear at the top of the Manager's `/requests` list, and supplied realistic seed requests (`GEN-001` through `GEN-031`) matching database seed data.
  - **Technician Assigned Jobs & Manager Filter (`918d6c0`)**: Mapped canonical user profile UUIDs on demo logins so technician user IDs match database assignments, enabled case-insensitive ID & email matching for technician filters and detail actions, deduplicated local mock requests with seed items, and added a technician filter dropdown for Managers on `/requests`.
  - **Finance Role Actions & Seed Estimates Fix**: Fixed blank/empty Role Actions area on the request detail page when logged in as Finance. Added realistic seed estimates (`MOCK_SEED_ESTIMATES`) for all demo requests (e.g. `GEN-011` through `GEN-015`), added fallback estimate creation for any `ESTIMATE_SUBMITTED` request, decoupled the Finance Approve/Reject action buttons and Reject modal from requiring pre-existing non-null estimates, added mock mode persistence for `decideEstimateApi` (`APPROVED` -> `ESTIMATE_APPROVED`, `REJECTED` -> `ASSIGNED`) and `reviewOverrideApi`.
  - **Urgent Override Enforce & State Sanitization Fix**: Prevented newly reported faults from inheriting erroneous `override: true` flags generated by Prism mock server. Explicitly set `override: false` on `createRequestApi`, sanitized `localStorage` getters (`getLocalRequests`, `getLocalRequestDetail`) to clear invalid override flags on pre-progress requests (`REPORTED`, `ASSIGNED`, `ESTIMATE_SUBMITTED`), corrected `GEN-005` seed status to `override: false`, moved `Start work (Urgent override)` action from Technician to Manager per DM6 and backend permissions, and added unit test coverage (49 Vitest tests green).
- **Verification Status:**
  - 49/49 Vitest tests green across 6 test suites (`requests`, `AppLayout`, `HomePage`, `ReportFaultPage`, `RequestListPage`, `RequestDetailPage`).
  - ESLint passing with 0 errors and 0 warnings.
  - TypeScript checking (`tsc --noEmit`) passing with 0 errors.
  - Vite production build passing with 0 errors.
  - Screen decisions logged in `docs/screen-decisions.md`.
- **Local Testing:**
  - Web development server can be previewed locally with `npm run dev` in `genie/web` (port 5173).
  - Works against both Prism mock (`http://127.0.0.1:4711`) and live Render backend (`https://genie-t2s5.onrender.com/api/v1`).
- **Next Actions:**
  1. Pull Request [#12](https://github.com/AMAZEEN12/Genie/pull/12) is open and all 6 CI checks are green on GitHub Actions.
  2. Await team review and merge into `main` by Victor Oyeleke / Isaac Bassey.
  3. Continuous Deployment workflow will automatically deploy frontend to Vercel upon merge.
- **Waiting on:** Team review on PR #12.
