# Genie decisions file

Team 3 · Side project (proposed by Victor Oyeleke) · Started 2026-10-23

This file is Genie's own decisions file (separate repository, DM-G2). It has three parts:
1. **Decisions to make or confirm.**
2. **Decisions made.** Append-only, with "Decided by" and "Logged by" recorded separately.
3. **Contract change log.** Every change to `contract/openapi.yaml`, dated, with **two engineers** named.

## 1. Decisions to make or confirm
(none open yet; see `sdlc/intent.md` "Open questions")

## 2. Decisions made
| ID | Date | Decision | Reason | Decided by | Logged by |
|----|------|----------|--------|------------|-----------|
| DM1 | 2026-10-23 | Genie follows the short SDLC path: intent.md (with requirements), plan.md, test-plan.md, EXECUTION.md. Spec, release and monitoring are covered by notes in EXECUTION.md | Side-project standard; Monday deadline | Team 3 | Nnaemeka Chukwuma |
| DM2 | 2026-10-23 | Genie is its own GitHub repository with its own artifacts, updated independently of Stockwise | Team decision for both products | Team 3 | Nnaemeka Chukwuma |
| DM3 | 2026-10-23 | Product owner: Victor Oyeleke (accepts Genie's artifacts, confirms MVP scope) | The brief says the interface engineer confirms the side project's scope | Team 3 | Nnaemeka Chukwuma |
| DM4 | 2026-10-23 | Area owners as for Stockwise (the brief: areas owned across both products by the same engineer): Nnaemeka Chukwuma (Data and rules), Isaac Bassey (API and access, team lead), Blessing Nwafor (Delivery and evidence), Victor Oyeleke (Interface) | Brief | Team 3 | Nnaemeka Chukwuma |
| DM5 | 2026-10-23 | Reuse the Stockwise team decisions as Genie's own: Java 25, Spring Boot 4, Maven wrapper, Spring JdbcClient with plain SQL, Flyway with hand-written undo scripts, PostgreSQL. Email + password (bcrypt), JWT bearer, 8-hour tokens, role re-read per request. Store UTC, "today" in Africa/Lagos. Vite + React 19 + TS strict + Tailwind + shared component set. Both hosting stacks in parallel (Vercel + Render + Neon official; Qocent + Neon parallel, pending funding) with **Genie's own** Neon project and Render service. CI gate, test guard plus CODEOWNERS, 80% coverage on rule packages, release manager Isaac Bassey (backup Blessing Nwafor), no AI agent in CI, reviews with 5 nits and one code-owner approval | Consistency; saves setup time; one shared component set | Team 3 | Nnaemeka Chukwuma |
| DM6 | 2026-10-23 | **Design problem (urgent fault vs finance approval):** a manager may start work before finance approval **only for priority URGENT** requests, with a mandatory reason. The request moves to In progress with `override = true`. Finance must review the override afterwards (accept, or flag as misuse) before the job can be verified and closed. Overrides are visible in a filter and counted per manager | Emergencies can't wait. Visibility plus a mandatory after-the-fact review stops the override quietly becoming the normal path. Cost: a work-around path exists and is guarded by review, not prevention. Reverse if more than about 20% of jobs use the override or finance flags misuse repeatedly | Victor Oyeleke | Nnaemeka Chukwuma |
| DM7 | 2026-10-23 | Interface state: TanStack (React) Query only, for server data. UI state in React state or URL params. No Redux Toolkit | One state tool; the brief warned that using both doubles the tools | Victor Oyeleke | Nnaemeka Chukwuma |
| DM8 | 2026-10-23 | Genie uses a Prism mock server generated from `contract/openapi.yaml` (optional for side projects, adopted anyway) | Victor can build Genie screens without waiting for the service | Victor Oyeleke | Nnaemeka Chukwuma |
| DM9 | 2026-10-23 | Weekend schedule, staggered with a fallback. **Fri:** Genie contract (MVP paths) and schema sketch (Isaac, Nnaemeka); repo and skeleton deploy (Blessing). **Sat:** migrations, assignment guard and its test (Nnaemeka); auth and endpoints (Isaac). **Sun:** screens against the mock (Victor). If Victor is behind by Sun 12:00, Blessing builds Genie's basic screens and logs it. Stockwise always takes priority | The brief's two-thirds / one-third split and its interface-risk fallback | Team 3 | Nnaemeka Chukwuma |
| DM11 | 2026-10-25 | Keep the Monday endpoint set unchanged and align its public contract: request responses use dedicated summary/detail DTOs, internal idempotency fields are never returned, request history uses the same ownership rule as request detail, transitions have type-specific request schemas, assignment concurrency uses the body `version`, and request references are opaque strings to clients. Logout remains client-side; access requests and `allowedActions` are deferred. | Corrects contract/service mismatches without expanding Monday MVP scope or coupling the interface to a reference format. | Victor Oyeleke | Codex |
| DM10 | 2026-10-25 | The web router uses React Router Data Mode route objects with the `Component` property. Product feature code lives under `web/src/features/<feature>`; shared shells live under `web/src/layouts`; generic pages such as 404 live under `web/src/pages`. There is no separate `routes` folder. Customer and customer-picker work is not part of Genie. | Keeps routing configuration separate from feature ownership and corrects a Stockwise-only resource that was mentioned for Genie by mistake | Victor Oyeleke | Codex |

## 3. Contract change log
| Date | Change | Why | Agreed by (two engineers) |
|------|--------|-----|---------------------------|
| 2026-10-25 | Initial contract 0.1.0: MVP paths for auth, users, requests, assignment, estimates, transitions, override-review, history and health | EXECUTION.md step 2; Monday MVP | Isaac Bassey (API and access owner), Nnaemeka Chukwuma (Data and rules owner) |
| 2026-10-25 | Proposed 0.1.1: align request response DTOs, document detail/history 403 responses, require type-specific transition fields, keep assignment version in the body, and define references as opaque | Keep the merged service and generated interface schema in sync for Monday | Victor Oyeleke (interface owner, approved); Isaac Bassey (API owner, approval requested before merge) |
