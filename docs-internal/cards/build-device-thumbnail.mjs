#!/usr/bin/env node
/**
 * Build the dual-device thumbnail: template-assets/cards/thumbnail-16x10.png
 *
 *   pnpm dev --port 3100                                  # in another terminal
 *   PLAYWRIGHT=/path/to/node_modules/playwright-core/index.mjs \
 *   CHROME=$HOME/.cache/ms-playwright/chromium-<rev>/chrome-linux64/chrome \
 *   BASE=http://127.0.0.1:3100 \
 *   node docs-internal/cards/build-device-thumbnail.mjs
 *
 * A product shot with no copy: the desktop app floated left of centre with the
 * phone overlapping its bottom-right corner, both with rounded corners and a
 * soft shadow, and NO device bezel. The alternative composition — lockup,
 * headline and fact chips over browser chrome — is build-cards.mjs, which also
 * writes this same filename. Run whichever treatment you want last.
 *
 * The ground is TRANSPARENT, the one rule both card builders share: the listing
 * page supplies its own pastel, so the PNG must be RGBA with a fully
 * transparent background. Asserted at the bottom of this file.
 *
 * The two devices deliberately show DIFFERENT screens, and different personas —
 * the admin dashboard and the vendor home. The same screen twice communicates
 * nothing, and the paired workspaces are the whole point of the template.
 *
 * Capture uses reducedMotion:'reduce' for the same reason capture-screenshots.mjs
 * does: the meters gate their fill on useInView and the cards have entry
 * animations, so an unsettled page shoots with empty tracks. See that file's
 * header for the full explanation.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../../template-assets/cards');
const BASE = process.env.BASE || 'http://localhost:3000';

// Canvas is 16:10; deviceScaleFactor 2 lands the file on 2880x1800.
const W = 1440;
const H = 900;

// Geometry, in canvas px. Both plates keep their capture aspect ratio exactly,
// so nothing is stretched: 1440x900 -> 1072x670, 390x844 -> 281x608.
const DESKTOP = { x: 86, y: 109, w: 1072 };
const PHONE = { x: 1085, y: 241, w: 281 };

const browser = await chromium.launch(
  process.env.CHROME ? { executablePath: process.env.CHROME } : {},
);

async function shoot({ width, height, role, route }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', role === 'admin' ? 'ava.klein@example.com' : 'sara.chen@aster.example');
  await page.fill('input[type=password]', 'demo1234');
  await page.getByRole('button', { name: role === 'admin' ? /Sign in as Admin/i : /Sign in as Vendor/i }).click();
  await page.waitForURL((u) => u.pathname === (role === 'admin' ? '/dashboard' : '/vendor'), { timeout: 20000 });

  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.motion-pulse-dot{animation:none !important}' });
  await page.waitForFunction(
    () => !document.body.innerText.includes('Loading workspace'),
    { timeout: 20000 },
  );
  await page.waitForFunction(
    () => {
      const main = document.querySelector('main');
      return !!document.querySelector('main h1') && (main?.innerText.length ?? 0) > 400;
    },
    { timeout: 20000 },
  );
  await page.waitForTimeout(300);

  // Viewport-only, not fullPage: this is the above-the-fold plate.
  const buf = await page.screenshot({ fullPage: false });
  await ctx.close();
  console.log(`  captured ${role.padEnd(6)} ${route.padEnd(11)} ${width}x${height}`);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const desktop = await shoot({ width: 1440, height: 900, role: 'admin', route: '/dashboard' });
const phone = await shoot({ width: 390, height: 844, role: 'vendor', route: '/vendor' });

const markup = `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:transparent}
  .plate{position:absolute;overflow:hidden;display:block}
  .plate img{display:block;width:100%;height:auto}
  /* Two adjacent 1px rings, because the ground is transparent and unknown. The
     outer dark one keeps the white app body from dissolving into a pale listing
     pastel; the inner light one keeps the app's dark sidebar from dissolving
     into a dark ground. They sit at different insets so they cannot cancel, and
     the light one is a pseudo-element because an inset box-shadow on .plate
     would paint UNDER the child <img> and never be seen. */
  .plate::after{
    content:"";position:absolute;inset:1px;border-radius:inherit;pointer-events:none;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);
  }
  .desktop{
    left:${DESKTOP.x}px;top:${DESKTOP.y}px;width:${DESKTOP.w}px;
    border-radius:15px;
    outline:1px solid rgba(23,19,52,.08);outline-offset:-1px;
    box-shadow:0 46px 96px -34px rgba(40,51,69,.34), 0 14px 36px -14px rgba(40,51,69,.16);
  }
  .phone{
    left:${PHONE.x}px;top:${PHONE.y}px;width:${PHONE.w}px;z-index:2;
    border-radius:30px;
    outline:1px solid rgba(23,19,52,.08);outline-offset:-1px;
    box-shadow:0 26px 54px -22px rgba(40,51,69,.34), 0 8px 18px -8px rgba(23,19,52,.14);
  }
</style>
<div class="plate desktop"><img src="${desktop}"></div>
<div class="plate phone"><img src="${phone}"></div>`;

const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.setContent(markup, { waitUntil: 'load' });
await page.waitForTimeout(400);

mkdirSync(OUT, { recursive: true });
const png = resolve(OUT, 'thumbnail-16x10.png');
// omitBackground is what keeps the ground transparent; the shadows stay,
// rendered as soft alpha so they composite onto any listing colour.
await page.screenshot({ path: png, omitBackground: true });
await browser.close();

const info = execFileSync('convert', [png, '-format', '%wx%h|%[channels]|%[opaque]', 'info:']).toString();
const [dims, channels, opaque] = info.split('|');
const want = `${W * 2}x${H * 2}`;
if (dims !== want) throw new Error(`thumbnail: got ${dims}, expected ${want}`);
if (opaque.trim() === 'true') throw new Error('thumbnail: image is fully opaque — the transparent ground was lost');
console.log(`\n  thumbnail-16x10.png  ${dims}  ${channels}  transparent-ground=true`);

/* Repack the listing bundle, for the same reason build-cards.mjs does: it
   embeds a COPY of the thumbnail, so leaving it alone would ship the other
   treatment's card inside the zip while the loose PNG showed this one. */
const bundle = resolve(OUT, 'vendor-management-images.zip');
execFileSync('rm', ['-f', bundle]);
execFileSync('zip', ['-q', '-j', '-X', bundle,
  resolve(OUT, 'cover-16x9.png'),
  resolve(OUT, 'hero-2x1.png'),
  resolve(OUT, 'thumbnail-16x10.png'),
  resolve(OUT, 'logo-1024.png'),
  resolve(OUT, 'logo.svg'),
]);
const listed = execFileSync('unzip', ['-Z1', bundle]).toString().trim().split('\n');
console.log(`  vendor-management-images.zip  ${listed.length} files: ${listed.join(', ')}`);
