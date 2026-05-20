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
  image?: string;
  type?: "website" | "article";
  /** Full canonical URL override (e.g. "https://example.com/blog/post-1"). Takes precedence over path. */
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
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

export function useSEO({
  title,
  description,
  path,
  image,
  type = "website",
  canonical,
  ogTitle,
  ogDescription,
  robots,
  schemas,
  jsonLd,
}: SEOOptions) {
  // Stable dep keys
  const schemaKey = JSON.stringify(schemas ?? []);
  const jsonLdKey = JSON.stringify(jsonLd ?? null);

  useEffect(() => {
    document.title = title;

    const pathname = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = canonical && canonical.trim() ? canonical.trim() : SITE_URL + pathname;
    const img = image
      ? image.startsWith("http")
        ? image
        : SITE_URL + (image.startsWith("/") ? image : "/" + image)
      : `${SITE_URL}/favicon.jpg`;

    const finalOgTitle = ogTitle?.trim() || title;
    const finalOgDesc = ogDescription?.trim() || description;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", finalOgDesc || description);
    }
    if (finalOgDesc) {
      upsertMeta('meta[property="og:description"]', "property", "og:description", finalOgDesc);
    }
    upsertMeta('meta[property="og:title"]', "property", "og:title", finalOgTitle);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", finalOgTitle);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:image"]', "property", "og:image", img);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", img);
    upsertLink("canonical", canonicalUrl);

    // Robots — only override if explicitly provided (so noindex doesn't leak across pages)
    if (robots && robots.trim()) {
      upsertMeta('meta[name="robots"]', "name", "robots", robots.trim());
    } else {
      // Reset to default index,follow so a previous page's noindex doesn't stick
      upsertMeta('meta[name="robots"]', "name", "robots", "index, follow");
    }

    // Per-page JSON-LD — replace any previous page-level blocks on every render
    const existing = document.head.querySelectorAll('script[data-page-jsonld="true"]');
    existing.forEach((n) => n.remove());

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
        return; // skip invalid JSON
      }
      const payload = { "@context": "https://schema.org", "@type": s.type, ...(body as object) };
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.setAttribute("data-page-jsonld", "true");
      tag.text = JSON.stringify(payload);
      document.head.appendChild(tag);
    });
  }, [title, description, path, image, type, canonical, ogTitle, ogDescription, robots, schemaKey, jsonLdKey]);
}
