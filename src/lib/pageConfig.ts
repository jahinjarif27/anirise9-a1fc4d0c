// Central registry for built-in page slug/status resolution.
// Built-in pages live at fixed React-Router routes, but the admin can override
// the public-facing slug (e.g. /services → /our-services) and toggle draft status.
//
// The original (default) path always continues to resolve so existing links and
// bookmarks never 404. The new admin-set slug also resolves — both render the
// same content, and canonical points to the admin-set slug.

import type { PageSeo } from "@/context/AdminContext";

export type BuiltInPageKey =
  | "home"
  | "services"
  | "portfolio"
  | "blog"
  | "testimonials"
  | "contact"
  | "about"
  | "strategy-call";

export const BUILTIN_DEFAULT_SLUGS: Record<BuiltInPageKey, string> = {
  home: "",
  services: "services",
  portfolio: "portfolio",
  blog: "blog",
  testimonials: "testimonials",
  contact: "contact",
  about: "about",
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
  // Then default slug
  for (const k of keys) {
    if (BUILTIN_DEFAULT_SLUGS[k] === cleaned) return k;
  }
  return null;
}
