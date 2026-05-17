CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  quote text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews public insert" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews public update" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "reviews public delete" ON public.reviews FOR DELETE USING (true);
CREATE INDEX idx_reviews_approved_created ON public.reviews(approved, created_at DESC);