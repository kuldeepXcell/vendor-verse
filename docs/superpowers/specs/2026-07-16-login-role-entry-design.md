# Login & Role Entry — Design

Date: 2026-07-16  
Product: Nexus — Vendor Portal (vendor-verse)

## Goal

Add a professional login entry screen that matches the existing Slate & Steel theme. Users sign in with email and password, then choose Admin or Vendor on the same screen. Each choice routes into the corresponding panel.

## Decisions (approved)

- Real login form: email + password required
- Role chosen on the same screen via two submit buttons
- Login lives at `/` (entry)
- Admin dashboard moves from `/` to `/dashboard`
- Vendor home stays at `/vendor`
- Layout: split-panel (Approach 1)
- Auth: client-side mock for now (no backend API)

## Routing

| Route | Purpose |
|-------|---------|
| `/` | Login split-panel. If session exists, redirect to role home |
| `/dashboard` | Admin Overview (current index content) |
| `/vendor` | Vendor home (unchanged) |

Soft session guard:

- Visiting `/dashboard` or `/vendor` without a session → redirect to `/`
- Visiting `/` with an existing session → redirect to `/dashboard` (admin) or `/vendor` (vendor)

## Auth behavior

1. User enters email and password
2. User clicks **Sign in as Admin** or **Sign in as Vendor**
3. Both buttons submit the same fields; the clicked button supplies `role: "admin" | "vendor"`
4. Demo acceptance rule: any non-empty email and password succeed
5. Persist `{ email, role }` in `sessionStorage` under a single key (e.g. `nexus.session`)
6. Redirect: admin → `/dashboard`, vendor → `/vendor`
7. Empty fields: show inline validation; do not navigate
8. No real password hashing, API, or token refresh in this scope

Sign-out is out of scope for this change unless already trivial to wire later from the shell.

## Layout & UI

### Desktop

- **Left (~42%):** Dark brand panel using existing sidebar / `--gradient-surface` tokens. Nexus mark (`N`), product name “Nexus”, subtitle “Vendor Portal”, one short line about procurement and vendor operations. Subtle radial highlight consistent with the vendor hero. No cards, badges, or floating stickers.
- **Right (~58%):** Light background. Centered form column (~380px max width):
  - Eyebrow: “Sign in”
  - Headline (Urbanist): “Welcome back”
  - Supporting line: short, product-specific
  - Email field (existing `Input`)
  - Password field (existing `Input`, `type="password"`)
  - Primary button: **Sign in as Admin**
  - Outline/secondary button: **Sign in as Vendor**
  - Helper under buttons: “Choose the workspace that matches your role.”

### Mobile

- Compact brand strip on top
- Form stacked below with the same fields and both buttons

### Theme

Reuse only existing tokens from `src/styles.css`:

- Palette: Slate & Steel (oklch primary/sidebar/background)
- Type: Urbanist (display), Epilogue (body)
- Components: existing `Button`, `Input`, `Label`
- Motion: light fade/slide of the form on load; honor `prefers-reduced-motion`

## Implementation shape

### Files (expected)

- `src/routes/index.tsx` — replace dashboard with login page
- `src/routes/dashboard.tsx` — move current admin Overview here
- `src/lib/auth-session.ts` (or similar) — get/set/clear session helpers
- Optional: `src/components/login-form.tsx` if the route file grows large
- Update any hard-coded links that pointed at `/` as “admin home” to `/dashboard` (e.g. AppShell nav “Dashboard”, 404 “Go home” may stay at `/` as entry)

### AppShell nav

- Dashboard nav item `to` changes from `/` to `/dashboard`
- Active-state logic updated accordingly

### Out of scope

- Real backend auth / SSO
- Role enforcement beyond soft client redirects
- Password reset, remember-me, MFA
- Redesigning admin or vendor panels beyond route move

## Success criteria

- `/` shows split-panel login in Nexus theme
- Valid submit as Admin lands on `/dashboard` with existing admin Overview
- Valid submit as Vendor lands on `/vendor`
- Empty credentials blocked with clear validation
- Session persists for the browser tab (`sessionStorage`) and restores redirect from `/`
- Visual language matches existing portal (no new palette or default Inter/purple look)
