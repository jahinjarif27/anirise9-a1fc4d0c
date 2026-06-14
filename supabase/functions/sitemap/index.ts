// Live sitemap edge function. Reads admin settings + blog posts on every request,
// so admin sitemap edits and page/slug/blog changes are reflected without rebuilds.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SITE_URL = 'https://anirise.com.bd';
const STYLESHEET = '?xsl=1';

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
  'content-type': 'application/xml; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0, s-maxage=0',
  'X-Content-Type-Options': 'nosniff',
};

function normalizeSiteUrl(value?: string): string {
  const base = (value || SITE_URL).trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(base) ? base : SITE_URL;
}

function isSafeManualSitemap(xml: string): boolean {
  const trimmed = xml.trim();
  return trimmed.length > 0 &&
    /<(urlset|sitemapindex)\b/i.test(trimmed) &&
    !/<!DOCTYPE|<!ENTITY/i.test(trimmed);
}

function attachStylesheet(xml: string): string {
  const clean = xml.replace(/<\?xml-stylesheet[\s\S]*?\?>\s*/gi, '').trim();
  const declaration = clean.match(/^<\?xml[^?]*\?>\s*/i)?.[0] || '<?xml version="1.0" encoding="UTF-8"?>\n';
  const body = clean.startsWith(declaration) ? clean.slice(declaration.length) : clean;
  return `${declaration}${declaration.endsWith('\n') ? '' : '\n'}<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>\n${body}\n`;
}

function renderXsl(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>AniRise XML Sitemap</title>
        <style>
          *{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Arial,sans-serif;line-height:1.5}header{background:#0f172a;color:#f8fafc;padding:28px 24px;border-bottom:4px solid #6366f1}.wrap{max-width:1120px;margin:0 auto}h1{margin:0;font-size:24px;letter-spacing:0;font-weight:750}.summary{margin-top:6px;color:#cbd5e1;font-size:13px}main{max-width:1120px;margin:0 auto;padding:24px}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.06)}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:13px 16px;border-bottom:1px solid #eef2f7;vertical-align:middle}th{background:#f8fafc;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:.04em;font-weight:700}tr:last-child td{border-bottom:0}a{color:#2563eb;text-decoration:none;overflow-wrap:anywhere}a:hover{text-decoration:underline}.muted{color:#64748b}.num{width:64px;color:#64748b}.empty{padding:24px;color:#64748b}@media(max-width:720px){main{padding:14px}th:nth-child(3),td:nth-child(3),th:nth-child(4),td:nth-child(4){display:none}.num{width:42px}th,td{padding:11px 10px}}
        </style>
      </head>
      <body>
        <header><div class="wrap"><h1>XML Sitemap</h1><div class="summary">Live indexable URLs for AniRise</div></div></header>
        <main>
          <div class="panel">
            <xsl:choose>
              <xsl:when test="s:urlset/s:url">
                <table>
                  <thead><tr><th class="num">#</th><th>URL</th><th>Last modified</th><th>Change frequency</th><th>Priority</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="s:urlset/s:url">
                      <tr><td class="num"><xsl:value-of select="position()"/></td><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td><td class="muted"><xsl:value-of select="s:lastmod"/></td><td class="muted"><xsl:value-of select="s:changefreq"/></td><td class="muted"><xsl:value-of select="s:priority"/></td></tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              <xsl:when test="s:sitemapindex/s:sitemap">
                <table>
                  <thead><tr><th class="num">#</th><th>Sitemap</th><th>Last modified</th></tr></thead>
                  <tbody>
                    <xsl:for-each select="s:sitemapindex/s:sitemap">
                      <tr><td class="num"><xsl:value-of select="position()"/></td><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td><td class="muted"><xsl:value-of select="s:lastmod"/></td></tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              <xsl:otherwise><div class="empty">No sitemap URLs found.</div></xsl:otherwise>
            </xsl:choose>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
}

function renderUrlset(entries: Entry[], siteUrl: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map((e) =>
        [
          `  <url>`,
          `    <loc>${esc(siteUrl + e.path)}</loc>`,
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

function renderSitemapIndex(children: Array<{ name: string; lastmod: string }>, siteUrl: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    children
      .map(
        (c) =>
          `  <sitemap>\n` +
          `    <loc>${esc(siteUrl + '/sitemap.xml?sub=' + c.name)}</loc>\n` +
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
    if (url.searchParams.get('xsl') === '1') {
      return new Response(renderXsl(), {
        headers: { ...cors, 'content-type': 'application/xslt+xml; charset=utf-8', 'Cache-Control': 'no-store, max-age=0, s-maxage=0' },
      });
    }
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
    const siteUrl = normalizeSiteUrl(s.seo?.canonicalUrl);
    const manualSitemap = typeof s.seo?.sitemap === 'string' ? s.seo.sitemap.trim() : '';
    const useManual = s.seo?.autoSitemap === false && isSafeManualSitemap(manualSitemap);
    if (useManual && (!sub || sub === 'all')) {
      return new Response(attachStylesheet(manualSitemap), { headers: xmlHeaders });
    }
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
      all: [...pagesEntries, ...servicesEntries, ...blogEntries, ...portfolioEntries, ...customEntries],
    };

    if (sub && map[sub]) {
      return new Response(renderUrlset(map[sub], siteUrl), { headers: xmlHeaders });
    }

    // Root → sitemap index. Skip empty sub-sitemaps for a clean index.
    const children: Array<{ name: string; lastmod: string }> = [];
    for (const name of ['pages', 'services', 'blog', 'portfolio', 'custom']) {
      if (map[name].length > 0) children.push({ name, lastmod: settingsDate });
    }
    return new Response(renderSitemapIndex(children, siteUrl), { headers: xmlHeaders });
  } catch (e) {
    console.error('sitemap error', e);
    return new Response(`<!-- sitemap error: ${(e as Error).message} -->`, {
      status: 500,
      headers: { ...cors, 'content-type': 'application/xml; charset=utf-8' },
    });
  }
});
