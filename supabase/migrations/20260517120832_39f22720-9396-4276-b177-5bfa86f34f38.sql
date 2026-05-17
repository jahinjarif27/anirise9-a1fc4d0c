
-- site_settings: single row holding all editable content as JSON columns
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  appearance JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  home_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  section_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  page_location JSONB NOT NULL DEFAULT '{}'::jsonb,
  home_membership JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO public.site_settings (id) VALUES (1);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings public update"
  ON public.site_settings FOR UPDATE
  USING (true) WITH CHECK (true);

-- blog_posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  author TEXT NOT NULL DEFAULT 'AniRise Team',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time TEXT NOT NULL DEFAULT '5 min',
  cover TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts public read"   ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "blog_posts public insert" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_posts public update" ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "blog_posts public delete" ON public.blog_posts FOR DELETE USING (true);

-- leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads public insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads public read"   ON public.leads FOR SELECT USING (true);
CREATE POLICY "leads public delete" ON public.leads FOR DELETE USING (true);

-- page_visits: real visitor analytics
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX page_visits_created_at_idx ON public.page_visits (created_at DESC);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_visits public insert" ON public.page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "page_visits public read"   ON public.page_visits FOR SELECT USING (true);

-- Helper SQL function to purge old leads (called by edge function or manual button)
CREATE OR REPLACE FUNCTION public.purge_old_leads()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.leads WHERE created_at < (now() - INTERVAL '90 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
