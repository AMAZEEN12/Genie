# Genie performance checks

Two checks, both optional (the side-project standard does not require them). Keep results in `docs/performance-evidence.md`.

## 1. Load test (k6)
Install k6 (https://grafana.com/docs/k6/latest/set-up/install-k6/), then from the repo root:

    # try it on your own machine first (service running locally on 8080)
    k6 run -e RATES=2,5 load/k6/genie-mixed-load.js

    # the deployed API
    k6 run -e BASE=https://genie-t2s5.onrender.com/api/v1 --summary-export=load/results/mixed.json load/k6/genie-mixed-load.js

Read the end-of-test summary: one `read_N` and one `write_N` line per step. The saturation point is the first step
where p95 passes the target (800 ms) or errors pass 1 %.
The script wakes Render first, but run it twice and report the second run. The writes create real fictional faults.

## 2. Lighthouse
From the `web` folder, with the web deployed (needs Chrome installed):

    $env:WEB_URL="https://<your-web>"; $env:API_URL="https://genie-t2s5.onrender.com/api/v1"
    npx @lhci/cli@0.14.0 autorun --config=lighthouse/lighthouserc.cjs

(macOS/Linux: `WEB_URL=... API_URL=... npx @lhci/cli@0.14.0 autorun --config=lighthouse/lighthouserc.cjs`.)
Reports land in `web/lighthouse/results/`. Or run the manual **Lighthouse** workflow on GitHub.
