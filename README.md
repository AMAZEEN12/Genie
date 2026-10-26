# Genie

Maintenance requests from reported fault to verified repair. TeSA Cohort 6 capstone, Team 3 side project. Product owner: Victor Oyeleke.

An employee reports a fault. A manager assigns a technician, who estimates the cost. Finance approves the estimate, the technician completes the job, and the manager verifies it. Every step is recorded with who did it and when. Requirements are in [sdlc/intent.md](sdlc/intent.md), and the design and build order in [sdlc/plan.md](sdlc/plan.md).

> **Status: Backend & Workflows Implemented & Verified.**
> - Backend API complete with Java 25, Spring Boot 4, JdbcClient, plain SQL status machine, and Flyway migrations (V1-V4) with undo scripts (U1-U4).
> - 39 tests green across 15 test classes (5 unit tests, 34 integration tests against Testcontainers PostgreSQL 17).
> - OpenAPI 3.1 specification (`contract/openapi.yaml`) lint clean.
> - Concurrency guard verified with automated evidence workflow (`evidence/no-assignment-guard`).
> - Gated CI/CD and deployment workflows configured (`.github/workflows/ci.yml`, `concurrency-evidence.yml`, `deploy.yml`).

## Layout
| Folder | What | Owner |
|----|----|----|
| `service/` | Spring Boot 4 HTTP service (Java 25, Maven wrapper, JdbcClient with plain SQL, Flyway, PostgreSQL) | API and access (Isaac Bassey), Data and rules (Nnaemeka Chukwuma) |
| `web/` | React 19 + TypeScript (strict) + Vite + Tailwind 4, TanStack Query for server data (DM7), React Router | Interface (Victor Oyeleke) |
| `contract/` | OpenAPI 3.1 contract (`contract/openapi.yaml`) and Prism mock on port 4711 (DM8) | Isaac Bassey and Nnaemeka Chukwuma |
| `sdlc/` | Lifecycle artifacts: intent, plan, test plan, runbook, work log | everyone |

## Demo Credentials (R13, R14)
The database seed contains 35 maintenance requests spanning all 7 statuses and 4 edge cases (unassigned urgent, overridden pending finance review, rejected estimate, and disputed verification).

| Name | Email | Role | Password |
|---|---|---|---|
| Tunde Balogun | `employee@genie.test` | `EMPLOYEE` | `Genie-Demo-2026` |
| Chioma Nwosu | `manager@genie.test` | `MANAGER` | `Genie-Demo-2026` |
| Emeka Obi | `technician@genie.test` | `TECHNICIAN` | `Genie-Demo-2026` |
| Fatima Aliyu | `technician2@genie.test` | `TECHNICIAN` | `Genie-Demo-2026` |
| Babajide Adeleke | `finance@genie.test` | `FINANCE` | `Genie-Demo-2026` |

## Free Tier Terms Checked (deploy-plan §1, dated 2026-10-23)
The capstone brief requires auditing each cloud provider's official pricing and terms before deploying:

| Provider | Page read (2026-10-23) | What it says | What it doesn't say (still to verify) |
|---|---|---|---|
| **Qocent Deploy** | apps.qocent.com `/`, `/product`, `/pricing` | Connect a repository through the GitHub App, or upload a zip. **Every push to the tracked branch builds a numbered release.** Roll back to any earlier release with no rebuild. Builds can be cancelled. Secrets are encrypted at rest, with an audit of who revealed which key. A health check on `/` must return 200 before a release goes live. The project type is detected once and can be overridden at creation, after which it is permanent. The home page lists "Web services… Node.js, Python, Go, or Java, including … Spring Boot". **Pricing: prepaid credits, nothing renews. At zero balance live projects pause, deploys are refused and pushes are dropped.** No database service. | **No public docs** (`/docs`, `/help` and `/api` return 404). Not stated: Java version (we need 25), Maven detection (the product page's detection list names Node, Python and Go but not `pom.xml`), port binding, whether the health-check path can be configured, monorepo root directory, memory, cold starts (the home page says "function backends"), free credits, regions, custom domains, deploy API. |
| **Render** | render.com/docs/free | A free web service spins down after **15 min** idle and takes **about 1 min** to spin up. **750 free instance hours per workspace per month**, and all free services are suspended when they run out. Ephemeral filesystem. Render may restart the service at any time. Free Postgres **expires after 30 days** (plus a 14-day grace period) and allows one per workspace. | RAM and CPU for free instances. Docker on free (see `/docs/docker`). Deploy hooks. |
| **Neon** | neon.com/pricing | Free plan is permanent with no card. 100 projects per organisation, **1 GB storage per project** (writes are blocked above that), **100 CU-hours per project per month** (compute is suspended until the next period when exceeded), scale to zero after 5 min (can't be turned off), 10 branches per project, connection pooling included. | Whether inactive projects are paused. |
| **Vercel** | vercel.com/pricing | Hobby is "for personal, non-commercial use", with 1 developer seat, 100 GB/month data transfer, unlimited deployments, and hard usage caps. | Whether a GitHub **organisation** repository can deploy on Hobby. CLI and Actions specifics (limits documentation). |

### Provider Conclusions & Operational Guardrails:
1. **Never use Render Postgres**: expires after 30 days. Neon is used exclusively for PostgreSQL.
2. **Neon dual connection URLs**:
   - `DATABASE_JDBC_URL` uses Neon pooled endpoint (`-pooler`) for Spring Boot runtime.
   - `DATABASE_JDBC_URL_DIRECT` uses Neon direct endpoint for Flyway migrations (pooler breaks session advisory locks).
3. **Render workspace quota**: 750 free hours/month. Cold starts take ~1 minute after 15 minutes of inactivity. Keep-alive pingers are avoided.
4. **Qocent credit risk**: Prepaid credits require positive balance. Stack V (Vercel + Render + Neon) serves as the primary official deployment.

## Concurrency Evidence (Step 10, Spec R4, Success Measure S2)
- Rule R4 requires optimistic concurrency protection on technician assignment: `WHERE id = :id AND status = 'REPORTED' AND version = :expectedVersion`.
- Passing run: `AssignmentConcurrencyIT` passes 10 repeated parallel executions on `main` / `feat/backend-api`.
- Failing evidence branch: `evidence/no-assignment-guard` removes the status and version checks.
- Workflow `.github/workflows/concurrency-evidence.yml` automates running both and archiving `with-guard-PASSES.log` and `no-assignment-guard-FAILS.log`.

## Run it locally
Prerequisites: Java 25, Node 22+, Docker Desktop.

```bash
# 1. Start local PostgreSQL
docker compose up -d db

# 2. Run backend service
cd service && ./mvnw spring-boot:run

# 3. Run frontend
cd web && cp .env.example .env && npm ci && npm run dev
```

Local service URL: `http://localhost:8080/api/v1`
Healthcheck: `http://localhost:8080/api/v1/health`

## Automated Checks
```bash
# Backend unit and integration tests (39 tests on Testcontainers Postgres 17)
cd service && ./mvnw verify

# OpenAPI contract linting
npx --yes @redocly/cli@2 lint contract/openapi.yaml --config contract/redocly.yaml

# Frontend checks
cd web && npm run lint && npm run typecheck && npm test && npm run build
```

## Configuration Reference
| Variable | Tier | Default | Description |
|---|---|---|---|
| `PORT` | service | `8080` | Port bound by the HTTP container |
| `DATABASE_JDBC_URL` | service | `jdbc:postgresql://localhost:5433/genie` | Runtime pooled database connection string |
| `DATABASE_JDBC_URL_DIRECT` | CI/CD | - | Direct endpoint for Flyway migrations |
| `DATABASE_USERNAME`, `DATABASE_PASSWORD` | service | `genie` / `genie` | Database credentials |
| `JWT_SECRET` | service | Required (fail fast if empty) | HMAC-SHA secret (>= 32 bytes) for auth tokens |
| `VITE_API_BASE_URL` | web | `http://127.0.0.1:4711` | API base URL for client queries |
