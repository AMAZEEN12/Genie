# Genie

Maintenance requests from fault to verified repair (TeSA Cohort 6 capstone, Team 3 side project, product owner Victor Oyeleke). Context for any AI agent or new team member. Read it at the start of every session.

> Commands marked **verified** were run on the scaffold (2026-10-25). The others are still planned; the first engineer to run one replaces "planned" with the real healthy output.

## Commands
- Database (local): `docker compose up -d db` (Postgres 17 on host port **5433**, database, user and password `genie`)
- Service build and test **(verified 2026-10-25)**: `cd service && ./mvnw verify` (healthy: `Tests run: 34, Failures: 0, Errors: 0` integration tests across 13 test classes plus `PasswordTest`, then `BUILD SUCCESS`). Needs **Docker Desktop running** (Testcontainers, `postgres:17-alpine`).
- Run (planned; the same app was verified in the image above): `cd service && ./mvnw spring-boot:run` with `docker compose up -d db` first (healthy: `Started GenieApplication`; `curl localhost:8080/api/v1/health` gives `{"status":"UP","database":"UP",...}`). Add `-Dspring-boot.run.profiles=demo` for the seed. Flyway runs at start-up, so the service won't start without a database.
- Service image **(verified 2026-10-25)**: `docker build -t genie-service service/` (about 520 MB, runs as the non-root user `genie`). Started with `DATABASE_JDBC_URL` pointing at a Postgres 17 container, it logged `Started GenieApplication in 8.8 seconds`, and both `/` and `/api/v1/health` answered `UP`.
- Contract lint **(verified 2026-10-25)**: `npx @redocly/cli lint contract/openapi.yaml` (0 errors, valid).
- Mock (planned, step 2): `cd web && npm run mock` (Prism on port 4711, DM8; serves paths at the root)
- Web **(verified 2026-10-25)**: `cd web && npm ci && npm run lint && npm run typecheck && npm test && npm run build` (healthy: no lint output, `Tests 4 passed (4)`, `built in`). `npm run dev` serves on http://127.0.0.1:5173.
- Generated API types **(verified 2026-10-25)**: `cd web && npm run generate:api` writes `src/api/schema.d.ts`.

## Conventions
- Same stack and rules as Stockwise (DM5): Java 25, Spring Boot 4, Maven wrapper, `JdbcClient` with plain SQL (no JPA), Flyway with an undo script for every migration, React + TS strict + TanStack Query only (DM7).
- **Money is integer kobo** (`BIGINT` / `long` / JSON integer). Never floating point.
- **Every status change is one guarded SQL `UPDATE … WHERE status = <expected> …`** plus a `status_history` insert in the same transaction. Never read the status in Java and then write it.
- The status sequence is defined once in `contract/openapi.yaml` and enforced in SQL. The UI only hides buttons; the service decides.
- `status_history` is append-only.
- `POST /requests` takes `Idempotency-Key`.
- Urgent override (DM6): URGENT only, reason required, finance reviews before close.
- Decisions go in `decisions.md` with "Decided by" and "Logged by" recorded separately. Contract changes get a dated line naming two engineers.

## Architecture
- `contract/`: OpenAPI 3.1 and the Prism mock.
- `service/`: package `ng.tesa.genie` (`config`, `auth`, `user`, `request`, `estimate`, `common`). Migrations, undo scripts and seed live under `src/main/resources/db/`.
- `web/`: React app; types generated from the contract. Route objects use React Router's `Component` property. Product feature code lives in `src/features/<feature>`, shared route shells in `src/layouts`, and generic pages in `src/pages`; don't recreate `src/routes`.
- `.github/workflows/`: `ci.yml`, `deploy.yml`, `concurrency-evidence.yml`.

## Protected paths
- `web/src/api/schema.d.ts` is generated. Don't edit it by hand.
- Applied migrations are frozen. Write `V<n+1>` instead.
- `evidence/no-assignment-guard` is never merged.
- Don't edit tests during a bug fix.
- `service/` and `web/` are separate builds with no shared code. The contract is the only link between them.

## Mistakes to avoid
Rule: when an agent makes the same mistake twice, the correction goes here.
- A query hook must not set its own `retry`. The shared policy in `web/src/app/queryClient.ts` decides (retry network errors and 5xx once, never 4xx). A per-hook `retry: 1` overrode it and delayed every error state by a second (scaffold, 2026-10-25).
- PostgreSQL JDBC driver does not map `Instant` directly on `rs.getObject(col, Instant.class)` or when binding raw `Instant` parameters in `jdbc.sql(...)`. Use `rs.getTimestamp(col)?.toInstant()` and bind `Timestamp.from(instant)` to avoid `PSQLException` (backend, 2026-10-25).

## Verifying your work
Before reporting a task complete, run these and paste the output:
- `cd service && ./mvnw verify` (`BUILD SUCCESS`)
- `npx @redocly/cli lint contract/openapi.yaml` (valid)
- `cd web && npm run lint && npm run typecheck && npm test` (zero errors, all green)

If a test fails, fix the code, not the test. Never skip or delete a failing test.

## Lifecycle work in progress
Artifacts live in `sdlc/` (short path: intent, plan, test-plan, EXECUTION). Read `sdlc/WORKLOG.md` first and continue from its "Resume here" section. Then read `sdlc/intent.md` (it holds the requirements) and `sdlc/plan.md` before changing code. Product decisions are in `decisions.md`.
