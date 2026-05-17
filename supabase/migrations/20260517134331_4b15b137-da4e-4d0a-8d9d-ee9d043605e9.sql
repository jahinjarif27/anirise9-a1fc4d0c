ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cta_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cta_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_url text NOT NULL DEFAULT '';