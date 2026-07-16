# Dual-panel prototype — Design

Date: 2026-07-16  
Product: Nexus — Vendor Portal

## Goal

Make login role-aware end-to-end: Admin sees the admin panel; Vendor sees a vendor workspace. Shared dummy data powers a clickable prototype.

## Approach

Session-driven dual shell (approved): one app, two navs, route guards by role, shared demo dataset filtered for the vendor company.

## Roles

### Admin
- Home: `/dashboard`
- Nav: Dashboard, Vendors, Purchase Orders, Invoices, Documents, Payments, Messages, Settings
- Data: full org dummy set

### Vendor
- Home: `/vendor`
- Nav: Home, My POs, My Invoices, Documents, Payments, Messages, Profile
- Company: Aster Manufacturing (demo)
- Data: rows belonging to that vendor only

## Auth

- `AuthProvider` wraps the app; session from `sessionStorage` (`nexus.session`)
- Sign out clears session and navigates to `/`
- Guards: no session → `/`; wrong role → that role’s home
- AppShell role and user chip come from session (not hardcoded props)

## Prototype interactions

- Search/filter on list pages (client-side)
- Vendor can acknowledge an open PO (local state)
- Status pills and tables use shared demo data module

## Out of scope

- Real backend, SSO, permissions matrix beyond admin/vendor
- Full settings module redesign
