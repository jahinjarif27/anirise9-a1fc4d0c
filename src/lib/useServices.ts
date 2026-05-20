import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { services as staticServices } from "@/data/services";

export type RuntimeService = {
  slug: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

const STATIC_ICON_BY_SLUG: Record<string, LucideIcon> = Object.fromEntries(
  staticServices.map((s) => [s.slug, s.icon]),
);

export const resolveServiceIcon = (name?: string, slug?: string): LucideIcon => {
  if (name) {
    const Cmp = (Icons as any)[name];
    if (Cmp) return Cmp as LucideIcon;
  }
  if (slug && STATIC_ICON_BY_SLUG[slug]) return STATIC_ICON_BY_SLUG[slug];
  return Icons.Sparkles;
};

/** Public-site services list — admin-managed when set, otherwise static defaults. */
export const useServices = (): RuntimeService[] => {
  const { content } = useAdmin();
  const list = (content.servicesList || []).filter((s) => s.published !== false);
  if (list.length === 0) {
    return staticServices.map((s) => ({ slug: s.slug, title: s.title, desc: s.desc, icon: s.icon }));
  }
  return [...list]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      desc: s.desc,
      icon: resolveServiceIcon(s.iconName, s.slug),
    }));
};

/** Admin-side: full list including drafts, sorted by order. Returns AdminService shape. */
export const useAllServices = () => {
  const { content } = useAdmin();
  const list = content.servicesList || [];
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};
