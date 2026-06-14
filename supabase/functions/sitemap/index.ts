// Live sitemap edge function — Dribbble-style sitemap index with sub-sitemaps.
// Public endpoint (verify_jwt = false). Reads site_settings + blog_posts and
// emits an up-to-date sitemap — no rebuild needed when admin changes slugs.
//
// Layout (matches dribbble.com/sitemap.xml shape):
//   /sitemap.xml              → <sitemapindex> listing child sitemaps
//   /sitemap.xml?sub=pages    → <urlset> for built-in pages + legal
//   /sitemap.xml?sub=services → <urlset> for service pages
//   /sitemap.xml?sub=blog     → <urlset> for blog posts
//   /sitemap.xml?sub=portfolio→ <urlset> for portfolio + case studies
//   /sitemap.xml?sub=custom   → <urlset> for admin-created custom pages
//
// All XML is rendered through /sitemap.xsl for a clean in-browser view.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE_URL = 'https://anirise.com.bd';
const STYLESHEET = '/sitemap.xsl';

const BUILTIN_DEFAULT_SLUGS: Record<string, string> = {
  home: '',
  services: 'services',
  portfolio: 'portfolio',
  blog: 'blog',
  testimonials: 'testimonials',
  contact: 'contact',
  about: 'about',
  'case-studies': 'case-studies',
  'strategy-call': 'strategy-call',
};

const PRIORITY_DEFAULT: Record<string, string> = {
  home: '1.0', services: '0.9', portfolio: '0.9', blog: '0.8',
  testimonials: '0.6', contact: '0.7', about: '0.7',
  'case-studies': '0.8', 'strategy-call': '0.7',
};

const CHANGEFREQ_DEFAULT: Record<string, string> = {
  home: 'weekly', services: 'weekly', portfolio: 'monthly', blog: 'weekly',
  testimonials: 'monthly', contact: 'yearly', about: 'yearly',
  'case-studies': 'monthly', 'strategy-call': 'monthly',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const xmlHeaders = {
  ...cors,
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0, s-maxage=0',
};

function renderUrlset(entries: Entry[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>\n` +
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
    `\n</urlset>\n`
  );
}

function renderSitemapIndex(children: Array<{ name: string; lastmod: string }>): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    children
      .map(
        (c) =>
          `  <sitemap>\n` +
          `    <loc>${esc(SITE_URL + '/sitemap.xml?sub=' + c.name)}</loc>\n` +
          `    <lastmod>${esc(c.lastmod)}</lastmod>\n` +
          `  </sitemap>`,
      )
      .join('\n') +
    `\n</sitemapindex>\n`
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = new URL(req.url);
    const sub = url.searchParams.get('sub');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const sb = createClient(SUPABASE_URL, KEY);

    const [settingsRes, postsRes] = await Promise.all([
      sb.from('site_settings').select('seo, custom_pages, portfolio, case_studies, content, updated_at').eq('id', 1).maybeSingle(),
      sb.from('blog_posts').select('slug, date'),
    ]);

    const s: any = settingsRes.data ?? {};
    const pageSeo: Record<string, any> = (s.seo?.pageSeo ?? {}) as any;
    const customPages: any[] = Array.isArray(s.custom_pages) ? s.custom_pages : [];
    const portfolio: any[] = Array.isArray(s.portfolio) ? s.portfolio : [];
    const caseStudies: any[] = Array.isArray(s.case_studies) ? s.case_studies : [];
    const svcList: any[] = Array.isArray(s.content?.servicesList) ? s.content.servicesList : [];
    const today = new Date().toISOString().slice(0, 10);
    const settingsDate = s.updated_at ? String(s.updated_at).slice(0, 10) : today;

    // Effective parent slugs
    const blogParent = (pageSeo.blog?.slug?.trim() || 'blog').replace(/^\/+/, '');
    const portfolioParent = (pageSeo.portfolio?.slug?.trim() || 'portfolio').replace(/^\/+/, '');

    // ---- Build each sub-set ----
    const pagesEntries: Entry[] = [];
    for (const key of Object.keys(BUILTIN_DEFAULT_SLUGS)) {
      const ps = pageSeo[key] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const slug = (ps.slug?.trim() || BUILTIN_DEFAULT_SLUGS[key]).replace(/^\/+/, '');
      pagesEntries.push({
        path: slug ? `/${slug}` : '/',
        changefreq: ps.changefreq || CHANGEFREQ_DEFAULT[key],
        priority: ps.priority || PRIORITY_DEFAULT[key],
        lastmod: settingsDate,
      });
    }
    // Seeded legal pages
    const customSlugs = new Set(customPages.map((p: any) => (p?.slug || '').replace(/^\/+/, '')));
    for (const legal of [
      { slug: 'privacy-policy' },
      { slug: 'terms-of-service' },
      { slug: 'refund-policy' },
    ] as const) {
      if (customSlugs.has(legal.slug)) continue;
      pagesEntries.push({ path: `/${legal.slug}`, changefreq: 'yearly', priority: '0.3', lastmod: settingsDate });
    }

    const servicesEntries: Entry[] = [];
    for (const sv of svcList) {
      if (sv.published === false) continue;
      const ps = pageSeo[`svc:${sv.slug}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const tail = (sv.urlSlug?.trim() || sv.slug || '').replace(/^\/+/, '');
      if (!tail) continue;
      servicesEntries.push({
        path: `/services/${tail}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.9',
        lastmod: settingsDate,
      });
    }

    const blogEntries: Entry[] = [];
    if (Array.isArray(postsRes.data)) {
      for (const p of postsRes.data) {
        const ps = pageSeo[`blog/${p.slug}`] || {};
        if (ps.status === 'draft' || ps.robots === 'noindex') continue;
        blogEntries.push({
          path: `/${blogParent}/${p.slug}`,
          lastmod: p.date || settingsDate,
          changefreq: ps.changefreq || 'monthly',
          priority: ps.priority || '0.7',
        });
      }
    }

    const portfolioEntries: Entry[] = [];
    for (const it of portfolio) {
      const ps = pageSeo[`proj:${it.id}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const slugTail = (it.slug || it.id || '').replace(/^\/+/, '');
      if (!slugTail) continue;
      portfolioEntries.push({
        path: `/${portfolioParent}/${slugTail}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.7',
        lastmod: settingsDate,
      });
    }
    for (const c of caseStudies) {
      if (!c?.id) continue;
      const ps = pageSeo[`case:${c.id}`] || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      portfolioEntries.push({
        path: `/case-studies/${c.id}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.7',
        lastmod: settingsDate,
      });
    }

    const customEntries: Entry[] = [];
    for (const p of customPages) {
      if (!p?.published) continue;
      const ps = p.seo || {};
      if (ps.status === 'draft' || ps.robots === 'noindex') continue;
      const slug = (p.slug || '').replace(/^\/+/, '');
      if (!slug) continue;
      customEntries.push({
        path: `/${p.parent ? p.parent + '/' : ''}${slug}`,
        changefreq: ps.changefreq || 'monthly',
        priority: ps.priority || '0.6',
        lastmod: settingsDate,
      });
    }

    // ---- Serve requested view ----
    const map: Record<string, Entry[]> = {
      pages: pagesEntries,
      services: servicesEntries,
      blog: blogEntries,
      portfolio: portfolioEntries,
      custom: customEntries,
    };

    if (sub && map[sub]) {
      return new Response(renderUrlset(map[sub]), { headers: xmlHeaders });
    }

    // Root → sitemap index. Skip empty sub-sitemaps for a clean index.
    const children: Array<{ name: string; lastmod: string }> = [];
    for (const name of ['pages', 'services', 'blog', 'portfolio', 'custom']) {
      if (map[name].length > 0) children.push({ name, lastmod: settingsDate });
    }
    return new Response(renderSitemapIndex(children), { headers: xmlHeaders });
  } catch (e) {
    console.error('sitemap error', e);
    return new Response(`<!-- sitemap error: ${(e as Error).message} -->`, {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
});
