# 04 — Mock data

## The two layers

| Layer | File | Role |
| --- | --- | --- |
| **Seed** | [`../src/lib/demo-data.ts`](../src/lib/demo-data.ts) | Static literals. 8 exported collections plus the types they satisfy. Never mutated. |
| **Store** | [`../src/lib/demo-store.tsx`](../src/lib/demo-store.tsx) | A React context that copies the seed into `useState` on mount and exposes 13 mutation functions. Everything the UI changes happens here. |

Nothing is generated at runtime — there is no faker, no random data, no date arithmetic. Every value
is a hand-written literal, which is why the demo looks identical on every load and in every
screenshot.

## What is seeded

| Export | Rows | Type |
| --- | --- | --- |
| `vendors` | 8 | `Vendor` |
| `initialPurchaseOrders` | 10 | `PurchaseOrder` |
| `initialInvoices` | 9 | `Invoice` |
| `documents` | 12 | `DocumentItem` |
| `paymentRuns` | 4 | `PaymentRun` |
| `vendorPayments` | 3 | `VendorPayment` |
| `messageThreads` | 5 | `MessageThread` |
| `vendorOnboardingSteps` | 6 | `{ label, done }` |
| `seedMessages` *(in `demo-store.tsx`)* | 7 | `ChatMessage` |

Plus two constants that define the vendor persona, at the top of `demo-data.ts`:

```ts
export const DEMO_VENDOR_NAME = "Aster Manufacturing";
export const DEMO_VENDOR_INITIAL = "AM";
```

Change those two to another name from the `vendors` array and the entire vendor-side scoping
follows, via the `filterByVendor()` helper at the bottom of the same file.

### Everything is a formatted string

This is the most important thing to know before wiring a real API. Money and dates are **display
strings**, not numbers or dates:

```ts
{ id: "PO-24817", value: "$48,200", created: "Aug 12", delivery: "Aug 21", items: 14 }
```

`items`, `vendors` and `count` are the only numeric fields anywhere. Sorting, arithmetic, currency
switching and locale formatting are therefore not possible without changing the types first. See
[`05-connect-a-backend.md`](05-connect-a-backend.md).

Statuses are also free-text strings paired with a `tone` from a fixed union:

```ts
type StatusTone = "muted" | "success" | "warning" | "info" | "destructive";
```

`tone` drives the colour of the `StatusPill`; the `status` string is what the user reads. The two are
set together at every call site, so if you add a status you must pick its tone by hand.

## Three data sources the store does *not* own

Most screens read the store. Three sets of literals bypass it, and they will not react to anything
you do in the UI:

| Where | What | Consequence |
| --- | --- | --- |
| [`../src/routes/dashboard.tsx`](../src/routes/dashboard.tsx) lines 488, 511, 542 | `activity` (5 rows), `docs` (4 rows), `topVendors` (4 rows) | The dashboard's activity feed, expiring-documents card and top-vendor list are decorative. Approving an invoice does not appear in the activity feed. |
| [`../src/routes/dashboard.tsx`](../src/routes/dashboard.tsx) line 455 | `weeks` — 12 `[number, number, number]` triples | The 12-week payables chart is fixed. It does not respond to POs or invoices. |
| [`../src/routes/vendor.index.tsx`](../src/routes/vendor.index.tsx) line 13 | imports `vendorPayments` from `demo-data.ts` directly, not from the store | The vendor home's "next payment" card reads the seed array. `/vendor/payments` reads the store correctly, so the two screens can drift apart. |
| [`../src/components/app-shell.tsx`](../src/components/app-shell.tsx) | `adminNotifications` and `vendorNotifications`, 3 rows each | The bell dropdown is static per role. |

Some KPI sub-labels are also literals — `"$1.24M committed"`, `"4 overdue for approval"`,
`"Next run · Friday"` and the `+12 / +4 / -3 / +6.2%` deltas on the dashboard tiles. The tile
*values* are derived from the store; the deltas and sub-labels beside them are decorative. (The one
sub-label that contradicted the data — "8 pending onboarding" against a panel showing 2 — was
changed in v1.0.0 to derive from the same count.)

## What the 13 mutations do

All are in-memory `setState` calls, each followed by a `sonner` toast. None validate beyond what the
form dialog already checked, and none can fail.

| Function | Effect |
| --- | --- |
| `acknowledgePurchaseOrder(id)` | PO status → "Acknowledged", tone → info |
| `approveInvoice(id)` | Invoice status → "Approved", tone → success |
| `rejectInvoice(id)` | Invoice status → "Rejected", tone → destructive |
| `createPurchaseOrder({vendor, value, delivery, description})` | Prepends a PO with the next `PO-` id, `created: "Today"`, status "Awaiting acknowledgement". Prefixes `$` to the value if you omitted it. |
| `inviteVendor({name, category, location})` | Prepends a vendor with `spend: "$0"`, status "Onboarding", initials derived from the first two words of the name |
| `uploadInvoice(fileName, role)` | Prepends an invoice with `value: "$0"`, attached to the newest PO; status differs by role ("In review" for a vendor, "Awaiting approval" for an admin) |
| `uploadDocument(fileName, vendor?)` | Prepends a document in the "Compliance" group. **Side effect:** if the filename contains "coi" or "insurance" it also ticks the COI onboarding step; "iso" ticks the ISO 9001 step. |
| `completeOnboardingStep(label)` | Marks that step done — matched by its exact label string |
| `schedulePaymentRun()` | Prepends a run with hardcoded figures: `Aug 29, 2026`, 8 vendors, 12 payments, `$156,400` |
| `reschedulePaymentRun(id)` | Sets that run to `Aug 29, 2026`, status "Scheduled" |
| `markPaymentRunProcessed(id)` | Status → "Processed", tone → success |
| `sendMessage(threadId, body, from)` | Appends a `ChatMessage` with `side: "me"`, and updates the thread's preview and timestamp to "now". Ignores an empty body. |
| `markThreadRead(threadId)` | Clears the thread's `unread` flag |

Two ids are generated rather than fixed. `nextId(prefix, existing)` strips non-digits from the
existing ids, takes the max and adds 1 — so new POs and invoices continue the `PO-248xx` /
`INV-88xx` series. Documents and messages use `Date.now()` instead.

## How to reset

**Reload the page.** That is the whole reset mechanism, and it is complete: `DemoStoreProvider`
re-initialises all nine `useState` calls from the seed imports on mount.

There is no reset button, no `localStorage` to clear, and no persistence layer to purge. Your
sign-in choice is the one thing that survives a reload — it lives in `sessionStorage` and the
`vendorverse.session` cookie. Sign out, or close the tab, to clear that too.

If you want an in-app reset button, the shape is small: add a `reset` function to
`DemoStoreProvider` that calls each setter with its seed import, and expose it through the context
value alongside the other 13.

## How to change the demo data

| Goal | Do this |
| --- | --- |
| Different companies | Edit the `vendors` array in `demo-data.ts`. The `vendor` field on POs, invoices and documents is a **plain string match**, not a foreign key — rename a vendor and you must rename it everywhere it appears, or its rows silently disappear from that vendor's views. |
| Different vendor persona | Change `DEMO_VENDOR_NAME` and `DEMO_VENDOR_INITIAL` to another name from `vendors`. Note the vendor side currently has data for Aster only, so pick a vendor and give it POs, invoices and documents, or the vendor screens will be empty. |
| More rows | Append to the arrays. Ids must stay unique; keep the `PO-`/`INV-`/`RUN-`/`PAY-`/`doc-` prefixes so `nextId()` keeps working. |
| Fill the empty message threads | Add `ChatMessage` entries to `seedMessages` in `demo-store.tsx` with `threadId: "th-2"`, `"th-3"` and `"th-4"`. Only th-1 and th-5 have bodies today, so clicking the other three admin threads shows an empty pane. |
| Different currency | There is no currency setting. Money is baked into the strings — a find-and-replace across `demo-data.ts` plus the literal amounts in `dashboard.tsx`, `payments.tsx` and `vendor.*.tsx`. |
| Different dates | Same: dates are strings like `"Aug 21"` and `"Aug 22, 2026"`. The seed is set in **August 2026**, so the demo reads as current for that period and will look stale later. |

After editing, `pnpm typecheck` catches the shape mistakes and `pnpm lint` the formatting ones.
