import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("react-router")) return "router";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) return "charts";
            if (id.includes("@radix-ui")) return "radix";
            // lucide-react intentionally NOT manually chunked — let Rollup tree-shake per route.
            if (id.includes("@tanstack")) return "query";
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("dompurify") || id.includes("marked") || id.includes("html2canvas")) return "content";
            if (id.includes("jspdf") || id.includes("canvg")) return "pdf";
            if (id.includes("react-syntax-highlighter") || id.includes("refractor") || id.includes("prismjs") || id.includes("highlight.js")) return "syntax";
            if (id.includes("date-fns")) return "date-fns";
            if (id.includes("embla-carousel")) return "embla";
            // Per-package split for everything else — keeps the entry shell lean.
            const m = id.match(/node_modules\/(?:\.pnpm\/)?(@[^/]+\/[^/@]+|[^/@][^/]+)/);
            if (m) return `pkg-${m[1].replace(/[@/]/g, "_")}`;
          },
        },
      },
    },
  };
});
