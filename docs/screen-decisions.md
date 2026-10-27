# Screen Decisions: Genie Frontend

This document records all architectural, UX, token, and contract decisions made while implementing the Genie web application screens from `c:\Users\CHUKWUMA\Downloads\screen\screen`.

Logged by: **Nnaemeka Chukwuma** (`<nnaemeka.chukwuma@univaciti.com>`) for Product Owner **Victor Oyeleke**.

---

## 1. App Shell & Role Navigation (`feat/app-shell-navigation`)

- **Screen / Artifact Source:**
  - `GENIE appshell/Desktop sidebar by role.png`
  - `GENIE appshell/Mobile top bar (closed).png`
  - `GENIE appshell/Mobile drawer (open).png`
  - `GENIE appshell/Mobile drawer · [Role].png`
- **Decisions Made:**
  1. **Dual Shell Layout:**
     - Landing page (`/`) renders in a full-screen hero layout without the app sidebar.
     - Authenticated application routes render inside a 240px desktop sidebar layout (`md:w-60`) or responsive mobile top bar with slide-out drawer on viewports < 768px.
  2. **Role-Based Navigation Items:**
     - `EMPLOYEE`: "Report a fault" (`/requests/new`), "My requests" (`/requests`).
     - `MANAGER`: "All requests" (`/requests`), "Report a fault" (`/requests/new`).
     - `TECHNICIAN`: "My jobs" (`/my-jobs`), "All requests" (`/requests`).
     - `FINANCE`: "Approvals" (`/approvals`), "All requests" (`/requests`).
  3. **User Profile Section:**
     - Displays avatar initial circle with accent border, user display name, role badge pill, and explicit "Log out" button.
  4. **Mobile Native Experience:**
     - Top bar (60px) with `GenieLogo` and hamburger toggle button (`aria-expanded`, `aria-label`).
     - Slide-out drawer with backdrop blur, click-to-dismiss, Escape key dismissal, and `overscroll-behavior: contain`.
  5. **Contracts Used:**
     - Existing: `GET /me` (retrieves `User` object: `id`, `displayName`, `email`, `role`).
     - Stored token persistence: `genie_token` in `localStorage`.
- **Deviations from Design:** None. All design tokens (`--bg: #0D0D0D`, `--surface: #1A1A1A`, `--line: rgba(255,255,255,0.14)`, `--accent: #E1EE04`, rounded `10px` controls) strictly matched.
- **Verification:** 9 Vitest unit tests in `AppLayout.test.tsx` verifying all 4 roles, mobile drawer toggle, escape dismissal, logout, and protected route fallback.

---

## 2. Fault Reporting Screen (`feat/report-fault-screen`)

- **Screen / Artifact Source:**
  - `GENIE report a fault/Report a fault · 1440.png`
  - `GENIE report a fault/Report a fault · 360.png`
  - `GENIE report a fault/States.png`
- **Decisions Made:**
  1. **Form Structure & Fields:**
     - Title, Category, Priority pills, Building, Location, Equipment, Description.
     - Priority pill radio buttons (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) with dedicated visual focus, aria semantics (`role="radiogroup"`), and high-contrast highlight for URGENT (`#FF6B5E`).
  2. **API & Idempotency:**
     - Mutation calls `POST /requests` with standard UUID `Idempotency-Key` and `X-Request-Id` headers.
     - On success: invalidates `['requests']` TanStack Query cache and navigates directly to the created request detail (`/requests/${newRequest.id}`).
  3. **Error Handling & Validation:**
     - RFC 9457 Problem details mapped to inline alert banner above the form with error details.
     - Submit button displays loading spinner and disables while mutation is pending to prevent accidental double-submits.
- **Contracts Used:**
  - Existing: `POST /requests` (`CreateRequest` schema).
- **Verification:** 4 Vitest unit tests in `ReportFaultPage.test.tsx` verifying form render, priority pill toggle, successful submission with navigation, and API error alerts.

---

## 3. Request List & Filter Views (`feat/request-list-screen`)

- **Screen / Artifact Source:**
  - `GENIE request list/All requests · 1440.png`
  - `GENIE request list/All requests · 360.png`
  - `Genie - my request/My requests · 1440.png`
  - `Genie - my request/My requests · 360.png`
  - `GENIE request list/States.png`
- **Decisions Made:**
  1. **Dual Responsive Representation:**
     - Desktop view (`md:block`): Semantic `<table>` wrapped in `<div role="region" aria-label="Maintenance requests directory" tabIndex={0} className="overflow-x-auto">` with sticky header per `modern-web-guidance` responsive-table specifications.
     - Mobile view (`md:hidden`): Responsive card stack displaying Reference ID, StatusBadge, PriorityBadge with urgent override chip, Equipment tag, Location, Technician, and reported date.
  2. **Role Presets:**
     - `/requests`: All requests (or Employee's own requests if Employee role).
     - `/my-jobs`: Technician assigned requests (filters by `technicianId`).
     - `/approvals`: Finance requests awaiting decision (filters by `status=ESTIMATE_SUBMITTED`).
  3. **Multi-Faceted Filtering:**
     - Horizontal scrolling status pills (`ALL`, `REPORTED`, `ASSIGNED`, `ESTIMATE_SUBMITTED`, `ESTIMATE_APPROVED`, `IN_PROGRESS`, `COMPLETED`, `VERIFIED_CLOSED`).
     - Category dropdown, Priority dropdown, and "Urgent override only" toggle.
     - "Clear filters" action appears dynamically when any filter is active.
  4. **Reusable Badges:**
     - `StatusBadge`: colored status pill with indicator dot matching design token scheme.
     - `PriorityBadge`: priority badge with direction/hazard glyphs and distinct "OVERRIDE" badge when flagged.
- **Contracts Used:**
  - Existing: `GET /requests` with query parameters (`status`, `category`, `priority`, `technicianId`, `override`).
- **Verification:** 7 Vitest unit tests in `RequestListPage.test.tsx` testing table render, status pill filtering, override toggle, filter reset, role preset titles, and empty states.

---

## 4. Request Details, Action Panels & History Timeline (`feat/request-detail-screen`)

- **Screen / Artifact Source:**
  - `GENIE request details/Manager · Reported · 1440.png` & `360.png`
  - `GENIE request details/Technician · In progress · 1440.png` & `360.png`
  - `GENIE request details/Manager · Completed · 1440.png` & `360.png`
  - `GENIE request details/Role actions.png`
  - `GENIE request details/States.png`
- **Decisions Made:**
  1. **Strict Role-Action Visibility Rule:**
     - Only actions permitted for the current authenticated role and status are displayed.
     - When no action is permitted for the authenticated role, a calm indicator (`👤 Waiting for...`) is shown; non-actionable or disabled buttons are avoided.
     - **Manager**:
       - `REPORTED`: "Assign technician" modal (`PUT /requests/{id}/assignment`).
       - `COMPLETED`: "Verify & close repair" transition (`POST /requests/{id}/transitions` with `VerifyTransitionRequest`).
     - **Technician**:
       - `ASSIGNED`: "Submit repair estimate" modal (`POST /requests/{id}/estimates`) with integer kobo arithmetic; plus optional "Start work (Urgent override)" for URGENT faults (`OverrideStartTransitionRequest`).
       - `ESTIMATE_APPROVED`: "Start repair work" transition (`StartTransitionRequest`).
       - `IN_PROGRESS`: "Complete repair work" modal with actual cost in kobo, work summary, and completed date (`CompleteTransitionRequest`).
     - **Finance**:
       - `ESTIMATE_SUBMITTED`: "Approve estimate" & "Reject estimate" with optional rejection note (`PUT /estimates/{id}/decision`).
       - If `override === true` and unreviewed: "Accept override" / "Flag override" (`PUT /requests/{id}/override-review`).
     - **Employee**:
       - Calm status update message showing that request is being processed.
  2. **Facts & Problem Card:**
     - Structured facts grid (Building, Location, Equipment, Category, Technician, Deadline, Reported by, Reported date).
     - Full description container with monospace/pre-wrap styling.
     - Urgent Override callout banner with reason note and finance audit badge.
  3. **Estimate & Completion Cards:**
     - Cost formatted to Nigerian Naira (`formatKoboToNaira`), avoiding floating-point rounding errors.
     - Decision status pill (Approved / Rejected / Awaiting Decision).
     - Completion record displaying actual cost, completion date, and manager verification checkmark.
  4. **Status History Audit Timeline:**
     - Vertical timeline with status transition dots, glowing active dot for latest transition, actor name/role, and transition notes.
  5. **Modals with Light-Dismiss:**
     - `AssignTechnicianModal`, `SubmitEstimateModal`, `CompleteWorkModal`, `UrgentOverrideModal`, and Rejection prompt modal all follow `modern-web-guidance` (`<dialog>` light dismiss / backdrop click dismissal, focus management, and validation).
- **Contracts Used:**
  - Existing: `GET /requests/{id}`, `GET /requests/{id}/history`, `PUT /requests/{id}/assignment`, `POST /requests/{id}/estimates`, `PUT /estimates/{id}/decision`, `POST /requests/{id}/transitions`, `PUT /requests/{id}/override-review`, `GET /users?role=TECHNICIAN`.
- **Verification:** 7 Vitest unit tests in `RequestDetailPage.test.tsx` verifying facts rendering, manager technician assignment modal, technician estimate submission modal, finance estimate decision buttons, technician work completion modal, manager verify & close button, and calm waiting indicator.



