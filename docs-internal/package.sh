#!/usr/bin/env bash
#
# Build the Customable deliverable ZIPs for Vendor Verse.
#
#   ./docs-internal/package.sh            # build using VERSION from package.json
#   VERSION=1.1.0 ./docs-internal/package.sh
#
# Output goes to deliverables/ (gitignored). Run from the repo root.
#
set -euo pipefail

SLUG="vendor-verse"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERSION="${VERSION:-$(node -p "require('./package.json').version")}"
OUT="$ROOT/deliverables"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

die() { printf '\n\033[31mFAIL\033[0m  %s\n' "$1" >&2; exit 1; }
ok()  { printf '\033[32m  ok\033[0m  %s\n' "$1"; }
step(){ printf '\n\033[1m%s\033[0m\n' "$1"; }

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------
step "Preflight"

# Refuse to build a version the CHANGELOG does not document.
grep -qF "## v${VERSION} " CHANGELOG.md \
  || die "CHANGELOG.md has no '## v${VERSION} ' heading. Add the release notes first."
ok "CHANGELOG documents v${VERSION}"

# Every manifest must agree on the version. This repo has one; a monorepo would
# list several here.
for m in package.json; do
  got="$(node -p "require('./$m').version")"
  [ "$got" = "$VERSION" ] || die "$m says version $got, expected $VERSION"
  ok "$m at $VERSION"
done

command -v rsync >/dev/null || die "rsync is required"
command -v zip   >/dev/null || die "zip is required"
command -v unzip >/dev/null || die "unzip is required"

mkdir -p "$OUT"

# ---------------------------------------------------------------------------
# Stage the source tree
# ---------------------------------------------------------------------------
step "Staging source"

TOPDIR="customable-${SLUG}-source-v${VERSION}"
DEST="$STAGE/$TOPDIR"
mkdir -p "$DEST"

# CRITICAL — filter order. rsync stops at the first matching rule, so putting
#   --exclude='.env.*' before --include='.env.example'
# silently drops .env.example from the deliverable. The include MUST come first.
rsync -a \
  --include='.env.example' \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' --exclude='build/' \
  --exclude='.next/' --exclude='.turbo/' --exclude='coverage/' --exclude='.cache/' \
  --exclude='.output/' --exclude='.vercel/' --exclude='.nitro/' --exclude='.vinxi/' \
  --exclude='.tanstack/' --exclude='.wrangler/' --exclude='.dev.vars' \
  --exclude='.env' --exclude='.env.*' \
  --exclude='.DS_Store' --exclude='Thumbs.db' --exclude='.idea/' --exclude='.vscode/' \
  --exclude='*.log' --exclude='*.tsbuildinfo' --exclude='next-env.d.ts' \
  --exclude='*.local' \
  --exclude='deliverables/' --exclude='docs-internal/' --exclude='.claude/' \
  --exclude='template-assets/' \
  ./ "$DEST/"

# ---------------------------------------------------------------------------
# Assert the staged tree, before it becomes a ZIP
# ---------------------------------------------------------------------------
step "Asserting staged tree"

[ -f "$DEST/.env.example" ] \
  || die ".env.example missing from the staged copy — check the rsync filter order"
ok ".env.example present"

for required in package.json pnpm-lock.yaml README.md LICENSE.md CHANGELOG.md .nvmrc \
                docs/01-setup.md docs/02-demo-accounts.md docs/03-branding.md \
                docs/04-mock-data.md docs/05-connect-a-backend.md docs/06-deploy.md \
                src/routes/__root.tsx public/logo.svg public/favicon.ico; do
  [ -e "$DEST/$required" ] || die "$required missing from the staged copy"
done
ok "all required files present"

for forbidden in node_modules .git .output .vercel .idea .vscode template-assets \
                 docs-internal deliverables .env; do
  [ -e "$DEST/$forbidden" ] && die "$forbidden leaked into the staged copy"
done
ok "no forbidden paths"

# Nothing that looks like a real secret.
if grep -rIq -E "sk_(test|live)|AKIA|BEGIN [A-Z ]*PRIVATE KEY" "$DEST" 2>/dev/null; then
  die "possible secret found in the staged copy"
fi
ok "secret scan clean"

# ---------------------------------------------------------------------------
# Zip
# ---------------------------------------------------------------------------
step "Building archive"

ZIP="$OUT/${TOPDIR}.zip"
rm -f "$ZIP"
( cd "$STAGE" && zip -q -r -X "$ZIP" "$TOPDIR" )

# Exactly one top-level folder.
tops="$(unzip -Z1 "$ZIP" | cut -d/ -f1 | sort -u | wc -l)"
[ "$tops" -eq 1 ] || die "archive has $tops top-level entries, expected exactly 1"
ok "exactly one top-level folder: $TOPDIR"

# No junk paths anywhere in the listing.
if unzip -Z1 "$ZIP" | grep -E '(^|/)(node_modules|\.git|\.output|\.vercel|\.idea|\.vscode|template-assets|docs-internal|deliverables)(/|$)|\.DS_Store|\.tsbuildinfo|(^|/)\.env$'; then
  die "junk paths present in the archive listing"
fi
ok "no junk paths in the listing"

# .env.example survived the zip.
unzip -Z1 "$ZIP" | grep -qx "$TOPDIR/.env.example" \
  || die ".env.example is not in the archive"
ok ".env.example in the archive"

# Size ceiling.
bytes="$(stat -c %s "$ZIP")"
[ "$bytes" -lt 536870912 ] || die "archive is $bytes bytes, over the 512 MB limit"
ok "size under 512 MB"

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
step "Deliverables"
for z in "$OUT"/*.zip; do
  [ -e "$z" ] || continue
  printf '  %s\n' "$(basename "$z")"
  printf '    size     %s\n' "$(du -h "$z" | cut -f1)"
  printf '    files    %s\n' "$(unzip -Z1 "$z" | grep -vc '/$' || true)"
  printf '    sha256   %s\n' "$(shasum -a 256 "$z" | cut -d' ' -f1)"
done
printf '\n\033[32mDone.\033[0m deliverables/ is gitignored, so the ZIPs will not show in git status.\n'
