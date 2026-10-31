# Execution: Genie, maintenance requests from fault to verified repair

The runbook for taking Genie from planning to the Monday 26 Oct MVP and the final submission on Tue 3 Nov 2026. Any human or agent can follow it. Progress, decisions and conventions are tracked in [WORKLOG.md](WORKLOG.md); log each completed step there. Product decisions are in [decisions.md](../decisions.md) (DM1-DM9). **Stockwise always takes priority** (DM9).

Change slug: `genie` · Last updated: 2026-10-23 · Current stage: Build (implementation not started) · SDLC path: short (DM1)

## Artifact chain
| Stage | Artifact | Status | Owner | Approved by / date |
|-------|----------|--------|-------|--------------------|
| Plan | [intent.md](intent.md) (with requirements R1-R14) | accepted | Victor Oyeleke (product owner) | confirmed by Nnaemeka Chukwuma for Victor Oyeleke, 2026-10-23 |
| Design | spec.md | **not required** (short path): requirements are in intent.md and the design summary is in plan.md | n/a | n/a |
| Build | [plan.md](plan.md) | accepted | Nnaemeka Chukwuma; high-risk sign-off Isaac Bassey | confirmed by Nnaemeka Chukwuma for Victor Oyeleke, 2026-10-23 |
| Build | [AGENTS.md](../AGENTS.md) | draft (commands planned, not yet verified) | first engineer to scaffold each part | n/a |
| Test | [test-plan.md](test-plan.md) | accepted | Blessing Nwafor | confirmed by Nnaemeka Chukwuma for Victor Oyeleke, 2026-10-23 |
| Deploy | release.md | **not required** (short path): Genie follows the Stockwise release rules reused under DM5 (production approval by Isaac Bassey with Blessing Nwafor as backup, CI gates, rollback per [deploy-plan.md](../deploy-plan.md)). REVIEW.md is copied from Stockwise at step 1 and adapted to Genie's rules | Isaac Bassey | n/a |
| Maintain | monitoring.md | **not required**: side project, and team monitoring is deferred (Stockwise DM31) | n/a | n/a |

## Supporting skills
| Skill | Location | Version / date | Stages it shaped |
|-------|----------|----------------|------------------|
| none | n/a | n/a | n/a |

Candidate skills to write: shared with Stockwise ("money in kobo", "guards in SQL", "decision logging"). Also **"status machine in SQL"**: every transition is one guarded UPDATE plus a history insert. Owner: Nnaemeka Chukwuma. Hard guardrail: yes, via a review pass and one test per transition.

## Setup before automation starts
- [ ] Public GitHub repository for Genie; branch protection, CODEOWNERS and the `production` environment, copied from Stockwise. (Blessing) *Partly done, 2026-10-31:* repository and CODEOWNERS exist (every path is owned by `@AMAZEEN12`, left as is on purpose); `production` environment has required reviewers Blessing Nwafor and Isaac Bassey. **Branch protection on `main` is not set.**
- [x] Neon project `genie`; Render service `genie-api` (Docker, auto-deploy off); Vercel project `genie-web`; Qocent projects tracking `deploy/genie-*`. (Blessing) *Done 2026-10-31 for Neon, Render (its own workspace) and Vercel. Qocent is not used: Stack V is the official stack (DM5, Qocent funding pending).*
- [x] CI jobs: test-guard, contract-log, frozen-migration and undo-script checks, gitleaks, JaCoCo gate. (Blessing) *Done 2026-10-31:* the JaCoCo gate is in `service/pom.xml` (rule packages `request` and `estimate` must each reach 80% line coverage; `./mvnw verify` fails otherwise). First CI run passed: `request` 348 of 387 lines (about 90%), `estimate` 87 of 94 (about 93%). The gate has not yet been seen failing (no deliberate-failure test was run).
- [x] README "Free tier terms checked" table (from deploy-plan §1, dated). (Blessing) *Done: `README.md`, dated 2026-10-23.*

## Steps
Each step: actor · input → action → output · gate before the next step.

**Friday 23 Oct**
1. **Repository and protections** · Blessing · plan.md → Genie repo, setup checklist, REVIEW.md copied and adapted → live repo · Gate: a test PR is blocked without review.
2. **Contract (MVP paths) + Prism mock** · Isaac + Nnaemeka · plan "Endpoints" → `contract/openapi.yaml` with the status enum → valid contract · Gate: `redocly lint` passes; two engineers named in the change log.
3. **Schema sketch** · Nnaemeka · plan "Data model" and the guards table → reviewed sketch · Gate: Isaac agrees.
4. **Walking skeleton deployed** · Blessing · deploy-plan → `/` and `/api/v1/health` live on Stack V (Stack Q in parallel) → two live addresses · Gate: smoke green; Isaac approves the production deploy.

**Saturday 24 Oct**
5. **Migrations V1-V4 + undo scripts** · Nnaemeka · data model → migrations, `MigrationRollbackIT` · Gate: CI green; Isaac approves.
6. **Assignment guard + start guard** · Nnaemeka · guards table → `AssignmentConcurrencyIT`, `StartWithoutApprovalIT` · Gate: CI green, looped 20 times locally; Isaac approves.
7. **Auth, roles and endpoints** · Isaac · contract → security, request, estimate and transition controllers, `AuthorizationIT` · Gate: CI green; wrong-role test seen failing with the check removed.

**Sunday 25 Oct**
8. **MVP-journey screens** · Victor (fallback Blessing at 12:00, DM9) · contract and mock → report, list, detail with actions, assign, estimate, approvals, complete, verify, five states → working screens · Gate: Playwright journey green against the mock.
9. **Seed subset + README + deploy** · Nnaemeka + Blessing · R13, R14 → seed with the awkward cases, demo credentials, labels · Gate: `SeedVerificationIT` subset green.
10. **Failing-test evidence** · Nnaemeka · `evidence/no-assignment-guard` → `concurrency-evidence.yml` logs (pass on `main`, fail on the branch) · Gate: both logs saved.
11. **Monday journey on the deployed site** · all · intent "Monday journey" → clean-browser run · Gate: Isaac approves the checkpoint release.

**Monday 26 Oct**
12. **Slides 6 and 7** · Victor presents · intent.md → problem, users and MVP; live demo · Gate: Goodnews review.

**After Monday (only when Stockwise is on track)**
13. Override review screen and filters polished (R7, R11) → 14. Full seed ≥ 30 (R13) → 15. Keyboard and phone pass (R12) → 16. DR-1 urgent override and DR-2 assignment guard → 17. Rule-removal log for every rule → 18. Shoulds (photos) only if there is time → 19. **Final submission, Tue 3 Nov** · Gate: Genie assessed as "meets" its MVP definition of done.

## Commands
```
build/test: cd service && ./mvnw verify
lint:       npx @redocly/cli lint contract/openapi.yaml ; cd web && npm run lint && npm run typecheck
web test:   cd web && npm test -- --run && npx playwright test
mock:       npx @stoplight/prism-cli mock contract/openapi.yaml
deploy:     merge to main → deploy.yml   # production requires Isaac Bassey (backup Blessing Nwafor)
evidence:   gh workflow run concurrency-evidence.yml
rollback:   as in deploy-plan.md §3-§4 (Vercel rollback, Render rollback, Qocent roll back, undo scripts)
```

## Parallel work
- **At the same time:** steps 1-4 on Friday; steps 8 and 9 on Sunday.
- **In order:** 2 → 7 · 5 → 6 → 10 · 7 → role tests · 8 needs 2 (the mock), not 7.
- **Across products:** if a person is needed on Stockwise and Genie at once, Stockwise wins (DM9).

## Human decision points
| Decision | Approver | Evidence they review |
|----------|----------|----------------------|
| Genie scope and artifacts | Victor Oyeleke | intent.md, plan.md |
| High-risk merges (guards, override, migrations) | Isaac Bassey | PR, concurrency test output |
| Production deploys | Isaac Bassey (backup Blessing Nwafor) | green CI, migration list |
| Fallback trigger at Sun 12:00 | Isaac Bassey with Victor Oyeleke | screen progress against step 8 |
| Drop Genie from Monday? | Isaac Bassey tells Goodnews **today** if needed | the team's honest progress estimate |
| Monday assessment | Goodnews | live demo |

## Automation roadmap
| Trigger | Starts | Automated now? |
|---------|--------|----------------|
| Push or PR | `ci.yml` | yes, after step 1 |
| Merge to `main` | `deploy.yml` (pauses for production approval) | yes, after step 4; the approval stays manual |
| Manual dispatch | concurrency evidence | manual by design |
| Monitoring | n/a | no (not required; team monitoring deferred) |

## Measurement
| Stage | Leading indicator | Lagging indicator |
|-------|-------------------|-------------------|
| Plan | intent accepted the same day | edits to intent after plan |
| Build | PRs merged at the first review | drift from plan.md |
| Test | first-pass CI success | regressions caught at the checkpoint |
| Deploy | time waiting at the production approval | failed deploys and time to restore |

## Unresolved questions
| Question | From artifact | Owner | Needed by step |
|----------|---------------|-------|----------------|
| Can both MVPs realistically be ready Monday? If not, tell Goodnews today | intent.md | Isaac Bassey | 1 (today) |
| Qocent funding (Stockwise PD5a): until settled, Stack V is official | intent.md, deploy-plan | Isaac Bassey + Goodnews | 4 |
| Separate Render workspace for Genie (Stockwise PD5c). **Resolved 2026-10-31: Genie has its own Render workspace** | intent.md | Blessing Nwafor | 4 |
| Spring Boot 4-compatible contract validator (follows the Stockwise answer) | test-plan.md | Isaac Bassey | 7 |

## Addendum 2026-10-29: MVP feedback (R15-R21)
Proposed by **Victor Oyeleke** (product owner) as MVP feedback; implemented by **Nnaemeka Chukwuma**. Added 2026-10-29 as an addendum to the accepted artifacts, at Nnaemeka's direction (DM17), instead of a separate change folder.

| # | Step | Actor | Gate |
|----|----|----|----|
| F1 | Review PR from `feat/mvp-feedback` | Victor Oyeleke (screens, R16-R21), Isaac Bassey (contract 0.2.0, V5 migration: high-risk path) | Code-owner approval; Isaac adds his half of the 0.2.0 line in `decisions.md` §3 |
| F2 | Merge to `main` | reviewer | CI green (guards, gitleaks, contract lint, service, web) |
| F3 | Deploy (`deploy.yml`: migrate V5 on Neon, Vercel, Render) | release manager (Isaac Bassey) | Smoke OK |
| F4 | Check live: refresh `/requests` (200, not 404); log in as `employee@genie.test` and open a priced request (no amounts); submit an itemised estimate as `technician@genie.test` and see the lines as `finance@genie.test`; home page on a phone (buttons right, hero centred, "i" in proportion) | Victor Oyeleke | All pass, noted in the WORKLOG |

Rollback: `./mvnw -Pundo -Dundo.target=4 exec:java` removes V5; Vercel and Render roll back to the previous deploy (release rules unchanged).
