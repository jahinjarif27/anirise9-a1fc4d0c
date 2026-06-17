
-- 1. Private admin credentials table (service_role only)
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id integer PRIMARY KEY,
  hash text,
  salt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate existing hash/salt from site_settings.admin_auth
INSERT INTO public.admin_credentials (id, hash, salt, updated_at)
SELECT 1,
       NULLIF(admin_auth->>'hash', ''),
       NULLIF(admin_auth->>'salt', ''),
       now()
FROM public.site_settings
WHERE id = 1
ON CONFLICT (id) DO UPDATE
  SET hash = EXCLUDED.hash, salt = EXCLUDED.salt, updated_at = now()
WHERE EXCLUDED.hash IS NOT NULL;

-- Ensure row exists even if no prior hash
INSERT INTO public.admin_credentials (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- No public/anon/authenticated grants — only service_role
REVOKE ALL ON public.admin_credentials FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_credentials TO service_role;

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon/authenticated. service_role bypasses RLS.

-- 2. Drop the public admin_auth column from site_settings
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS admin_auth;

-- 3. Drop overly-permissive RLS policies
DROP POLICY IF EXISTS "site_settings public update" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings public insert" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings public delete" ON public.site_settings;

DROP POLICY IF EXISTS "blog_posts public insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts public update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts public delete" ON public.blog_posts;

DROP POLICY IF EXISTS "reviews public update" ON public.reviews;
DROP POLICY IF EXISTS "reviews public delete" ON public.reviews;

DROP POLICY IF EXISTS "leads public read" ON public.leads;
DROP POLICY IF EXISTS "leads public select" ON public.leads;
DROP POLICY IF EXISTS "leads public update" ON public.leads;
DROP POLICY IF EXISTS "leads public delete" ON public.leads;
DROP POLICY IF EXISTS "leads public insert" ON public.leads;
