import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ReactNode, useEffect } from "react";

export const ServiceLayout = ({ title, children }: { title: string; children: ReactNode }) => {
  useEffect(() => {
    document.title = `${title} — AniRise`;
  }, [title]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
