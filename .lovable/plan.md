# Make admin panel permanent on Lovable Cloud

## Goal
Today, everything edited in the admin panel lives in React state and resets when the browser tab closes (leads use localStorage, but only on one device). After this change, every value the admin edits is saved in the database and loaded the next time anyone opens the site — on any device.

## What gets persisted

| Area | Today | After |
|---|---|---|
| Hero / Services / About / Portfolio / Testimonials / Contact text & images | In-memory | DB (`site_settings`) |
| Contact info (phone, email, WhatsApp, Facebook, address) | In-memory | DB (`site_settings`) |
| Portfolio items | In-memory | DB (`site_settings`) |
| SEO: meta, schemas, sitemap, robots, redirects, canonical, per-page SEO | In-memory | DB (`site_settings`) |
| Appearance (fonts, base font size) | In-memory | DB (`site_settings`) |
| Custom pages + home sections + section groups + page locations | In-memory | DB (`site_settings`) |
| Blog posts | In-memory | DB (`blog_posts`) |
| Leads | localStorage (one browser) | DB (`leads`) — shared across devices |
| Visitor count + chart | Random mock numbers | DB (`page_visits`) — real visits |

## Database tables

1. **`site_settings`** — one row, JSON columns per section
   - Columns: `id (singleton)`, `content`, `contact`, `portfolio`, `seo`, `appearance`, `custom_pages`, `home_sections`, `section_groups`, `page_location`, `home_membership`, `updated_at`
2. **`blog_posts`** — `id, slug (unique), title, excerpt, category, author, date, read_time, cover, cover_alt, created_at`
3. **`leads`** — `id, name, email, phone, service, message, created_at`. A daily edge function purges rows older than 90 days.
4. **`page_visits`** — `id, path, user_agent, created_at`. Inserted on every page mount.

## Visitor tracking (real, not mocked)

- New hook `useTrackVisit()` inserts a row into `page_visits` on each route mount (deduped per session via `sessionStorage`).
- Admin Overview pulls last 30 days of rows, groups by day, shows: total visits, unique paths, and a line chart of the last 14 days.

## Auth and security posture

The current admin uses a hardcoded password (`1122`) checked in the browser — anyone who reads the bundled JS can find it. Two options:

- **Option A (now, fast):** Keep the password gate as-is. Tables get **public read** RLS so the site can render content for visitors, and **public write** RLS for the admin panel. This unblocks persistence today but is technically writable by anyone who knows the API contract. The site is small and low-risk, and you've said you want progress now.
- **Option B (later):** Migrate the admin to real Supabase email/password auth + a `user_roles` table. Tables become **public read, admin-only write**. This is the secure long-term setup.

I will implement **Option A** now (matches what you've been doing), and call this out in the security memory with a note to upgrade to Option B before the site grows. When you want Option B, it's a clean follow-up.

## Edge functions

- **`prune-leads`** — deletes leads older than 90 days. Can be invoked manually from the admin "Clear old leads" button, and scheduled via cron later.

## Files touched

- `src/context/AdminContext.tsx` — replace `useState` initializers with Supabase fetches; replace every setter with `update + upsert` to the database; keep the same exported API so other components don't change.
- `src/integrations/supabase/client.ts` — auto-generated when Cloud is enabled.
- New hook `src/hooks/useTrackVisit.ts` — called from `App.tsx`.
- `src/pages/admin/AdminDashboard.tsx` — Overview pulls real visits from DB, chart uses real data.
- `scripts/generate-sitemap.ts` — also fetches `blog_posts` from DB at build time so the sitemap reflects published posts.
- New migration for the four tables + RLS + a daily-purge SQL function.
- New edge function `supabase/functions/prune-leads/index.ts`.

## What does NOT change

- All page UI, routing, styling, and admin panel layout stay exactly the same.
- The admin login flow stays the same (`1122` password gate).
- Vercel deploy pipeline stays the same; sitemap still pre-generates.

## Trade-offs to know

- First load of any page now waits ~100-300ms for `site_settings` to fetch from the database. I'll show the page with sensible defaults while it loads (no flash of empty content).
- Visitor counts only start counting from the moment this ships — no historical backfill.
- Until Option B, the admin write API is technically open. Don't put truly sensitive data in the panel.

## Rollout

1. Enable Lovable Cloud.
2. Create migration (tables + RLS + purge function).
3. Seed `site_settings` with current defaults so the site renders on first load.
4. Refactor `AdminContext` to read/write the DB.
5. Add visitor tracking hook.
6. Wire `prune-leads` edge function + admin button.
7. Verify: edit something in admin → reload in incognito → change is still there.
