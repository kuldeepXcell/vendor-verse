# 03 — Branding

Four things carry the brand: **colours**, **fonts**, the **app name**, and the **logo**. Colours and
fonts are centralised — one file each. The name is spread across 5 files, and this guide lists every
line so you do not have to hunt.

---

## 1. Colours — one file

Everything lives in [`../src/styles.css`](../src/styles.css). The structure is three blocks:

| Block | What it does |
| --- | --- |
| `@theme inline { … }` | Registers each custom property as a Tailwind utility. `--color-primary: var(--primary)` is what makes `bg-primary` and `text-primary` exist. |
| `:root { … }` | The **light** palette — the actual values. |
| `.dark { … }` | The **dark** palette. |

To recolour, edit the values in `:root` (and `.dark` if you support it). Every utility across all 16
screens follows automatically. The token names are the standard shadcn set plus four extras
(`success`, `warning`, `info` and their `-foreground` pairs) and the `sidebar-*` family.

The current palette is called **Slate & Steel** — a desaturated blue-grey with a near-black sidebar:

| Token | Light value | Reads as |
| --- | --- | --- |
| `--primary` | `oklch(0.32 0.035 260)` | deep slate blue — buttons, chart bar 1 |
| `--sidebar` | `oklch(0.245 0.03 260)` | near-black navy — the sidebar and login panel |
| `--accent` | `oklch(0.62 0.03 258)` | mid steel grey |
| `--background` | `oklch(0.985 0.002 250)` | off-white |
| `--success` | `oklch(0.62 0.13 155)` | green — approved, paid, delivered |
| `--warning` | `oklch(0.78 0.14 75)` | amber — awaiting, expiring |
| `--info` | `oklch(0.65 0.11 235)` | blue — scheduled, in production |
| `--destructive` | `oklch(0.58 0.19 25)` | red — mismatch, delayed, overdue |
| `--radius` | `0.75rem` | corner rounding; the `--radius-*` scale derives from it |

Also defined in `:root`, and easy to miss because they are not colours in the `@theme` sense:
`--shadow-elegant`, `--shadow-card`, `--gradient-surface`.

### Two rules when you edit

1. **Keep the `oklch()` format.** The comment at the top of the file says colours *must* be `oklch`,
   and it is not decoration — `bento-card-interactive` uses
   `color-mix(in oklch, var(--color-primary) 30%, var(--color-border))`, which needs an
   oklch-compatible input to interpolate sanely.
2. **Add new colours in three places**, per the file's own header comment: a value in `:root`, a
   value in `.dark`, and a `--color-<name>: var(--<name>)` line in `@theme inline`. Skip the third
   and no Tailwind utility is generated.

### Colour literals outside the token system

Four places hold raw colour values. If you recolour and these look stale, this is why:

| File | Line | Value | Note |
| --- | --- | --- | --- |
| [`../src/routes/index.tsx`](../src/routes/index.tsx) | 76 | `oklch(0.62 0.03 258)`, `oklch(0.245 0.03 260)`, `oklch(0.32 0.035 260)` | The login panel's inline `backgroundImage` — a radial plus a linear gradient. The three values duplicate `--accent`, `--sidebar` and `--primary`. |
| [`../public/logo.svg`](../public/logo.svg) | 17, 18, 22, 24 | `#283345`, `#3c4a63`, `#f9fafb`, `#7b8799` | The mark. Hex rather than `oklch()` so the file rasterises in tools that predate CSS Color 4. Hex equivalents of `--primary`, a lighter step of it, `--primary-foreground` and `--accent`. |
| [`../public/logo-animated.svg`](../public/logo-animated.svg) | 13, 14, 41, 43 | the same four | Same mark, animated. |
| [`../src/styles.css`](../src/styles.css) | `--gradient-surface` | `oklch(0.245 0.03 260)`, `oklch(0.32 0.035 260)` | Duplicates `--sidebar` and `--primary` inside a `linear-gradient()`. |

The `StatusPill` tone classes in `app-shell.tsx` (`bg-success/12`, `bg-warning/15`, …) *are*
token-based — the numbers are opacity modifiers, so they follow a recolour correctly.

---

## 2. Fonts — two places

| Where | What to change |
| --- | --- |
| [`../src/styles.css`](../src/styles.css), in `@theme inline` | `--font-display` (headings) and `--font-sans` (body). Applied by the `@layer base` rules below: `body` gets `--font-sans`, and `h1`–`h6` get `--font-display` plus `letter-spacing: -0.02em`. |
| [`../src/routes/__root.tsx`](../src/routes/__root.tsx), in the `links` array | The Google Fonts `<link>` that actually loads the files, plus two `preconnect` hints. |

Current pairing: **Urbanist** (500–800) for display, **Epilogue** (400–700) for body. Both are SIL
Open Font License, loaded from the Google Fonts CDN. **No font binaries ship in this template.**

Changing fonts means editing both places — the token *and* the `<link>` — or you will reference a
family the browser never downloaded. Also worth knowing: `body` sets
`font-feature-settings: "cv02", "cv11", "ss01"`, which are Epilogue-specific stylistic sets. A
different family will either ignore them or apply something unintended; delete that line if the
result looks odd.

To self-host instead: put the files in `public/`, add `@font-face` rules to `src/styles.css`, and
remove the CDN `<link>` and the two `preconnect` entries.

---

## 3. App name — 5 files, 27 lines

The string is **"Vendor Verse"**. Nothing derives it from `package.json`, so a rename is a
find-and-replace across these:

| File | Lines | What it is |
| --- | --- | --- |
| [`../src/routes/__root.tsx`](../src/routes/__root.tsx) | 79 | `title` — the default document title, `"Vendor Verse — Vendor Portal"` |
| | 85 | `meta name="author"` |
| | 86 | `meta property="og:title"` |
| [`../src/routes/index.tsx`](../src/routes/index.tsx) | 41 | page title, `"Sign in — Vendor Verse"` |
| | 45 | `meta name="description"` |
| | 83, 117 | logo `alt` text (desktop panel, mobile header) |
| | 89, 123 | the wordmark next to the logo (desktop panel, mobile header) |
| | 207 | `© 2026 Vendor Verse. All rights reserved.` |
| [`../src/components/app-shell.tsx`](../src/components/app-shell.tsx) | 169 | logo `alt` text |
| | 175 | the sidebar wordmark |
| 17 `head()` blocks | one `title:` line each | The `— Vendor Verse` suffix: `__root`, `index`, `dashboard`, `vendors`, `purchase-orders`, `invoices`, `documents`, `payments`, `messages`, `settings`, `vendor.index`, `vendor.purchase-orders`, `vendor.invoices`, `vendor.documents`, `vendor.payments`, `vendor.messages`, `vendor.profile` |

```bash
# from the repo root — review before running
grep -rn "Vendor Verse" src/
```

Two related strings are **not** the app name and should be changed on their own terms:

- **"Vendor Portal"** — the subtitle under the wordmark on the login screen and in `__root.tsx`'s
  title. Set separately in `index.tsx` (lines 91, 125) and `__root.tsx` (line 79).
- **"Admin workspace" / "Vendor workspace"** — the sidebar subtitle, chosen by role in
  `app-shell.tsx`.

### Also rename, if you rename the app

| Thing | Where | Note |
| --- | --- | --- |
| Session key `vendorverse.session` | [`../src/lib/auth-session.ts`](../src/lib/auth-session.ts), `SESSION_KEY` | Cosmetic — it is the cookie and `sessionStorage` key. Changing it signs out anyone holding the old one. |
| `name` and `description` | [`../package.json`](../package.json) | |
| Meta descriptions | `__root.tsx` line 80, `index.tsx` line 45, and the per-route `description` entries in `dashboard.tsx` and `vendors.tsx` | Prose, not just the name. |

---

## 4. Logo and favicon — replace the files, keep the names

Three files in [`../public/`](../public/), referenced by path from three places:

| File | Used by | Rendered at |
| --- | --- | --- |
| `logo.svg` | `__root.tsx` — `rel="icon"` and `rel="apple-touch-icon"` | browser tab, iOS home screen |
| `logo-animated.svg` | `app-shell.tsx` line 168; `index.tsx` lines 82 and 116 | 36×36 in the sidebar, 44×44 on the login panel, 36×36 in the mobile login header |
| `favicon.ico` | requested automatically by browsers at `/favicon.ico` — **not referenced in any markup** | browser tab fallback, bookmarks |

**Replace all three and keep the filenames, and no code changes are needed.** All three references
are string paths, so nothing else has to be touched.

Both SVGs are original artwork for this template, built from the palette above: a rounded-square
tile in the `--primary` gradient, a single white stroke that reads as both the "V" of Vendor Verse
and an approval check, and an `--accent` node on the rising arm. `favicon.ico` is that same mark
rasterised at 16, 32 and 48 px.

The animated variant draws the check in and pulses the node on a 3.6 s loop, and it honours
`prefers-reduced-motion: reduce` with a `@media` block inside the SVG — matching the app's own
reduced-motion rule at the bottom of `styles.css`. If you replace it with a static file, the app
still works; the `<img>` simply shows a still image.

### Sizing notes

The mark is drawn on a 1024×1024 viewBox with the glyph inset roughly 25%, which is what lets it
stay legible at 16 px. The app applies `rounded-lg` to the `<img>`, so the tile's own `rx="232"`
corner radius is what you see at large sizes and Tailwind's radius at small ones. A replacement
logo with edge-to-edge artwork will get visibly clipped by that class — either inset your artwork
or remove `rounded-lg` from the three `<img>` tags.

---

## What is *not* configurable

There is no theme-switcher UI and no runtime branding config. The `.dark` block and the
`@custom-variant dark (&:is(.dark *))` rule exist, and the dark palette is fully defined, but
**nothing in the app ever adds the `dark` class to a wrapping element** — no toggle, no
`prefers-color-scheme` listener. The app always renders light. To ship dark mode you would add the
class yourself (on `<html>` in `__root.tsx`'s `RootShell`, or via a toggle) — the tokens are already
there waiting.
