// Build-time prerender for TravelIQ (custom Playwright script).
//
// After `vite build`, this serves dist/ with Vite's own preview server (SPA
// history fallback + correct MIME types), loads each marketing route in a
// modern headless Chromium, waits for React to render into #root, and writes
// the fully-rendered HTML back to dist/<route>/index.html. Crawlers that don't
// run JS then get real content; real users still hydrate the SPA (see
// src/index.tsx).
//
// Run via `pnpm prerender` (which installs Chromium first) or automatically as
// the `postbuild` step of `pnpm build`.

import { preview } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OUT_DIR = 'dist';
const PORT = 4321;
const NAV_TIMEOUT = 45_000;

// Public marketing routes only. Dynamic (/supplier/:id, /blog/:id), auth, admin,
// dashboard and ai-studio routes are intentionally excluded.
const ROUTES = [
  '/',
  '/suppliers',
  '/pricing',
  '/about',
  '/blog',
  '/affiliate-program',
  '/privacy',
  '/terms',
];

const server = await preview({ preview: { port: PORT, strictPort: false } });
const base = (server.resolvedUrls?.local?.[0] ?? `http://localhost:${PORT}/`).replace(/\/$/, '');
console.log(`prerender: serving ${OUT_DIR} at ${base}`);

const browser = await chromium.launch();
const page = await browser.newPage();

const failures = [];

for (const route of ROUTES) {
  const url = `${base}${route}`;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });

    // Wait until the SPA has actually rendered content into #root, rather than
    // relying on networkidle (Supabase may hold connections open).
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return !!root && root.children.length > 0;
      },
      { timeout: NAV_TIMEOUT },
    );

    // Small settle for any late-rendered content.
    await page.waitForTimeout(750);

    const html = await page.content(); // includes <!DOCTYPE html>
    const outPath =
      route === '/' ? join(OUT_DIR, 'index.html') : join(OUT_DIR, route, 'index.html');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, 'utf8');
    console.log(`prerender: ${route} -> ${outPath}`);
  } catch (err) {
    console.error(`prerender: FAILED ${route} - ${err.message}`);
    failures.push(route);
  }
}

await browser.close();
await server.httpServer?.close();

if (failures.length) {
  console.error(`prerender: ${failures.length} route(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`prerender: done, ${ROUTES.length} routes rendered`);
