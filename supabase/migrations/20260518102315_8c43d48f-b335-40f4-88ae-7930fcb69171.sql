ALTER TABLE public.page_visits ADD COLUMN IF NOT EXISTS visitor_id text;
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor_created ON public.page_visits (visitor_id, created_at);