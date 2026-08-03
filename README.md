# Vendor Verse

A vendor management portal template — admin and vendor dashboards for purchase orders, invoices,
payments, documents, and messaging.

## This is a frontend-only demo

There is no real backend. Everything runs in the browser:

- **Data** — all vendors, purchase orders, invoices, payments, documents, and messages come from
  static seed data in [`src/lib/demo-data.ts`](src/lib/demo-data.ts). Interactions (approving an
  invoice, inviting a vendor, uploading a file, sending a message, etc.) are held in memory by
  [`src/lib/demo-store.tsx`](src/lib/demo-store.tsx) and reset on page reload — nothing is
  persisted or sent to a server.
- **Authentication** — sign-in is a mock. Any non-empty email and password succeeds; there is no
  password check, token, or server call (see [`src/lib/auth-session.ts`](src/lib/auth-session.ts),
  [`src/lib/auth-context.tsx`](src/lib/auth-context.tsx),
  [`src/lib/auth-guards.ts`](src/lib/auth-guards.ts)). The role you pick on the login screen
  (Admin or Vendor) just decides which mock dashboard you land on.
- **File uploads** — the file picker reads a file's name/size/type locally and simulates a
  successful upload; no file content is read, stored, or transmitted anywhere.

There are no API keys, secrets, or real API endpoints anywhere in this repo.

## Commands

- `pnpm install` — install dependencies
- `pnpm dev` — Vite dev server (port 3000)
- `pnpm build` — production build
- `pnpm start` — run Node server from `.output/server/index.mjs`
- `pnpm lint` / `pnpm format`
