import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useSEO } from "@/hooks/useSEO";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  path?: string;
  children: ReactNode;
};

export const ServiceLayout = ({ title, description, path, children }: Props) => {
  useSEO({
    title: `${title} — AniRise`,
    description,
    path,
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
