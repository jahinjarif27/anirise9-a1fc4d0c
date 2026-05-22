import { lazy, Suspense, type ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { useAdmin } from "@/context/AdminContext";

const NotFound = lazy(() => import("@/pages/NotFound"));

type Props = {
  title: string;
  description?: string;
  path?: string;
  /** Admin pageSeo key for this service page, e.g. "svc:website-seo". */
  seoKey?: string;
  children: ReactNode;
};

export const ServiceLayout = ({ title, description, path, seoKey, children }: Props) => {
  const { seo } = useAdmin();
  const override: any = seoKey ? seo.pageSeo?.[seoKey] || {} : {};
  const isDraft = override.status === "draft";

  useSEO({
    title: override.metaTitle || `${title} — AniRise`,
    description: override.metaDescription || description,
    path,
    canonical: override.canonicalAuto === false ? override.canonicalUrl : undefined,
    robots: override.robots === "noindex" || isDraft ? "noindex, nofollow" : undefined,
    ...fromPageSeo(override),
  });

  if (isDraft) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
