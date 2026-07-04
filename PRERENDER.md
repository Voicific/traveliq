# Build-time prerendering (custom Playwright script)

Fixes the "crawlers see an empty `<div id="root">`" problem with no runtime /
Browser-Rendering cost. After the normal Vite build, `scripts/prerender.mjs`
serves `dist/` with Vite's preview server, loads each marketing route in a modern
headless Chromium (Playwright), waits for React to render into `#root`, and
writes the fully-rendered HTML back to `dist/<route>/index.html`. Real users still
get the SPA (it hydrates the snapshot); crawlers that don't run JS now get real
content.

> We started with react-snap (per the original brief) but it was validated as
> broken here: it bundles a 2019 Chromium that can't parse the modern JS Vite
> emits (`?.` / `??`), so it produced empty snapshots. Playwright uses a current
> Chromium and renders correctly.

## How it's wired

- `scripts/prerender.mjs` — the renderer. Route list lives here.
- `package.json` → `"prerender": "playwright install chromium && node scripts/prerender.mjs"`
  (installs the browser first, idempotent) and `"postbuild": "pnpm prerender"`
  so it runs automatically after `pnpm build`.
- `src/index.tsx` → hydrates when a snapshot is present, otherwise mounts normally.

## Routes prerendered

`/`, `/suppliers`, `/pricing`, `/about`, `/blog`, `/affiliate-program`,
`/privacy`, `/terms`. Dynamic (`/supplier/:id`, `/blog/:id`), auth, admin,
dashboard and ai-studio routes are excluded.

## Run + verify locally

```bash
pnpm build          # vite build, then prerender (postbuild)
cat dist/pricing/index.html | sed -n '/<body/,/<\/html>/p' | head
```

`dist/pricing/index.html` should now contain real pricing markup inside `<body>`,
not just `<div id="root"></div>`.

## Notes / follow-ups

1. **Cloudflare Pages build command:** `postbuild` auto-runs after `pnpm build`.
   If Pages runs `build:prod` instead, set the build command to
   `pnpm build:prod && pnpm prerender` so the snapshot step still executes. The
   `playwright install chromium` step inside `prerender` handles the browser
   download in CI.
2. **`/suppliers` data (known, non-urgent):** its content loads from Supabase at
   runtime. The prerender allows network, so it may capture live data, but if
   auth-gated it can fall back to an empty/loading state. Core static marketing
   pages (home, pricing, about) are the priority and capture fully.
3. **Tailwind CDN (separate ticket):** `index.html` loads Tailwind from
   `https://cdn.tailwindcss.com` at runtime. Switch production to the compiled
   Tailwind output (a `tailwind.config.js` already exists) — unrelated to
   prerender, tracked separately.
