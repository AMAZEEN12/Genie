# Releases and rollback rehearsals (Genie)

Release rule (Stockwise release.md, reused under DM5): every production change is a merged PR plus a `Deploy` run approved in the GitHub `production` environment by someone who is **not the author** (Isaac Bassey, backup Blessing Nwafor).

## Deploy log
Approval gate: GitHub environment `production` has required reviewers (Blessing Nwafor and Isaac Bassey), set on 2026-10-31. **Before that date the environment had no required reviewer, so deploys 1-16 below ran without an approval step**; the rule above was not enforced by GitHub. From the next deploy, GitHub records who approved each run. (Check "Prevent self-review" is on: otherwise the author can approve their own deploy.)

| Date (Lagos) | Commit | Deploy run | Approved by | Smoke / SHA check | Notes |
|--------------|--------|------------|-------------|-------------------|-------|
| 2026-10-26 | runs #1-#7 | #1-#7 | n/a | failed or cancelled | Set-up runs while the pipeline was being fixed; no production release |
| 2026-10-26 | manual run | #8 | no approval gate yet | Render served the SHA (run green) | First green deploy |
| 2026-10-26 | 5ab1f6a (PR #10) | #9 | no approval gate yet | green | |
| 2026-10-27 | 14a4cb9 (PR #11) | #10 | no approval gate yet | green | |
| 2026-10-27 | e021cd9 (PR #12) | #11 | no approval gate yet | green | |
| 2026-10-28 | 4de0e94 (PR #13) | #12 | no approval gate yet | green | |
| 2026-10-29 | 8a9c8d4 (PR #14) | #13 | no approval gate yet | green | Includes migration V5 (estimate lines) |
| 2026-10-31 | da2a718 (PR #15) | #14 | no approval gate yet | green | Rule-removal evidence runner; docs and CI only |
| 2026-10-31 | f37b53c (PR #16) | #15 | no approval gate yet | green | Docs only |
| 2026-10-31 | 0c19458 (PR #17) | #16 | no approval gate yet | <fill in when the run finishes> | Docs only |

## Rollback commands
| What | Action |
|------|--------|
| Web (Vercel) | `vercel rollback <previous-deployment-url> --token $VERCEL_TOKEN`, or Promote the previous deployment in the dashboard |
| Service (Render) | Dashboard, `genie-api`, Deploys, previous deploy, Rollback |
| Database | run the matching `db/rollback/U<n>__*.sql` (undo scripts U1-U5 exist). The runner is `ng.tesa.genie.db.MigrationUndo <targetVersion>` (reads `DATABASE_JDBC_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`); the exact command line for the packaged jar has not been run yet, so it is still UNRESOLVED. Try it on a Neon staging branch, never on production first |
| Then | Revert the offending commit on `main`, log it above |

## Rehearsals
| Date | Environment | What was rolled back | Minutes taken | By |
|------|-------------|----------------------|---------------|----|
| 2026-10-31 | Production, Render `genie-api` | Rolled back from 0c19458 to f37b53c in the Render dashboard (Deploys > Rollback), then rolled forward to 0c19458 again | Rollback 1 min 43 s; roll-forward 1 min 21 s (about 3 min round trip) | Blessing Nwafor |
