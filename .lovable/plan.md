## Goal

Home page-ke ekta proper "agency landing" e convert kora — tomar 2 yr experience-er sathe match kore — and admin panel-e shob notun section manage korar shobidha dewa. Service page-er FAQ alada (deep / service-specific) thakbe; home page er FAQ alada (general / brand-level) thakbe. Sheshe full match check.

---

## Phase 1 — Home page e notun sections build

Home er final order (top → bottom):

1. **Hero** (already ase) — keep
2. **Trust Strip** — auto-scrolling client logos/names marquee
3. **Stats Band** — 3–4 ta boro number (Projects, Clients, Years, Retention)
4. **Services Preview** — compact 3–6 card grid, "View all →" link
5. **Featured Case Studies** — 2–3 card with metric (e.g. "+180% traffic")
6. **Blog** (recent 3 — already ase) — keep
7. **Home FAQ** — 5–7 brand/general questions (alada from service FAQs)
8. **Final CTA Banner** — boro headline + 2 button → /contact

About, Portfolio (full), Testimonials, Contact full section — home theke OUT (already user remove korechhe; admin default-ei reflect korbo).

---

## Phase 2 — New components

Notun files (src/components/site/home/):
- `TrustStrip.tsx` — marquee of logos/names from admin
- `StatsBand.tsx` — grid of stat cards
- `ServicesPreview.tsx` — compact services grid (reuses services data, 6 max)
- `CaseStudies.tsx` — card grid with metric badge
- `HomeFAQ.tsx` — accordion (uses existing shadcn Accordion), brand-level Q&A
- `FinalCTA.tsx` — gradient banner with 2 CTAs

Each component pulls data from `useAdmin()` so admin control kora jay.

---

## Phase 3 — Service page FAQ admin-managed

- Currently WebsiteSEO.tsx-er FAQ hardcoded; other service pages-e FAQ nei.
- Add per-service FAQ data structure in admin (keyed by service slug: `website-seo`, `ecommerce-seo`, `graphics-design`, etc.).
- Refactor service pages to read FAQs from admin store instead of local const.
- Each service page-e ekta FAQ accordion section thakbe (admin theke add/edit/delete).

---

## Phase 4 — Admin panel update

`AdminContext.tsx` e notun state + persist to `site_settings` (jsonb columns):

- `homeFaqs: { id, question, answer }[]`
- `serviceFaqs: Record<serviceSlug, { id, question, answer }[]>`
- `stats: { id, value, label }[]`
- `trustLogos: { id, name, image }[]`
- `caseStudies: { id, title, metric, image, link }[]`
- `finalCta: { headline, subline, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl }`
- `homeBlocks: enabled flags for { trustStrip, stats, servicesPreview, caseStudies, homeFaq, finalCta }`

AdminDashboard.tsx e notun editor panels:
- "Home builder" tab e — Trust Strip / Stats / Services Preview / Case Studies / Home FAQ / Final CTA editors (each with add/edit/delete + enable toggle).
- "Services" tab er moddhe per-service FAQ manager.
- Default `pageLocation` update: about/portfolio/testimonials/contact = "" (standalone), not "home". Home membership defaults update kore notun blocks add korbo.

---

## Phase 5 — Database

`site_settings` table e already `home_sections` (jsonb) ache, kintu structured data-r jonno notun columns lagbe. Add (via migration):
- `home_blocks jsonb default '{}'`
- `home_faqs jsonb default '[]'`
- `service_faqs jsonb default '{}'`
- `stats jsonb default '[]'`
- `trust_logos jsonb default '[]'`
- `case_studies jsonb default '[]'`
- `final_cta jsonb default '{}'`

AdminContext-e load/persist logic e eigula add korbo. types.ts auto-regen hobe.

---

## Phase 6 — Render wiring

`src/pages/Index.tsx` rewrite kore notun order onujayi render korbe, each block conditionally on `homeBlocks[key]` flag. About/Portfolio/Testimonials/Contact home theke remove (already done) — confirm kora hobe.

---

## Phase 7 — Polish & cross-check

- Main site (/) — top to bottom scroll kore protita notun section visually verify (mobile + desktop).
- Admin (/admin) — protita new editor field edit → save → site refresh → change reflect kore kina test.
- Service pages — admin theke FAQ add → service page e dekha jay kina.
- Empty states — jodi admin kichu add na kore, default placeholder content show.
- Mobile responsiveness — 451px viewport e check.
- SEO meta + JSON-LD untouched (already configured per-page).

---

## Technical notes

- All new components use semantic Tailwind tokens (no raw colors).
- Reuse existing shadcn `Accordion`, `Card`, `Button`.
- Use existing `ImageUpload` for case study / trust logo images.
- Persist via existing `site_settings` upsert pattern in `AdminContext`.
- Default content shipped in `defaultStats`, `defaultHomeFaqs` etc. so site never shows empty.

---

## Out of scope (later, on request)

- Awards section
- Industries served
- Process timeline
- Pricing teaser

Eta approve korle implement kora shuru korbo, ekta ekta phase kore.