# Prerendering Setup — vite-plugin-prerender approach

Build time e sob sitemap URL er jonno actual rendered HTML generate korbo. Bots (Seobility/Bing/Facebook/Googlebot) full content, H1, links, meta tags sob paabe.

## Approach

Custom Puppeteer-based prerender script (more reliable than abandoned vite plugins). Runs ke `vite build` er por automatically.

## Steps

### 1. Install dependencies
```
bun add -d puppeteer fast-glob
```

### 2. Create `scripts/prerender.mjs`
- Spawn `vite preview` on port 4321
- Read sitemap.xml → list of 25 URLs
- For each URL: Puppeteer launches, navigates, waits for `window.__PRERENDER_READY__ = true` flag (5s timeout fallback)
- Saves rendered HTML to `dist/<route>/index.html`
- Kill preview server, exit

### 3. Add ready flag in `src/main.tsx`
- After React mounts + AdminContext loads initial data, set `window.__PRERENDER_READY__ = true`
- Use `requestIdleCallback` to fire after first paint

### 4. Update `package.json` build script
```
"build": "vite build && node scripts/prerender.mjs"
```

### 5. Switch `createRoot` → `hydrateRoot` in `src/main.tsx`
- Detects if DOM is already prerendered → hydrates instead of replacing
- Prevents content flash, preserves SEO HTML

### 6. Vercel config
- `vercel.json` already has SPA rewrite. Add cache headers for prerendered HTML
- Verify `PUPPETEER_SKIP_DOWNLOAD` is NOT set (Puppeteer needs to download Chromium during install on Vercel)
- Build time will increase by ~60-90 seconds

## Routes to prerender (25)
Pull from `sitemap.xml` dynamically — automatically covers:
- Home, About, Services, Portfolio, Blog, Contact, Testimonials, Strategy Call
- 6 service pages
- 3 blog posts (dynamic from DB)
- 3 portfolio items
- 2 case studies
- 3 legal pages

## Risk mitigation
- **Build failure on Vercel**: If Puppeteer install fails, fallback config will skip prerender and ship SPA (build still succeeds). Console warning instead of hard failure.
- **Dynamic admin content**: Prerender uses live Supabase data fetched at build time. If admin changes content, only reflects after next deploy. Acceptable trade-off — Google still re-crawls live for fresh content.
- **Hydration mismatches**: If client renders different content than prerender (e.g. time-based), React will warn and re-render. Functional but suboptimal. Will check after first deploy.

## What you get after deploy
- Seobility/Bing/all bots → see full H1, internal links, meta tags, body text
- Word count > 0 on all pages
- File size 30-80 KB per page (vs 1.8 KB now)
- Google can index all 25 pages without JS rendering
- Per-route canonical/og:title/og:description baked into HTML

## What doesn't change
- Client-side behavior, admin panel, interactivity — sob same
- Sitemap, robots.txt, middleware redirects — sob same
