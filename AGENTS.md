# Genie

Maintenance requests from fault to verified repair (TeSA Cohort 6 capstone, Team 3 side project, product owner Victor Oyeleke). Context for any AI agent or new team member. Read it at the start of every session.

> Commands are **planned** (`sdlc/plan.md`). The first engineer to scaffold each part replaces "planned" with the verified command and its real healthy output.

## Commands
- Database (local): `docker compose up -d db`
- Service: `cd service && ./mvnw verify` (healthy: `BUILD SUCCESS`, `Failures: 0, Errors: 0`; needs Docker)
- Run: `cd service && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local,demo`
- Contract lint: `npx @redocly/cli lint contract/openapi.yaml`
- Mock: `npx @stoplight/prism-cli@5 mock contract/openapi.yaml --port 4711` (DM8; serves paths at the root)
- Web: `cd web && npm ci && npm run lint && npm run typecheck && npm test -- --run && npm run build`

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
- `web/`: React app; types generated from the contract.
- `.github/workflows/`: `ci.yml`, `deploy.yml`, `concurrency-evidence.yml`.

## Protected paths
- `web/src/api/schema.d.ts` is generated. Don't edit it by hand.
- Applied migrations are frozen. Write `V<n+1>` instead.
- `evidence/no-assignment-guard` is never merged.
- Don't edit tests during a bug fix.

## Mistakes to avoid
Rule: when an agent makes the same mistake twice, the correction goes here.
- (none yet)

## Verifying your work
Before reporting a task complete, run these and paste the output:
- `cd service && ./mvnw verify` (`BUILD SUCCESS`)
- `npx @redocly/cli lint contract/openapi.yaml` (valid)
- `cd web && npm run lint && npm run typecheck && npm test -- --run` (zero errors, all green)

If a test fails, fix the code, not the test. Never skip or delete a failing test.

## Lifecycle work in progress
Artifacts live in `sdlc/` (short path: intent, plan, test-plan, EXECUTION). Read `sdlc/WORKLOG.md` first and continue from its "Resume here" section. Then read `sdlc/intent.md` (it holds the requirements) and `sdlc/plan.md` before changing code. Product decisions are in `decisions.md`.
