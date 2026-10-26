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

