// Generates public/sitemap.xml — runs via `predev` and `prebuild` hooks.
// Vercel serves public/ files at the root, so /sitemap.xml resolves to this output.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { initialPosts } from "../src/data/blog";

const BASE_URL = "https://anirise.com.bd";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xlrmuspmekwbtnyeutxz.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhscm11c3BtZWt3YnRueWV1dHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTUzMzUsImV4cCI6MjA5NDU5MTMzNX0.7hnEy_HPG4rzOZBeF7k6iPP0c51ohnoedXAsTA_Wisw";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const STATIC_PAGE_KEYS: Array<{ key: string; defaultSlug: string; changefreq: SitemapEntry["changefreq"]; priority: string }> = [
  { key: "home",          defaultSlug: "",              changefreq: "weekly",  priority: "1.0" },
  { key: "services",      defaultSlug: "services",      changefreq: "monthly", priority: "0.9" },
  { key: "about",         defaultSlug: "about",         changefreq: "monthly", priority: "0.8" },
  { key: "portfolio",     defaultSlug: "portfolio",     changefreq: "monthly", priority: "0.8" },
  { key: "testimonials",  defaultSlug: "testimonials",  changefreq: "monthly", priority: "0.7" },
  { key: "contact",       defaultSlug: "contact",       changefreq: "monthly", priority: "0.8" },
  { key: "blog",          defaultSlug: "blog",          changefreq: "weekly",  priority: "0.9" },
  { key: "strategy-call", defaultSlug: "strategy-call", changefreq: "monthly", priority: "0.8" },
];

const serviceFallback: SitemapEntry[] = [
  { path: "/services/website-seo", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/services/ecommerce-seo", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/services/graphics-design", changefreq: "monthly", priority: "0.9", lastmod: today },
];

const blogFallback: SitemapEntry[] = initialPosts.map((p) => ({
  path: `/blog/${p.slug}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: p.date || today,
}));

async function fetchDynamicEntries(): Promise<{
  pageEntries: SitemapEntry[];
  extras: SitemapEntry[];
  services: SitemapEntry[];
  blog: SitemapEntry[];
}> {
  const pageEntries: SitemapEntry[] = [];
  const extras: SitemapEntry[] = [];
  let services: SitemapEntry[] = serviceFallback;
  let blog: SitemapEntry[] = blogFallback;
  try {
    const [settingsRes, postsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=portfolio,case_studies,custom_pages,seo,content,updated_at`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,date`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
      ),
    ]);
    if (!settingsRes.ok) {
      for (const p of STATIC_PAGE_KEYS) {
        pageEntries.push({ path: p.defaultSlug ? `/${p.defaultSlug}` : "/", changefreq: p.changefreq, priority: p.priority, lastmod: today });
      }
      return { pageEntries, extras, services, blog };
    }
    const rows = (await settingsRes.json()) as Array<{
      portfolio?: Array<{ id: string; slug?: string }>;
      case_studies?: Array<{ id: string }>;
      custom_pages?: Array<{ slug: string; parent?: string; published?: boolean; seo?: any }>;
      seo?: { pageSeo?: Record<string, any> };
      content?: { servicesList?: Array<{ slug: string; urlSlug?: string; published?: boolean }> };
      updated_at?: string;
    }>;
    const row = rows[0] || {};
    const pageSeo = row.seo?.pageSeo || {};
    const settingsDate = row.updated_at ? row.updated_at.slice(0, 10) : today;

    // Built-in pages — honor admin slug/status/changefreq/priority
    for (const p of STATIC_PAGE_KEYS) {
      const cfg = pageSeo[p.key] || {};
      if (cfg.status === "draft") continue;
      if (cfg.robots === "noindex") continue;
      const slug = (cfg.slug && String(cfg.slug).trim()) ? String(cfg.slug).trim().replace(/^\/+/, "") : p.defaultSlug;
      pageEntries.push({
        path: slug ? `/${slug}` : "/",
        changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || p.changefreq,
        priority: cfg.priority || p.priority,
        lastmod: settingsDate,
      });
    }

    // Services — admin-managed list (with pageSeo overrides keyed `service:<slug>`)
    const servicesParent = (pageSeo.services?.slug?.trim() || "services").replace(/^\/+/, "");
    const svcList = row.content?.servicesList || [];
    if (svcList.length) {
      services = svcList
        .filter((s) => s.published !== false)
        .map((s) => {
          const cfg = pageSeo[`svc:${s.slug}`] || {};
          if (cfg.status === "draft" || cfg.robots === "noindex") return null;
          const tail = (s.urlSlug && s.urlSlug.trim()) || s.slug;
          return {
            path: `/${servicesParent}/${tail}`,
            changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || "monthly",
            priority: cfg.priority || "0.9",
            lastmod: settingsDate,
          } as SitemapEntry;
        })
        .filter(Boolean) as SitemapEntry[];
    }

    // Effective parent slugs (honor admin overrides)
    const blogParent = (pageSeo.blog?.slug?.trim() || "blog").replace(/^\/+/, "");
    const portfolioParent = (pageSeo.portfolio?.slug?.trim() || "portfolio").replace(/^\/+/, "");
    const caseStudiesParent = (pageSeo["case-studies"]?.slug?.trim() || "case-studies").replace(/^\/+/, "");

    // Blog posts from DB (with pageSeo overrides keyed `blog/<slug>`)
    if (postsRes.ok) {
      const dbPosts = (await postsRes.json()) as Array<{ slug: string; date?: string }>;
      if (Array.isArray(dbPosts) && dbPosts.length) {
        blog = dbPosts
          .map((p) => {
            const cfg = pageSeo[`blog/${p.slug}`] || {};
            if (cfg.status === "draft" || cfg.robots === "noindex") return null;
            const publicSlug = (cfg.slug && String(cfg.slug).trim()) ? String(cfg.slug).trim().replace(/^\/+/, "") : p.slug;
            return {
              path: `/${blogParent}/${publicSlug}`,
              changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || "monthly",
              priority: cfg.priority || "0.7",
              lastmod: p.date || settingsDate,
            } as SitemapEntry;
          })
          .filter(Boolean) as SitemapEntry[];
      }
    }

    // Portfolio
    (row.portfolio || []).forEach((p) => {
      if (!p?.id) return;
      const cfg = pageSeo[`proj:${p.id}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") return;
      const tail = (p.slug && p.slug.trim()) || p.id;
      extras.push({
        path: `/${portfolioParent}/${tail}`,
        changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || "monthly",
        priority: cfg.priority || "0.7",
        lastmod: settingsDate,
      });
    });

    // Case studies
    (row.case_studies || []).forEach((c) => {
      if (!c?.id) return;
      const cfg = pageSeo[`case:${c.id}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") return;
      const tail = (cfg.slug && String(cfg.slug).trim()) ? String(cfg.slug).trim().replace(/^\/+/, "") : c.id;
      extras.push({
        path: `/${caseStudiesParent}/${tail}`,
        changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || "monthly",
        priority: cfg.priority || "0.7",
        lastmod: settingsDate,
      });
    });

    // Custom pages (with parent + per-page seo overrides)
    (row.custom_pages || []).filter((p) => p.published && p.slug).forEach((p) => {
      const cfg = p.seo || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") return;
      const slug = String(p.slug).replace(/^\/+/, "");
      extras.push({
        path: `/${p.parent ? p.parent + "/" : ""}${slug}`,
        changefreq: (cfg.changefreq as SitemapEntry["changefreq"]) || "monthly",
        priority: cfg.priority || "0.6",
        lastmod: settingsDate,
      });
    });

    // Seeded legal pages — always present even before admin saves
    const existingCustomSlugs = new Set((row.custom_pages || []).map((p) => String(p.slug || "").replace(/^\/+/, "")));
    for (const legal of [
      { slug: "privacy-policy" },
      { slug: "terms-of-service" },
      { slug: "refund-policy" },
    ]) {
      if (existingCustomSlugs.has(legal.slug)) continue;
      extras.push({
        path: `/${legal.slug}`,
        changefreq: "yearly",
        priority: "0.3",
        lastmod: settingsDate,
      });
    }

    return { pageEntries, extras, services, blog };
  } catch {
    for (const p of STATIC_PAGE_KEYS) {
      pageEntries.push({ path: p.defaultSlug ? `/${p.defaultSlug}` : "/", changefreq: p.changefreq, priority: p.priority, lastmod: today });
    }
    return { pageEntries, extras, services, blog };
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const { pageEntries, extras, services, blog } = await fetchDynamicEntries();
  const entries = [...pageEntries, ...services, ...blog, ...extras];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();

