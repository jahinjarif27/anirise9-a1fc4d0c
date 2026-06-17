import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore - no types shipped
import prerender from "@prerenderer/rollup-plugin";

// Routes prerendered to static HTML at build time so crawlers (and SEO tools
// that don't execute JS) receive fully-rendered markup, real <a href> links,
// and proper <title>/<meta> tags. Dynamic detail pages (blog posts, project
// detail) are still client-rendered; Googlebot executes JS so they index fine.
const PRERENDER_ROUTES = [
  "/",
  "/services",
  "/services/website-seo",
  "/services/ecommerce-seo",
  "/services/graphics-design",
  "/portfolio",
  "/case-studies",
  "/testimonials",
  "/about",
  "/contact",
  "/blog",
  "/strategy-call",
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
        routes: PRERENDER_ROUTES,
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
}));
