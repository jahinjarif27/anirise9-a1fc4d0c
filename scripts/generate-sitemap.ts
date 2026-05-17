// Generates public/sitemap.xml — runs via `predev` and `prebuild` hooks.
// Vercel serves public/ files at the root, so /sitemap.xml resolves to this output.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { initialPosts } from "../src/data/blog";

const BASE_URL = "https://anirise9.vercel.app";

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

const entries = [...staticEntries, ...blogEntries];

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

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
