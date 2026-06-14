ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();