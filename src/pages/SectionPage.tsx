import { ComponentType } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const SectionPage = ({ Section }: { Section: ComponentType }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32">
        <Section />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default SectionPage;
