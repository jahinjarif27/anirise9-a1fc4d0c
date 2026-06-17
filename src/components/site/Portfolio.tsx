import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin, PROJECT_CATEGORIES } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { SectionNote } from "@/components/site/SectionNote";
import { getPageSlug } from "@/lib/pageConfig";

export const Portfolio = () => {
  const { content, portfolio, seo } = useAdmin();
  const [active, setActive] = useState<string>("All");
  const portfolioSlug = getPageSlug("portfolio", seo.pageSeo);

  const categories = useMemo(() => {
    const used = new Set(portfolio.map((p) => p.category).filter(Boolean) as string[]);
    const ordered = PROJECT_CATEGORIES.filter((c) => used.has(c));
    return ["All", ...ordered];
  }, [portfolio]);

  const sorted = useMemo(
    () => [...portfolio].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
    [portfolio],
  );
  const filtered = active === "All" ? sorted : sorted.filter((p) => p.category === active);

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Our Projects
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">{content.portfolioTitle}</h2>
          <p className="mt-4 text-muted-foreground">{content.portfolioBlurb}</p>
        </div>

        {categories.length > 1 && (
          <div className="mb-10 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-center min-w-max sm:min-w-0 sm:flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth whitespace-nowrap border",
                    active === c
                      ? "bg-accent text-accent-foreground border-accent shadow-card"
                      : "bg-secondary text-foreground/80 border-transparent hover:bg-secondary/70"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No projects in this category yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((it) => (
              <Link
                key={it.id}
                to={`/${portfolioSlug}/${it.slug?.trim() || it.id}`}
                aria-label={`View project: ${it.title}`}
                className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-elegant transition-smooth block cursor-pointer ring-1 ring-border/40 hover:ring-accent/60 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={it.image}
                    alt={it.imageAlt || it.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="w-full aspect-[5/4] object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-accent text-accent-foreground shadow-elegant opacity-90 group-hover:opacity-100 group-hover:rotate-[-45deg] transition-smooth">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {it.tag && <p className="text-[10px] font-semibold tracking-widest text-accent uppercase mb-1.5">{it.tag}</p>}
                    <h3 className="text-lg sm:text-xl font-bold text-primary-foreground leading-tight">{it.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground/90 group-hover:gap-2 transition-all">
                      View project
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SectionNote id="portfolioPage" />
    </section>
  );
};
