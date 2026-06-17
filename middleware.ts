const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xlrmuspmekwbtnyeutxz.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inhscm11c3BtZWt3YnRueWV1dHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTUzMzUsImV4cCI6MjA5NDU5MTMzNX0.7hnEy_HPG4rzOZBeF7k6iPP0c51ohnoedXAsTA_Wisw";

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

function redirectTo(request: Request, target: string) {
  const source = new URL(request.url);
  const destination = /^https?:\/\//i.test(target) ? new URL(target) : new URL(target.startsWith("/") ? target : `/${target}`, request.url);
  if (!destination.search && source.search) destination.search = source.search;
  return new Response(null, { status: 301, headers: { Location: destination.toString() } });
}

async function loadSettings() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=seo,content`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as any[];
  return rows?.[0] ?? null;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = cleanPath(url.pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/assets") || ASSET_PATH.test(pathname)) return;
  if (url.pathname !== pathname) return redirectTo(request, pathname);

  const settings = await loadSettings();
  const seo = settings?.seo ?? {};
  const pageSeo = seo.pageSeo ?? {};

  const manual = Array.isArray(seo.redirects) ? seo.redirects : [];
  const exact = manual.find((r: any) => r?.enabled !== false && cleanPath(String(r.from || "")) === pathname && r.to && cleanPath(String(r.to)) !== pathname);
  if (exact) return redirectTo(request, exact.to);

  for (const [key, defaultSlug] of Object.entries(BUILTIN_DEFAULT_SLUGS)) {
    const customSlug = String(pageSeo[key]?.slug || "").replace(/^\/+|\/+$/g, "");
    if (!customSlug || customSlug === defaultSlug) continue;
    if (pathname === `/${defaultSlug}`) return redirectTo(request, `/${customSlug}`);
  }

  const services = Array.isArray(settings?.content?.servicesList) ? settings.content.servicesList : [];
  const serviceMatch = pathname.match(/^\/services\/([^/]+)$/);
  if (serviceMatch) {
    const item = services.find((s: any) => s?.slug === serviceMatch[1] && s?.urlSlug && s.urlSlug !== s.slug);
    if (item) return redirectTo(request, `/services/${String(item.urlSlug).replace(/^\/+|\/+$/g, "")}`);
  }

  for (const key of ["blog", "portfolio"] as const) {
    const defaultSlug = BUILTIN_DEFAULT_SLUGS[key];
    const customSlug = String(pageSeo[key]?.slug || "").replace(/^\/+|\/+$/g, "");
    if (!customSlug || customSlug === defaultSlug) continue;
    if (pathname.startsWith(`/${defaultSlug}/`)) return redirectTo(request, pathname.replace(`/${defaultSlug}/`, `/${customSlug}/`));
  }
}

export const config = {
  matcher: "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|sitemap.xsl|sitemap-style.css).*)",
};