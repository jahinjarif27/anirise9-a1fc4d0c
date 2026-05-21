// Phase 5 — live sitemap edge function.
// Public endpoint (verify_jwt = false). Reads site_settings + blog_posts and
// emits an up-to-date sitemap.xml — no rebuild needed when admin changes slugs.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE_URL = 'https://anirise.com.bd';

const BUILTIN_DEFAULT_SLUGS: Record<string, string> = {
  home: '',
  services: 'services',
  portfolio: 'portfolio',
  blog: 'blog',
  testimonials: 'testimonials',
  contact: 'contact',
  about: 'about',
  'strategy-call': 'strategy-call',
};

const PRIORITY_DEFAULT: Record<string, string> = {
  home: '1.0', services: '0.9', portfolio: '0.9', blog: '0.8',
  testimonials: '0.6', contact: '0.7', about: '0.7', 'strategy-call': '0.7',
};

const CHANGEFREQ_DEFAULT: Record<string, string> = {
  home: 'weekly', services: 'weekly', portfolio: 'monthly', blog: 'weekly',
  testimonials: 'monthly', contact: 'yearly', about: 'yearly', 'strategy-call': 'monthly',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };

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

    const [settingsRes, postsRes] = await Promise.all([
      sb.from('site_settings').select('seo, custom_pages, portfolio, case_studies, content').eq('id', 1).maybeSingle(),
      sb.from('blog_posts').select('slug, date'),
    ]);

    const s: any = settingsRes.data ?? {};
    const pageSeo: Record<string, any> = (s.seo?.pageSeo ?? {}) as any;
    const customPages: any[] = Array.isArray(s.custom_pages) ? s.custom_pages : [];
    const portfolio: any[] = Array.isArray(s.portfolio) ? s.portfolio : [];
    const caseStudies: any[] = Array.isArray(s.case_studies) ? s.case_studies : [];
    const svcList: any[] = Array.isArray(s.content?.servicesList) ? s.content.servicesList : [];

    // NOTE: We intentionally ignore any saved `seo.sitemap` blob in the DB.
    // Always regenerate live from real data so admin changes reflect instantly
    // and stray text/typos in the saved blob never leak into the served XML.

    const entries: Entry[] = [];

    // Built-in pages
    for (const key of Object.keys(BUILTIN_DEFAULT_SLUGS)) {
      const ps = pageSeo[key] || {};
      if (ps.status === 'draft') continue;
      if (ps.robots === 'noindex') continue;
      const slug = (ps.slug?.trim() || BUILTIN_DEFAULT_SLUGS[key]).replace(/^\/+/, '');
      entries.push({
        path: slug ? `/${slug}` : '/',
        changefreq: ps.changefreq || CHANGEFREQ_DEFAULT[key],
        priority: ps.priority || PRIORITY_DEFAULT[key],
      });
    }

    // Effective parent slugs
    const blogParent = (pageSeo.blog?.slug?.trim() || 'blog').replace(/^\/+/, '');
    const portfolioParent = (pageSeo.portfolio?.slug?.trim() || 'portfolio').replace(/^\/+/, '');

    // Services (admin-managed)
    for (const sv of svcList) {
      if (sv.published === false) continue;
      const ps = pageSeo[`service:${sv.slug}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const tail = (sv.urlSlug?.trim() || sv.slug || '').replace(/^\/+/, '');
      if (!tail) continue;
      entries.push({
        path: `/services/${tail}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.9',
      });
    }

    // Blog posts
    if (Array.isArray(postsRes.data)) {
      for (const p of postsRes.data) {
        const ps = pageSeo[`blog/${p.slug}`] || {};
        if (ps.status === 'draft' || ps.robots === 'noindex') continue;
        entries.push({
          path: `/${blogParent}/${p.slug}`,
          lastmod: p.date || undefined,
          changefreq: ps.changefreq || 'monthly',
          priority: ps.priority || '0.7',
        });
      }
    }

    // Custom pages
    for (const p of customPages) {
      if (!p?.published) continue;
      const ps = p.seo || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const slug = (p.slug || '').replace(/^\/+/, '');
      if (!slug) continue;
      entries.push({
        path: `/${p.parent ? p.parent + '/' : ''}${slug}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.6',
      });
    }

    // Portfolio items
    for (const it of portfolio) {
      const ps = pageSeo[`proj:${it.id}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const slugTail = (it.slug || it.id || '').replace(/^\/+/, '');
      if (!slugTail) continue;
      entries.push({
        path: `/${portfolioParent}/${slugTail}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.7',
      });
    }

    // Case studies
    for (const c of caseStudies) {
      const ps = pageSeo[`case:${c.id}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      if (!c?.id) continue;
      entries.push({
        path: `/case-studies/${c.id}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.7',
      });
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      entries
        .map((e) =>
          [
            `  <url>`,
            `    <loc>${esc(SITE_URL + e.path)}</loc>`,
            e.lastmod ? `    <lastmod>${esc(e.lastmod)}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${esc(e.changefreq)}</changefreq>` : null,
            e.priority ? `    <priority>${esc(e.priority)}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join('\n'),
        )
        .join('\n') +
      `\n</urlset>\n`;

    return new Response(xml, {
      headers: {
        ...cors,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0, s-maxage=0',
      },
    });
  } catch (e) {
    console.error('sitemap error', e);
    return new Response(`<!-- sitemap error: ${(e as Error).message} -->`, {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
});
