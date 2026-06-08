import { ComponentType, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Contact } from "@/components/site/Contact";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { useAdmin } from "@/context/AdminContext";
import { getPagePath, isPageDraft, BUILTIN_DEFAULT_SLUGS, type BuiltInPageKey } from "@/lib/pageConfig";

const NotFound = lazy(() => import("./NotFound"));

type Props = {
  Section: ComponentType;
  title?: string;
  sectionKey?: string;
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  services: "Explore AniRise services: SEO, ecommerce SEO, web development, graphics design, and digital marketing built to grow your brand.",
  about: "Learn about AniRise — a digital agency helping brands rise online with SEO, web, and marketing expertise.",
  portfolio: "Selected AniRise client work and results across SEO, web development, and digital marketing.",
  testimonials: "What AniRise clients say about working with us — real results from real brands.",
  contact: "Contact AniRise to start your SEO, web, or digital marketing project. Get a fast response and a free consultation.",
};

export const SectionPage = ({ Section, title, sectionKey }: Props) => {
  const { seo, loading } = useAdmin();
  const location = useLocation();
  const ps = sectionKey ? seo.pageSeo?.[sectionKey] : undefined;

  // Draft page → 404 on public site
  if (sectionKey && isPageDraft(sectionKey, seo.pageSeo)) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  // If admin overrode the slug, the default path must 404 (single source of truth).
  if (sectionKey && (sectionKey in BUILTIN_DEFAULT_SLUGS)) {
    const effective = getPagePath(sectionKey as BuiltInPageKey, seo.pageSeo);
    const current = location.pathname.replace(/\/+$/, "") || "/";
    if (current !== effective.replace(/\/+$/, "") && current !== effective) {
      return (
        <Suspense fallback={null}>
          <NotFound />
        </Suspense>
      );
    }
  }

  const path = sectionKey ? getPagePath(sectionKey as any, seo.pageSeo) : undefined;

  useSEO({
    title: ps?.metaTitle || (title ? `${title} — AniRise` : "AniRise"),
    description: ps?.metaDescription || (sectionKey ? SECTION_DESCRIPTIONS[sectionKey] : undefined),
    path,
    canonical: ps?.canonicalAuto === false ? ps?.canonicalUrl : undefined,
    robots: ps?.robots === "noindex" ? "noindex, nofollow" : undefined,
    ...fromPageSeo(ps),
  });


  const isContactPage = sectionKey === "contact";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32">
        <Section />
        {!isContactPage && (
          <div className="border-t border-border/60 mt-12">
            <Contact />
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default SectionPage;
