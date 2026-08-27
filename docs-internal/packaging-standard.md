# Packaging record — v1.0.0

The audit-and-repair pass that turned the `vendor-verse` prototype into a licensable deliverable,
against the Customable Deliverable Packaging Standard. Packaged 2026-08-25.

---

## Resolved inputs

| Input | Value | How it was resolved |
| --- | --- | --- |
| `SLUG` | `vendor-verse` | Inferred. `package.json` `name` and the repository folder agree. |
| `VERSION` | `1.0.0` | **`package.json` had no `version` field at all** — `pnpm dev` printed `vendor-verse@ dev`. Unversioned, so `1.0.0` per the standard's rule. No `0.x` judgement call arose. |
| `PLANS` | single plan | Left blank. One deliverable, sort order 0, no plan tagging. |

---

## What ships

The source ZIP: 87 files, one top-level folder, 168 KB. Root manifests and configs, `docs/` (six
guides), `public/` (four assets), and all of `src/`. Full shape in
[`deliverables-admin.md`](deliverables-admin.md) §2.

## What does not ship, and why

| Excluded | Reason |
| --- | --- |
| `node_modules/` | 258 MB of reinstallable dependencies. `pnpm-lock.yaml` ships instead. |
| `.git/` | History, remote (`kuldeepXcell/vendor-verse` — a private org repo), and every superseded version of the removed third-party logo. |
| `.output/`, `.vercel/` | Build output, 2.9 MB + 2.6 MB. Also the direct cause of the lint hang (see Fixes). |
| `.idea/` | JetBrains project config, containing absolute `/home/kuldeep` paths. |
| `.vscode/`, `.claude/`, `.turbo/`, `.nitro/`, `.tanstack/`, `.vinxi/`, `dist/`, `build/`, `coverage/`, `.cache/`, `*.log`, `*.tsbuildinfo`, `.DS_Store`, `Thumbs.db`, `*.local` | Editor state, tool caches, build artefacts, OS junk. Filtered pre-emptively; most are not present. |
| `.env`, `.env.*` | Never ship an environment file. **`.env.example` is explicitly re-included ahead of these two rules** — rsync stops at the first matching rule, so the include has to come first or the example file is silently dropped. |
| `template-assets/` | 9 MB of listing imagery — marketing cards and 18 device screenshots. Belongs to the storefront, not the buyer. |
| `docs-internal/` | This folder. Internal records, the build script, the card generator. |
| `deliverables/` | The ZIPs themselves. Also gitignored. |

`package.sh` **asserts** the absence of `node_modules`, `.git`, `.output`, `.vercel`, `.idea`,
`.vscode`, `template-assets`, `docs-internal`, `deliverables` and `.env` from the staged copy, and
the presence of `.env.example` plus 15 other required files, before it zips anything. Filter
mistakes fail the build rather than shipping.

---

## Code changes, and the justification for each under Rule 4

Rule 4: docs, config and a design-token entry point may be added; a broken script or a hardcoded
value that blocks a rebrand or the quickstart may be fixed. Features may not be refactored,
dependencies may not be upgraded, the UI may not be restyled.

| # | Change | Files | Justification |
| --- | --- | --- | --- |
| 1 | **Removed the third-party brand mark.** `public/logo.svg` carried `<!-- Uploaded to: SVG Repo, www.svgrepo.com -->` and `public/logo-animated.svg` was titled *"Animated Nexus Mods logo"* — the orange `#da8e35` disc mark of a real company. `public/favicon.ico` was the gradient-heart icon from a Lovable scaffold, unrelated to the logo and of unverified provenance. Replaced all three with an original mark. | `public/logo.svg`, `public/logo-animated.svg`, `public/favicon.ico`, `template-assets/cards/logo.svg`, `logo-1024.png` | **Rule 3.** Shipping another company's trademark as the template's own brand is not shippable at any price. Approved by the owner before the change. |
| 2 | **Renamed the app "Nexus" → "Vendor Verse"** across 19 files: 17 route `head()` titles, the sidebar wordmark, the login panel (×2), logo `alt` text (×3), `author` and `og:title` metadata, and the copyright line. Session key `nexus.session` → `vendorverse.session`. | 19 files under `src/` | Compounds #1: the mark and the name were the *same* third-party identity, and "Nexus" reads as a real company. Also aligns the product name with the repo, the slug, `package.json` and the licence. Approved by the owner. |
| 3 | **Fixed the hanging lint script.** `eslint .` ran past a 300-second timeout because ESLint was walking the 42 minified bundles in `.vercel/output/static/assets/` — `.output` was ignored, `.vercel` was not. Added `.vercel`, `.nitro`, `.tanstack` and the generated `src/routeTree.gen.ts` to `ignores`. **300s+ → 3s.** | `eslint.config.js` | Explicitly sanctioned: "you may fix a broken script". The script was unusable for any buyer who had built the project once. |
| 4 | **Made lint exit 0.** It reported **143 errors** on a clean checkout: 142 `prettier/prettier` violations plus one real `@typescript-eslint/no-explicit-any`. Ran `pnpm format` (the repo's own Prettier config, formatting only), and typed `Kpi`'s `icon` prop as `LucideIcon` instead of `any`. | ~25 files (whitespace only) + `src/routes/dashboard.tsx` | Same clause. A template that fails its own advertised lint gate on first run is a broken script. The formatting pass changes no logic; the `any` fix is a type annotation, no runtime effect. Approved by the owner. |
| 5 | **Fixed the invalid sitemap.** `const BASE_URL = ""` produced relative `<loc>/vendors</loc>` values, which the sitemap protocol forbids. Now `(import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, "")`. | `src/routes/sitemap[.]xml.ts` line 7 | A hardcoded value that blocks deployment. Verified both ways: unset → relative (unchanged default behaviour, nothing breaks), set → absolute with the trailing slash trimmed. |
| 6 | **Fixed a dashboard tile that contradicted the data beside it.** The "Active vendors" tile hardcoded `sub: "8 pending onboarding"` while the panel next to it derived **2** from the same array. Now `` sub: `${onboardingCount} pending onboarding` ``. | `src/routes/dashboard.tsx` line 113 | Demo-copy correction on the flagship screen, using a variable that already existed two lines away. Approved by the owner. |
| 7 | **Removed real company names from seed data.** `ACH · Chase •• 4821` and `Wire · HSBC •• 9903` → `Northlake` and `Continental`. | `src/lib/demo-data.ts` (3), `src/routes/payments.tsx` (2), `vendor.profile.tsx` (1), `vendor.payments.tsx` (1) | Rule 3 / Phase 3 hygiene: no real company in demo content. Invented replacements. Approved by the owner. |
| 8 | **Manifest completeness.** Added `version`, `description`, `license: "SEE LICENSE IN LICENSE.md"`, `engines` (`node >=22.12.0`, `pnpm >=10`) and a `typecheck` script. | `package.json` | Config, not behaviour. There was previously no entry point for type checking at all, though `tsc --noEmit` passed. |
| 9 | **Moved internal records out of the deliverable.** `AGENTS.md` and `docs/superpowers/specs/` → `docs-internal/`. | 3 files moved | Vendor-internal. Frees `docs/` to be exactly the six buyer guides. Approved by the owner. |

Nothing else in `src/` was touched. No dependency version changed. No component was refactored. No
CSS rule was altered — the Prettier pass reflowed `src/styles.css` whitespace but changed no value.

## Files created

`LICENSE.md` · `CHANGELOG.md` · `.env.example` · `.nvmrc` · `README.md` (rewritten from 40 lines) ·
`docs/01-setup.md` … `docs/06-deploy.md` · `docs-internal/` (this file, `README.md`,
`deliverables-admin.md`, `package.sh`, `cards/`) · `deliverables/` added to `.gitignore`.

---

## What was deliberately not done

| | Why |
| --- | --- |
| **Did not delete the five unused shadcn primitives** (`sheet`, `skeleton`, `tooltip`, `toggle`, `separator`) **or `hooks/use-mobile.tsx`** | They are the standard shadcn kit a buyer extends. Their three Radix dependencies are declared and small. Removing them would shrink the dependency list and the template's usefulness together. Disclosed in the README folder map instead. |
| **Did not consolidate the design tokens** | They already are consolidated — `src/styles.css` is a single, well-commented token file with `@theme inline` registrations. The four colour literals that live outside it are tabulated in `docs/03-branding.md` rather than moved, because three of them are inside SVG assets that must rasterise without CSS Color 4. |
| **Did not fix the onboarding-panel contradiction** (R1) | Both candidate fixes change what the flagship screen renders — four rows become two, or the `Vendor` type needs new fields for the progress bars. A design call, not a copy fix. Logged as R1. |
| **Did not fill the three empty message threads** (R2) | Adding nine seeded messages was outside the approved copy-fix scope. Logged as R2 and documented in `docs/02` and `docs/04`. |
| **Did not format created-PO values** (R3) | `$9999` instead of `$9,999` is a behaviour change in `createPurchaseOrder`, not a data fix. Logged as R3. |
| **Did not fix the truncated mobile heading** (R4) | Restyling the UI is out of bounds. Logged as R4. |
| **Did not point `vendor.index.tsx` at the store** (R5) | Harmless in the demo, and rewiring a screen's data source is a refactor. Documented as a trap for backend work in `docs/04` and `docs/05`. |
| **Did not invent a demo URL** | None exists anywhere in the repository. `README.md` carries a visible placeholder and it is logged as blocker B1. |
| **Did not build a design ZIP or a handover ZIP** | No Figma source exists, and the logo assets already ship in the source ZIP; the handover contents already ship as `docs/05` and `docs/06`, and a support policy must not be invented. Logged as gaps G1 and G2. |
| **Did not verify `pnpm start`, the Vercel preset, or dark mode** | `pnpm build` succeeded and emitted the Nitro server, but the runtime check ran on the dev server. No deploy was made. Dark mode is unreachable — nothing applies the `dark` class. All three recorded as caveats. |
| **Did not touch the user's working environment** | The user's `node_modules` was left in place. Every verification ran in a pristine `rsync` copy under the scratch directory. Two dev servers were started and stopped by this pass; nothing else was killed. |

---

## Third-party asset audit

| Asset | Finding |
| --- | --- |
| Fonts | Urbanist + Epilogue, **CDN only** — a Google Fonts `<link>` in `__root.tsx`. **No font binary anywhere in the repo** (`find` for `woff2\|woff\|ttf\|otf\|eot` outside build output: zero hits). Both SIL OFL 1.1. |
| Stock imagery | **None.** No filename matched `vecteezy\|freepik\|shutterstock\|istock\|gettyimages\|adobestock\|unsplash`, and `strings … \| grep -iE "copyright\|licen[cs]e\|author\|creator"` over every image returned nothing. The template ships **no raster images at all** beyond `favicon.ico`. |
| Logo / favicon | **Was infringing; now original.** See change #1. The replacements carry zero embedded metadata and are covered by `LICENSE.md`. |
| Icons | `lucide-react`, ISC. |
| UI primitives | shadcn/ui (MIT, vendored into `src/components/ui/`) over Radix (MIT). |

All of the above is disclosed to the buyer in the README's **Third-party assets** table and carved
out of `LICENSE.md`.

## Secret audit

Both prescribed greps returned **zero matches** across the whole tree (excluding `node_modules` and
`.git`):

```
grep -rIn -E "sk_(test|live)|AKIA|BEGIN [A-Z ]*PRIVATE KEY|password\s*[:=]\s*["'][^"']+" .
grep -rIn -E "(api[_-]?key|secret|token|bearer|passwd|credential)\s*[:=]\s*["'][A-Za-z0-9_/+-]{12,}" .
```

No `.env` file exists in the tree. `.vercel/` contained only build output — no `project.json`, so no
org or project id. The only environment variable the code reads is the optional `VITE_SITE_URL`.
`package.sh` re-runs the first pattern against the staged copy on every build.

## Client-identification audit

All eight vendor companies are invented (Aster Manufacturing, Kenji Metals, Orbit Logistics, Halcyon
Print Co., Northwind Textiles, Meridian Chemicals, Sable & Sons, Terra Foundry). The two people are
invented (Ava Klein, Sara Chen). Message bodies, notification text and document names are generic
procurement copy naming only those invented entities. The single email in the UI is the placeholder
`you@company.com`. Cities are real but paired only with invented companies. **The two real names
found — Chase and HSBC — were replaced** (change #7). Nothing identifies any client.

## Note for the record

The buyer-facing `CHANGELOG.md` describes change #1 accurately but neutrally — "third-party
artwork, sourced from an icon repository and identifiable as another company's logo" — rather than
naming the companies. The full detail is recorded here, where it belongs. Both statements are true;
the listing is not the place to advertise the specifics of a fixed infringement.
