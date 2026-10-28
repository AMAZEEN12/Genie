# Releases and rollback rehearsals (Genie)

Release rule (Stockwise release.md, reused under DM5): every production change is a merged PR plus a `Deploy` run approved in the GitHub `production` environment by someone who is **not the author** (Isaac Bassey, backup Blessing Nwafor).

## Deploy log
| Date | Commit | Approved by | Migrations | Smoke / SHA check | Notes |
|------|--------|-------------|------------|-------------------|-------|
| 2026-10-27 | 14a4cb9 | | | UP at 14a4cb9 (worklog) | From worklog; confirm approver |
| | e021cd9 (PR #12 merge) | | | | TODO: approve and record |

## Rollback commands
| What | Action |
|------|--------|
| Web (Vercel) | `vercel rollback <previous-deployment-url> --token $VERCEL_TOKEN`, or Promote the previous deployment in the dashboard |
| Service (Render) | Dashboard, `genie-api`, Deploys, previous deploy, Rollback |
| Database | run the matching `db/rollback/U<n>__*.sql` (undo scripts U1-U4 exist). The exact runner command is still UNRESOLVED (Stockwise release.md) |
| Then | Revert the offending commit on `main`, log it above |

## Rehearsals
| Date | Environment | What was rolled back | Minutes taken | By |
|------|-------------|----------------------|---------------|----|
| | | | | |
