# Changelog

All notable changes to Vendor Verse are recorded here.

This file starts at v1.0.0. The repository's git history before this release is two commits of
initial prototype work (`initialization`, then `add README, logo, and update form handling with zod
validation`) — pre-release development, not a sequence of releases, so there is nothing earlier to
reconstruct honestly.

## v1.0.0 — 2026-08-25

First public release. The application's features and UI are unchanged from the prototype; this
release makes it a licensable, documented, self-contained template.

### Added

- `LICENSE.md` — template licence: unlimited use in own and client projects, no resale or
  redistribution as a template, with third-party assets carved out explicitly.
- `README.md` — rewritten from 40 lines to a full guide: what it is and is not, requirements,
  quickstart, script table, folder map, personas, a four-move rebrand section with exact paths, the
  backend seam, and a third-party asset table.
- `docs/01-setup.md` … `docs/06-deploy.md` — six guides covering setup and troubleshooting, demo
  personas, branding, mock data, the backend boundary, and deployment.
- `.env.example` — documents that the template needs no environment variables to run, and the one
  optional build-time variable that exists.
- `.nvmrc` — pins Node 22.22.0, the version this release was verified on.
- `package.json` — `version`, `description`, `license`, and an `engines` field (`node >=22.12.0`,
  `pnpm >=10`).
- `pnpm typecheck` script (`tsc --noEmit`). Type checking previously had no entry point.
- `docs-internal/` — packaging standard, build script and admin-panel reference. Excluded from
  every deliverable archive.

### Changed

- **Renamed the application to "Vendor Verse"** across 19 files — page titles, the
  sidebar wordmark, the login panel, OpenGraph metadata, logo `alt` text and the copyright line —
  so the product name matches the repository, the licence and the package name.
- Session storage key is now `vendorverse.session`, matching the new name. A browser holding the
  old key is simply treated as signed out.
- Formatted the whole repository with the project's own Prettier config (`pnpm format`).
  Formatting only; no logic changed.
- `README.md`'s "nothing persists" claim now states the actual exception — the sign-in choice
  survives a reload via `sessionStorage` and a cookie, while all data edits do not.

### Fixed

- **`pnpm lint` no longer hangs.** ESLint was walking the 42 minified bundles under
  `.vercel/output/`, taking over five minutes. Added `.vercel`, `.nitro`, `.tanstack` and the
  generated `src/routeTree.gen.ts` to the flat config's `ignores`. Lint now completes in ~3 seconds.
- **`pnpm lint` now exits 0.** It previously reported 143 errors on a clean checkout — 142 Prettier
  violations plus one real `@typescript-eslint/no-explicit-any` in `dashboard.tsx`, where the `Kpi`
  component typed its `icon` prop as `any`; it is now `LucideIcon`.
- **`/sitemap.xml` emitted relative `<loc>` values**, which the sitemap protocol does not allow.
  The origin now comes from `VITE_SITE_URL`.
- **The dashboard contradicted itself.** The "Active vendors" tile hardcoded the sub-label
  "8 pending onboarding" while the Vendor Onboarding panel beside it derived 2 from the same data.
  The label is now derived from the same count.

### Removed

- **`public/logo.svg` and `public/logo-animated.svg`** — the prototype's mark was third-party
  artwork, sourced from an icon repository and identifiable as another company's logo. Removed and
  replaced with an original mark drawn from this template's own palette tokens. Everything in
  `public/` is now original work, licensed to you under `LICENSE.md`.
- **`public/favicon.ico`** — was a scaffold leftover of unverified provenance, and unrelated to the
  app's own logo. Rebuilt from the new mark at 16, 32 and 48 px.
- Real financial-institution names in the seed data — two named banks in the payment-method strings
  became the invented `Northlake •• 4821` and `Continental •• 9903`, so no real company appears
  anywhere in demo content.
- `AGENTS.md` and `docs/superpowers/specs/` moved to `docs-internal/`. Internal design records; they
  no longer ship, and `docs/` is now exclusively the six buyer guides.
