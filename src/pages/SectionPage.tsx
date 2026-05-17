import { ComponentType } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Contact } from "@/components/site/Contact";
import { useSEO } from "@/hooks/useSEO";

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
  useSEO({
    title: title ? `${title} — AniRise` : "AniRise",
    description: sectionKey ? SECTION_DESCRIPTIONS[sectionKey] : undefined,
    path: sectionKey ? `/${sectionKey}` : undefined,
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
