import { next } from "@vercel/functions";

const env = typeof process !== "undefined" ? process.env : {};
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "https://xlrmuspmekwbtnyeutxz.supabase.co";
const SUPABASE_KEY =
  env.SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhscm11c3BtZWt3YnRueWV1dHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTUzMzUsImV4cCI6MjA5NDU5MTMzNX0.7hnEy_HPG4rzOZBeF7k6iPP0c51ohnoedXAsTA_Wisw";

const BUILTIN_DEFAULT_SLUGS: Record<string, string> = {
  services: "services",
  portfolio: "portfolio",
  blog: "blog",
  testimonials: "testimonials",
  contact: "contact",
  about: "about",
  "case-studies": "case-studies",
  "strategy-call": "strategy-call",
};

const ASSET_PATH = /\.[a-z0-9]{2,8}$/i;

function cleanPath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}

function rulePath(value: string) {
  try {
    return cleanPath(/^https?:\/\//i.test(value) ? new URL(value).pathname : value.startsWith("/") ? value : `/${value}`);
  } catch {
    return cleanPath(value.startsWith("/") ? value : `/${value}`);
  }
}

function redirectTo(request: Request, target: string) {
  const source = new URL(request.url);
  const destination = /^https?:\/\//i.test(target) ? new URL(target) : new URL(target.startsWith("/") ? target : `/${target}`, request.url);
  if (!destination.search && source.search) destination.search = source.search;
  return new Response(null, {
    status: 301,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Redirect-By": "anirise-middleware",
    },
  });
}

async function loadRuntimeData() {
  const [settingsRes, postsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=seo,content,portfolio,case_studies`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }),
    fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=slug`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    }),
  ]);
  const settings = settingsRes.ok ? ((await settingsRes.json()) as any[])?.[0] ?? null : null;
  const posts = postsRes.ok ? ((await postsRes.json()) as any[]) : [];
  return { settings, posts };
}

function cleanSlug(value: unknown) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

function resolveBuiltIn(slug: string, pageSeo: Record<string, any>) {
  const cleaned = cleanSlug(slug);
  for (const [key, defaultSlug] of Object.entries(BUILTIN_DEFAULT_SLUGS)) {
    const customSlug = cleanSlug(pageSeo[key]?.slug);
    if (customSlug && customSlug === cleaned) return key;
    if (!customSlug && defaultSlug === cleaned) return key;
  }
  return null;
}

function pageSlug(key: string, pageSeo: Record<string, any>) {
  return cleanSlug(pageSeo[key]?.slug) || BUILTIN_DEFAULT_SLUGS[key] || key;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = cleanPath(url.pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/assets") || ASSET_PATH.test(pathname)) return next();
  if (url.pathname !== pathname) return redirectTo(request, pathname);

  const { settings, posts } = await loadRuntimeData();
  const seo = settings?.seo ?? {};
  const pageSeo = seo.pageSeo ?? {};

  const manual = Array.isArray(seo.redirects) ? seo.redirects : [];
  const exact = manual.find((r: any) => r?.enabled !== false && rulePath(String(r.from || "")) === pathname && r.to && rulePath(String(r.to)) !== pathname);
  if (exact) return redirectTo(request, exact.to);

  const detailMatch = pathname.match(/^\/([^/]+)\/([^/]+)$/);
  if (detailMatch) {
    const [, sectionSlug, itemSlug] = detailMatch;
    const section = resolveBuiltIn(sectionSlug, pageSeo);
    if (section === "portfolio") {
      const portfolio = Array.isArray(settings?.portfolio) ? settings.portfolio : [];
      const item = portfolio.find((p: any) => cleanSlug(p?.slug) === itemSlug);
      const publicTail = cleanSlug(item?.slug) || item?.id;
      if (item && publicTail && sectionSlug !== pageSlug("portfolio", pageSeo)) {
        return redirectTo(request, `/${pageSlug("portfolio", pageSeo)}/${publicTail}`);
      }
    }
  }

  const caseMatch = pathname.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch) {
    const cases = Array.isArray(settings?.case_studies) ? settings.case_studies : [];
    const item = cases.find((c: any) => c?.id === caseMatch[1]);
    const overrideSlug = cleanSlug(item && pageSeo[`case:${item.id}`]?.slug);
    if (item && overrideSlug && overrideSlug !== caseMatch[1]) return redirectTo(request, `/case-studies/${overrideSlug}`);
  }

  return next();
}

export const config = {
  matcher: "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|sitemap.xsl|sitemap-style.css).*)",
};