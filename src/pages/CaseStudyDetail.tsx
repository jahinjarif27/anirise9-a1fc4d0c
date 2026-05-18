import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";

const CaseStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { caseStudies } = useAdmin();
  const cs = caseStudies.find((c) => c.id === id);

  useSEO({
    title: cs ? `${cs.title} — Case Study | AniRise` : "Case Study | AniRise",
    description: cs?.description || "AniRise case study.",
    path: `/case-studies/${id}`,
  });

  if (!cs) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Case study not found</h1>
          <Link to="/" className="text-accent underline">Back to home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-20 lg:py-24">
        <div className="container max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-accent mb-6 hover:gap-2 transition-all">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full mb-4">
            <TrendingUp className="h-3.5 w-3.5" /> {cs.metric}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">{cs.title}</h1>
          {cs.image && (
            <img src={cs.image} alt={cs.imageAlt || cs.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />
          )}
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{cs.description}</p>
          {cs.body && (
            <div className="prose prose-lg max-w-none whitespace-pre-line text-foreground/85">{cs.body}</div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CaseStudyDetail;
