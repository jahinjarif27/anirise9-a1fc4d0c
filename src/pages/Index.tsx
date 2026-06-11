import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Footer } from "@/components/site/Footer";
import { Blog } from "@/components/site/Blog";
import { About } from "@/components/site/About";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { TrustStrip } from "@/components/site/home/TrustStrip";
import { StatsBand } from "@/components/site/home/StatsBand";
import { ServicesPreview } from "@/components/site/home/ServicesPreview";
import { CaseStudies } from "@/components/site/home/CaseStudies";
import { HomeFAQ } from "@/components/site/home/HomeFAQ";
import { FinalCTA } from "@/components/site/home/FinalCTA";
import { StrategyCall } from "@/components/site/home/StrategyCall";
import { WhyChooseAniRise } from "@/components/site/home/WhyChooseAniRise";

import { HomeLoader } from "@/components/site/HomeLoader";
import { useAdmin } from "@/context/AdminContext";
import { DEFAULT_HOME_ORDER, type HomeBlockId } from "@/context/AdminContext";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { useState } from "react";
import { TextBlocksView } from "@/components/site/TextBlocksView";

const Index = () => {
  const { pageLocation, homeSections, customPages, homeBlocks, seo, content, loading } = useAdmin();
  const [animDone, setAnimDone] = useState(false);
  const showLoader = loading || !animDone;
  const onHome = (k: string) => (pageLocation[k] ?? "home") === "home";
  const ps = seo.pageSeo?.home;
  const psExtra = fromPageSeo(ps);
  const fallbackJsonLd = !psExtra.schemas
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "AniRise",
        url: "https://anirise.com.bd/",
        logo: "https://anirise.com.bd/favicon.jpg",
      }
    : undefined;
  useSEO({
    title: ps?.metaTitle || "AniRise — Visibility · Growth · Success | SEO & Web Agency",
    description:
      ps?.metaDescription ||
      "AniRise is a digital agency helping brands rise online with SEO, ecommerce SEO, web development, and digital marketing. Visibility, growth, success.",
    path: "/",
    canonical: ps?.canonicalAuto === false ? ps?.canonicalUrl : undefined,
    robots: ps?.robots === "noindex" ? "noindex, nofollow" : undefined,
    ...psExtra,
    jsonLd: fallbackJsonLd,
  });

  // Phase 4+ — unified ordering across built-in blocks, custom home sections, and custom pages on home.
  const homeCustomSections = homeSections.filter(
    (s) => s.enabled && (s.groupKey ?? "home") === "home",
  );
  const homeCustomPages = customPages.filter(
    (p) => p.published && (p.groupKey ?? "") === "home",
  );

  const defaultUnified: string[] = [
    ...DEFAULT_HOME_ORDER,
    ...homeCustomSections.map((s) => `hs:${s.id}`),
    ...homeCustomPages.map((p) => `cp:${p.id}`),
  ];
  const savedOrder = Array.isArray(content.homeOrder) ? content.homeOrder : [];
  const orderedIds = [
    ...savedOrder.filter((id) => defaultUnified.includes(id)),
    ...defaultUnified.filter((id) => !savedOrder.includes(id)),
  ];

  const renderBlock = (id: string) => {
    if (id.startsWith("hs:")) {
      const s = homeCustomSections.find((x) => x.id === id.slice(3));
      if (!s) return null;
      return (
        <section key={id} className="py-16 md:py-24">
          <div className="container">
            {s.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{s.title}</h2>}
            {s.image && <img src={s.image} alt={s.imageAlt} className="rounded-2xl w-full mb-6" />}
            <div className="max-w-3xl text-foreground/80">
              <TextBlocksView blocks={s.textBlocks} fallbackBody={s.body} />
            </div>
          </div>
        </section>
      );
    }
    if (id.startsWith("cp:")) {
      const p = homeCustomPages.find((x) => x.id === id.slice(3));
      if (!p) return null;
      return (
        <section key={id} className="py-16 md:py-24">
          <div className="container">
            {p.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{p.title}</h2>}
            {p.image && <img src={p.image} alt={p.imageAlt} className="rounded-2xl w-full mb-6" />}
            <div className="max-w-3xl text-foreground/80">
              <TextBlocksView blocks={p.textBlocks} fallbackBody={p.body} />
            </div>
          </div>
        </section>
      );
    }
    switch (id as HomeBlockId) {
      case "hero":            return onHome("hero") ? <Hero key={id} /> : null;
      case "trustStrip":      return homeBlocks.trustStrip ? <TrustStrip key={id} /> : null;
      case "stats":           return homeBlocks.stats ? <StatsBand key={id} /> : null;
      case "servicesPreview": return homeBlocks.servicesPreview ? <ServicesPreview key={id} /> : null;
      case "about":           return <About key={id} />;
      case "caseStudies":     return homeBlocks.caseStudies ? <CaseStudies key={id} /> : null;
      case "processFlow":     return null;
      case "whyChoose":       return <WhyChooseAniRise key={id} />;
      case "strategyCall":    return <StrategyCall key={id} />;
      case "homeFaq":         return homeBlocks.homeFaq ? <HomeFAQ key={id} /> : null;
      case "blog":            return onHome("blog") ? <Blog key={id} /> : null;
      case "finalCta":        return homeBlocks.finalCta ? <FinalCTA key={id} /> : null;
      default:                return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showLoader && <HomeLoader onDone={() => setAnimDone(true)} />}
      <Navbar />
      <main>
        {orderedIds.map(renderBlock)}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;

