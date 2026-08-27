# 01 — Setup

## What you need

| | |
| --- | --- |
| Node | **22.12.0 or newer**. Verified on v22.22.0 — the version in [`.nvmrc`](../.nvmrc). |
| pnpm | **10.x**. Pinned as `packageManager: pnpm@10.34.1` in `package.json`. |

The Node floor is not arbitrary: `@tanstack/react-start` declares `engines.node: ">=22.12.0"`.
Vite 8 and Nitro 3 allow `^20.19.0 || >=22.12.0`, so TanStack Start is the binding constraint.

If you use nvm or fnm, `nvm use` / `fnm use` in the project root picks up `.nvmrc`.
If you do not have pnpm: `corepack enable` (bundled with Node) or `npm i -g pnpm@10`.

## Install and run

```bash
pnpm install
pnpm dev
```

Open **http://localhost:3000**. You land on the sign-in screen. Enter any email and any password,
then choose **Sign in as Admin** or **Sign in as Vendor**.

The port is set explicitly in [`vite.config.ts`](../vite.config.ts) (`server.port: 3000`). The app
serves from the root path — nothing is mounted under a prefix.

## Production build

```bash
pnpm build     # emits .output/ — client assets plus a Nitro server
pnpm start     # node .output/server/index.mjs
```

`pnpm build` runs Nitro without a hardcoded preset, so it produces a `node-server` build locally and
a `vercel` build on Vercel. That is why `pnpm start` works on your machine without configuration.
See [`06-deploy.md`](06-deploy.md).

## Checks

```bash
pnpm lint        # eslint + prettier-as-a-rule. Exits 0. ~3 seconds.
pnpm typecheck   # tsc --noEmit. Exits 0.
pnpm format      # prettier --write . — fixes what lint would complain about
```

`pnpm lint` prints **6 warnings and 0 errors** on a clean checkout. All six are
`react-refresh/only-export-components`, from files that legitimately export a hook or a constant
next to a component — `auth-context.tsx`, `demo-store.tsx`, and four shadcn primitives. They are
warnings by design and do not fail the build.

## Troubleshooting

These are the failure modes actually encountered while packaging this template, not a generic list.

### `pnpm lint` seems to hang forever

**Symptom:** `eslint .` runs for minutes with no output.
**Cause:** you have built the project, and ESLint is walking the minified bundles inside `.output/`
or `.vercel/output/` — roughly 40 files of generated JavaScript per directory.
**Fix:** already fixed in this release — `.output`, `.vercel`, `.nitro`, `.tanstack`, `dist` and the
generated `src/routeTree.gen.ts` are all in the `ignores` array at the top of
[`eslint.config.js`](../eslint.config.js). If you add another build or cache directory, add it
there too. A clean lint takes about 3 seconds; if yours takes minutes, something is being walked
that shouldn't be.

### `pnpm install` fails, or the app behaves oddly after installing

**Cause:** you used npm or yarn. Only `pnpm-lock.yaml` is committed, so npm and yarn resolve a
fresh, untested dependency tree — with React 19, TanStack Start and Vite 8 in the mix, that is a
real risk rather than a theoretical one.
**Fix:** delete `node_modules` and any `package-lock.json` / `yarn.lock`, then `pnpm install`.

### Port 3000 already in use

Vite says so and starts on the next free port — read the URL it prints rather than assuming 3000.
To pin a different port permanently, change `server.port` in `vite.config.ts`.

### `pnpm start` exits immediately with a module-not-found error

`pnpm start` runs `node .output/server/index.mjs`, which only exists after a build.
Run `pnpm build` first.

### Signed in as the wrong role, and the URL bounces me back

Working as designed. `requireAuth("admin")` in [`../src/lib/auth-guards.ts`](../src/lib/auth-guards.ts)
redirects a vendor session away from `/dashboard` to `/vendor`, and vice versa. Sign out from the
sidebar footer, then sign in as the other role. See [`02-demo-accounts.md`](02-demo-accounts.md).

### The app remembered me after a reload — isn't this supposed to reset?

Two different things reset differently. Your **sign-in choice** persists, in `sessionStorage` plus a
`vendorverse.session` cookie, so a refresh doesn't dump you back at the login screen. Your **data
edits** — approvals, new POs, uploads, messages — do not persist; they live in React state and are
gone on reload. That is the intended reset mechanism; see [`04-mock-data.md`](04-mock-data.md).

### Colours look transparent or missing

Your browser is too old for `oklch()`. The floor is Chrome/Edge 111, Safari 15.4, Firefox 113.
There is no fallback layer — the entire palette is `oklch()`.

### Fonts fall back to the system sans-serif

Urbanist and Epilogue load from the Google Fonts CDN via a `<link>` in
[`../src/routes/__root.tsx`](../src/routes/__root.tsx). Offline, behind a firewall that blocks
`fonts.googleapis.com`, or in an air-gapped environment, you get the fallback stack. No font
binaries are bundled. To self-host, download the two families, drop the files in `public/`, add
`@font-face` rules to `src/styles.css`, and remove the CDN `<link>`.
