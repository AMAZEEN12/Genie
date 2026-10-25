# Work log: Genie (Team 3 side project)

Change slug: `genie` · Started: 2026-10-23 · Last updated: 2026-10-23 by the agent
Source document: `Tesa cohort 6 software engineering capstone project.pdf` (Genie is product 7, pages 19-20; "Side project standard" page 14)

> Any agent opening this project: read this file first, then the "Conventions and guidelines" and "Decisions" sections, then the artifacts in this folder. Continue from "Resume here". Don't re-ask anything already answered below.

## Resume here
- **Stage:** Implementation (EXECUTION.md).
- **Step:** Project scaffold done on branch `chore/scaffold`, requested by Nnaemeka Chukwuma. It has two separate builds: `service/` (Spring Boot 4.1.2, Java 25, Maven wrapper, `GenieApplication`, `RootController` answering `/` and `/api/v1/health`, `application.yml`, Dockerfile, `HealthIT`) and `web/` (Vite 7, React 19, TS strict, Tailwind 4, TanStack Query (DM7), React Router 7, API client, placeholder home, Vitest). Plus `docker-compose.yml` (Postgres 17 on 5433), README and `.editorconfig`. GitHub repo: https://github.com/AMAZEEN12/Genie.
- **In progress:** nothing half-done.
- **Next action:** Review and merge the scaffold PR. Then step 2, the contract (Isaac + Nnaemeka); steps 3, 5 and 6, the schema, migrations V1-V4 and the guards (Nnaemeka, adding the sign-up review fixes to V1: unique `lower(email)` and the name-length CHECK); step 4, the deploy wiring and CI (Blessing); step 8, screens (Victor).
- **Waiting on:** branch protection, CODEOWNERS and the `production` environment on the GitHub repo (Blessing, step 1). Isaac Bassey's collaborator access.

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
