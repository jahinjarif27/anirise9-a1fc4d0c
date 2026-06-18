import { next } from "@vercel/functions";

const env = typeof process !== "undefined" ? process.env : {};
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "https://xlrmuspmekwbtnyeutxz.supabase.co";
const SUPABASE_KEY =
  env.SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhscm11c3BtZWt3YnRueWV1dHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTUzMzUsImV4cCI6MjA5NDU5MTMzNX0.7hnEy_HPG4rzOZBeF7k6iPP0c51ohnoedXAsTA_Wisw";

const ASSET_PATH = /\.[a-z0-9]{2,8}$/i;
const ALLOWED_CODES = new Set([301, 302, 307, 308]);

function cleanPath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}

function normalizeSource(value: string) {
  try {
    const v = value.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return cleanPath(new URL(v).pathname);
    return cleanPath(v.startsWith("/") ? v : `/${v}`);
  } catch {
    return cleanPath(value.startsWith("/") ? value : `/${value}`);
  }
}

function redirectTo(request: Request, target: string, code: number) {
  const source = new URL(request.url);
  const destination = /^https?:\/\//i.test(target)
    ? new URL(target)
    : new URL(target.startsWith("/") ? target : `/${target}`, request.url);
  if (!destination.search && source.search) destination.search = source.search;
  const status = ALLOWED_CODES.has(code) ? code : 301;
  return new Response(null, {
    status,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Redirect-By": "anirise-middleware",
    },
  });
}

async function loadRedirects(): Promise<Array<{ from: string; to: string; code: number; enabled: boolean }>> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=seo`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const row = ((await res.json()) as any[])?.[0];
  const list = Array.isArray(row?.seo?.redirects) ? row.seo.redirects : [];
  return list
    .filter((r: any) => r && r.enabled !== false && r.from && r.to)
    .map((r: any) => ({
      from: normalizeSource(String(r.from)),
      to: String(r.to).trim(),
      code: ALLOWED_CODES.has(Number(r.code)) ? Number(r.code) : 301,
      enabled: true,
    }));
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = cleanPath(url.pathname);
  if (pathname.startsWith("/admin") || pathname.startsWith("/assets") || ASSET_PATH.test(pathname)) return next();

  // Canonicalize trailing slash with 308 (preserves method, safe).
  if (url.pathname !== pathname) return redirectTo(request, pathname, 308);

  const rules = await loadRedirects();
  if (!rules.length) return next();

  // Build map and resolve, following chains while guarding against loops.
  const map = new Map<string, { to: string; code: number }>();
  for (const r of rules) {
    if (!map.has(r.from)) map.set(r.from, { to: r.to, code: r.code });
  }
  const rule = map.get(pathname);
  if (!rule) return next();

  let target = rule.to;
  let code = rule.code;
  const seen = new Set<string>([pathname]);
  for (let i = 0; i < 8; i++) {
    const targetPath = normalizeSource(target);
    if (!targetPath.startsWith("/")) break; // absolute URL — stop chain
    if (seen.has(targetPath)) {
      // Loop — refuse to redirect.
      return next();
    }
    const nxt = map.get(targetPath);
    if (!nxt) break;
    seen.add(targetPath);
    target = nxt.to;
    code = nxt.code;
  }

  if (normalizeSource(target) === pathname) return next();
  return redirectTo(request, target, code);
}

export const config = {
  matcher: "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|sitemap.xsl|sitemap-style.css).*)",
};
