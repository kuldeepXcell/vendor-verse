#!/usr/bin/env node
/**
 * Regenerate the three Customable marketing cards for Vendor Verse.
 *
 *   node docs-internal/cards/build-cards.mjs
 *
 * What it does:
 *   1. reads the current screenshots from template-assets/ and the mark from
 *      public/logo.svg, and inlines them as data URIs
 *   2. renders cards.html (composed from cards.css, which resolves the app's
 *      own design tokens) in headless Chrome at deviceScaleFactor 2
 *   3. writes transparent-background PNGs to template-assets/cards/
 *
 * The cards carry NO background colour on purpose — the listing page supplies
 * its own pastel. Every PNG is RGBA with a fully transparent ground.
 *
 * Requires: google-chrome (or set CHROME=/path/to/chrome), ImageMagick `convert`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const ASSETS = resolve(ROOT, 'template-assets');
const OUT = resolve(ASSETS, 'cards');
const CHROME = process.env.CHROME || 'google-chrome';

const dataUri = (p, mime) => `data:${mime};base64,${readFileSync(p).toString('base64')}`;

// Crop a full-page screenshot to an above-the-fold slice, so the cards show a
// screen rather than an endless scroll. Widths are the @2x capture widths.
function crop(src, outName, w, h) {
  const dst = resolve(HERE, '.cache', outName);
  mkdirSync(dirname(dst), { recursive: true });
  execFileSync('convert', [src, '-crop', `${w}x${h}+0+0`, '+repage', dst]);
  return dst;
}

const shots = {
  dashboard: crop(resolve(ASSETS, 'desktop/1-dashboard.png'), 'dash.png', 2880, 2100),
  invoices:  crop(resolve(ASSETS, 'desktop/4-invoices.png'),  'inv.png',  2880, 1560),
  vendors:   crop(resolve(ASSETS, 'desktop/2-vendors.png'),   'ven.png',  2880, 1560),
  mVendor:   crop(resolve(ASSETS, 'mobile/6-vendor-home.png'), 'mv.png',   780, 1500),
  mDash:     crop(resolve(ASSETS, 'mobile/1-dashboard.png'),  'md.png',   780, 1500),
};

const img = {
  logo: dataUri(resolve(ROOT, 'public/logo.svg'), 'image/svg+xml'),
  ...Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, dataUri(v, 'image/png')])),
};

const fonts = readFileSync(resolve(HERE, 'embedded-fonts.css'), 'utf8');
const css = readFileSync(resolve(HERE, 'cards.css'), 'utf8');

const lockup = `
  <div class="lockup">
    <img src="${img.logo}" alt="">
    <div>
      <div class="name">Vendor Verse</div>
      <div class="kicker">Vendor portal template</div>
    </div>
  </div>`;

const chip = (t, ok) => `<span class="chip"><span class="dot${ok ? ' dot--ok' : ''}"></span>${t}</span>`;

/* ---------------------------------------------------------------- COVER ----
   One confident product shot in browser chrome, bleeding off the right and
   bottom edges. Product name, headline, one-line description, fact chips. */
const cover = `
<div class="card card--cover">
  <div style="position:absolute;left:82px;top:74px;width:600px">
    ${lockup}
    <h1 class="headline" style="font-size:66px;margin-top:52px">
      Two portals,<br>one procurement<br>workflow.
    </h1>
    <p class="sub" style="margin-top:24px;max-width:485px">
      A vendor management prototype with paired admin and vendor workspaces —
      purchase orders, invoice approval, payment runs, compliance documents
      and messaging.
    </p>
    <div class="chips" style="margin-top:34px;max-width:452px">
      ${chip('16 screens')}${chip('Admin + vendor roles')}
      ${chip('React 19 · Tailwind 4')}${chip('Mock data, no backend', true)}
    </div>
  </div>
  <div class="browser" style="position:absolute;left:726px;top:150px;width:900px">
    <div class="browser__bar">
      <span class="browser__dot"></span><span class="browser__dot"></span><span class="browser__dot"></span>
      <span class="browser__url">vendor-verse / dashboard</span>
    </div>
    <img class="browser__shot" src="${img.dashboard}" alt="">
  </div>
</div>`;

/* ----------------------------------------------------------------- HERO ----
   A different headline, and a two-device collage showing DIFFERENT screens:
   invoices on the desktop, the vendor home on the phone. */
const hero = `
<div class="card card--hero">
  <div style="position:absolute;left:82px;top:96px;width:520px">
    ${lockup}
    <h1 class="headline" style="font-size:56px;margin-top:44px">
      The vendor side<br>is already built.
    </h1>
    <p class="sub" style="margin-top:22px;max-width:445px">
      Suppliers get their own workspace — acknowledge a PO, submit an invoice,
      keep documents current — scoped to their own data by a single helper.
    </p>
    <div class="chips" style="margin-top:30px;max-width:520px">
      ${chip('7 vendor screens')}${chip('Role-guarded routes')}
    </div>
  </div>
  <div class="browser" style="position:absolute;left:648px;top:104px;width:790px">
    <div class="browser__bar">
      <span class="browser__dot"></span><span class="browser__dot"></span><span class="browser__dot"></span>
      <span class="browser__url">vendor-verse / invoices</span>
    </div>
    <img class="browser__shot" src="${img.invoices}" alt="">
  </div>
  <div class="phone" style="position:absolute;left:534px;top:284px">
    <div class="phone__screen"><img src="${img.mVendor}" alt=""></div>
  </div>
</div>`;

/* ------------------------------------------------------------ THUMBNAIL ----
   Compact and legible small. Transparent ground — the pastel comes from the
   listing. One device, angled off the bottom edge. */
const thumbnail = `
<div class="card card--thumbnail">
  <div style="position:absolute;left:88px;top:96px;width:660px">
    ${lockup}
    <h1 class="headline" style="font-size:74px;margin-top:60px">
      Vendor<br>management,<br>ready to brand.
    </h1>
    <div class="chips" style="margin-top:40px;max-width:412px">
      ${chip('16 screens')}${chip('Admin + vendor')}
      ${chip('React 19 · Tailwind 4')}${chip('6 docs guides', true)}
    </div>
  </div>
  <div class="browser" style="position:absolute;left:788px;top:342px;width:860px">
    <div class="browser__bar">
      <span class="browser__dot"></span><span class="browser__dot"></span><span class="browser__dot"></span>
      <span class="browser__url">vendor-verse / vendors</span>
    </div>
    <img class="browser__shot" src="${img.vendors}" alt="">
  </div>
  <div class="phone" style="position:absolute;left:520px;top:520px;width:250px">
    <div class="phone__screen"><img src="${img.mDash}" alt=""></div>
  </div>
</div>`;

const CARDS = [
  ['cover-16x9',      cover,     1440, 810],
  ['hero-2x1',        hero,      1440, 720],
  ['thumbnail-16x10', thumbnail, 1440, 900],
];

mkdirSync(OUT, { recursive: true });
for (const [name, markup, w, h] of CARDS) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>${fonts}</style><style>${css}</style>
<style>html,body{width:${w}px;height:${h}px;overflow:hidden}</style>
</head><body>${markup}</body></html>`;
  const htmlPath = resolve(HERE, '.cache', `${name}.html`);
  writeFileSync(htmlPath, html);

  const png = resolve(OUT, `${name}.png`);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--default-background-color=00000000',       // transparent ground
    '--force-device-scale-factor=2',
    `--window-size=${w},${h}`,
    `--screenshot=${png}`,
    '--virtual-time-budget=4000',
    `file://${htmlPath}`,
  ], { stdio: 'ignore' });

  // Assert the output: exact pixels, and a genuinely transparent ground.
  const out = execFileSync('convert', [png, '-format', '%wx%h|%[channels]|%[opaque]', 'info:']).toString();
  const [dims, channels, opaque] = out.split('|');
  const want = `${w * 2}x${h * 2}`;
  if (dims !== want) throw new Error(`${name}: got ${dims}, expected ${want}`);
  if (opaque.trim() === 'true') throw new Error(`${name}: image is fully opaque — the transparent ground was lost`);
  console.log(`  ${name}.png  ${dims}  ${channels}  transparent-ground=${opaque.trim() === 'false'}`);
}
/* A convenience bundle for uploading listing imagery in one go. Regenerated
   here so it can never drift from the current cards — the previous bundle
   still held pre-rebrand artwork months after the cards were replaced. */
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

console.log('\nCards written to template-assets/cards/ — transparent ground, pastel supplied by the listing.');
