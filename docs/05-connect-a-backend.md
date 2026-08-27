# 05 — Connecting a real backend

## The boundary

**[`../src/lib/demo-store.tsx`](../src/lib/demo-store.tsx)** is the module a real API replaces.

It is a single React context provider that holds nine collections in `useState` and exposes them,
plus 13 mutation functions, through `useDemoStore()`. **14 of the 16 screens read data only through
that hook.** Replace the provider's internals with fetches — keeping the returned object's shape —
and those 14 screens need no changes at all.

The two that do not use the store are the login screen (`index.tsx`, which has no data to show) and
`/settings` (whose 4 cards are local literals with local toggle state).

```
src/routes/*.tsx            ← 15 screens, all consuming useDemoStore()
        │
        ▼
src/lib/demo-store.tsx      ← THE SEAM. useState today, your API tomorrow.
        │
        ▼
src/lib/demo-data.ts        ← static literals + the exported types. Keep the types.
```

Two things sit outside the seam and need their own attention:

1. **[`../src/routes/vendor.index.tsx`](../src/routes/vendor.index.tsx) line 13** imports
   `vendorPayments` from `demo-data.ts` directly rather than from the store. Point it at the store
   before you start, or the vendor home will keep showing seed data after everything else is live.
2. **[`../src/routes/dashboard.tsx`](../src/routes/dashboard.tsx)** declares `activity` (line 488),
   `docs` (511), `topVendors` (542) and `weeks` (455) as local literals. They have no store
   equivalent — you will be adding endpoints and store fields for these, not swapping them.

Authentication is a separate, smaller seam — see the last section.

## What the context exposes

### State — nine collections

| Field | Type | Rows seeded |
| --- | --- | --- |
| `vendors` | `Vendor[]` | 8 |
| `purchaseOrders` | `PurchaseOrder[]` | 10 |
| `invoices` | `Invoice[]` | 9 |
| `documents` | `DocumentItem[]` | 12 |
| `paymentRuns` | `PaymentRun[]` | 4 |
| `vendorPayments` | `VendorPayment[]` | 3 |
| `threads` | `MessageThread[]` | 5 |
| `chatMessages` | `ChatMessage[]` | 7 |
| `onboardingSteps` | `{ label: string; done: boolean }[]` | 6 |

All types except `ChatMessage` are exported from
[`../src/lib/demo-data.ts`](../src/lib/demo-data.ts); `ChatMessage` is exported from the store.

### Methods — all 13

| Method | Signature | Today | A real implementation would |
| --- | --- | --- | --- |
| `acknowledgePurchaseOrder` | `(id: string) => void` | sets status "Acknowledged" | `POST /purchase-orders/:id/acknowledge` |
| `approveInvoice` | `(id: string) => void` | sets status "Approved" | `POST /invoices/:id/approve` |
| `rejectInvoice` | `(id: string) => void` | sets status "Rejected" | `POST /invoices/:id/reject` — probably wants a reason argument |
| `createPurchaseOrder` | `(input: { vendor: string; value: string; delivery: string; description: string }) => void` | prepends a PO, generates the id client-side | `POST /purchase-orders` — the server should own the id and the created date |
| `inviteVendor` | `(input: { name: string; category: string; location: string }) => void` | prepends a vendor with status "Onboarding" | `POST /vendors/invitations` — and send an actual email |
| `uploadInvoice` | `(fileName: string, role: "admin" \| "vendor") => void` | prepends an invoice with `value: "$0"`; **the file is never read** | `POST /invoices` as multipart, then OCR or manual entry for the amount |
| `uploadDocument` | `(fileName: string, vendor?: string) => void` | prepends a document; also ticks the COI or ISO onboarding step if the filename matches | `POST /vendors/:id/documents` as multipart. Note the filename-sniffing side effect — real onboarding should be driven by a document *type* the user picks, not a substring of the filename. |
| `completeOnboardingStep` | `(label: string) => void` | marks the step done, matched by label string | `PATCH /vendors/:id/onboarding/:stepId` — give steps ids, not labels |
| `schedulePaymentRun` | `() => void` | prepends a run with hardcoded totals | `POST /payment-runs` — takes no arguments today, so you will be adding them |
| `reschedulePaymentRun` | `(id: string) => void` | sets a fixed date | `PATCH /payment-runs/:id` — needs a date argument |
| `markPaymentRunProcessed` | `(id: string) => void` | sets status "Processed" | `POST /payment-runs/:id/execute` — the one call that would move real money |
| `sendMessage` | `(threadId: string, body: string, from: "admin" \| "vendor") => void` | appends a message, updates the thread preview | `POST /threads/:id/messages`; consider websockets or polling for the other side |
| `markThreadRead` | `(threadId: string) => void` | clears `unread` | `POST /threads/:id/read` |

Every mutation is synchronous, returns `void`, and cannot fail. Adding a real API means introducing
three things the screens do not currently handle: **async**, **loading state**, and **errors**.
`@tanstack/react-query` v5 is already a dependency and already wired — `QueryClientProvider` wraps
the app in [`../src/routes/__root.tsx`](../src/routes/__root.tsx) and a `QueryClient` is in the
router context — but nothing uses it yet. That is your fastest path: swap the `useState` fields for
`useQuery` and the methods for `useMutation`, keeping the same names and shapes.

## The shape change you cannot avoid

**Money and dates are formatted display strings.**

```ts
value: "$48,200"       // not 48200
due: "Aug 30"          // not "2026-08-30"
date: "Aug 22, 2026"   // not a Date
spend: "$412,880"      // not 412880
match: "3-way ✓"       // a rendered glyph, not a boolean or enum
```

A real API returns numbers and ISO dates. You have two options:

1. **Format at the boundary.** Convert in the store, keep the types as they are, and no screen
   changes. Fastest, but you inherit strings that cannot be sorted or arithmetic'd, and
   [`../src/lib/format-number.ts`](../src/lib/format-number.ts) already exists for the formatting.
2. **Change the types to numbers and dates**, then update each render site. Correct, and required if
   you want sorting, totals, multi-currency or locale formatting. `pnpm typecheck` will walk you
   through every call site — this is the main reason the project is strict-mode TypeScript.

Option 2 is the right call for anything real. Do it before you build features on top.

Also note: `vendor` is a **plain string** on POs, invoices and documents — matched by name, not id.
`filterByVendor()` does `row.vendor === vendor`. A real schema has vendor ids; introduce them at the
same time as the number/date change, because both touch the same types.

## Statuses

Statuses are free text paired with a tone:

```ts
status: "Awaiting acknowledgement",  tone: "warning"
```

The tone drives the pill colour and is a fixed union
(`"muted" | "success" | "warning" | "info" | "destructive"`); the status string is what users read.
There is no state machine and no validation — nothing stops an invoice going from "Paid" back to
"Awaiting approval". If your backend has real status enums, map them to `{ status, tone }` pairs in
the store, in one place.

The distinct status strings currently in use:

| Collection | Seeded statuses | Added by a mutation |
| --- | --- | --- |
| Purchase orders | Draft, Awaiting acknowledgement, Acknowledged, In production, Delivered, Delayed | — |
| Invoices | In review, Awaiting approval, Approved, Scheduled, Paid, PO mismatch | **Rejected** (`rejectInvoice`) |
| Payment runs | Scheduled, Processed | — |
| Vendors | Active, Onboarding, Review, Paused | — |
| Documents | Active, Verified, Library, Missing, Overdue, OK, and day-count labels (`"8 days"`, `"14 days"`, `"21 days"`) | **Pending review** (`uploadDocument`) |

Note the document "statuses" mix three different ideas — a state (Active, Missing), a verification
result (Verified), and a countdown (`"8 days"`). If you model documents properly, that column wants
splitting into a status enum and an expiry date.

## Authentication

Three small files, and nothing else touches the session:

| File | Role |
| --- | --- |
| [`../src/lib/auth-session.ts`](../src/lib/auth-session.ts) | The only module that reads or writes the session. `getSession()` is an isomorphic function — cookie on the server, `sessionStorage` then cookie on the client. Also `setSession`, `clearSession`, `homeForRole`. |
| [`../src/lib/auth-context.tsx`](../src/lib/auth-context.tsx) | `AuthProvider` + `useAuth()`, exposing `session`, `signIn(email, role)`, `signOut()`. |
| [`../src/lib/auth-guards.ts`](../src/lib/auth-guards.ts) | `requireAuth(role?)` for route `beforeLoad`. Used 15 times. |

To make it real:

1. Replace `signIn` in `auth-context.tsx` with a call to your auth endpoint, and store a real token
   or set an httpOnly cookie server-side. **The current cookie is not httpOnly and holds an
   unsigned JSON blob** — anyone can edit it and change their own role. It is a demo, not a
   vulnerability to fix in place; replace it.
2. Keep `requireAuth`'s signature. The guards stay as they are; only what `getSession()` trusts
   changes.
3. Decide about `ssr: false`. Every protected route sets it, because the session is a client-side
   value. With a real httpOnly cookie the server can know the session, so you can turn SSR back on
   and get server-rendered, guarded pages — a meaningful improvement, and a change to make
   deliberately, route by route.
4. Add authorisation on the server. The role check here is a client-side redirect for *navigation*
   only. It stops nothing.

## A suggested order

1. Change money/date/`vendor` types to numbers, ISO dates and ids. Let `pnpm typecheck` find the call sites.
2. Point `vendor.index.tsx` at the store instead of `demo-data.ts`.
3. Replace real auth first — everything else depends on knowing who is calling.
4. Convert the store to `useQuery`/`useMutation`, one collection at a time. It can coexist with
   seeded state while you go.
5. Add loading and error states as you convert each screen.
6. Add endpoints for the dashboard's four local literal sets.
