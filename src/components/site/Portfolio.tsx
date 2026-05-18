import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin, PROJECT_CATEGORIES } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

export const Portfolio = () => {
  const { content, portfolio } = useAdmin();
  const [active, setActive] = useState<string>("All");

  const categories = useMemo(() => {
    const used = new Set(portfolio.map((p) => p.category).filter(Boolean) as string[]);
    const ordered = PROJECT_CATEGORIES.filter((c) => used.has(c));
    return ["All", ...ordered];
  }, [portfolio]);

  const filtered = active === "All" ? portfolio : portfolio.filter((p) => p.category === active);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((it) => (
              <Link
                key={it.id}
                to={`/portfolio/${it.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-elegant transition-smooth block"
              >
                <img
                  src={it.image}
                  alt={it.imageAlt || it.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-smooth">
                  <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-1">{it.tag}</p>
                  <h3 className="text-xl font-bold text-primary-foreground">{it.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
