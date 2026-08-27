#!/usr/bin/env node
/**
 * Recapture the listing screenshot set into template-assets/{desktop,tablet,mobile}/.
 *
 *   pnpm dev --port 3100           # in another terminal
 *   PLAYWRIGHT=/path/to/node_modules/playwright-core/index.mjs \
 *   CHROME=$HOME/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome \
 *   BASE=http://127.0.0.1:3100 \
 *   node docs-internal/cards/capture-screenshots.mjs
 *
 * PLAYWRIGHT defaults to a bare 'playwright' specifier, which works when
 * playwright is installed where node can resolve it. CHROME may be omitted if
 * the playwright install has a matching browser revision.
 *
 * Signs in as admin for screens 1-5 and as vendor for screen 6, at three
 * viewport widths, deviceScaleFactor 2, fullPage.
 *
 * WHY reducedMotion IS THE WHOLE TRICK
 * -----------------------------------
 * The app animates on scroll: AnimatedProgress / AnimatedBar gate their fill on
 * useInView, and .motion-fade-up / .chart-bar are CSS entry animations. A
 * fullPage screenshot renders the entire scroll height in one pass WITHOUT
 * scrolling, so every meter below the fold never intersects the viewport and
 * would be captured at zero — empty grey tracks in the finished asset.
 *
 * Both hooks and the stylesheet honour prefers-reduced-motion: reduce, under
 * which useInView resolves true immediately, useAnimatedNumber jumps straight
 * to its target, and the entry keyframes are disabled. Launching the context
 * with reducedMotion:'reduce' therefore gives a fully settled page with no
 * timing guesswork — which is also why this no longer needs a blind wait.
 * .motion-pulse-dot is an infinite loop that reduced-motion does not cover, so
 * it is frozen with an injected rule to avoid catching it mid-pulse.
 *
 * WHY THE VIEWPORT IS GROWN TO THE PAGE HEIGHT
 * -------------------------------------------
 * The shell positions its chrome against the VIEWPORT, not the document: the
 * desktop sidebar is `sticky top-0 h-screen` and the mobile tab bar is `fixed
 * inset-x-0 bottom-0`. A fullPage shot taken at a short viewport therefore
 * strands both at the first fold — the sidebar stops a third of the way down
 * and leaves a white gutter, and the tab bar cuts across the middle of the
 * page. Resizing the viewport to the measured scroll height before shooting
 * makes h-screen span the whole image and puts the tab bar at the true bottom.
 * Growing the viewport can reflow the content, so the height is re-measured
 * until it settles.
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../template-assets');

const DEVICES = [['desktop', 1440, 1000], ['tablet', 834, 1000], ['mobile', 390, 932]];
const ADMIN = [
  ['1-dashboard', '/dashboard'],
  ['2-vendors', '/vendors'],
  ['3-purchase-orders', '/purchase-orders'],
  ['4-invoices', '/invoices'],
  ['5-payments', '/payments'],
];
const VENDOR = [['6-vendor-home', '/vendor']];

// Freeze the one animation prefers-reduced-motion does not disable.
const FREEZE = '.motion-pulse-dot{animation:none !important}';

const browser = await chromium.launch(
  process.env.CHROME ? { executablePath: process.env.CHROME } : {},
);

let failures = 0;

for (const [device, width, height] of DEVICES) {
  mkdirSync(resolve(OUT, device), { recursive: true });
  for (const [role, screens] of [['admin', ADMIN], ['vendor', VENDOR]]) {
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

    for (const [name, route] of screens) {
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: FREEZE });

      // The shell renders a "Loading workspace…" placeholder until the session
      // is known; screenshotting through it yields a blank page.
      await page.waitForFunction(
        () => !document.body.innerText.includes('Loading workspace'),
        { timeout: 20000 },
      );
      // Real content, not an empty shell. h1 + a populated main region.
      await page.waitForFunction(
        () => {
          const main = document.querySelector('main');
          return !!document.querySelector('main h1') && (main?.innerText.length ?? 0) > 400;
        },
        { timeout: 20000 },
      );
      await page.waitForTimeout(250); // one paint after the style injection

      // Grow the viewport to the full document height so viewport-anchored
      // chrome spans the whole capture. Re-measure until stable, since a taller
      // viewport can itself reflow the content.
      let h = height;
      for (let pass = 0; pass < 4; pass++) {
        const measured = await page.evaluate(() => Math.ceil(Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        )));
        if (measured <= h) break;
        h = measured;
        await page.setViewportSize({ width, height: h });
        await page.waitForTimeout(300);
      }

      const path = resolve(OUT, device, `${name}.png`);
      await page.screenshot({ path, fullPage: true });

      // Report any meter captured empty — the failure reducedMotion prevents.
      // Do NOT trust aria-valuenow: ui/progress.tsx destructures `value` out and
      // never forwards it to the Radix Root, so every bar reads as
      // data-state="indeterminate" with no aria-valuenow. The indicator's own
      // translateX is the real signal — a 0% bar sits at exactly -trackWidth.
      // AnimatedBar is a plain div with an inline width instead.
      const empty = await page.evaluate(() => {
        const flatProgress = [...document.querySelectorAll('[role="progressbar"]')]
          .filter((el) => {
            const track = el.getBoundingClientRect().width;
            const ind = el.firstElementChild;
            if (!track || !ind) return false;
            const m = new DOMMatrixReadOnly(getComputedStyle(ind).transform);
            return track + m.m41 < 1; // shifted fully out of the track
          }).length;
        const flatBar = [...document.querySelectorAll('[style*="width: 0%"], .chart-bar')]
          .filter((b) => b.getBoundingClientRect().height < 1 || b.getBoundingClientRect().width < 1)
          .length;
        return flatProgress + flatBar;
      });
      console.log(`  ${device.padEnd(8)} ${name}  ${width * 2}x${h * 2}${empty ? `  !! ${empty} meter(s) at zero — verify by eye` : ''}`);
      if (empty) failures++;

      await page.setViewportSize({ width, height }); // reset for the next screen

    }
    await ctx.close();
  }
}
await browser.close();

if (failures) {
  console.warn(`\n${failures} screen(s) reported a meter at zero — open those PNGs before shipping.`);
}
console.log('\nDone. Now regenerate the cards: node docs-internal/cards/build-cards.mjs');
