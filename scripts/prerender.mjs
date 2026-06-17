// Post-build prerender — generates per-route static HTML in dist/.
// Bots see real H1, internal links, title, meta description, canonical, og:* tags.
// React mounts to a separate #root; an inline script removes the SEO shell on mount.
// No Puppeteer — pure data + template. Safe on Vercel builds.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";

const BASE_URL = "https://anirise.com.bd";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xlrmuspmekwbtnyeutxz.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhscm11c3BtZWt3YnRueWV1dHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTUzMzUsImV4cCI6MjA5NDU5MTMzNX0.7hnEy_HPG4rzOZBeF7k6iPP0c51ohnoedXAsTA_Wisw";

const DIST = resolve("dist");
const TEMPLATE_PATH = join(DIST, "index.html");

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(s) {
  return String(s ?? "").trim().replace(/^\/+|\/+$/g, "");
}

async function fetchData() {
  try {
    const [settingsRes, postsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=portfolio,case_studies,custom_pages,seo,content`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,date`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
      ),
    ]);
    const settings = settingsRes.ok ? ((await settingsRes.json())[0] || {}) : {};
    const posts = postsRes.ok ? await postsRes.json() : [];
    return { settings, posts };
  } catch (e) {
    console.warn("[prerender] data fetch failed, using fallback:", e?.message);
    return { settings: {}, posts: [] };
  }
}

const STATIC_PAGES = [
  { key: "home",          slug: "",              h1: "AniRise — Visibility · Growth · Success",
    title: "AniRise — Visibility · Growth · Success | SEO & Web Agency",
    description: "AniRise helps brands rise online with SEO, ecommerce SEO, web development, and digital marketing." },
  { key: "about",         slug: "about",         h1: "About AniRise",
    title: "About AniRise — SEO & Digital Growth Agency in Bangladesh",
    description: "Learn about AniRise — our mission, team, and approach to SEO, web development, and digital marketing." },
  { key: "services",      slug: "our-services",  h1: "Our Services",
    title: "Our Services — SEO, Web Development, Graphics & Marketing | AniRise",
    description: "Explore AniRise services: SEO, ecommerce SEO, website development, graphics design, social media marketing, and Google Ads." },
  { key: "portfolio",     slug: "portfolio",     h1: "Our Portfolio",
    title: "Portfolio — Recent Projects & Case Studies | AniRise",
    description: "Recent SEO, web development, and design projects delivered by AniRise for clients across industries." },
  { key: "blog",          slug: "blog",          h1: "AniRise Blog",
    title: "Blog — SEO Tips, Marketing & Web Development Insights | AniRise",
    description: "Read AniRise blog for the latest SEO tips, web development guides, and digital marketing insights." },
  { key: "testimonials",  slug: "testimonials",  h1: "Client Testimonials",
    title: "Client Testimonials & Reviews | AniRise",
    description: "Real reviews from AniRise clients about our SEO, web development, and digital marketing services." },
  { key: "contact",       slug: "contact",       h1: "Contact AniRise",
    title: "Contact AniRise — Get In Touch For SEO & Web Services",
    description: "Contact AniRise for SEO, web development, ecommerce, and digital marketing services in Bangladesh and worldwide." },
  { key: "strategy-call", slug: "strategy-call", h1: "Book A Free Strategy Call",
    title: "Book A Free Strategy Call | AniRise",
    description: "Book a free 30-minute strategy call with AniRise experts to plan your SEO, web, or digital marketing roadmap." },
];

function resolveStaticSlug(p, pageSeo) {
  const cfg = pageSeo[p.key] || {};
  const custom = clean(cfg.slug);
  return custom || p.slug;
}

function applySeoOverride(base, cfg) {
  return {
    ...base,
    title: (cfg?.metaTitle && cfg.metaTitle.trim()) || base.title,
    description: (cfg?.metaDescription && cfg.metaDescription.trim()) || base.description,
    h1: (cfg?.h1 && cfg.h1.trim()) || base.h1,
    ogImage: (cfg?.ogImage && cfg.ogImage.trim()) || base.ogImage || "",
  };
}

function buildNavLinks(navItems, services, parents) {
  const items = navItems
    .map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`)
    .join("");
  const svcs = services
    .map((s) => `<li><a href="/${esc(parents.services)}/${esc(s.slug)}">${esc(s.title)}</a></li>`)
    .join("");
  return `<nav aria-label="Primary"><ul>${items}</ul></nav>
<nav aria-label="Services"><h2>All Services</h2><ul>${svcs}</ul></nav>`;
}

function buildFooter(navItems, services, posts, parents) {
  const navLinks = navItems.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join(" · ");
  const svcLinks = services.map((s) => `<a href="/${esc(parents.services)}/${esc(s.slug)}">${esc(s.title)}</a>`).join(" · ");
  const blogLinks = posts.slice(0, 6).map((p) => `<a href="/${esc(parents.blog)}/${esc(p.slug)}">${esc(p.title || p.slug)}</a>`).join(" · ");
  return `<footer><h2>Sitemap</h2>
<p><strong>Pages:</strong> ${navLinks}</p>
<p><strong>Services:</strong> ${svcLinks}</p>
${blogLinks ? `<p><strong>Recent Posts:</strong> ${blogLinks}</p>` : ""}
<p><strong>Legal:</strong> <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-of-service">Terms of Service</a> · <a href="/refund-policy">Refund Policy</a></p>
<p>&copy; ${new Date().getFullYear()} AniRise. All rights reserved.</p>
</footer>`;
}

function renderSeoShell({ h1, description, bodyExtra, navHtml, footerHtml }) {
  // Static SEO content for crawlers. Positioned offscreen so humans never see a FOUC
  // before React mounts. Bots parsing raw HTML still see full content + links.
  // The cleanup script removes it once React mounts to #root.
  return `<div id="seo-shell" aria-hidden="true" style="position:absolute;left:-99999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;clip:rect(0 0 0 0);clip-path:inset(50%)">
<header>${navHtml}</header>
<main>
<h1>${esc(h1)}</h1>
<p>${esc(description)}</p>
${bodyExtra || ""}
</main>
${footerHtml}
</div>`;
}

function rewriteHead(template, { title, description, canonical, ogImage, ogType = "website" }) {
  let html = template;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);

  // Description
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(description)}">`);
  } else {
    html = html.replace(/<\/head>/i, `  <meta name="description" content="${esc(description)}">\n  </head>`);
  }

  // Canonical + OG + Twitter — inject before </head>, removing any existing
  html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<meta[^>]+property=["']og:(title|description|url|image|type)["'][^>]*>/gi, "");
  html = html.replace(/<meta[^>]+name=["']twitter:(card|title|description|image)["'][^>]*>/gi, "");

  const ogAbs = ogImage ? (/^https?:\/\//i.test(ogImage) ? ogImage : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`) : "";
  const seoTags = [
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="${esc(ogType)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    ogAbs ? `<meta property="og:image" content="${esc(ogAbs)}">` : null,
    `<meta name="twitter:card" content="${ogAbs ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    ogAbs ? `<meta name="twitter:image" content="${esc(ogAbs)}">` : null,
  ].filter(Boolean).join("\n    ");

  html = html.replace(/<\/head>/i, `    ${seoTags}\n  </head>`);
  return html;
}

const SHELL_CLEANUP_SCRIPT = `<script>(function(){var t=Date.now();function clean(){var s=document.getElementById('seo-shell');var r=document.getElementById('root');if(s&&r&&r.children&&r.children.length>0){s.remove();return true}return false}if(clean())return;var i=setInterval(function(){if(clean()||Date.now()-t>10000)clearInterval(i)},100)})();</script>`;

function injectBody(html, shellHtml) {
  // Inject shell + cleanup script right before </body>, so SEO content is in DOM but invisible.
  return html.replace(/<\/body>/i, `${shellHtml}\n${SHELL_CLEANUP_SCRIPT}\n</body>`);
}

function writeRoute(routePath, html) {
  const clean = routePath === "/" ? "" : routePath.replace(/^\/+|\/+$/g, "");
  const filePath = clean ? join(DIST, clean, "index.html") : join(DIST, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

(async () => {
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`[prerender] No dist/index.html — did vite build run?`);
    process.exit(0); // don't fail the build
  }
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const { settings, posts } = await fetchData();
  const pageSeo = settings?.seo?.pageSeo || {};
  const servicesList = (settings?.content?.servicesList || []).filter((s) => s.published !== false);
  const portfolio = (settings?.portfolio || []);
  const caseStudies = (settings?.case_studies || []);
  const customPages = (settings?.custom_pages || []).filter((p) => p.published);

  // Effective parent slugs (honor admin overrides everywhere)
  const parents = {
    services: clean(pageSeo.services?.slug) || "services",
    blog: clean(pageSeo.blog?.slug) || "blog",
    portfolio: clean(pageSeo.portfolio?.slug) || "portfolio",
    "case-studies": clean(pageSeo["case-studies"]?.slug) || "case-studies",
  };

  // Build navbar links (mirror Navbar.tsx logic — built-in sections only)
  const navItems = [
    { key: "home", label: "Home", href: "/" },
    { key: "services", label: "Services" },
    { key: "portfolio", label: "Portfolio" },
    { key: "blog", label: "Blog" },
    { key: "about", label: "About" },
    { key: "contact", label: "Contact" },
  ].map((n) => {
    if (n.href) return n;
    const cfg = pageSeo[n.key] || {};
    const slug = clean(cfg.slug) || n.key;
    return { label: n.label, href: `/${slug}` };
  });

  const servicesForNav = servicesList.map((s) => ({
    slug: clean(s.urlSlug) || s.slug,
    title: s.title || s.slug,
  }));

  const postsForNav = posts || [];

  const navHtml = buildNavLinks(navItems, servicesForNav, parents);
  const footerHtml = buildFooter(navItems, servicesForNav, postsForNav, parents);

  let count = 0;
  const written = [];

  function emit(routePath, base) {
    const cfg = base.cfgKey ? (pageSeo[base.cfgKey] || {}) : {};
    if (cfg.status === "draft" || cfg.robots === "noindex") return;
    const seo = applySeoOverride(base, cfg);
    const canonical = `${BASE_URL}${routePath === "/" ? "" : routePath}` || BASE_URL + "/";
    let html = rewriteHead(template, {
      title: seo.title,
      description: seo.description,
      canonical: canonical || BASE_URL,
      ogImage: seo.ogImage,
      ogType: base.ogType || "website",
    });
    const shell = renderSeoShell({
      h1: seo.h1,
      description: seo.description,
      bodyExtra: base.bodyExtra || "",
      navHtml,
      footerHtml,
    });
    html = injectBody(html, shell);
    writeRoute(routePath, html);
    written.push(routePath);
    count++;
  }

  // Static pages
  for (const p of STATIC_PAGES) {
    const slug = resolveStaticSlug(p, pageSeo);
    const path = slug ? `/${slug}` : "/";
    emit(path, { ...p, cfgKey: p.key });
  }

  // Service pages
  for (const svc of servicesList) {
    const tail = clean(svc.urlSlug) || svc.slug;
    const title = (svc.title && svc.title.trim()) || tail;
    emit(`/${parents.services}/${tail}`, {
      cfgKey: `svc:${svc.slug}`,
      title: `${title} | AniRise`,
      description: svc.shortDescription || svc.description || `Professional ${title} services by AniRise.`,
      h1: title,
      ogImage: svc.image || "",
    });
  }

  // Blog posts
  for (const post of posts) {
    if (!post?.slug) continue;
    const cfg = pageSeo[`blog/${post.slug}`] || {};
    const publicSlug = clean(cfg.slug) || post.slug;
    const title = post.title || post.slug;
    emit(`/${parents.blog}/${publicSlug}`, {
      cfgKey: `blog/${post.slug}`,
      title: `${title} | AniRise Blog`,
      description: post.excerpt || `Read "${title}" on the AniRise blog.`,
      h1: title,
      ogType: "article",
    });
  }

  // Portfolio items
  for (const item of portfolio) {
    if (!item?.id) continue;
    const tail = clean(item.slug) || item.id;
    const title = item.title || tail;
    emit(`/${parents.portfolio}/${tail}`, {
      cfgKey: `proj:${item.id}`,
      title: `${title} — Project | AniRise Portfolio`,
      description: item.summary || item.description || `${title} — project case from AniRise.`,
      h1: title,
      ogImage: item.image || item.cover || "",
    });
  }

  // Case studies
  for (const cs of caseStudies) {
    if (!cs?.id) continue;
    const cfg = pageSeo[`case:${cs.id}`] || {};
    const tail = clean(cfg.slug) || cs.id;
    const title = cs.title || cs.id;
    emit(`/${parents["case-studies"]}/${tail}`, {
      cfgKey: `case:${cs.id}`,
      title: `${title} — Case Study | AniRise`,
      description: cs.summary || cs.description || `${title} — case study by AniRise.`,
      h1: title,
      ogImage: cs.image || cs.cover || "",
    });
  }

  // Custom pages (incl. legal)
  for (const cp of customPages) {
    if (!cp?.slug) continue;
    const path = `/${cp.parent ? cp.parent + "/" : ""}${clean(cp.slug)}`;
    emit(path, {
      cfgKey: undefined,
      title: cp.seo?.metaTitle || `${cp.title || cp.slug} | AniRise`,
      description: cp.seo?.metaDescription || cp.excerpt || `${cp.title || cp.slug} — AniRise`,
      h1: cp.title || cp.slug,
      ogImage: cp.seo?.ogImage || "",
    });
  }

  // Seed default legal pages if not present
  const customSlugs = new Set(customPages.map((p) => clean(p.slug)));
  const LEGAL = [
    { slug: "privacy-policy", title: "Privacy Policy", description: "AniRise privacy policy — how we collect, use, and protect your data." },
    { slug: "terms-of-service", title: "Terms of Service", description: "AniRise terms of service — rules for using our website and services." },
    { slug: "refund-policy", title: "Refund Policy", description: "AniRise refund policy — refund eligibility, process, and conditions." },
  ];
  for (const l of LEGAL) {
    if (customSlugs.has(l.slug)) continue;
    emit(`/${l.slug}`, {
      cfgKey: undefined,
      title: `${l.title} | AniRise`,
      description: l.description,
      h1: l.title,
    });
  }

  console.log(`[prerender] generated ${count} HTML files:\n  ${written.join("\n  ")}`);
})().catch((e) => {
  console.error("[prerender] failed:", e);
  // Do not fail the build — SPA fallback still ships.
  process.exit(0);
});
