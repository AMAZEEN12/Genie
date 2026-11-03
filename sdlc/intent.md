# Intent: Genie, maintenance requests from fault to verified repair

Author: Nnaemeka Chukwuma (logger, Team 3) · Product owner: Victor Oyeleke (DM3) · Status: accepted
Created: 2026-10-23 · Accepted: 2026-10-23 for Victor Oyeleke (product owner), confirmed by Nnaemeka Chukwuma
Source document: `Tesa cohort 6 software engineering capstone project.pdf`, product 7 "Genie" (pp. 19-20) and "Side project standard" (p. 14) · Entry route: idea (side-project proposal by Victor Oyeleke, tightened by the facilitators)
Source of truth: repository (Genie's own, DM2)
Supporting skills: none
SDLC path: **short** (DM1). This file also holds the numbered requirements that a spec.md would otherwise hold.

## Problem
From the brief: when equipment fails in an office, the fault is usually reported by WhatsApp or a phone call. Afterwards nobody can say whether the repair was recorded and assigned, how long it took, what it cost, whether there is evidence it was done, and who confirmed it.

## Proposed outcome
One record per repair, from report to verified completion, showing who did what, when and for how much. Genie records and routes work. It makes no payments and does no accounting.

## Affected users and systems
- Users: employee (reports and follows a fault) · operations manager (prioritises, assigns, verifies, may override for urgent faults) · technician (estimates, updates progress, completes) · finance (approves or rejects estimates, reviews overrides and actual costs).
- Systems (new): Genie web interface, Genie HTTP service, Genie Neon Postgres project, GitHub Actions. Separate repository; hosting per DM5.

## Status sequence
`REPORTED → ASSIGNED → ESTIMATE_SUBMITTED → ESTIMATE_APPROVED → IN_PROGRESS → COMPLETED → VERIFIED_CLOSED`
- An estimate rejection moves `ESTIMATE_SUBMITTED → ASSIGNED`.
- **Urgent override** (DM6): for `priority = URGENT`, a manager may move `ASSIGNED` or `ESTIMATE_SUBMITTED → IN_PROGRESS` with `override = true` and a reason.
- The sequence is documented in the OpenAPI file and enforced in the service and database (allowed transitions only).

## Requirements (MVP for Monday 26 Oct unless marked)
| ID | Requirement | Acceptance criterion |
|----|----|----|
| R1 | **Roles** employee, manager, technician, finance, enforced in the service | A test calls the service directly with the wrong role (an employee assigning) and gets 403, and that test fails when the check is removed |
| R2 | **Report a fault:** title, description, building, location, equipment, category, priority (LOW / MEDIUM / HIGH / URGENT), date reported. Photos are a Should | Created request shows `REPORTED`. Missing required fields return 400 |
| R3 | **Creating twice records once:** `Idempotency-Key` on `POST /requests` | The same key twice gives one request, both calls return the same ID |
| R4 | **Assign** a technician and a deadline (manager only). **Two managers assigning at once: one wins, the other gets a clear refusal.** Implemented as a conditional update (`WHERE status='REPORTED' AND version=:v`). **The protected rule for Monday** | Concurrency test: two parallel assignments give one 200 and one 409 `ALREADY_ASSIGNED`, exactly one assignment stored. The test **fails** when the guard is removed |
| R5 | **Estimate in kobo** by the assigned technician. Finance approves or rejects. **Finance can't approve its own submission** (`approved_by <> submitted_by`, database CHECK). Rejection returns the request to `ASSIGNED` | Integer kobo only (a float gives 400). Self-approval is refused even when calling the service directly |
| R6 | **Work can't start without an approved estimate**, except for the R7 override | Calling `POST …/start` directly on an unapproved, non-urgent request returns 409. The guard is in the conditional update |
| R7 | **Urgent override** (DM6): manager-only, URGENT-only, reason required. Sets `override = true`. Finance must review it (`ACCEPTED` or `FLAGGED`) before the request can close | A non-urgent override returns 409. Closing with an unreviewed override returns 409. Overrides can be filtered and counted per manager |
| R8 | **Progress and completion:** the technician updates progress and submits completion (work done, actual cost in kobo, completion date). A job can't close without completion details | `VERIFIED_CLOSED` without completion data is impossible (database CHECK) |
| R9 | **Verify and close** (manager). **A technician can't verify their own job** (`verified_by <> technician_id`) | Self-verification is refused |
| R10 | **History:** every status change is appended with who and when, never edited | Append-only table (UPDATE and DELETE blocked by a trigger). The history view shows every step |
| R11 | **Search and filter** by status, category, priority and assigned technician (plus "override") | Filters combine and can be cleared |
| R12 | **Five screen states** on the MVP journey, keyboard operable with visible focus, phone layout | Checklist plus a Playwright journey at 360 px |
| R13 | **Seed:** ≥ 30 requests across every status, including a rejected estimate, an actual cost above the estimate, and a job in the urgent override state (brief) | Seed verification test |
| R14 | **README:** demo credentials (one per role), simulated features labelled, AI-log entry | Clean-browser checklist |

**Monday journey (brief):** an employee reports a fault, the manager assigns it, the technician submits an estimate, finance approves it, the technician completes it, and the manager verifies it, all on the deployed service. Two managers assigning at once produce one assignment, with a test that fails when the protection is removed. A job can't start without an approved estimate, checked by calling the service directly.

## Constraints
- Side-project standard (brief p. 14): two live addresses via GitHub Actions with tests and type-checking blocking the deploy. An OpenAPI document for the MVP paths (a mock is optional). Auth and roles in the service with a wrong-role test. One database-protected rule with a concurrent test. Five states, keyboard, phone. Seed with awkward cases. README. AI-log entry. **Two decision records**, each with a rejected alternative, a named cost and a reversal observation.
- Not required for Genie: full load test, screen-reader report, Core Web Vitals targets, five-record decision set, walkthrough video.
- Money in integer kobo. Free tiers only. Fictional data only.
- Time split: about one third of team time. If both MVPs can't be finished, Stockwise is protected and Goodnews is told **on Friday 23 Oct**.

## Out of scope
Payments and accounting. Email via Resend, downloadable reports and cost analytics (Phase 2). Photo uploads via Cloudinary, before/after photos and receipts (Should, after Monday if time allows).

## Success criteria
- S1. The Monday journey runs end to end on the deployed Genie service from a clean browser.
- S2. The R4 concurrency test passes and is shown failing with the guard removed.
- S3. The R6 direct-call test passes (no start without an approved estimate).
- S4. The R1 wrong-role test passes.
- S5. Both tiers deploy through GitHub Actions. The README has credentials, simulated features are labelled, and the seed meets R13.
- S6 (final). Two decision records written: DR-1 urgent override (DM6) and DR-2 assignment protection (R4). Genie reported as "meets" its MVP definition of done.

## Open questions
- [ ] Can the team realistically finish Genie's MVP by Monday alongside Stockwise? If not, Isaac Bassey tells Goodnews **today (Fri 23 Oct)**. (owner: Isaac Bassey) · UNRESOLVED
- [ ] Is Qocent funded (Stockwise PD5a)? Until it is, Genie's official address is Vercel + Render + Neon. (owner: Isaac Bassey + Goodnews) · UNRESOLVED
- [x] Render free hours: a separate Render workspace for Genie (Stockwise PD5c)? (owner: Blessing Nwafor) · RESOLVED 2026-10-31: yes, Genie has its own Render workspace

## Measurement
- Leading: time from the first conversation to an accepted intent.md (git timestamps).
- Lagging: whether this intent is accepted into planning, and how many edits it gets after plan.md is first committed.

## Addendum 2026-10-29: MVP feedback (R15-R21)
Proposed by **Victor Oyeleke** (product owner) as MVP feedback; implemented by **Nnaemeka Chukwuma**. Added 2026-10-29 as an addendum to the accepted artifacts, at Nnaemeka's direction (DM17), instead of a separate change folder.

| ID | Requirement | Acceptance criteria |
|----|----|----|
| R15 | **Employees see nothing about billing** (feedback item 1). | An EMPLOYEE's request responses carry no estimates, no actual cost, no finance review of an override and no notes written by others; the screens show no amounts, no cost cards and neutral status wording ("Awaiting approval", "Approved for repair"). The service enforces it, not only the screen (DM19). |
| R16 | **Navbar on small screens:** Login and Get started are right-aligned (item 2). | The home page header is right-aligned at every width. |
| R17 | **Logo:** the "i" scales with the rest of the wordmark (item 3). | The "i" is sized in `em`, so it shrinks with the text on phones instead of staying 124 px tall. |
| R18 | **Hero on small screens:** the heading, text and "Report or manage a fault" button are centred (item 4). | Centred below the `sm` breakpoint, left-aligned from `sm` up. |
| R19 | **Refreshing any page works** for every role (item 5). | `/requests`, `/requests/{id}`, `/my-jobs`, `/approvals` and `/requests/new` load on refresh instead of Vercel's 404. |
| R20 | **Cost breakdown on estimates** (item 6). | The technician enters 1-20 lines (Labour, Materials or Other, a description, an amount); the total is their sum; Finance sees the lines before deciding. The service and the database both refuse a total that doesn't match (DM18). |
| R21 | **Finance's Role Actions box is never blank** (reported by Nnaemeka Chukwuma while testing locally). | For every status, with or without an override, Finance sees an action or "No finance action pending". |

**Out of scope:** editing an estimate after submission; letting employees see costs on request; changing the seed's existing estimates (they have no lines and stay valid).

## Addendum 2026-11-01: Receipt Uploads with Cloudinary (R22-R30)
Proposed by **Victor Oyeleke** and the specification `Receipt Uploads with Cloudinary: Role-Based Backend Summary`; implemented and signed by **Nnaemeka Chukwuma** (Data and rules owner, implementer). Added 2026-11-01 as an addendum to the accepted artifacts (DM20-DM21).

| ID | Requirement | Acceptance criteria |
|----|----|----|
| R22 | **Private Cloudinary Receipt Uploads** (Technician, Manager, Finance). | Multipart upload via `/api/v1/receipts` capped at 10MB. Enforces magic byte checks (accepts JPEG, PNG, WebP, PDF only; renames like `.exe` return 400). Re-encodes images on upload to strip location and device metadata. Uploads to Cloudinary as `type: authenticated`, `resource_type: auto` into a server-controlled folder (`genie/receipts/<orgId>`). Returns application receipt ID only; Cloudinary public ID and upload URL never reach browser. |
| R23 | **Access-Controlled Streaming** via `/api/v1/receipts/{id}/file`. | After role and tenant access checks, backend generates a signed Cloudinary URL and streams the file back through the service. Sets `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`. Browser never sees a Cloudinary URL. |
| R24 | **Tenant and Role Isolation**. | Single access check on every receipt route: same organisation first, then role and relationship. Denied requests return 404 instead of 403 (Technician viewing another technician's receipt returns 404; Manager viewing receipt outside team returns 404; Finance viewing receipt from another organisation returns 404). |
| R25 | **Manager Decision Protection**. | Manager approves or rejects direct reports' receipts only (`PUT/POST /receipts/{id}/decision`). Self-approval is rejected with 403. Non-managers calling decision get 403. Transitions `submitted` -> `approved` or `rejected`. Invalid transitions return 409. |
| R26 | **Finance Reimbursement Guard**. | Finance marks approved receipts as reimbursed (`PUT/POST /receipts/{id}/reimburse`). Reimbursing a receipt that is not approved returns 409. Non-finance calling reimburse returns 403. |
| R27 | **Deletion Policy**. | Uploader can delete own receipt while still `submitted` (`DELETE /receipts/{id}`). Uploader deleting an approved receipt gets 403. Finance can delete any receipt in the organisation at any time. File is deleted from Cloudinary (invalidating cache) and removed from database. |
| R28 | **Upload Rate Limiting**. | Uploads are rate limited per user and per IP (10 uploads/minute). Exceeding rate limit returns 429 Too Many Requests (`RATE_LIMIT_EXCEEDED`). |
| R29 | **Audit Trail Logging**. | State transitions and data access (`UPLOAD`, `VIEW`, `DECISION`, `REIMBURSE`, `DELETE`) are logged to `receipt_audit_log` with timestamp, user ID, org ID, and action details. |
| R30 | **Information Leak Prevention**. | API responses and RFC 9457 Problem error bodies never return Cloudinary errors, stack traces, cloud name, API key, API secret, or Cloudinary URLs. |

**Out of scope for backend receipt phase:** Video uploads, client-side direct uploads to Cloudinary (forbidden by design), batch exports.

## Addendum 2026-11-03: Receipt Rendering Resilience & Defensive Format Derivation (R31-R33)
Reported via production incident on `genie-sigma-two.vercel.app/receipts` (`TypeError: Cannot read properties of undefined (reading 'toLowerCase')` at `Array.map`); implemented and verified by **Nnaemeka Chukwuma**.

| ID | Requirement | Acceptance criteria |
|----|----|----|
| R31 | **Defensive Format Derivation (Frontend)**. | Receipt rendering must never assume `receipt.format` is present or non-null. The UI must safely derive format and PDF status using `receipt.format || receipt.originalName?.split('.').pop() || 'file'`, with optional chaining across all string methods (`toLowerCase()`, `slice()`). Searching by name, ID, or uploader must never throw on missing fields. |
| R32 | **Explicit Backend Format & ResourceType Exposure**. | `ReceiptResponse` in `ng.tesa.genie.receipt` and the OpenAPI `Receipt` schema must expose `format` and `resourceType` explicitly from `Receipt.java`, ensuring consumers receive authoritative file metadata. |
| R33 | **Route Error Boundary**. | The `/receipts` route (and root `AppLayout`) must configure an `ErrorBoundary` (`ErrorPage.tsx`) so that any unexpected runtime error displays a branded, accessible recovery state ("Reload page" / "Back to home") rather than an unstyled runtime crash screen. |

## Addendum 2026-11-03: Receipt Storage Persistence & Preview Resilience (R34-R38)
Reported via production incident on `genie-sigma-two.vercel.app/receipts` ("after the receipt has been uploaded it cant be view or downloaded"); diagnosed, implemented, and verified by **Nnaemeka Chukwuma**.

| ID | Requirement | Acceptance criteria |
|----|----|----|
| R34 | **Persistent Database Storage Fallback (V7)**. | Uploaded receipt file binaries must be stored persistently in PostgreSQL via dedicated `receipt_file` table (Flyway V7 migration with U7 undo) keyed to `receipt(id)` with `ON DELETE CASCADE`. When streaming `/receipts/{id}/file`, if Cloudinary is not configured or fails, the service streams the binary from PostgreSQL, ensuring receipts persist across container restarts, Render sleep cycles, and redeployments. |
| R35 | **Flexible Cloudinary Configuration (`CLOUDINARY_URL`)**. | Backend Cloudinary initialization in `AppProperties` and `DefaultCloudinaryStorageService` must support standard `CLOUDINARY_URL` (`cloudinary://<api_key>:<api_secret>@<cloud_name>`) environment configuration as well as discrete properties (`cloud-name`, `api-key`, `api-secret`). |
| R36 | **Frontend Streaming Error Transparency**. | `downloadReceiptBlob` in `web/src/api/receipts.ts` must not swallow 404 or backend API errors into a fake SVG. If a backend call fails, it must propagate the `ApiError` to the caller so the UI can accurately present the error to the user. |
| R37 | **Resilient Receipt View & Error Handling**. | In `ReceiptViewModal.tsx`, `<img ... />` tags must implement `onError` fallback handlers so corrupt or invalid image data triggers the error UI instead of displaying a broken image icon. The "Save File" button must only be active when a valid file blob is loaded without stream errors. Offline mock previews must render valid SVG XML (`&amp;`). |
| R38 | **Orphaned Receipt Cleanup Recovery**. | When a receipt's binary file cannot be found (404), the viewer modal must display a clear message explaining that the file was cleared prior to persistent storage enablement, and provide an inline "Delete & Re-upload" action for permitted users (`canDelete`). |
