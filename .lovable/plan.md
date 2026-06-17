## Problem recap

Ei project ekta **Vite + React SPA** — server theke khali `index.html` (empty `<div id="root">`) ashe, sob content + links browser e JS run hoye render hoy. Eta dui ta SEO impact dey:

1. **Crawler dekhe "JS-rendered" links** — Googlebot JS execute kore (so indexing kaj kortese, GA te visit ashbe), but Bing/Facebook/LinkedIn/old SEO scanners JS execute kore na → tara khali page dekhe.
2. **301 redirect kaj kore na** — `vercel.json` e `rewrite` rule ache (status 200, same URL), `redirect` na. Eta SPA er jonno mandatory, but old URL → new URL er jonno alada `redirects` block dorkar.

## Fix plan

### Part 1: Prerendering (crawler-visible HTML)

`vite-plugin-prerender-spa` install kore build-time e known routes er real HTML generate korbo. Mane `npm run build` er por `dist/` te:

```
dist/index.html              ← homepage er real HTML
dist/services/index.html     ← services page er real HTML
dist/blog/index.html
dist/blog/{slug}/index.html  ← dynamic, Supabase theke fetch
dist/portfolio/{id}/index.html
... etc
```

Vercel ei static HTML serve korbe → crawler real content + links dekhe. User experience SPA i thakbe (hydration).

**Coverage:**
- Static routes: `/`, `/services`, `/portfolio`, `/about`, `/contact`, `/testimonials`, `/case-studies`, `/blog`, `/services/website-seo`, `/services/ecommerce-seo`, `/services/graphics-design`, `/strategy-call`
- Dynamic routes: build time e Supabase theke blog posts, projects, case studies, custom pages fetch kore prerender korbo
- Admin (`/admin`) prerender hobe na (gated)

### Part 2: Sitemap update

Current `/sitemap.xml` ekta edge function theke ashe. Verify korbo sob prerendered route sitemap e ache. Missing thakle add korbo.

### Part 3: 301 Redirects

Tomar theke list lagbe — kon kon **purono URL → notun URL** 301 korte hobe? Example format:
```
/old-services       → /services
/old-blog-post-slug → /blog/new-slug
```

List dile `vercel.json` er `redirects` array e add kore dibo (`permanent: true` = 301). List na thakle ei part skip korbo — tomar paath theke specific URLs lagbe.

### Part 4: Internal linking audit

Sob `<Link>` / `<a>` tag check korbo — confirm korbo sob proper `href="/path"` use kortese (JS `onClick` navigation na). Prerendering er pore crawler ei links follow korte parbe.

## Technical details

**Install:** `vite-plugin-prerender-spa` (puppeteer based, build-time)

**vite.config.ts e add:**
- Plugin config with routes list
- Dynamic route fetcher (Supabase client call at build time using anon key)
- Headless chrome render → static HTML write

**Build flow:** `vite build` → React app build → puppeteer launch → each route visit → wait for content → save HTML → done.

**Vercel impact:** Build time barbe (~1-2 min extra). Output size barbe (route prati ~50-100KB HTML). Runtime e free — pure static serve.

**Files to edit:**
- `vite.config.ts` — add prerender plugin
- `package.json` — add devDependency
- `vercel.json` — add `redirects` block (after tumi URL list dao)
- Possibly minor tweaks in route components jodi prerender e hydration mismatch hoy

## Confirmation needed before implementing

1. **Prerendering implement korbo?** (Recommend kori — ei i real fix)
2. **301 redirect er purono → notun URL list dao** (na hoye Part 3 skip)
3. Build time 1-2 min barbe — okay?
