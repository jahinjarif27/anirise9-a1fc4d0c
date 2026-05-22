import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { StrategyCall } from "@/components/site/home/StrategyCall";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { useAdmin } from "@/context/AdminContext";

const StrategyCallPage = () => {
  const { seo } = useAdmin();
  const override = seo.pageSeo?.["strategy-call"];
  useSEO({
    title: override?.metaTitle || "Book A Strategy Call — AniRise",
    description:
      override?.metaDescription ||
      "Book a free strategy call with AniRise. Share your business challenges and get a tailored growth plan within 24 hours.",
    path: "/strategy-call",
    canonical: override?.canonicalAuto === false ? override?.canonicalUrl : undefined,
    robots: override?.robots === "noindex" ? "noindex, nofollow" : undefined,
    ...fromPageSeo(override),
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32">
        <StrategyCall />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default StrategyCallPage;
