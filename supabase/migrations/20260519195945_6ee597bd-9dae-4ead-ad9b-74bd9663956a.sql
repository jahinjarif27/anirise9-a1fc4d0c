-- Lock down RLS: drop all wide-open public write/destructive policies.
-- Public visitors keep only: read site_settings, read approved reviews, read blog_posts, insert page_visits.
-- All mutations + sensitive reads will go through edge functions using the service role.

-- ===== leads =====
DROP POLICY IF EXISTS "leads public read"   ON public.leads;
DROP POLICY IF EXISTS "leads public insert" ON public.leads;
DROP POLICY IF EXISTS "leads public delete" ON public.leads;
-- No public policies remain on leads. RLS stays enabled, so anon has zero access.

-- ===== reviews =====
DROP POLICY IF EXISTS "reviews public insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews public update" ON public.reviews;
DROP POLICY IF EXISTS "reviews public delete" ON public.reviews;
DROP POLICY IF EXISTS "reviews public read"   ON public.reviews;
-- Public can only read APPROVED reviews now.
CREATE POLICY "reviews public read approved"
  ON public.reviews FOR SELECT
  USING (approved = true);

-- ===== blog_posts =====
DROP POLICY IF EXISTS "blog_posts public insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts public update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts public delete" ON public.blog_posts;
-- Keep "blog_posts public read" so the blog page works.

-- ===== site_settings =====
DROP POLICY IF EXISTS "site_settings public update" ON public.site_settings;
-- Keep "site_settings public read" so the site renders.

-- ===== page_visits =====
DROP POLICY IF EXISTS "page_visits public read" ON public.page_visits;
-- Keep "page_visits public insert" so visit tracking still works.

-- ===== purge_old_leads function =====
-- Revoke EXECUTE from anon/authenticated; only service role (edge functions) may call it.
REVOKE ALL ON FUNCTION public.purge_old_leads() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_old_leads() FROM anon;
REVOKE ALL ON FUNCTION public.purge_old_leads() FROM authenticated;