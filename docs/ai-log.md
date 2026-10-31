# AI log (Genie)

Required by the brief: tools used, what was asked, what was accepted, what was rejected, and **at least one case where the output was checked and found wrong** (what it claimed, how it was checked, what was true, what was done instead). A log with no errors reads as a log with no checking.

Tools named in the repo history: Codex (DM10, DM11 entries), an AI coding agent used by Nnaemeka Chukwuma (worklog entries "agent for Nnaemeka Chukwuma"), an AI assistant used by Isaac Bassey (worklog 2026-10-27). **Each engineer: add your own rows, with your own words.** Entries below are drafted from `sdlc/WORKLOG.md`; confirm or correct each one with the person who actually did it before submission.

## Log
| Date | Who | Tool | Asked it to | Accepted | Rejected / changed |
|------|-----|------|-------------|----------|--------------------|
| 2026-10-25 | Nnaemeka | AI agent | Implement the backend: contract, migrations V1-V4 with undo scripts, SQL guards, endpoints, integration tests | Guarded-UPDATE design, Testcontainers tests | CONFIRM: see error 1 |
| 2026-10-25 | Nnaemeka | AI agent | Harden JWT and money parsing | Removed default JWT secret, fail-fast key check, strict Jackson number settings | A committed default JWT secret in `application.yml` was found at handover review and removed |
| 2026-10-26 | Nnaemeka | AI agent | Build the four MVP screens from the design images | Shell, report form, list, detail with modals | See error 3 |
| 2026-10-27 | Isaac | AI assistant | Review the API layer; add request-ID logging and timing-safe login | Request-ID in logs, dummy bcrypt check for unknown emails | CONFIRM with Isaac |
| 2026-10-31 | Blessing | Claude (Anthropic) | Read the Genie repo and list what was left for me to do in Delivery and evidence | The list: fill the rule-removal log, record green re-runs, add the concurrency link, my AI-log rows, the release log | Its first claim that the 2026-10-28 rule-removal evidence was valid (see Error 4) |
| 2026-10-31 | Blessing | Claude (Anthropic) | Find a way to run the rule-removal tests without Docker on my machine | A manual GitHub Actions workflow (`rule-removal.yml`) and `tools/rules-removal/run-on-ci.mjs` that run each removal on GitHub's runners, re-run the test after restoring, and mark Docker/start-up errors INVALID; the same fix in `run-rule-removal.ps1` | Its suggestion to run the workflow with `gh workflow run --ref` before merging: GitHub only lists workflows on `main`, so a `pull_request` trigger limited to the workflow's own files was added instead |
| 2026-10-31 | Blessing | Claude (Anthropic) | Write the new text of `docs/rule-removal-log.md` from the CI run's `entries.md` | Output blocks, failing method names and green re-runs pasted from the run's artifact; the discarded first run is described in the log | Wording I changed myself. |

## Cases where the output was wrong (checked, found wrong)
Drafted from the worklog. **Verify each against the commit and fill the "how I checked" field honestly.**

### Error 1: wrong Jackson import (commit 3b849e8)
- Claimed / produced: `RequestSummaryResponse.java` and `RequestDetailResponse.java` imported `tools.jackson.annotation.JsonInclude`.
- How it was checked: `./mvnw clean test-compile` failed on `feat/home-and-login` (PR #8).
- What was actually true: Jackson 3 moved most packages to `tools.jackson`, but the annotations package is still `com.fasterxml.jackson.annotation`.
- What was done instead: imports corrected, `NotFoundException` import added, compile green. CONFIRM the exact error message from the CI log.

### Error 2: per-hook `retry` overrode the shared query policy (2026-10-25)
- Claimed / produced: scaffold hook with its own `retry` setting.
- How it was checked: a Vitest test failed (worklog: "one real defect found by the tests").
- What was actually true: a per-hook option overrides the shared TanStack Query policy.
- What was done instead: removed it; rule added to `AGENTS.md` "Mistakes to avoid".

### Error 3: mock server's placeholder values leaked into the app (2026-10-27)
- Claimed / produced: `createRequestApi` spread the Prism response, so new faults got `override: true`.
- How it was checked: manual run showed a newly reported fault with the urgent-override flag; traced to Prism returning synthetic example values.
- What was actually true: Prism examples are not real service data. The live service never returns that.
- What was done instead: `override: false` set explicitly, localStorage sanitised, unit test added. **Open issue:** the same placeholder-detection approach still exists in `web/src/api/requests.ts` (empty live list returns hardcoded seed requests). Decide with Victor whether to remove it before the demo.

### Error 4: the first rule-removal evidence was reported as valid but was not (2026-10-28, found 2026-10-31)
- Claimed / produced: the PowerShell runner reported all ten runs as "FAILS AS EXPECTED (valid evidence)", the log's summary table said every rule "fails without the protection", and Claude repeated that in its first answer without opening the logs.
- How it was checked: I ran `Select-String` on the ten `*-FAILS.log` files. Every failure was `Errors: N` with `ExceptionInInitializerError` / `NoClassDefFound`, and the log said `Could not find a valid Docker environment`.
- What was actually true: Docker Desktop was not running, so the test classes crashed at start-up and no test body ran. The runner's check looked for "Cannot connect to the Docker", which is not the message Testcontainers writes.
- What was done instead: the run was discarded and the log says so. The runner now treats Docker and start-up errors as INVALID, and all ten rules were re-run on GitHub Actions (run 41175833281) with real assertion failures.

### Error 5: the removal for rule 8 (R7 override) left two protections in place (found 2026-10-31)
- Claimed / produced: `rules.json` described rule 8 as removing the R7 protection, and the entry said the removal was complete.
- How it was checked: the CI summary showed `STILL PASSES` for `OverrideIT` in the first run, with `Tests run: 3, Failures: 0`.
- What was actually true: R7 is also enforced by two checks in `RequestWorkflowService` (the URGENT priority check and the finance-review-before-close check). The removal only touched the repository query and the two database constraints.
- What was done instead: both checks were added to the removal, and the second CI run showed `OverrideIT` failing (`expected: 409 but was: 200`) and passing again after restoring.
