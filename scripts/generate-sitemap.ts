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

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/services", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/about", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/portfolio", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/testimonials", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/contact", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/blog", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/strategy-call", changefreq: "monthly", priority: "0.8", lastmod: today },
  { path: "/services/website-seo", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/services/ecommerce-seo", changefreq: "monthly", priority: "0.9", lastmod: today },
  { path: "/services/graphics-design", changefreq: "monthly", priority: "0.9", lastmod: today },
];

const blogEntries: SitemapEntry[] = initialPosts.map((p) => ({
  path: `/blog/${p.slug}`,
  changefreq: "monthly",
  priority: "0.7",
  lastmod: p.date || today,
}));

async function fetchDynamicEntries(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=portfolio,case_studies,custom_pages`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      portfolio?: Array<{ id: string }>;
      case_studies?: Array<{ id: string }>;
      custom_pages?: Array<{ slug: string; parent?: string; published?: boolean }>;
    }>;
    const row = rows[0] || {};
    const out: SitemapEntry[] = [];
    (row.portfolio || []).forEach((p) => p?.id && out.push({ path: `/portfolio/${p.id}`, changefreq: "monthly", priority: "0.7", lastmod: today }));
    (row.case_studies || []).forEach((c) => c?.id && out.push({ path: `/case-studies/${c.id}`, changefreq: "monthly", priority: "0.7", lastmod: today }));
    (row.custom_pages || []).filter((p) => p.published && p.slug).forEach((p) =>
      out.push({ path: `/${p.parent ? p.parent + "/" : ""}${p.slug}`, changefreq: "monthly", priority: "0.6", lastmod: today }),
    );
    return out;
  } catch {
    return [];
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
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const dynamicEntries = await fetchDynamicEntries();
  const entries = [...staticEntries, ...blogEntries, ...dynamicEntries];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
