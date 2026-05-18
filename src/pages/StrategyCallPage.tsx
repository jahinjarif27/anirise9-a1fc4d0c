import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { StrategyCall } from "@/components/site/home/StrategyCall";
import { useSEO } from "@/hooks/useSEO";

const StrategyCallPage = () => {
  useSEO({
    title: "Book A Strategy Call — AniRise",
    description:
      "Book a free strategy call with AniRise. Share your business challenges and get a tailored growth plan within 24 hours.",
    path: "/strategy-call",
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
