# docs-internal

**Nothing in this folder ships.** `docs-internal/` is excluded by
[`package.sh`](package.sh)'s rsync filter, and the script asserts its absence from the staged copy
before zipping — so if it ever leaks, the build fails rather than shipping it.

Buyer-facing documentation lives in [`../README.md`](../README.md) and [`../docs/`](../docs/).

## Contents

| File | What it is |
| --- | --- |
| [`deliverables-admin.md`](deliverables-admin.md) | **Open this to publish the listing.** Admin-panel fields per ZIP, archive shapes, the verification record, and open items ranked by risk. |
| [`packaging-standard.md`](packaging-standard.md) | The v1.0.0 packaging record: resolved inputs, what ships and what does not with a reason per exclusion, every code change and its justification, and what was deliberately left alone. |
| [`package.sh`](package.sh) | The build script. The only sanctioned way to produce a deliverable. |
| [`cards/`](cards/) | The marketing-card generator — HTML/CSS/JS that renders the cover, hero and thumbnail from the app's own design tokens and real screenshots. |
| [`AGENTS.md`](AGENTS.md) | The original agent-instruction file. Moved out of the deliverable in v1.0.0. |
| [`specs/`](specs/) | The two prototype design specs (dual-panel, login role entry). The only written record of those decisions — keep them. |

## Quick reference

```bash
# Build the deliverable (writes to deliverables/, which is gitignored)
./docs-internal/package.sh

# Build a different version — fails unless CHANGELOG.md documents it
VERSION=1.1.0 ./docs-internal/package.sh

# Regenerate the marketing cards (needs google-chrome + ImageMagick)
node docs-internal/cards/build-cards.mjs

# Recapture the listing screenshots (needs the app running on :3000 + playwright)
#   see cards/README.md — the capture script is inlined there
```

## Checks before any release

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint        # must exit 0; 6 react-refresh warnings are expected
pnpm typecheck   # must exit 0
```

Then follow the release checklist at the bottom of
[`deliverables-admin.md`](deliverables-admin.md).
