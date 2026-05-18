import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolio, loading } = useAdmin();
  const p = portfolio.find((x) => x.id === id);

  useSEO({
    title: p ? `${p.title} — Project | AniRise` : "Project | AniRise",
    description: p?.description || "AniRise project case.",
    path: `/portfolio/${id}`,
  });

  if (loading) return null;
  if (!p) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Project not found</h1>
          <Link to="/portfolio" className="text-accent underline">Back to projects</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <Link to="/portfolio" className="inline-flex items-center gap-1 text-sm font-semibold text-accent mb-6 hover:gap-2 transition-all">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          {p.tag && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{p.tag}</p>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">{p.title}</h1>
          {p.image && (
            <img src={p.image} alt={p.imageAlt || p.title} className="w-full rounded-2xl mb-8 aspect-[16/9] object-cover" />
          )}
          {p.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{p.description}</p>
          )}
          {p.body && (
            <div className="prose prose-lg max-w-none whitespace-pre-line text-foreground/85">{p.body}</div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProjectDetail;
