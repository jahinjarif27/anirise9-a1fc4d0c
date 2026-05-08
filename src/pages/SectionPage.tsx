import { ComponentType, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Contact } from "@/components/site/Contact";

type Props = {
  Section: ComponentType;
  title?: string;
  sectionKey?: string;
};

export const SectionPage = ({ Section, title, sectionKey }: Props) => {
  useEffect(() => {
    if (title) document.title = `${title} — AniRise`;
  }, [title]);

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
