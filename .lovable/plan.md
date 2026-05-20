# Client requirements — 6-phase rollout

## ✅ Phase 1 — DONE (this turn)
Per-page SEO foundation + editable slugs + draft toggle.

**What works now (admin → Pages tab → pick any page):**
- URL slug edit per built-in page (Services, Portfolio, Blog, etc.). Default path always works too; new slug also works (both render same content, canonical points to new).
- Published / Draft toggle. Draft pages 404 publicly + auto-hidden from Navbar + Footer + sitemap.
- Full per-page SEO: meta title, description, keywords.
- Canonical URL (auto from path, or manual override).
- Open Graph: title, description, image.
- Robots: index / noindex.
- Sitemap changefreq + priority per page.
- Per-page JSON-LD schemas (Article, Service, FAQPage, etc.) — add/edit/delete unlimited.
- `useSEO` hook rewritten — properly cleans up old schemas + robots between pages.
- Sitemap generator reads admin pageSeo → skips drafts/noindex, uses admin slug + changefreq + priority.

**Files changed:** useSEO.ts, AdminContext (PageSeo type), Index, SectionPage, CustomPageView, AppRoutes (DynamicSlugResolver), Navbar, Footer, AdminDashboard (SeoBlock), scripts/generate-sitemap.ts, new src/lib/pageConfig.ts.

## ⏳ Phase 2 — Services dropdown in Navbar + Footer + Mobile sheet
## ⏳ Phase 3 — Multi-paragraph + alignment editor (TextBlocks)
## ⏳ Phase 4 — Drag-and-drop section reorder (@dnd-kit)
## ⏳ Phase 5 — Live sitemap edge function (realtime /sitemap.xml)
## ⏳ Phase 6 — Per-item SEO (blog posts, service detail, portfolio items, case studies)
