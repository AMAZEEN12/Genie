# Work log: Genie (Team 3 side project)

Change slug: `genie` · Started: 2026-10-23 · Last updated: 2026-10-25 by the agent
Source document: `Tesa cohort 6 software engineering capstone project.pdf` (Genie is product 7, pages 19-20; "Side project standard" page 14)

> Any agent opening this project: read this file first, then the "Conventions and guidelines" and "Decisions" sections, then the artifacts in this folder. Continue from "Resume here". Don't re-ask anything already answered below.

## Resume here
- **Stage:** Implementation & Deployment (EXECUTION.md).
- **Division of Work:**
  - Frontend (`web/` screens, Step 8): Owned and handled by Victor Oyeleke.
  - Backend & Deployment (Steps 1, 4, 10): Handled by Nnaemeka Chukwuma / agent.
- **Backend Status:** Complete on branch `feat/backend-api` with PR #2 open at https://github.com/AMAZEEN12/Genie/pull/2.
  - 39 tests green across 15 test classes (5 unit tests, 34 integration tests) passing on Testcontainers Postgres 17.
  - Hardened JWT secret handling with fail-fast enforcement in production and unit test coverage (`TokenServiceTest`).
  - Strict Jackson 3 money deserialization configured (`JacksonConfig`) enforcing integer kobo and rejecting float/string coercions (`NoFloatSchemaIT`).
  - OpenAPI 3.1 contract lint clean.
  - Flyway migrations V1-V4 and rollback undo scripts U1-U4.
  - Demo seed dataset (35 requests across 7 statuses + 4 edge cases).
- **In progress:** Failing-test evidence branch & CI/CD deployment workflows.
- **Next backend & deployment actions:**
  1. Push hardened backend configuration & tests to `feat/backend-api` (PR #2) - **Completed**.
  2. Create GitHub Actions CI & Evidence workflows (`.github/workflows/ci.yml`, `concurrency-evidence.yml`, `deploy.yml`, and helper scripts in `.github/scripts/`) and open PR #5 - **Completed**.
  3. Create failing-test evidence branch `evidence/no-assignment-guard` (Step 10) proving `AssignmentConcurrencyIT` fails without the version guard, and open PR #6 - **Completed**.
  4. Update `README.md` with demo credentials, free-tier audit table (deploy-plan §1), and deployment instructions (R14) and open PR #7 - **In Progress**.
  5. Coordinate Neon & Render production secrets and deployment hook.
- **Waiting on:** PR merges to `main`, GitHub repository environment/secrets configuration, and Victor's frontend completion.

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
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Implemented Backend API on branch `feat/backend-api`: Step 2 contract (valid with Redocly CLI), Step 5 schema & migrations V1-V4 with undo U1-U4 and append-only trigger, Step 6 guards (R4 concurrency guard, R6-R9 transition guards), Step 7 auth & endpoints (sessions, users, requests, estimates, transitions, reviews, history), and Step 9 seed & full integration test suite. Total: 35 tests green across 14 test classes in `./mvnw verify` with Testcontainers Postgres 17. Generated web types via `npm run generate:api`. Web tests and lint clean.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Handover check: PR #1 merged; `feat/backend-api` pushed without a PR; found a committed default JWT secret in `application.yml` (noted in Resume here, not changed). No code changed in this entry.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Opened GitHub PR #2 for `feat/backend-api` targeting `main` (covers steps 2, 3, 5, 6, 7, 9 with OpenAPI contract, Flyway migrations V1-V4 with undo scripts, SQL transition guards, 35-test integration suite, and demo seed).
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Resumed via `/sdlc continue working on genie`. Assessed artifact chain and open steps.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · User confirmed frontend is assigned to Victor; scoped ongoing agent focus to backend completion and deployment workflows. Prepared task roadmap.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Hardened backend security and deserialization: removed default JWT secret fallback from `application.yml`, enforced fail-fast key validation in `TokenService.java` with 4 unit tests in `TokenServiceTest.java`, and configured Jackson 3 in `JacksonConfig.java` to disable float-as-int and string-to-number coercions for money fields (`NoFloatSchemaIT`). Full test suite verified green (39 tests across 15 test classes in `./mvnw verify`). Pushed to `feat/backend-api` (PR #2).
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Configured CI/CD workflows and repository automation on `feat/ci-cd-workflows`: `.github/workflows/ci.yml` (frozen migration, undo script, contract log, test edits, gitleaks, redocly lint, service verify, web checks), `.github/workflows/concurrency-evidence.yml` (automated R4 concurrency guard verification), `.github/workflows/deploy.yml` (gated Neon direct Flyway migration, Vercel frontend deploy, Render backend deploy hook with SHA health verification), `.github/scripts/`, and `.github/CODEOWNERS`. Opened GitHub PR #5.
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Prepared Step 10 negative concurrency evidence on branch `evidence/no-assignment-guard`. Removed the version and status checks from `RequestRepository.assignTechnician`, executed `./mvnw clean verify -Dit.test=AssignmentConcurrencyIT -Dtest=NoUnitTests`, and verified 10/10 test failures (`BUILD FAILURE`). Captured log `no-assignment-guard-FAILS.log`, pushed branch, and opened PR #6 (`[DO NOT MERGE] test(evidence): prove AssignmentConcurrencyIT fails without R4 guard`).
- 2026-10-25 · agent (for Nnaemeka Chukwuma) · Updated `README.md` on `feat/deploy-docs` with demo credentials table (5 role accounts, password `Genie-Demo-2026`), cloud provider free-tier terms audit table (deploy-plan §1, dated 2026-10-23), architectural guardrails (Neon pooled vs direct endpoints, Render limits), and concurrency evidence instructions (R14).
