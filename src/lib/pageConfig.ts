// Central registry for built-in page slug/status resolution.
// Built-in pages live at fixed React-Router routes, but the admin can override
// the public-facing slug (e.g. /services → /our-services) and toggle draft status.
//
// When an admin slug is set, the original/default path no longer resolves.
// This keeps one public URL per page and prevents stale URLs from staying live.

import type { PageSeo } from "@/context/AdminContext";

export type BuiltInPageKey =
  | "home"
  | "services"
  | "portfolio"
  | "blog"
  | "testimonials"
  | "contact"
  | "about"
  | "case-studies"
  | "strategy-call";

export const BUILTIN_DEFAULT_SLUGS: Record<BuiltInPageKey, string> = {
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

export const BUILTIN_PAGE_LABELS: Record<BuiltInPageKey, string> = {
  home: "Home",
  services: "Services",
  portfolio: "Portfolio",
  blog: "Blog",
  testimonials: "Testimonials",
  contact: "Contact",
  about: "About",
  "case-studies": "Case studies",
  "strategy-call": "Strategy Call",
};

/** Effective public slug for a built-in page — admin override or default. */
export function getPageSlug(
  key: BuiltInPageKey,
  pageSeo: Record<string, PageSeo> | undefined,
): string {
  const override = pageSeo?.[key]?.slug?.trim();
  return override && override.length > 0 ? override.replace(/^\/+/, "") : BUILTIN_DEFAULT_SLUGS[key];
}

/** Full public path for a built-in page (always starts with "/"). */
export function getPagePath(
  key: BuiltInPageKey,
  pageSeo: Record<string, PageSeo> | undefined,
): string {
  const slug = getPageSlug(key, pageSeo);
  return slug ? `/${slug}` : "/";
}

export function hasCustomPageSlug(
  key: BuiltInPageKey,
  pageSeo: Record<string, PageSeo> | undefined,
): boolean {
  const override = pageSeo?.[key]?.slug?.trim().replace(/^\/+/, "");
  return !!override && override !== BUILTIN_DEFAULT_SLUGS[key];
}

/** Is the page marked draft / hidden in admin? */
export function isPageDraft(
  key: string,
  pageSeo: Record<string, PageSeo> | undefined,
): boolean {
  return pageSeo?.[key]?.status === "draft";
}

/** Resolve a URL path to a built-in page key (matches both default + custom slug). */
export function resolvePathToBuiltIn(
  slug: string,
  pageSeo: Record<string, PageSeo> | undefined,
): BuiltInPageKey | null {
  const cleaned = (slug || "").replace(/^\/+/, "");
  const keys = Object.keys(BUILTIN_DEFAULT_SLUGS) as BuiltInPageKey[];
  // Prefer admin-set slug match
  for (const k of keys) {
    const customSlug = pageSeo?.[k]?.slug?.trim();
    if (customSlug && customSlug.replace(/^\/+/, "") === cleaned) return k;
  }
  // Then default slug, but only while that page has no admin-set replacement.
  for (const k of keys) {
    if (!hasCustomPageSlug(k, pageSeo) && BUILTIN_DEFAULT_SLUGS[k] === cleaned) return k;
  }
  return null;
}
