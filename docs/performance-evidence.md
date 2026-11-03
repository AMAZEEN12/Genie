# Performance evidence (Genie)

Fill this in after each run. Keep the raw files (`load/results/*.json`, `web/lighthouse/results/`) next to it.

## Load test (k6, `load/k6/genie-mixed-load.js`)
- Date / by:
- Target: `https://genie-t2s5.onrender.com/api/v1` (Render free tier + Neon). Warm: yes / no
- Command:
- Workload: reads (list + detail) with writes at ____ % of the read rate. Steps (reads per second): ____
- Target p95: ____ ms. Error limit: 1 %

| Step (reads/s) | Reads p95 (ms) | Writes p95 (ms) | Error rate | Verdict |
|---|---|---|---|---|
| | | | | |

- Saturation point (first step that fails): ____
- What I think limits it (database pool, Render CPU, cold start): ____
- Limits of this test: one machine, one network path, free-tier host, fictional data, test data left in the database.

## Lighthouse (`web/lighthouse/lighthouserc.cjs`)
- Date / by:
- Web: ____  Profile: desktop / mobile  Runs: 3 (median)

| Page | Performance | Accessibility | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | | | | | | |
| `/requests` (signed in) | | | | | | |

- Fixes made from the report: ____
- Not fixed, and why: ____
