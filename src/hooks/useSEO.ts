import { useEffect } from "react";

const SITE_URL = "https://anirise.com.bd";

export type SchemaInput = {
  /** Schema.org @type — e.g. "Article", "Service", "FAQPage", "BreadcrumbList" */
  type: string;
  /** Raw JSON body (without @context/@type). Will be wrapped automatically. */
  json: string;
  enabled?: boolean;
};

type OG = {
  title?: string;
  description?: string;
  image?: string;
  type?: string; // og:type — defaults to "website"
};

type SEOOptions = {
  title: string;
  description?: string;
  /** Optional meta keywords. */
  keywords?: string;
  /** Page path (e.g. "/services"). Used to build canonical when no override. */
  path?: string;
  /** Full canonical URL override. Takes precedence over path. */
  canonical?: string;
  /** Robots directive. Use "noindex, nofollow" to keep page out of search. */
  robots?: string;
  /** Open Graph / Twitter tag overrides. Falls back to title/description. */
  og?: OG;
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

function removeMeta(selector: string) {
  document.head.querySelectorAll(selector).forEach((n) => n.remove());
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
  keywords,
  path,
  canonical,
  robots,
  og,
  schemas,
  jsonLd,
}: SEOOptions) {
  const schemaKey = JSON.stringify(schemas ?? []);
  const jsonLdKey = JSON.stringify(jsonLd ?? null);
  const ogKey = JSON.stringify(og ?? null);

  useEffect(() => {
    document.title = title;

    const pathname = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = canonical && canonical.trim() ? canonical.trim() : SITE_URL + pathname;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
    }
    upsertLink("canonical", canonicalUrl);

    // Keywords — write when provided, otherwise clear so prior page's value doesn't leak.
    if (keywords && keywords.trim()) {
      upsertMeta('meta[name="keywords"]', "name", "keywords", keywords.trim());
    } else {
      removeMeta('meta[name="keywords"]');
    }

    // Robots — only override if explicitly provided
    if (robots && robots.trim()) {
      upsertMeta('meta[name="robots"]', "name", "robots", robots.trim());
    } else {
      upsertMeta('meta[name="robots"]', "name", "robots", "index, follow");
    }

    // Open Graph + Twitter — always present, fall back to page title/description.
    const ogTitle = og?.title?.trim() || title;
    const ogDesc = og?.description?.trim() || description || "";
    const ogImage = og?.image?.trim() || "";
    const ogType = og?.type?.trim() || "website";

    upsertMeta('meta[property="og:title"]', "property", "og:title", ogTitle);
    upsertMeta('meta[property="og:type"]', "property", "og:type", ogType);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    if (ogDesc) {
      upsertMeta('meta[property="og:description"]', "property", "og:description", ogDesc);
    } else {
      removeMeta('meta[property="og:description"]');
    }
    if (ogImage) {
      // Resolve relative paths to absolute against the site URL.
      const absImage = /^https?:\/\//i.test(ogImage)
        ? ogImage
        : SITE_URL + (ogImage.startsWith("/") ? ogImage : `/${ogImage}`);
      upsertMeta('meta[property="og:image"]', "property", "og:image", absImage);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absImage);
      upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
      upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    }
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", ogTitle);
    if (ogDesc) {
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", ogDesc);
    } else {
      removeMeta('meta[name="twitter:description"]');
    }

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
  }, [title, description, keywords, path, canonical, robots, schemaKey, jsonLdKey, ogKey]);
}

/** Helper: build the `og` + `keywords` + `schemas` props from an admin pageSeo override object. */
export function fromPageSeo(ps: any | undefined) {
  if (!ps) return {} as Pick<SEOOptions, "keywords" | "og" | "schemas">;
  const userSchemas = Array.isArray(ps.schemas) ? ps.schemas.filter((s: any) => s.enabled) : [];
  return {
    keywords: ps.metaKeywords || undefined,
    og: {
      title: ps.ogTitle || undefined,
      description: ps.ogDescription || undefined,
      image: ps.ogImage || undefined,
    },
    schemas: userSchemas.length > 0 ? userSchemas : undefined,
  } as Pick<SEOOptions, "keywords" | "og" | "schemas">;
}
