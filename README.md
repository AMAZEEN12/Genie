# Genie

Maintenance requests from reported fault to verified repair. TeSA Cohort 6 capstone, Team 3 side project. Product owner: Victor Oyeleke.

An employee reports a fault. A manager assigns a technician, who estimates the cost. Finance approves the estimate, the technician completes the job, and the manager verifies it. Every step is recorded with who did it and when. Requirements are in [sdlc/intent.md](sdlc/intent.md), and the design and build order in [sdlc/plan.md](sdlc/plan.md).

> **Status: scaffold.** Both tiers build and test, but no feature exists yet. The service answers `/` and `/api/v1/health` only, and the web app shows a placeholder home page that checks the service. Demo credentials, simulated-feature labels, the live addresses and the free-tier terms are added as the work lands (R14).

## Layout
| Folder | What | Owner |
|----|----|----|
| `service/` | Spring Boot 4 HTTP service (Java 25, Maven wrapper, JdbcClient with plain SQL, Flyway, PostgreSQL) | API and access (Isaac Bassey), Data and rules (Nnaemeka Chukwuma) |
| `web/` | React 19 + TypeScript (strict) + Vite + Tailwind 4, TanStack Query for server data (DM7), React Router | Interface (Victor Oyeleke) |
| `contract/` | OpenAPI 3.1 contract and Prism mock (step 2, to come) | Isaac Bassey and Nnaemeka Chukwuma |
| `sdlc/` | Lifecycle artifacts: intent, plan, test plan, runbook, work log | everyone |

## Run it locally
You need Java 25, Node 24, and Docker Desktop (the tests start Postgres in Docker).

```bash
docker compose up -d db
```

```bash
cd service && ./mvnw spring-boot:run
```

The service listens on http://localhost:8080 and uses the compose database by default. `DATABASE_JDBC_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` and `PORT` override it.

```bash
cd web && cp .env.example .env && npm ci && npm run dev
```

Set `VITE_API_BASE_URL` in `web/.env` to the mock (`http://127.0.0.1:4711`, the default) or to the service (`http://localhost:8080/api/v1`).

## Checks
```bash
cd service && ./mvnw verify
```

```bash
cd web && npm run lint && npm run typecheck && npm test && npm run build
```

## Configuration
| Variable | Where | Default | Notes |
|----|----|----|----|
| `PORT` | service | `8080` | Set by the host |
| `DATABASE_JDBC_URL` | service | `jdbc:postgresql://localhost:5433/genie` | Neon: `jdbc:postgresql://<host>/<db>?sslmode=require` |
| `DATABASE_USERNAME`, `DATABASE_PASSWORD` | service | `genie` / `genie` | Secrets in deployment; never committed |
| `VITE_API_BASE_URL` | web (build time) | `http://127.0.0.1:4711` | Public, not a secret |
| `SPRING_PROFILES_ACTIVE=demo` | service | off | Adds the demo seed (`db/seed`) once it exists |
