// Live robots.txt edge function.
// Reads admin-edited seo.robotsTxt from site_settings; falls back to a safe default.
import { createClient } from 'npm:@supabase/supabase-js@2';

const FALLBACK = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*

User-agent: Googlebot
Allow: /
Disallow: /admin

User-agent: Bingbot
Allow: /
Disallow: /admin

Sitemap: https://anirise.com.bd/sitemap.xml
`;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const sb = createClient(SUPABASE_URL, KEY);

    const { data } = await sb.from('site_settings').select('seo').eq('id', 1).maybeSingle();
    const body = (data?.seo as any)?.robotsTxt?.trim();
    const out = body && body.length > 0 ? body + '\n' : FALLBACK;

    return new Response(out, {
      headers: {
        ...cors,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0, s-maxage=0',
      },
    });
  } catch (e) {
    console.error('robots error', e);
    return new Response(FALLBACK, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
});
