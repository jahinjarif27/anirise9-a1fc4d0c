import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const CaseStudies = () => {
  const { caseStudies } = useAdmin();
  if (!caseStudies.length) return null;

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Case studies</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Real results, real numbers</h2>
          <p className="mt-3 text-muted-foreground">Snapshots of recent work where visibility turned into measurable business growth.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((c) => (
            <Link to={c.link || "/portfolio"} key={c.id} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/40 flex flex-col">
              {c.image && (
                <div className="aspect-video overflow-hidden bg-secondary">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="inline-flex items-center gap-1.5 self-start bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  <TrendingUp className="h-3.5 w-3.5" /> {c.metric}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{c.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  See case study <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
