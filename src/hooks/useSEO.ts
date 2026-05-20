import { useEffect } from "react";

const SITE_URL = "https://anirise.com.bd";

export type SchemaInput = {
  /** Schema.org @type — e.g. "Article", "Service", "FAQPage", "BreadcrumbList" */
  type: string;
  /** Raw JSON body (without @context/@type). Will be wrapped automatically. */
  json: string;
  enabled?: boolean;
};

type SEOOptions = {
  title: string;
  description?: string;
  /** Page path (e.g. "/services"). Used to build canonical when no override. */
  path?: string;
  /** Full canonical URL override. Takes precedence over path. */
  canonical?: string;
  /** Robots directive. Use "noindex, nofollow" to keep page out of search. */
  robots?: string;
  /** Per-page structured-data blocks. Replaces all previous page-level JSON-LD on mount. */
  schemas?: SchemaInput[];
  /** Legacy convenience JSON-LD prop (single or array). Merged into schemas. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Remove any Open Graph / Twitter card meta tags that may have been injected
 * earlier (legacy code or third-party scripts). OG sharing previews are
 * intentionally disabled site-wide.
 */
function stripOgTags() {
  document.head
    .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
    .forEach((n) => n.remove());
}

export function useSEO({
  title,
  description,
  path,
  canonical,
  robots,
  schemas,
  jsonLd,
}: SEOOptions) {
  const schemaKey = JSON.stringify(schemas ?? []);
  const jsonLdKey = JSON.stringify(jsonLd ?? null);

  useEffect(() => {
    document.title = title;

    const pathname = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = canonical && canonical.trim() ? canonical.trim() : SITE_URL + pathname;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
    }
    upsertLink("canonical", canonicalUrl);

    // Robots — only override if explicitly provided
    if (robots && robots.trim()) {
      upsertMeta('meta[name="robots"]', "name", "robots", robots.trim());
    } else {
      upsertMeta('meta[name="robots"]', "name", "robots", "index, follow");
    }

    // Always strip any OG/Twitter tags every render
    stripOgTags();

    // Per-page JSON-LD — replace any previous page-level blocks on every render
    document.head.querySelectorAll('script[data-page-jsonld="true"]').forEach((n) => n.remove());

    const allSchemas: SchemaInput[] = [];
    if (Array.isArray(schemas)) allSchemas.push(...schemas.filter((s) => s.enabled !== false));
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      arr.forEach((data) => {
        try {
          const { ["@context"]: _ctx, ["@type"]: ldType, ...rest } = data as any;
          allSchemas.push({ type: String(ldType || "Thing"), json: JSON.stringify(rest), enabled: true });
        } catch {}
      });
    }

    allSchemas.forEach((s) => {
      let body: unknown = {};
      try {
        body = s.json && s.json.trim() ? JSON.parse(s.json) : {};
      } catch {
        return;
      }
      const payload = { "@context": "https://schema.org", "@type": s.type, ...(body as object) };
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.setAttribute("data-page-jsonld", "true");
      tag.text = JSON.stringify(payload);
      document.head.appendChild(tag);
    });
  }, [title, description, path, canonical, robots, schemaKey, jsonLdKey]);
}
