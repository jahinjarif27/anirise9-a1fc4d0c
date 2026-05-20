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
import { ProcessSteps } from "@/components/site/home/ProcessSteps";
import { HomeLoader } from "@/components/site/HomeLoader";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import { useState } from "react";

const Index = () => {
  const { pageLocation, homeSections, customPages, homeBlocks, seo, loading } = useAdmin();
  const [animDone, setAnimDone] = useState(false);
  const showLoader = loading || !animDone;
  const onHome = (k: string) => (pageLocation[k] ?? "home") === "home";
  const ps = seo.pageSeo?.home;
  const userSchemas = ps?.schemas?.filter((s) => s.enabled) ?? [];
  // Fallback Organization JSON-LD when admin hasn't configured page-level schemas
  const fallbackJsonLd = userSchemas.length === 0
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
    schemas: userSchemas.length > 0 ? userSchemas : undefined,
    jsonLd: fallbackJsonLd,
  });

  return (
    <div className="min-h-screen bg-background">
      {showLoader && <HomeLoader onDone={() => setAnimDone(true)} />}
      <Navbar />
      <main>
        {onHome("hero") && <Hero />}
        {homeBlocks.trustStrip && <TrustStrip />}
        {homeBlocks.stats && <StatsBand />}
        {homeBlocks.servicesPreview && <ServicesPreview />}
        <About />
        {homeBlocks.caseStudies && <CaseStudies />}
        {homeBlocks.processFlow && <ProcessSteps />}
        <WhyChooseAniRise />
        <StrategyCall />
        {homeBlocks.homeFaq && <HomeFAQ />}
        {onHome("blog") && <Blog />}
        {homeBlocks.finalCta && <FinalCTA />}
        {homeSections.filter((s) => s.enabled && (s.groupKey ?? "home") === "home").map((s) => (
          <section key={s.id} className="py-16 md:py-24">
            <div className="container">
              {s.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{s.title}</h2>}
              {s.image && <img src={s.image} alt={s.imageAlt} className="rounded-2xl w-full mb-6" />}
              {s.body && <p className="text-foreground/80 whitespace-pre-line max-w-3xl">{s.body}</p>}
            </div>
          </section>
        ))}
        {customPages.filter((p) => p.published && (p.groupKey ?? "") === "home").map((p) => (
          <section key={p.id} className="py-16 md:py-24">
            <div className="container">
              {p.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{p.title}</h2>}
              {p.image && <img src={p.image} alt={p.imageAlt} className="rounded-2xl w-full mb-6" />}
              {p.body && <p className="text-foreground/80 whitespace-pre-line max-w-3xl">{p.body}</p>}
            </div>
          </section>
        ))}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
