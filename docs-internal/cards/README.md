# Marketing card generator

Regenerates the three Customable listing cards so they are reproducible artefacts, not one-offs.

```bash
node docs-internal/cards/build-cards.mjs
```

Outputs to `template-assets/cards/`:

| File | Pixels | Ratio |
| --- | --- | --- |
| `cover-16x9.png` | 2880 × 1620 | 16:9 |
| `hero-2x1.png` | 2880 × 1440 | 2:1 |
| `thumbnail-16x10.png` | 2880 × 1800 | 16:10 |

It also repacks `vendor-management-images.zip` — the convenience bundle for uploading listing
imagery (the three cards plus `logo-1024.png` and `logo.svg`). That repack is deliberate: the
previous bundle still contained pre-rebrand artwork long after the cards themselves had been
replaced, so it is now rebuilt from the same run that produces the cards and cannot drift.

## The two rules these cards follow

1. **The background is transparent.** Every PNG is RGBA with a fully transparent ground, because the
   listing page supplies its own pastel from code. `cards.css` must never paint a full-bleed
   background colour, and `build-cards.mjs` **asserts** it — if `convert`'s `%[opaque]` comes back
   `true`, the build throws. Chrome is invoked with `--default-background-color=00000000`.
2. **The art is derived from the product, so it cannot drift from it.** Colours in `cards.css` are
   hex resolutions of the `oklch()` tokens in `src/styles.css`, with the mapping written into the
   file's header comment. Type is the app's own Urbanist + Epilogue. The screenshots are the real
   ones from `template-assets/`, inlined as data URIs. The mark is `public/logo.svg` itself.

## Files

| File | Role |
| --- | --- |
| `build-device-thumbnail.mjs` | Builds `thumbnail-16x10.png` in the **dual-device** treatment (see below) and repacks the zip |
| `build-cards.mjs` | Composes the markup, renders in headless Chrome at `deviceScaleFactor 2`, asserts dimensions and transparency |
| `cards.css` | The card design system — tokens, lockup, type scale, chips, browser and phone chrome |
| `embedded-fonts.css` | Urbanist + Epilogue latin subsets as base64 `@font-face`, so rendering needs no network and cannot silently fall back to a system font |
| `.cache/` | Cropped screenshots and generated HTML from the last run. Disposable. |

Requirements: `google-chrome` (or `CHROME=/path/to/chrome`) and ImageMagick `convert`.

## Two thumbnail treatments — both write the same filename

`thumbnail-16x10.png` has two builders. Whichever you run **last** wins, and both repack the zip so
the bundled copy can never disagree with the loose PNG.

| Builder | Treatment |
| --- | --- |
| `build-cards.mjs` | Lockup, headline and fact chips beside a screenshot in browser chrome |
| `build-device-thumbnail.mjs` | No copy at all: the desktop app floated left of centre with the phone overlapping its bottom-right, rounded corners, soft shadow, no bezel |

The dual-device one is currently the shipped thumbnail. It needs the dev server, because it captures
its own plates rather than reading `template-assets/`:

```bash
pnpm dev --port 3100                                    # in another terminal
PLAYWRIGHT=/path/to/node_modules/playwright-core/index.mjs \
CHROME=$HOME/.cache/ms-playwright/chromium-<rev>/chrome-linux64/chrome \
BASE=http://127.0.0.1:3100 \
node docs-internal/cards/build-device-thumbnail.mjs
```

Two details in it are deliberate:

- **The two devices show different screens *and* different personas** — the admin dashboard and the
  vendor home. Same rule as the hero: one screen twice communicates nothing, and the paired
  workspaces are what the template is actually selling.
- **Each plate carries two adjacent 1px rings, not one.** The ground is transparent, so the backdrop
  is unknown at build time. The outer dark ring stops the white app body dissolving into a pale
  listing pastel; the inner light ring stops the app's dark sidebar dissolving into a dark one. They
  sit at different insets so they cannot cancel, and the light one is a pseudo-element — an inset
  `box-shadow` on the plate paints *under* the child `<img>` and is never seen. Check any edit
  against both a pale and a dark ground before shipping it.

## Composition rules, so a future edit doesn't undo the work

- Each card gets its **own headline**. They are not one design at three crops — that was the
  previous version's defect, and it made cover, hero and thumbnail indistinguishable from the plain
  screenshots beside them.
- The **hero shows two different screens** — invoices on the desktop, the vendor home on the phone.
  The same screen on both devices communicates nothing.
- The product shot **bleeds off two edges** (right and bottom) so the card reads as a window onto
  something larger rather than a pasted rectangle.
- **Chips must not orphan.** Set `max-width` on `.chips` so they break evenly (2+2, or one line).
  A single chip alone on a second line looks like a mistake. Re-render and *look* after editing.
- **Every fact on a card must be verifiable in the codebase.** Current claims and their sources:

  | Claim | Verified by |
  | --- | --- |
  | 16 screens | 16 route components (20 files in `src/routes/` minus `__root.tsx`, `vendor.tsx` layout, `sitemap[.]xml.ts`, `README.md`) |
  | 7 vendor screens | `vendor.index`, `.purchase-orders`, `.invoices`, `.documents`, `.payments`, `.messages`, `.profile` |
  | Admin + vendor roles | `AuthRole = "admin" \| "vendor"` in `src/lib/auth-session.ts` |
  | Role-guarded routes | `requireAuth(role)` used 15× in `src/routes/` |
  | React 19 · Tailwind 4 | `react ^19.2.0`, `tailwindcss ^4.2.1` in `package.json` |
  | Mock data, no backend | `src/lib/demo-data.ts` + `demo-store.tsx`; no API layer exists |
  | 6 docs guides | `docs/01-…` through `docs/06-…` |

## Capturing the screenshots the cards consume

The cards read `template-assets/{desktop,tablet,mobile}/*.png`. Recapture them after a UI or brand
change with `capture-screenshots.mjs`, which signs in as admin for `1-dashboard` … `5-payments` and
as vendor for `6-vendor-home`, at viewport widths 1440 / 834 / 390, `deviceScaleFactor: 2`,
`fullPage: true`:

```bash
pnpm dev --port 3100                                    # in another terminal
PLAYWRIGHT=/path/to/node_modules/playwright-core/index.mjs \
CHROME=$HOME/.cache/ms-playwright/chromium-*/chrome-linux64/chrome \
BASE=http://127.0.0.1:3100 \
node docs-internal/cards/capture-screenshots.mjs
```

Two things in that script are load-bearing. Both fix failures that are invisible unless you open the
PNGs, so do not simplify them away.

**1. The context runs with `reducedMotion: 'reduce'`, not a fixed wait.** A `fullPage` screenshot
renders the whole scroll height in one pass *without scrolling*, but `AnimatedProgress` and
`AnimatedBar` gate their fill on `useInView`, and `.motion-fade-up` / `.chart-bar` are entry
animations. Nothing below the first fold ever intersects the viewport, so every meter further down
the page captures at **zero** — empty grey tracks in the shipped asset. `useInView`,
`useAnimatedNumber` and `styles.css` all honour `prefers-reduced-motion: reduce`, under which
in-view resolves true immediately, the counters jump to their targets and the keyframes are off.
That removes the timing guesswork entirely, which is why the old blind `waitForTimeout(1600)` is
gone. `.motion-pulse-dot` loops forever and reduced-motion does not cover it, so it is frozen with
an injected rule rather than caught mid-pulse.

**2. The viewport is grown to the measured page height before each shot.** The shell anchors its
chrome to the viewport, not the document — the sidebar is `sticky top-0 h-screen`, the mobile tab bar
is `fixed inset-x-0 bottom-0`. Shooting `fullPage` at a short viewport strands both at the first
fold: the sidebar stops partway down and leaves a white gutter beside the lower half of the page, and
the tab bar is stamped across the middle of the content. Resizing to the document height first makes
`h-screen` span the full image and puts the tab bar at the true bottom. The height is re-measured
until stable, since a taller viewport can itself reflow content.

The script also reports any meter it captured at zero. It reads the indicator's own `translateX`
rather than `aria-valuenow`: `src/components/ui/progress.tsx` destructures `value` out and never
forwards it to the Radix root, so every bar reports `data-state="indeterminate"` with no
`aria-valuenow` — an accessibility gap in the component, and a trap for anything asserting on it.
