# SEO Verification Report + Remaining Work

Client-er checklist verify korlam. Niche real status + ki ki baki ache:

## Verified status

### 1. URL Slug — ✅ Done
`pageConfig.ts` + admin slug edit kaj korche. Both default + custom slug resolve hoy, canonical redirect thik ache.

### 2. SEO Meta Setup — ⚠️ Partially done
Admin panel-e meta title / description / keywords edit korle ei page-gulo update hoy:
- Home (`/`)
- Section pages (services, portfolio, blog, about, contact, testimonials list)
- Blog post (`/blog/:slug`)
- Custom pages
- Strategy call

**Ei page-gulo admin override IGNORE kore (hardcoded title/description):**
- Service detail pages (`/services/website-seo`, etc.) — `ServiceLayout` admin pageSeo read korche na
- Project detail (`/portfolio/:id`) — `proj:${id}` override ignore
- Case study detail (`/case-studies/:id`) — `case:${id}` override ignore

**Meta keywords admin-e save hoy kintu kothao render hoy na** — `useSEO` keywords field-i support kore na.

### 3. Canonical URLs — ⚠️ Almost
Home/Section/Blog/Custom/StrategyCall canonical override support kore. Service/Project/CaseStudy pages-e canonical override kaj kore na (same gap as #2).

### 4. Page SEO Optimization — Same as #2/#3
Same 3 page type-er jonno admin SEO disconnected.

### 5. Schema Markup — ⚠️ Partial (admin UI mostly cosmetic)
- `useSEO` schemas support kore ✅
- Home/Section/Blog/Custom pages schemas render kore ✅
- Service/Project/CaseStudy pages schemas pass korche na ❌
- **Open Graph (ogTitle / ogImage / ogDescription) admin-e edit kora jay kintu `useSEO` `stripOgTags()` diye SOB og tag delete kore dey.** Manei admin-er OG fields purai dead — kichui render hoy na.

### 6. Sitemap & Robots — ✅ Mostly done
- Live edge function `/sitemap.xml` auto-update korche ✅
- `robots.txt` static, admin theke change-able na (minor)

---

## Plan: ki ki fix korbo

### A. Service detail pages-e admin SEO wire korbo
`ServiceLayout` (and the 4 service page wrappers: WebsiteSEO, EcommerceSEO, GraphicsDesign, ComingSoon) admin `pageSeo[\`service:${slug}\`]` (or matching key) theke override pore neek. Each service page already has a stable slug → ei key diye lookup korbo: metaTitle, metaDescription, canonicalUrl, robots, schemas, og*.

### B. ProjectDetail-e admin SEO wire korbo
`pageSeo[\`proj:${id}\`]` override read kore useSEO-te pass korbo (already used in sitemap function). Status=draft hole 404.

### C. CaseStudyDetail-e admin SEO wire korbo
`pageSeo[\`case:${id}\`]` override read kore useSEO-te pass korbo (already used in sitemap). Status=draft hole 404.

### D. Open Graph render actually kaj koranor jonno useSEO fix
`useSEO` te `stripOgTags()` call remove korbo, change kore properly upsert korbo:
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
useSEO-r option-e `og?: { title?, description?, image? }` add korbo. Tarpor every page (Index, SectionPage, BlogPost, Service, Project, CaseStudy, CustomPage, StrategyCall) override.og* pass korbe — fallback to metaTitle/metaDescription. Sitewide fallback `index.html`-e thakbe (already present).

### E. Meta keywords output
`useSEO` te optional `keywords` add korbo, `<meta name="keywords">` upsert korbo, jate admin-e type kora keywords actually head-e jay. Sob page admin override theke pass korbe.

### F. robots.txt note
Static `public/robots.txt` admin theke editable na. Client jodi chai admin theke control korte, alada edge function `/robots.txt`-er jonno (sitemap-er motoi) banate hobe. Ei plan-e include korchi NA — confirm chai. (Currently working as-is.)

## Files to edit
- `src/hooks/useSEO.ts` — add `og`, `keywords`, real OG/Twitter tag rendering (remove strip)
- `src/pages/services/ServiceLayout.tsx` — read admin override per service slug
- `src/pages/ProjectDetail.tsx` — read `proj:${id}` override (incl. draft 404)
- `src/pages/CaseStudyDetail.tsx` — read `case:${id}` override (incl. draft 404)
- `src/pages/Index.tsx`, `src/pages/SectionPage.tsx`, `src/pages/BlogPost.tsx`, `src/pages/CustomPageView.tsx`, `src/pages/StrategyCallPage.tsx` — pass `og` + `keywords` to useSEO

## Verification
Implementation-er pore: admin-e ekta service page-e meta title/desc/og change kore save → preview-e `view-source` (or DevTools head) check kore confirm korbo `<meta name="description">`, `<meta property="og:title">`, `<meta name="keywords">` admin value-r sathe match korche. Project + case study-r jonno same check.

Question: **robots.txt-o admin-controlled korte chao?** Korle ekta `robots` edge function add korbo (sitemap-er motoi)— confirm korle ei plan-e add kore debo, na hole ei step skip.
