# 06 — Deploy

## What a build produces

```bash
pnpm build
```

Output lands in **`.output/`**:

```
.output/
├── nitro.json          build manifest — records which preset was used
├── public/             static assets: assets/, favicon.ico, logo.svg,
│                       logo-animated.svg, robots.txt
└── server/
    └── index.mjs       the Nitro server entry
```

This is a **server** build, not a folder of static files. The app server-renders, and
`/sitemap.xml` is a real request-time handler.

## The preset is chosen for you

[`../vite.config.ts`](../vite.config.ts) calls `nitro()` with **no preset**, on purpose. Nitro
detects its environment:

| Building on | Preset | Result |
| --- | --- | --- |
| your machine, CI, a container | `node-server` | `.output/server/index.mjs`, run with `pnpm start` |
| Vercel | `vercel` | `.vercel/output/` in Vercel's Build Output API format |

That is why `pnpm start` works locally with no configuration, and why the Vercel deploy needs none
either. To target another platform, pass a preset — `nitro({ preset: "cloudflare_module" })`,
`"netlify"`, `"bun"` and so on — or set the `NITRO_PRESET` environment variable at build time.
Nitro's preset list is the authority on what is available in `3.0.260603-beta`; this template has
only been verified on `node-server` and `vercel`.

## Vercel

[`../vercel.json`](../vercel.json) is the whole configuration:

```json
{ "framework": "tanstack-start", "buildCommand": "pnpm build" }
```

Import the repository and deploy — no environment variables are required. Vercel supplies the Node
version from its own settings; pick **22.x** to match [`.nvmrc`](../.nvmrc) and the `engines` field.

If you set `VITE_SITE_URL` (see below), set it in the project's environment variables **before**
building, and remember it is baked in at build time — changing it later requires a redeploy, not a
restart.

## Node / your own server

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start            # node .output/server/index.mjs — listens on PORT, default 3000
```

`.output/` is self-contained: after building you can ship that directory alone and run
`node .output/server/index.mjs` with no `node_modules` present. Behind nginx or a load balancer,
proxy to the port and let the Node process serve both the assets and the SSR responses.

For a container, build in one stage with the full toolchain and copy only `.output/` into a
`node:22-slim` runtime stage.

## Static hosting — not supported as-is

There is no static export. A pure static host (S3 + CloudFront, GitHub Pages, plain nginx) would
break two things: SSR, and the `/sitemap.xml` server handler. Since every screen sets `ssr: false`
and all data is client-side literals, a static variant is *achievable* — it would need a Nitro
static preset and a replacement for the sitemap route — but it is not configured here and has not
been tested. Do not plan around it without trying it first.

## Sub-path / `basePath` behaviour

**The app assumes it is served from the root of a domain, and that is the only configuration that
has been verified.** Loading `http://localhost:3000/` returns HTTP 200 and every route resolves.

There is no `base` in `vite.config.ts`, no `basepath` on the router in
[`../src/router.tsx`](../src/router.tsx), and no path prefix anywhere in the config. If you need to
serve the app from `https://example.com/vendor-portal/`, treat it as a real task rather than a flag:

1. **Vite's `base` option is build-time**, not runtime. It is inlined into every generated asset URL
   at build, so one build cannot serve two different prefixes. A prefix change means a rebuild.
2. **Three hardcoded absolute asset paths will not be rewritten by anything** and must be changed by
   hand or made relative:
   - [`../src/components/app-shell.tsx`](../src/components/app-shell.tsx) line 168 — `src="/logo-animated.svg"`
   - [`../src/routes/index.tsx`](../src/routes/index.tsx) lines 82 and 116 — the same
   TanStack's `<Link>` components resolve through the router and are fine; a bare `src="/…"` on an
   `<img>` is not.
3. **One hardcoded absolute link** — [`../src/routes/__root.tsx`](../src/routes/__root.tsx) line 63,
   inside the error page, is a plain `<a href="/">` rather than a `<Link>`. Under a prefix it sends
   the user to the domain root instead of the app root.
4. The `<loc>` paths in `/sitemap.xml` come from the `entries` array in
   [`../src/routes/sitemap[.]xml.ts`](../src/routes/sitemap%5B.%5Dxml.ts) and would need the prefix
   too.

A reverse proxy that strips the prefix before forwarding (so the app still sees `/dashboard`) avoids
all of this and is the path of least resistance — but the generated asset URLs still have to match,
so you are back to Vite's `base` for those.

## `VITE_SITE_URL`

The single environment variable this app reads, and it is optional. See
[`../.env.example`](../.env.example).

It supplies the absolute origin for the `<loc>` entries in `/sitemap.xml`. Unset, the sitemap emits
relative paths (`/vendors`), which the sitemap protocol does not permit — search engines will reject
it. Nothing else in the app reads it, so leaving it unset costs you nothing but SEO.

It is a `VITE_`-prefixed variable, so it is **inlined at build time**. Set it in your build
environment, not your runtime environment, and rebuild when it changes.

## Before you deploy — checklist

| | |
| --- | --- |
| ☐ | Replace the logo, favicon and app name — see [`03-branding.md`](03-branding.md) |
| ☐ | Set `VITE_SITE_URL`, or accept an invalid sitemap |
| ☐ | Decide about [`../public/robots.txt`](../public/robots.txt) — it currently reads `Allow: /`, which invites indexing of what may be a demo |
| ☐ | Remember there is **no real authentication**. Anything deployed publicly is fully open, and the session cookie is unsigned and client-writable — a visitor can hand themselves the admin role by editing it. Put it behind HTTP basic auth, Vercel's deployment protection, or a VPN until real auth is in place — see [`05-connect-a-backend.md`](05-connect-a-backend.md) |
| ☐ | `pnpm build && pnpm start` locally first; the dev server is more forgiving than the built one |
| ☐ | Node 22.12+ on the host, matching `engines` |
