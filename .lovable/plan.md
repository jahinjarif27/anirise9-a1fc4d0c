
## Full implementation plan — Client er sob requirement

Sob feature implement korbo. Boro scope (15+ file, 2-3 migration), so phase wise korbo jate prottek phase test korte paro. Sob phase complete na hoye final hobe na.

---

### Phase 1 — Per-page SEO foundation + editable slugs

**Goal:** Modern CMS-er moto protiti page er nijer slug, meta, canonical, OG, robots, JSON-LD schemas.

**DB (migration):** `site_settings.pages` notun jsonb column —
```
{
  "home":        { slug: "",          status: "published", changefreq: "weekly",  priority: "1.0", seo: {...} },
  "services":    { slug: "services",  status: "published", ... seo },
  "portfolio":   { slug: "portfolio", ... },
  "about":       { slug: "about", ... },
  "blog":        { slug: "blog", ... },
  "testimonials":{ slug: "testimonials", ... },
  "contact":     { slug: "contact", ... },
  "strategy-call":{ slug: "strategy-call", ... }
}
```
Per-page `seo` object: `metaTitle, metaDescription, metaKeywords, canonicalUrl, canonicalAuto, ogImage, ogTitle, ogDescription, robots ("index"|"noindex"), schemas: SchemaItem[]`.

Same shape `customPages[]` te add (already mostly ache). Service detail pages, blog posts, portfolio items, case studies — eo similar `seo` field add hobe individual item er moddhe.

**Slug behavior:**
- Built-in page slug change kora jabe (e.g. `/services` → `/our-services`).
- `AppRoutes.tsx` re-write — static `<Route path="services">` na, instead admin er `pages` object theke runtime e route resolve hobe (PageResolver component).
- Old slug → new slug 301-style redirect (client-side `<Navigate replace>`).
- Slug validation: lowercase, hyphens, no special chars, uniqueness check across all pages.

**SEO hook rewrite (`useSEO`):**
- Notun param: `canonical?: string` (override), `ogImage?: string`, `robots?: string`, `jsonLd?: SchemaItem[]`.
- Canonical auto fallback: if not provided, use `BASE_URL + currentPath`.
- Schema render: multiple `<script type="application/ld+json">` tags, each with `data-page-jsonld` attr (so cleanup on unmount).
- Robots noindex tag injection per-page.

**Wiring fix (client #4):** `SectionPage.tsx`, `ServiceLayout.tsx`, `CustomPageView.tsx`, `BlogPost.tsx`, `ProjectDetail.tsx`, `CaseStudyDetail.tsx`, `StrategyCallPage.tsx`, `Index.tsx` — sob admin er per-page seo read korbe (canonical, og, schemas o include korbe, just title/desc na).

**Admin UI rewrite — "SEO" tab:**
- Sidebar e page list (Home, Services, Each service, Portfolio, Each project, Blog, Each post, Testimonials, Contact, About, Strategy-call, Custom pages).
- Page select korle right panel e: Slug input, Status (published/draft), Meta title, Meta desc, Keywords, Canonical (auto toggle + override), OG image upload + title + desc, Robots dropdown, Schemas list (add/edit/delete JSON-LD blocks with type selector: Article/Service/FAQ/Product/Breadcrumb/Organization/Custom).
- Live preview: Google SERP preview + canonical/robots indicator.

---

### Phase 2 — Draft / Unpublished toggle (client first point)

`pages[key].status = "draft"` hole:
- PageResolver 404 dekhabe.
- Navbar, Footer, BottomNav, services dropdown automatic baad porbe.
- Sitemap theke baad jabe.
- Admin e badge ("Draft") dekhabe.

Custom pages e o same logic (already `published` boolean — eta `status` field er sathe align korbo).

---

### Phase 3 — Sitemap full rewrite (live + lastmod auto)

**Decision:** edge function diye realtime `/sitemap.xml` serve korbo. Build-time fallback o thakbe.

- Notun edge function: `supabase/functions/sitemap/index.ts` — `site_settings.pages` + `blog_posts` + `portfolio` + `case_studies` + `customPages` + service items theke realtime sitemap XML return korbe. `lastmod` per-page er nijer `updated_at` ba item create/update date. `changefreq` + `priority` admin e per-page editable.
- `vercel.json` te rewrite: `/sitemap.xml` → edge function URL.
- Draft pages skip, noindex pages o skip.
- Admin e "Sitemap" tab — read-only preview + manual refresh + per-page changefreq/priority editor. Duplicate hand-edit textarea remove.
- `scripts/generate-sitemap.ts` o update kore same admin data dekhe — fallback hisebe `public/sitemap.xml` build time e likhbe.

---

### Phase 4 — Services dropdown (navbar + mobile + footer)

- Desktop navbar "Services" link — hover/click dropdown with all enabled service items (data/services.ts + admin enable toggle).
- Mobile sheet menu — "Services" expandable accordion with same list.
- Footer Services section — auto-populate from same source.
- Admin e ekta toggle: per-service "Show in nav dropdown".

---

### Phase 5 — Multi-paragraph + alignment editor

**Scope:** Hero, About, Why Choose, Services Preview, Final CTA, Process, Service detail pages (intro + sections), Custom pages, HomeSections — i.e. sob editable text section.

**Data model change:** Existing `body: string` → `body: TextBlock[]` where:
```ts
type TextBlock = {
  id: string;
  type: "heading" | "paragraph";
  text: string;
  align: "left" | "center" | "right";
  level?: 2 | 3 | 4; // for heading
};
```
Backwards-compatible: existing string `body` gulo migrate hobe runtime e ekta single paragraph TextBlock e.

**Admin editor:** "Add paragraph" / "Add heading" button, per-block alignment toggle (3 button group: ⬅ ⬆ ➡), drag-reorder blocks within section, delete block. Light formatting (bold/italic/link) — markdown style `**bold**`, `[text](url)` — parse korbo, rich editor add korbo na (simpler, less deps).

**Render:** `<TextBlocks blocks={...} />` reusable component, sob page e use.

---

### Phase 6 — Drag-and-drop section reorder

- Library: `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight, accessible).
- Admin "Home Layout" tab — vertical list of all sections (Hero, Trust, Stats, Services Preview, About, Case Studies, Process, Why, Strategy Call, FAQ, Blog, Final CTA, custom sections). Drag handle (≡) icon on each. Toggle on/off + drag order.
- Order saved to `site_settings.home_sections_order: string[]`.
- `Index.tsx` rewrite — single loop renders sections in saved order; built-in section keys mapped to components.
- Same drag-reorder for Service detail page sub-sections + Custom pages.

---

### Other fixes paaye dekhechi, oigulao thik korbo

- Admin password change UI hide kora hobe (since you don't want change-pass now).
- Admin "page seo" key mismatch fix (client #4) — already covered in Phase 1 rewrite.
- Index.tsx hardcoded Organization JSON-LD → admin pages.home.seo.schemas e migrate.

---

## File change summary

**New:**
- `supabase/migrations/<ts>_pages_seo.sql`
- `supabase/functions/sitemap/index.ts`
- `src/components/site/TextBlocks.tsx`
- `src/components/admin/PageSeoEditor.tsx`
- `src/components/admin/TextBlockEditor.tsx`
- `src/components/admin/SortableList.tsx`
- `src/components/site/ServicesDropdown.tsx`
- `src/pages/PageResolver.tsx`

**Heavy edit:**
- `src/context/AdminContext.tsx` (data model + types)
- `src/pages/admin/AdminDashboard.tsx` (new SEO tab + layout tab)
- `src/pages/AppRoutes.tsx` (dynamic slug routing + redirects)
- `src/pages/Index.tsx` (ordered render)
- `src/hooks/useSEO.ts` (canonical/og/schema/robots)
- `src/components/site/Navbar.tsx`, `Footer.tsx`, `BottomNav.tsx` (dropdown + draft filter)
- All page wrappers (`SectionPage`, `ServiceLayout`, `CustomPageView`, `BlogPost`, `ProjectDetail`, `CaseStudyDetail`, `StrategyCallPage`)
- All editable section components (Hero, About, Why, etc.) — use TextBlocks
- `vercel.json` (sitemap rewrite)
- `scripts/generate-sitemap.ts`
- `supabase/functions/admin-action/index.ts` (new ops if needed)
- `package.json` (add `@dnd-kit/core`, `@dnd-kit/sortable`)

---

## Approach

Approve korle ami serially phase 1 → 6 implement korbo, ek ek phase complete kore deploy korbo. Boro change, ~3000+ lines touch hobe. Sob phase ses na hoye sob feature live hobe na — but interim e existing site bhangbe na (backward-compatible data migration).

Tomar approve dile suru korbo.
