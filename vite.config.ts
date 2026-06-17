import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - no types shipped
import prerender from "@prerenderer/rollup-plugin";

const BUILTIN_DEFAULT_SLUGS: Record<string, string> = {
  home: "",
  services: "services",
  portfolio: "portfolio",
  blog: "blog",
  testimonials: "testimonials",
  contact: "contact",
  about: "about",
  "case-studies": "case-studies",
  "strategy-call": "strategy-call",
};

// Fallback routes; production builds add live admin slugs/posts/services below.
const FALLBACK_PRERENDER_ROUTES = [
  "/",
  "/services",
  "/services/website-seo",
  "/services/ecommerce-seo",
  "/services/graphics-design",
  "/services/web-dev",
  "/services/social-media-marketing",
  "/services/digital-marketing",
  "/portfolio",
  "/case-studies",
  "/testimonials",
  "/about",
  "/contact",
  "/blog",
  "/strategy-call",
];

async function getPrerenderRoutes() {
  const routes = new Set(FALLBACK_PRERENDER_ROUTES);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) return [...routes];

  try {
    const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
    const [settingsRes, postsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/site_settings?id=eq.1&select=seo,content,custom_pages,portfolio,case_studies`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/blog_posts?select=slug,date`, { headers }),
    ]);
    const settingsRows = (await settingsRes.json()) as any[];
    const settings = settingsRows?.[0] ?? {};
    const posts = (await postsRes.json()) as any[];
    const pageSeo = settings.seo?.pageSeo ?? {};
    const add = (pathName: string) => routes.add(pathName.startsWith("/") ? pathName : `/${pathName}`);

    for (const [key, fallback] of Object.entries(BUILTIN_DEFAULT_SLUGS)) {
      const ps = pageSeo[key] ?? {};
      if (ps.status === "draft" || ps.robots === "noindex") continue;
      add((ps.slug?.trim() || fallback) || "/");
    }

    const blogParent = (pageSeo.blog?.slug?.trim() || "blog").replace(/^\/+/, "");
    const portfolioParent = (pageSeo.portfolio?.slug?.trim() || "portfolio").replace(/^\/+/, "");
    const services = Array.isArray(settings.content?.servicesList) ? settings.content.servicesList : [];
    services.forEach((s: any) => s?.published !== false && add(`/services/${(s.urlSlug?.trim() || s.slug || "").replace(/^\/+/, "")}`));
    Array.isArray(posts) && posts.forEach((p: any) => p?.slug && add(`/${blogParent}/${p.slug}`));
    (settings.portfolio ?? []).forEach((p: any) => (p?.slug || p?.id) && add(`/${portfolioParent}/${(p.slug || p.id).replace(/^\/+/, "")}`));
    (settings.case_studies ?? []).forEach((c: any) => c?.id && add(`/case-studies/${c.id}`));
    (settings.custom_pages ?? []).forEach((p: any) => p?.published && p?.slug && add(`/${p.parent ? `${p.parent}/` : ""}${p.slug.replace(/^\/+/, "")}`));
  } catch (error) {
    console.warn("Using fallback prerender routes", error);
  }
  return [...routes];
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const prerenderRoutes = mode === "development" ? [] : await getPrerenderRoutes();
  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Only prerender in production builds — dev server is unaffected.
    mode !== "development" &&
      prerender({
        routes: prerenderRoutes,
        renderer: "@prerenderer/renderer-puppeteer",
        rendererOptions: {
          maxConcurrentRoutes: 2,
          renderAfterTime: 2500,
          headless: "new",
          launchOptions: {
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          },
        },
        postProcess(renderedRoute: any) {
          // Strip lovable tagger artifacts and ensure trailing newline
          renderedRoute.html = renderedRoute.html.replace(
            /<script[^>]+lovable-tagger[^<]*<\/script>/g,
            "",
          );
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
};
});
