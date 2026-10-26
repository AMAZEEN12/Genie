# Work log: Genie (Team 3 side project)

Change slug: `genie` · Started: 2026-10-23 · Last updated: 2026-10-25 by the agent
Source document: `Tesa cohort 6 software engineering capstone project.pdf` (Genie is product 7, pages 19-20; "Side project standard" page 14)

> Any agent opening this project: read this file first, then the "Conventions and guidelines" and "Decisions" sections, then the artifacts in this folder. Continue from "Resume here". Don't re-ask anything already answered below.

## Resume here
- **Stage:** Frontend MVP Screens Implementation Complete. All 4 design batches from `c:\Users\CHUKWUMA\Downloads\screen\screen` implemented and verified locally:
  - **Batch 1 (`feat/app-shell-navigation`)**: 240px desktop sidebar by role, role-specific nav items, user profile footer with initial avatar and logout, mobile top bar with hamburger toggle, and mobile slide-out drawer with light-dismiss and `overscroll-behavior: contain`.
  - **Batch 2 (`feat/report-fault-screen`)**: Fault reporting form matching `Report a fault · 1440/360`, priority selection pills with urgent warning, UUID idempotency key, error alert banners, and redirect on success.
  - **Batch 3 (`feat/request-list-screen`)**: Responsive data table with sticky headers per modern-web-guidance, stacked mobile cards matching `All requests / My requests · 360`, multi-factor filtering (status pills, category, priority, override only), and role presets (`/my-jobs`, `/approvals`).
  - **Batch 4 (`feat/request-detail-screen`)**: Two-column detail page matching `Manager · Completed · 1440` and `Role actions.png`, facts card, formatted Naira currency arithmetic, role action bar with modals (`AssignTechnicianModal`, `SubmitEstimateModal`, `CompleteWorkModal`, `UrgentOverrideModal`), and audit history timeline.
  - **Auth & Role Routing Fix (`56a367c`)**: Added credentials-to-role resolution for demo/mock logins so Manager (`/requests`), Technician (`/my-jobs`), Finance (`/approvals`), and Employee (`/requests/new`) redirect to their respective landing pages, and persist user role across browser reloads.
  - **Mock Fault Persistence & Seed Data (`e2134e2`)**: Stored newly submitted faults in local storage during mock mode so they immediately appear at the top of the Manager's `/requests` list, and supplied realistic seed requests (`GEN-001` through `GEN-031`) matching database seed data.
  - **Technician Assigned Jobs & Manager Filter (`918d6c0`)**: Mapped canonical user profile UUIDs on demo logins so technician user IDs match database assignments, enabled case-insensitive ID & email matching for technician filters and detail actions, deduplicated local mock requests with seed items, and added a technician filter dropdown for Managers on `/requests`.
- **Verification Status:**
  - 47/47 Vitest tests green across 6 test suites (`requests`, `AppLayout`, `HomePage`, `ReportFaultPage`, `RequestListPage`, `RequestDetailPage`).
  - ESLint passing with 0 errors and 0 warnings.
  - TypeScript checking (`tsc --noEmit`) passing with 0 errors.
  - Vite production build passing with 0 errors.
  - Screen decisions logged in `docs/screen-decisions.md`.
- **Local Testing:**
  - Web development server can be previewed locally with `npm run dev` in `genie/web` (port 5173).
  - Works against both Prism mock (`http://127.0.0.1:4711`) and live Render backend (`https://genie-t2s5.onrender.com/api/v1`).
- **Next Actions:**
  1. User tests and verifies screens on localhost (`http://localhost:5173`).
  2. When user explicitly approves, push feature branch and create pull request.
- **Waiting on:** User review on localhost before pushing or opening PR.

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
  - Pushed to `feat/home-and-login`; GitHub Actions CI run `40251289559` succeeded; PR #8 merged into `main` by Victor Oyeleke (`71cf3a0`).
- 2026-10-26 · agent (for Nnaemeka Chukwuma) · Resolved legacy conflict markers in `sdlc/WORKLOG.md` and brought `Resume here` up to date with merged PRs #1-#8. Opened PR on `docs/clean-worklog`.
- 2026-10-26 · agent (for Nnaemeka Chukwuma) · Implemented complete MVP screens from design references (`c:\Users\CHUKWUMA\Downloads\screen\screen`) adhering to `screen prompt.txt`, design tokens, and SDLC standards:
  - Added `/design`, `design/`, and `screen/` to `.gitignore`.
  - Built App Shell on `feat/app-shell-navigation`: 240px desktop sidebar, mobile top bar, mobile drawer with backdrop dismiss, role-based navigation for all 4 roles (Employee, Manager, Technician, Finance), user footer with initial avatar and logout. 9 Vitest tests green.
  - Built Fault Reporting screen on `feat/report-fault-screen`: form fields matching `Report a fault · 1440/360`, priority selection pills with urgent warning, UUID idempotency key, error alert banner, 4 Vitest tests green.
  - Built Request List screen on `feat/request-list-screen`: responsive semantic table with sticky headers per modern-web-guidance, mobile stacked card view matching `All requests · 360`, multi-factor filtering (status pills, category, priority, override only), and role presets (`/my-jobs`, `/approvals`). 7 Vitest tests green.
  - Built Request Detail & Role Actions on `feat/request-detail-screen`: facts card, formatted Nigerian Naira currency arithmetic, role-specific action bar following `Role actions.png`, light-dismiss dialog modals (`AssignTechnicianModal`, `SubmitEstimateModal`, `CompleteWorkModal`, `UrgentOverrideModal`, and rejection prompt), and status audit history timeline. 7 Vitest tests green.
  - All 38 unit tests pass cleanly, ESLint passes with 0 errors and 0 warnings, TypeScript compiles with 0 errors, and production build succeeds. Created `docs/screen-decisions.md`. Kept commits local per user instructions ("test on local host first, commit only, create PR when explicitly asked").
