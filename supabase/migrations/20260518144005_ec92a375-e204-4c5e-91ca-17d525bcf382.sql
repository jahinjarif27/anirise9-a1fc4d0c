UPDATE public.site_settings SET portfolio = (
  SELECT jsonb_agg(
    CASE
      WHEN x->>'id'='p1' THEN x || '{"category":"Ecommerce SEO","tag":"Ecommerce SEO"}'::jsonb
      WHEN x->>'id'='p2' THEN x || '{"category":"Website SEO","tag":"Website SEO"}'::jsonb
      WHEN x->>'id'='p3' THEN x || '{"category":"Website Development","tag":"Website Development"}'::jsonb
      ELSE x
    END
  ) FROM jsonb_array_elements(portfolio) x
) WHERE id=1;