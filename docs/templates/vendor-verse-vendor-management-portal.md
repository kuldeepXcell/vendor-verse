# Vendor Verse - Vendor Management Portal

> **Slug** `vendor-verse-vendor-management-portal` · **Status** DRAFT · **Generated** 2026-08-25
> **Sources** — repo: `/home/kuldeep/Documents/Projects/vendor-verse` (local, private) · demo: none · screenshots: 18

## Details

**Title**
Vendor Verse - Vendor Management Portal

**Short description** *(124 chars)*
Vendor Verse is a two-sided vendor portal covering purchase orders, invoice approval, payment runs and compliance documents.

**Full description** *(474 chars — under 500)*
Vendor Verse is a vendor management portal for procurement teams with a recurring supplier base. Admins run onboarding, purchase orders, invoice approval, payment runs, documents and messaging from one workspace. Each vendor signs in to a scoped view of only their own orders, invoices, payments and files.

Role-aware routing switches navigation and data scope from a single sign-in, and every screen reads one React context, so wiring a real API is a single-module change.

## Classification

| Field | Value |
|---|---|
| Categories | Portals, Business Operations |
| Tech stack | React 19, TypeScript, TanStack Start, TanStack Router, Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Tags | Dashboard, Client-facing, Mobile-ready, Procurement |
| Industry | Manufacturing & Supply Chain |
| Business type | SMB / Mid-market |

`Procurement` is the only new tag; the other three reuse existing catalog tags.

## Links

| Field | Value |
|---|---|
| Demo URL | — |
| Repo URL | — |

Both blank on purpose: the README states the demo is not published yet, and the repo is private.

## Benefits

| # | Icon | Title | Body |
|---|---|---|---|
| 1 | layout-dashboard | Two Portals, One App | Admin procurement and vendor self-service ship together, not as two builds. |
| 2 | zap | Skip the UI Build | Sixteen finished screens replace weeks of layout, table and form component work. |
| 3 | palette | Rebrand in One File | Colours and fonts are tokens in a single stylesheet, so a restyle stays contained. |
| 4 | badge-check | Unlimited Client Work | The licence covers unlimited internal and client projects, with no attribution. |

## Features

| # | Title | Body |
|---|---|---|
| 1 | Vendor Onboarding Tracker | Invite vendors and follow KYC, contract and document steps against a progress bar. |
| 2 | Purchase Order Workflow | Raise POs, track acknowledgement and delivery status, and export the desk to CSV. |
| 3 | Invoice Approval Queue | Vendors submit invoices, admins approve or reject, and both sides see the status. |
| 4 | Payment Run Scheduling | Schedule, reschedule and mark payment runs processed, with vendor payment history. |
| 5 | Compliance Document Vault | Upload certificates and watch expiry dates from a document list and a dashboard panel. |

## FAQs

**1. How much of it can I customise?**
Everything. You get the full TypeScript source, and colours, fonts, logo and app name are four edits.

**2. What do I need to run it?**
Node 22.12 or newer and pnpm 10. It builds to a Nitro server that runs on Vercel or any Node host.

**3. Does it come with a database?**
No. Data is mock state in one React context, and that context is the single module you swap for real API calls.

**4. Can I use it for client projects?**
Yes. The licence allows unlimited internal and client projects. You may not resell it as a template.

**5. What is included for support?**
Six guides ship with the source: setup, roles, branding, mock data, backend wiring and deploy. Source + Setup adds a call.

## SEO

| Field | Value | Chars |
|---|---|---|
| Meta title | Vendor Verse - Vendor Management Portal Template | 48 |
| Meta description | Two-sided vendor management portal: admin procurement workspace plus vendor self-service for POs, invoices, payments and compliance docs. | 137 |
| OG title | Vendor Verse - Vendor Management Portal | 39 |
| OG description | Sixteen screens, two workspaces, one sign-in. Admins run POs, invoices and payment runs while vendors track their own orders and documents. | 139 |
| Twitter card | SUMMARY_LARGE_IMAGE | — |
| Canonical URL | — | — |

## Preview

| Field | Value |
|---|---|
| Preview URL | — (no public deploy yet) |
| Default device | DESKTOP |
| Allow proxy | false |

## CTA

| Field | Value |
|---|---|
| Primary label | Get a Quote |
| Primary URL | — (admin to point at the Customable quote route) |
| Secondary label | View Screenshots |
| Secondary URL | — (gallery is `template-assets/`, not yet hosted) |

## Pricing plans

**Complexity score** 9/18 — Standard (full product with auth and a real data layer)

| Dimension | Score | Evidence |
|---|---|---|
| Screens / routes | 2 | 16 screens across 20 route files (8 admin, 7 vendor, login) |
| Auth | 2 | Role-aware guards in `auth-guards.ts` split admin and vendor, but no credential check, no user records |
| Data layer | 1 | Mock literals in `demo-data.ts` held in React `useState`; nothing persists |
| Integrations | 1 | None. `.env.example` documents zero required variables |
| Depth | 2 | Dashboard chart, KPI tiles, CSV export on two screens, 13 store mutations |
| Polish | 1 | Responsive across three breakpoints; `.dark` tokens exist in `styles.css` but nothing applies the class, and the README states no accessibility audit |

**Rationale** The score lands at the bottom of the Standard band, and the price sits mid-band rather than at the floor: the frontend is broad and finished (two full workspaces, 16 screens, six written guides), and the licence lets an agency ship it to unlimited clients, which is what makes it worth more than a single-purpose tool. It does not reach the ceiling because there is no backend, no persistence and no real authentication, so a buyer still owns that work.

### Source Code · PAID
`$149 USD` · `ONE_TIME`
- Full TypeScript source and pnpm lockfile
- 16 screens across admin and vendor workspaces
- Six setup, branding and backend-wiring guides
- Perpetual licence for unlimited client projects

### Source + Setup · PREMIUM
`$249 USD` · `ONE_TIME`
- Full TypeScript source and pnpm lockfile
- Six setup, branding and backend-wiring guides
- Perpetual licence for unlimited client projects
- Rebrand applied to your colours, fonts and logo
- One hour handover call on the store boundary

## Evidence

- **Stack confirmed from** — `package.json` (React 19.2, TanStack Start 1.168, TanStack Router 1.170, TanStack Query 5.101, Tailwind CSS 4.2, Radix UI, React Hook Form 7.71, Zod 3.24, Vite 8, Nitro 3 beta), `components.json` (shadcn new-york, slate), `pnpm-lock.yaml`, `.nvmrc`, `vercel.json`, `.env.example`
- **Features derived from** — `src/routes/` (20 files), the `adminNav` and `vendorNav` arrays in `src/components/app-shell.tsx`, the 13 mutations on `DemoStoreValue` in `src/lib/demo-store.tsx`, `src/lib/auth-guards.ts`, `src/lib/download-csv.ts`, `src/routes/sitemap[.]xml.ts`
- **Demo verified** — no. The README says the demo is not published; no deploy URL exists in the repo, `vercel.json` or `.env.example`
- **Screenshots reviewed** — 18 PNGs in `template-assets/` (6 each at desktop, tablet, mobile). Opened `desktop/1-dashboard.png` and `desktop/6-vendor-home.png`: confirmed the admin overview (4 KPI tiles, 12-week payables chart, onboarding tracker, PO review table, expiring documents, top vendors) and the vendor home (onboarding progress, open POs, invoices, next payment, buyer contact)
- **Claims deliberately not made** — no analytics engine, no realtime, no payments processing, no i18n, no dark-mode toggle, no accessibility conformance. The README's "What it is not" section rules each of these out

## Open questions

- **Demo URL / preview URL** — blank. Nothing is deployed yet. A public deploy is the single highest-value gap: the listing cannot show a live preview without it.
- **Repo URL** — blank. Private local repo; leave blank unless a public mirror is published.
- **CTA URLs** — labels written, URLs blank. They depend on Customable's own quote and gallery routes.
- **Source + Setup deliverables** — the rebrand and the handover call are services the seller must commit to. Drop this plan or reword it if that is not on offer.
- **Business type** — set to `SMB / Mid-market` from the demo data's mid-size manufacturing vendors. `Agency` is defensible instead, given the licence targets client work. Seller's call.
- **Industry** — `Manufacturing & Supply Chain` reflects the seed vendors (metals, textiles, logistics, print). The app is industry-neutral, so a broader value is fine if the catalog prefers one.

## JSON payload

```json
{
  "title": "Vendor Verse - Vendor Management Portal",
  "shortDescription": "Vendor Verse is a two-sided vendor portal covering purchase orders, invoice approval, payment runs and compliance documents.",
  "description": "Vendor Verse is a vendor management portal for procurement teams with a recurring supplier base. Admins run onboarding, purchase orders, invoice approval, payment runs, documents and messaging from one workspace. Each vendor signs in to a scoped view of only their own orders, invoices, payments and files.\n\nRole-aware routing switches navigation and data scope from a single sign-in, and every screen reads one React context, so wiring a real API is a single-module change.",
  "techStack": ["React 19", "TypeScript", "TanStack Start", "TanStack Router", "Tailwind CSS", "shadcn/ui", "React Hook Form", "Zod"],
  "tagNames": ["Dashboard", "Client-facing", "Mobile-ready", "Procurement"],
  "categoryIds": [],
  "industry": "Manufacturing & Supply Chain",
  "businessType": "SMB / Mid-market",
  "demoUrl": "",
  "repoUrl": ""
}
```
