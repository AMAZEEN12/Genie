# Performance evidence (Genie)

Raw files: `load/results/mixed.json`, `load/results/mixed.txt`, `docs/evidence/lighthouse/`.

## Load test (k6, `load/k6/genie-mixed-load.js`)
- Date / by: 2026-11-03 / Nwafor Blessing, GitHub Actions "Load test" workflow
- Target: `https://genie-t2s5.onrender.com/api/v1` (Render free tier + Neon). Warm: yes (health check before the run)
- Workload: reads (list + detail) with writes at 10 % of the read rate. Steps: 2, 5, 10, 20 reads per second, 45 s each
- Target p95: 800 ms for reads, 1600 ms for writes. Error limit: 1 %

| Step (reads/s) | Reads p95 | Writes p95 | Verdict |
|---|---|---|---|
| 2 | 544 ms | 754 ms | pass |
| 5 | 554 ms | 779 ms | pass |
| 10 | 525 ms | 781 ms | pass |
| 20 | 12.3 s | 12.1 s | fail |

- Whole run: 3126 requests, 73 failed (2.33 %, over the 1 % limit). 225 iterations were dropped at the top step because k6 could not keep the arrival rate.
- Saturation point: 20 reads per second. Up to 10 reads per second the API stayed inside its targets.
- What limits it: not established. Candidates are Render free-tier CPU, the database connection pool and Neon. Not tested.
- Limits of this test: one run, one GitHub runner in another region, free-tier host, fictional data, test faults left in the database. Failures were not broken down per step.

## Lighthouse (`web/lighthouse/lighthouserc.cjs`)
- Date / by: 2026-11-03 / Nwafor Blessing, GitHub Actions "Lighthouse" workflow
- Web: https://genie-sigma-two.vercel.app  Profile: desktop  Runs: 3 (median)

| Page | Performance | Accessibility | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | 100 | 95 | 100 | 0.47 s | 0.004 | 0 ms |
| `/requests` (signed in) | 99 | 96 | 100 | 0.81 s | 0 | 1 ms |

- Findings: colour contrast fails on both pages; unused JavaScript; `robots.txt` not valid; large DOM on `/requests`.
- Fixes made from the report: none yet.
- Not fixed, and why: colour contrast and the others are not fixed yet. Next step is to find the failing element in the report and correct it.
- Scores are desktop and unthrottled. Mobile would be lower.
