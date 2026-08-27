# Deliverables — admin panel reference

**Vendor Verse v1.0.0** · packaged 2026-08-25 · single-plan listing

---

## 1. At a glance

| File | Size | Plan | Sort order |
| --- | --- | --- | --- |
| `deliverables/customable-vendor-verse-source-v1.0.0.zip` | 168 KB (170,089 bytes) | All plans | 0 |

One deliverable. Listing imagery is separate and does **not** ship to buyers — it lives in
`template-assets/` (three transparent-ground cards, `logo-1024.png`, `logo.svg`, and 18 device
screenshots), all regenerated for this release by
[`cards/build-cards.mjs`](cards/build-cards.mjs) and
[`cards/capture-screenshots.mjs`](cards/capture-screenshots.mjs). Upload bundle:
`template-assets/cards/vendor-management-images.zip`.

The design and handover extras were **not** built — see
[§4 Open items](#4-open-items-ranked-by-how-badly-each-hurts-if-it-ships), items **G1** and **G2**,
for why, and what the plan bullets must therefore not promise.

---

## 2. Paste block — source ZIP

```
Name:          Full source code
Version:       v1.0.0
What's inside: Complete TanStack Start + React 19 source for a vendor management portal —
               16 screens across paired admin and vendor workspaces, 17 shadcn/ui primitives,
               the Tailwind 4 design-token stylesheet, and mock data for every screen.
               Ships with a README, a licence, a changelog and six setup guides covering
               branding, mock data, backend wiring and deployment. Requires Node 22.12+
               and pnpm 10.
Included in:   
Sort order:    0
Checksum:      ca5cd0d263a269b2618cfe45067279cb8876a279a211e51063c1bec1dcc0d396
File:          deliverables/customable-vendor-verse-source-v1.0.0.zip  (168 KB)
```

Leave **Included in** empty — this ZIP belongs to every plan.

### Archive shape

Exactly one top-level folder, **87 files** in 9 directories:

```
customable-vendor-verse-source-v1.0.0/
├── README.md  LICENSE.md  CHANGELOG.md  .env.example  .nvmrc          15 files at root
├── package.json  pnpm-lock.yaml  tsconfig.json  vite.config.ts
├── eslint.config.js  .prettierrc  .prettierignore  components.json
├── vercel.json  .gitignore
├── docs/                                                               6 files
│   └── 01-setup · 02-demo-accounts · 03-branding
│       04-mock-data · 05-connect-a-backend · 06-deploy
├── public/                                                             4 files
│   └── logo.svg  logo-animated.svg  favicon.ico  robots.txt
└── src/                                                                5 files at src/
    ├── router.tsx  server.ts  start.ts  styles.css  routeTree.gen.ts
    ├── routes/          20 files  (16 screens + __root + /vendor layout
    │                               + sitemap[.]xml.ts + README.md)
    ├── components/      23 files  (6 app components + 17 shadcn/ui primitives)
    ├── lib/             10 files  (demo data & store, auth trio, helpers)
    └── hooks/            4 files
```

No `node_modules`, no `.git`, no build output, no `.env`, no editor config, no listing imagery, no
internal docs. Asserted by the build script, not eyeballed.

---

## 3. Verification record

Every check below was run against a **pristine copy** staged through the build script's own filter
list, and then re-run against the **extracted ZIP**. Nothing was verified in place.

### Commands and results

| # | Check | Command | Result |
| --- | --- | --- | --- |
| 1 | Clean install | `pnpm install --frozen-lockfile` | **exit 0**, "Done in 4.9s using pnpm v10.34.1". Lockfile in sync. |
| 2 | Production build | `pnpm run build` | **exit 0**, "✓ built in 490ms", `.output/` emitted with the `node-server` preset |
| 3 | Lint | `pnpm lint` | **exit 0** in **3.8s** — 6 warnings, 0 errors. (Was hanging past 300s and reporting 143 errors before this release.) |
| 4 | Typecheck | `pnpm typecheck` | **exit 0**, no diagnostics |
| 5 | Dev server | `pnpm dev` | Ready in 980ms on **port 3000 — the documented port was free, no fallback needed** |
| 6 | Quickstart from the extracted ZIP | `pnpm install` → `pnpm dev` → open `http://localhost:3000` | **exit 0** / ready in 1082ms / `GET / → 200`, served `<title>Sign in — Vendor Verse</title>` |
| 7 | Lint + typecheck from the extracted ZIP | `pnpm lint`, `pnpm typecheck` | **exit 0** and **exit 0** — 6 warnings, 0 errors |
| 8 | All 15 routes from the extracted ZIP | Playwright, both personas | identical to the pristine-copy run below: 15/15 populated, 0 broken images, 0 errors |
| 9 | Reproducibility | rebuilt via `package.sh`, `diff -r` on both extracted trees | **identical content, identical sha256.** The documented command produced the shipped file. |

### Route-by-route, in a real browser

Driven with Playwright (Chromium 1234), signing in as each persona and probing the DOM for
seeded-data fingerprints — not status codes. `TEXT` is `body.innerText` length; `$` counts rendered
currency values.

| Role | Route | HTTP | TEXT | Rows | List items | Chart bars | $ | Images/broken | Page + console errors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| admin | `/dashboard` | 200 | 1786 | 5 | 17 | 36 | 12 | 1/0 | none |
| admin | `/vendors` | 200 | 871 | — | — | — | 8 | 1/0 | none |
| admin | `/purchase-orders` | 200 | 996 | 10 | — | — | 10 | 1/0 | none |
| admin | `/invoices` | 200 | 1064 | 9 | — | — | 12 | 1/0 | none |
| admin | `/documents` | 200 | 876 | — | 12 | — | — | 1/0 | none |
| admin | `/payments` | 200 | 688 | 4 | 3 | — | 5 | 1/0 | none |
| admin | `/messages` | 200 | 712 | — | 4 | — | — | 1/0 | none |
| admin | `/settings` | 200 | 595 | — | — | — | — | 1/0 | none |
| vendor | `/vendor` | 200 | 1233 | — | 18 | — | 8 | 1/0 | none |
| vendor | `/vendor/purchase-orders` | 200 | 490 | 3 | — | — | 3 | 1/0 | none |
| vendor | `/vendor/invoices` | 200 | 419 | 3 | — | — | 3 | 1/0 | none |
| vendor | `/vendor/documents` | 200 | 463 | — | 4 | — | — | 1/0 | none |
| vendor | `/vendor/payments` | 200 | 596 | 3 | — | — | 4 | 1/0 | none |
| vendor | `/vendor/messages` | 200 | 534 | — | — | — | — | 1/0 | none |
| vendor | `/vendor/profile` | 200 | 382 | — | 4 | — | — | 1/0 | none |

**15/15 routes render with seeded data. 0 broken images, 0 page errors, 0 console errors, and no
route stuck on the "Loading workspace…" shell in either persona.** Row counts match the documented
seed counts exactly (10 POs, 9 invoices, 4 payment runs; vendor slice 3/3/4/3).

Both personas were exercised in separate browser contexts, so the role-scoped screens were checked
under the role that owns them.

### Interaction paths

| Path | Evidence |
| --- | --- |
| **Write** | Created a PO through the dialog: table rows **10 → 11**, new id **`PO-24818`** generated by `nextId()`, "Purchase order created" toast fired |
| **Mutation** | Approved `INV-8842`: status **"Awaiting approval" → "Approved"** in the row |
| **Reset** | Reloaded: rows **11 → 10**, and `INV-8842` back to "Awaiting approval". The documented reset path works. |
| **Session persistence** | Survives reload (documented exception); **sign-out → `/`** clears it |
| **Input validation** | `not-an-email` → *"Enter a valid email address."*, stays on `/`. Empty password → *"Enter your password to continue."* |
| **Server endpoints** | `/` 200 · `/sitemap.xml` 200 · `/robots.txt` 200 · `/logo.svg` 200 (`image/svg+xml`, 1205 B) · `/favicon.ico` 200 (`image/x-icon`, 15,086 B) · `/nonexistent-route` **404** |
| **`VITE_SITE_URL`** | Unset → sitemap emits relative `<loc>/vendors</loc>`. Set to `https://vendor-verse.example.com/` → `<loc>https://vendor-verse.example.com/vendors</loc>`, trailing slash trimmed. |
| **Visual** | Screenshotted and **reviewed by eye**: admin dashboard, vendor home, admin invoices, admin messages, and the login screen at 1440×900 and 430×932. New mark renders correctly at 36px on the dark sidebar; chart axis labels W1–W12 are legible, not clipped; "2 pending onboarding" now agrees with the panel beside it. |

### Caveats — recorded verbatim

- **No validated 4xx exists on the server to test.** The app exposes exactly one HTTP method
  (`GET /sitemap.xml`) and no API that accepts input. `POST /sitemap.xml` returns **200**, not 405 —
  the request falls through to the SSR catch-all and renders the page shell. The only request
  rejection in the product is the client-side Zod form schema, which was verified above.
- **`pnpm start` was not run against the built output.** `pnpm build` succeeded and emitted
  `.output/server/index.mjs`; the runtime check was done on the dev server, not the Nitro server.
- **Only the `node-server` preset was verified.** The Vercel preset is configured and was not
  exercised — no deploy was made.
- **Dark mode was not verified because it cannot be reached.** The `.dark` palette is fully defined
  but nothing in the app ever applies the `dark` class. Documented in `docs/03-branding.md`.
- **The `pnpm lint` timing figures differ slightly** between the working tree (2.9s) and the
  pristine copy (3.8s); both are the post-fix figure. The pre-fix behaviour was a hard timeout at
  300s.

---

## 4. Open items, ranked by how badly each hurts if it ships

### 🔴 B1 — BLOCKER: no live demo URL exists

`README.md` section 1 reads *"**Live demo:** not published yet — replace this line with your demo
URL before listing."* Nothing in the repo contains a demo URL, and one was not invented.

- **File:** `README.md` line 9
- **Decision needed:** deploy the demo (the Vercel config is ready and needs no environment
  variables), then replace that line. Also set `VITE_SITE_URL` in the Vercel project so the sitemap
  is valid.
- **Why it blocks:** a paid template listing with no demo converts badly, and the placeholder text
  is visible to the buyer inside the ZIP.

### 🟠 R1 — The dashboard's onboarding panel contradicts itself

The "Vendor onboarding" card shows a derived count of **2** above a hardcoded list of **4** vendors,
three of which are not onboarding in the seed data (Orbit = Review, Kenji = Active, Halcyon =
Active). Same defect class as the "8 pending onboarding" label fixed in this release, and it is
visible on the flagship screen **and on all three marketing cards**.

- **File:** `src/routes/dashboard.tsx` lines 210–225 — the inline `[{ name: "Orbit Logistics", … }]`
  array (first entry at line 211), rendered under the `<AnimatedCounter value={onboardingCount} />`
  at line 204
- **Fix, one line either way:** point the list at `vendors.filter(v => v.status === "Onboarding")`
  — but the `Vendor` type has no `stage`/`pct` fields, so the progress bars need a source; **or**
  edit the literal to name the two vendors that really are onboarding (Northwind Textiles, Terra
  Foundry), which drops the panel from four rows to two and changes the screen's proportions.
- **Not done here:** both options change what the flagship screen renders, beyond the copy-fix scope
  that was approved. It is a design call.

### 🟡 R2 — Three of the four admin message threads open empty

`seedMessages` only has bodies for `th-1` and `th-5`. The admin inbox opens on `th-1` (populated),
but clicking Kenji Metals, Orbit Logistics or Halcyon Print Co. shows an empty conversation pane
with just the composer.

- **File:** `src/lib/demo-store.tsx`, the `seedMessages` array (7 entries)
- **Fix:** add `ChatMessage` entries with `threadId: "th-2" | "th-3" | "th-4"`. Three exchanges of
  two or three messages each.
- **Documented meanwhile** in `docs/02-demo-accounts.md` and `docs/04-mock-data.md`.

### 🟡 R3 — A created PO's value renders unformatted

`createPurchaseOrder` prefixes `$` without adding thousands separators, so entering `9999` yields
**`$9999`** in a table where every seeded row reads `$48,200`. Reproduced during verification.

- **File:** `src/lib/demo-store.tsx` line 170, in `createPurchaseOrder`
- **Fix:** route it through the existing `src/lib/format-number.ts`.
- **Not done here:** changes app behaviour rather than data. Small, but it is a behaviour change.

### 🟡 R4 — The vendor home's mobile heading truncates

At 390px, `AppShell`'s `<h1 className="truncate">` clips *"Welcome back, Aster Manufacturing"* to
*"Welcome back, Aster Manufactur…"*. It is real product behaviour, and it is visible on the hero
card's phone.

- **File:** `src/components/app-shell.tsx` line 308 — `<h1 className="truncate …">`
- **Fix:** allow two lines at small widths. **Not done** — restyling the UI was out of scope.

### 🔵 R5 — `vendor.index.tsx` bypasses the store

`src/routes/vendor.index.tsx` line 13 imports `vendorPayments` straight from `demo-data.ts` rather than from `useDemoStore()`,
while `/vendor/payments` reads the store. The two screens can drift. Harmless in the demo (nothing
mutates `vendorPayments`), but it is a trap for a buyer wiring a backend.

- **Fix:** take it from the store. Documented in `docs/04-mock-data.md` and `docs/05-connect-a-backend.md`.

### 🔵 R6 — Five shadcn primitives and one hook are unused

`sheet`, `skeleton`, `tooltip`, `toggle`, `separator` and `hooks/use-mobile.tsx` are not imported by
any screen; `@radix-ui/react-tooltip`, `-toggle` and `-separator` exist only for them. **Kept
deliberately** — they are the standard kit a buyer extends, and they are disclosed in the README's
folder map. No action unless you want a smaller dependency list.

### ⚪ G1 — Gap: no design ZIP

**Not built, deliberately.** There is no Figma or other design source file in the repository. The
only design assets are `logo.svg`, `logo-animated.svg` and `favicon.ico` — all three of which
already ship inside the source ZIP's `public/`. Packaging them again under a second name would
duplicate the source, which the standard forbids.

- **If a plan bullet promises "design files", it is currently unmet.** Either remove the bullet, or
  produce a real design source (a Figma file with the screens and the token set) and package that.

### ⚪ G2 — Gap: no handover ZIP

**Not built, deliberately.** Its intended contents already ship as buyer documentation:
architecture and the backend seam in `docs/05-connect-a-backend.md`, deploy recipes in
`docs/06-deploy.md`. A support policy was **not invented**, and there is nothing else a handover ZIP
would carry that the source ZIP does not.

- **If a plan bullet promises "handover docs" or "support", the support half is unmet.** Remove it,
  or state a real policy and then package it.

---

## 5. Rebuilding

```bash
./docs-internal/package.sh                    # version from package.json
VERSION=1.1.0 ./docs-internal/package.sh      # explicit; fails without a CHANGELOG heading
```

The script refuses to build unless `CHANGELOG.md` contains a matching `## v<VERSION>` heading and
every manifest agrees on the version, and it asserts the archive shape (one top-level folder, no
junk paths, `.env.example` present, under 512 MB) before reporting success.

**`deliverables/` is gitignored.** The ZIPs will **not** appear in `git status` or in the editor's
source-control panel. That is expected and is not a failed build — confirm with `ls -la deliverables/`.

---

## 6. Release checklist for the next version

1. Land the code or docs changes.
2. Bump `version` in `package.json`. (One manifest today; add any new ones to the loop in
   `package.sh`.)
3. Add a `## v<new> — <date>` section to `CHANGELOG.md` with Added / Changed / Fixed / Removed.
   The build fails without it.
4. Update `.nvmrc` and the `engines` field if the verified Node version moved, and the Requirements
   table in `README.md` with it.
5. Re-run **Phase 4 in a pristine copy, not in place**:
   ```bash
   rsync -a <the package.sh excludes> ./ /tmp/verify/ && cd /tmp/verify
   pnpm install --frozen-lockfile && pnpm run build && pnpm lint && pnpm typecheck
   pnpm dev   # then drive a browser over all 15 routes in both personas
   ```
6. Recapture `template-assets/` screenshots if any UI changed, then
   `node docs-internal/cards/build-cards.mjs` and **look at the cards**.
7. `./docs-internal/package.sh`
8. Extract the ZIP into an empty directory and run the README quickstart from *that* copy.
9. **Update the checksum and file size in §1 and §2 of this file**, and the verification record in
   §3, with the new run's real output.
10. Re-rank §4: drop what was fixed, and add anything the new run surfaced.
