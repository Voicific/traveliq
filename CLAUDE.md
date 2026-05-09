# TravelIQ — CLAUDE.md

Project context for Claude Code and Cowork. Read this before making any changes.

## What this project is
TravelIQ is a B2B SaaS platform that gives travel suppliers (tour operators, cruise lines, airlines, hotels) a 24/7 AI Sales Assistant. UK and European travel agents use TravelIQ to get instant answers from suppliers. Affiliates earn commission by introducing suppliers to the platform.

## Tech stack
- **Framework:** React 18 + TypeScript (strict), Vite 6
- **Styling:** Tailwind CSS v3 — utility-first, no CSS modules
- **Icons:** lucide-react@0.364 — always use `strokeWidth={1.5}`, never emoji
- **Routing:** react-router-dom v6 with `HashRouter` (SPA on static host)
- **Backend:** Supabase (auth + database). Client at `src/lib/supabase.ts`
- **Package manager:** pnpm (use `pnpm` not `npm`)
- **UI primitives:** Radix UI (via shadcn/ui components in `src/components/ui/`)

## Design tokens / colour palette
The site uses a dark navy theme. Key values:
- Background: `#0a1628` (deep navy), `#0f1c2e`, `#0d2d3d`
- Accent / primary: `cyan-400` (`#22d3ee`), gradient `from-cyan-500 to-blue-600`
- Text: `text-white`, `text-gray-300`, `text-gray-400`
- Borders: `border-cyan-400/10`, `border-cyan-400/20`, `border-cyan-400/30`
- Tile backgrounds: teal-900/40 (Tier 1), amber-900/40 (Tier 2), blue-900/40 (Tier 3)

Do not introduce one-off hex values — use the token system above.

## Key conventions

### Icons
**Never use emoji as UI elements.** Use the shared icon library:
- `src/components/icons/TravelIQIcons.tsx` — `FeatureIcon` (container), `TierIcon` (named icon by string), plus individual named exports (`GlobalIcon`, `AIIcon`, etc.)
- Always `strokeWidth={1.5}` on lucide icons
- Icon colours follow the section palette: `text-cyan-400` default, `text-teal-300` / `text-amber-300` / `text-blue-300` for tier sections

### Scroll behaviour
`src/components/ScrollToTop.tsx` is mounted inside `<HashRouter>` in `App.tsx` and resets scroll to top on every route change. Do not remove it. If you need page-level anchor scrolling, use `element?.scrollIntoView({ behavior: 'smooth' })`.

### Routing
All routes are hash-based (`#/affiliate-program`, `#/supplier-portal/login`, etc.). When linking internally always use `<Link to="...">` from react-router-dom, never `<a href="...">`.

### Forms
Affiliate and supplier forms submit directly to Supabase. Keep form state local with `useState`. Validation is done via `required` HTML attributes + TypeScript types. Do not add a third-party form library.

### Component organisation
```
src/
  components/         # Shared UI components
    icons/
      LogoIcon.tsx    # Logo image wrapper
      TravelIQIcons.tsx  # Full icon library — use this for all new icons
    ScrollToTop.tsx   # Global scroll reset (mounted in App.tsx)
    Header.tsx
    Footer.tsx
    ...
  pages/              # One file per route
  context/            # React context providers
  lib/                # Supabase client, utilities
  hooks/
```

## Common commands
```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # TypeScript check + production build
pnpm lint         # ESLint
```

## Pages and their routes
| Route | File | Notes |
|-------|------|-------|
| `/` | `HomePage.tsx` | Marketing home |
| `/suppliers` | `DirectoryPage.tsx` | Agent-facing supplier directory |
| `/pricing` | `PricingPage.tsx` | "Work With Us" nav link |
| `/affiliate-program` | `AffiliateProgramPage.tsx` | Affiliate partner programme |
| `/supplier-portal/register` | `SupplierRegisterPage.tsx` | |
| `/supplier-portal/login` | `SupplierLoginPage.tsx` | |
| `/supplier-portal/dashboard` | `SupplierDashboardPage.tsx` | Protected |
| `/about` | `AboutUsPage.tsx` | |
| `/blog`, `/blog/:id` | `BlogPage.tsx`, `BlogPostPage.tsx` | |
| `/privacy`, `/terms` | `PrivacyPolicyPage.tsx`, `TermsPage.tsx` | |
| `/admin`, `/chat-history`, `/ai-studio/*` | Protected (ProtectedRoute) | Admin only |

## What not to do
- Do not add emoji to UI — use `TravelIQIcons.tsx`
- Do not use `npm` or `yarn` — use `pnpm`
- Do not modify files outside `src/` without explicit instruction
- Do not hardcode hex colours — use Tailwind classes from the palette above
- Do not add `window.scrollTo` calls in individual page components — `ScrollToTop.tsx` handles this globally
