# 02 — Demo accounts and roles

## There are no accounts

This bears stating plainly, because it is the first thing people look for: **there is no user table,
no seeded credentials, and no password to find.** Authentication is a mock.

The sign-in form at `/` ([`../src/routes/index.tsx`](../src/routes/index.tsx)) validates exactly two
things with Zod:

- the email field is non-empty and looks like an email address
- the password field is non-empty

Then it calls `signIn(email, role)` and navigates. There is no credential check, no request, no
token. `demo@example.com` / `x` works as well as anything else.

## The two personas

| | **Admin** | **Vendor** |
| --- | --- | --- |
| How to enter | any email + password → **Sign in as Admin** | any email + password → **Sign in as Vendor** |
| Lands on | `/dashboard` | `/vendor` |
| Sidebar name | **"Ava Klein"**, hardcoded | derived from the email you typed |
| Sidebar subtitle | "Procurement lead" | "Aster Manufacturing" (`DEMO_VENDOR_NAME`) |
| Avatar initials | `AK`, hardcoded | initials computed from your email's local part |
| Nav items | 8 | 7 |
| Data scope | everything | Aster Manufacturing's slice only |

The admin identity is hardcoded at [`../src/components/app-shell.tsx`](../src/components/app-shell.tsx)
— `displayName`, `displayTitle` and `avatar` are chosen by role there. Change "Ava Klein" in that
one place and it updates the sidebar everywhere.

## What each persona sees

Both personas land on a populated screen; neither role has an empty first view.

### Admin — 8 screens

| Route | Screen | Seeded rows |
| --- | --- | --- |
| `/dashboard` | Overview — KPI tiles, 12-week payables chart, recent POs, onboarding, activity, expiring docs, top vendors | 4 KPIs, 12 chart bars, 5 recent POs |
| `/vendors` | Vendor directory with status filter and per-row actions | 8 vendors |
| `/purchase-orders` | PO table, status filters, create-PO dialog, CSV export | 10 POs |
| `/invoices` | Invoice table with approve/reject, status chips, upload | 9 invoices |
| `/documents` | Compliance library grouped into 4 categories | 12 documents |
| `/payments` | Payment runs, schedule/reschedule/process, payment methods | 4 runs |
| `/messages` | Threaded inbox with composer | **4** threads (see the note below), 3 messages in the default thread |
| `/settings` | 4 configuration cards (toggles are cosmetic) | 4 cards |

### Vendor — 7 screens

| Route | Screen | Seeded rows |
| --- | --- | --- |
| `/vendor` | Vendor home — onboarding checklist, next payment, open POs, compliance | 6 onboarding steps |
| `/vendor/purchase-orders` | POs issued to Aster, with acknowledge | **3** |
| `/vendor/invoices` | Aster's invoices, with upload | **3** |
| `/vendor/documents` | Aster's documents, grouped, with upload | **4** across 3 groups |
| `/vendor/payments` | Aster's payment history and next scheduled | **3** |
| `/vendor/messages` | The single thread with Procurement | 1 thread, 4 messages |
| `/vendor/profile` | Company profile, banking, contact, compliance status | 4 info rows |

The vendor scoping is one helper — `filterByVendor(rows, vendor = DEMO_VENDOR_NAME)` at the bottom
of [`../src/lib/demo-data.ts`](../src/lib/demo-data.ts) — which filters any array of `{ vendor: string }`
down to Aster Manufacturing. To demo a different vendor, change `DEMO_VENDOR_NAME` and
`DEMO_VENDOR_INITIAL` at the top of that file to another name in the `vendors` array, and the whole
vendor side follows.

## Switching roles

Click the **sign-out** button — the arrow icon in the sidebar footer on desktop, or in the header on
mobile — then sign in as the other role. Signing out clears both `sessionStorage` and the
`vendorverse.session` cookie.

There is no in-app persona switcher; sign-out-and-back-in is the intended path.

## How the guard works

[`../src/lib/auth-guards.ts`](../src/lib/auth-guards.ts) exports one function, used in every
protected route's `beforeLoad`:

```ts
requireAuth()          // any session; unauthenticated -> redirect to "/"
requireAuth("admin")   // admin only; a vendor session -> redirect to "/vendor"
requireAuth("vendor")  // vendor only; an admin session -> redirect to "/dashboard"
```

The codebase uses only the two role-specific forms — `requireAuth("admin")` in 8 routes and
`requireAuth("vendor")` in 7. The bare `requireAuth()` form works but is currently unused.

It runs on both SSR and client, because `getSession()` in
[`../src/lib/auth-session.ts`](../src/lib/auth-session.ts) is built with TanStack's
`createIsomorphicFn()`: on the server it parses the `vendorverse.session` cookie, and on the client
it reads `sessionStorage` first and falls back to the cookie.

Every protected route also sets `ssr: false`, so the shell is rendered on the client where the
session is known — which is why a plain `curl` of `/dashboard` returns HTTP 200 with an empty shell
rather than a redirect. Judge these routes in a browser, not with `curl`.

## Messaging: how the 5 threads are split

`messageThreads` in `demo-data.ts` holds 5 threads, and the two sides of the app divide them:

- **Admin `/messages`** shows `threads.filter(t => t.id !== "th-5")` — threads **th-1 to th-4**.
- **Vendor `/vendor/messages`** shows only **th-5**, the thread between Aster and Procurement.

Only **th-1 and th-5** have seeded conversation bodies (3 and 4 messages). The admin inbox opens on
th-1, so the first view is populated — but **clicking th-2, th-3 or th-4 shows an empty conversation
pane** with only the composer. If you are demoing the messaging screen, either stay on the first
thread or add `ChatMessage` entries with those `threadId`s to `seedMessages` in
[`../src/lib/demo-store.tsx`](../src/lib/demo-store.tsx). See [`04-mock-data.md`](04-mock-data.md).

## The one hardcoded thread

`/vendor/messages` ([`../src/routes/vendor.messages.tsx`](../src/routes/vendor.messages.tsx)) looks
up thread `"th-5"` by literal id. If you edit the `messageThreads` array and remove or rename that
entry, the vendor messages screen throws — the lookup uses a non-null assertion. Keep an id of
`th-5`, or change the constant in that file at the same time.
