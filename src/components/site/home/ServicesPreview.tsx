import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useServices } from "@/lib/useServices";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";

export const ServicesPreview = () => {
  const { content, servicePreviews } = useAdmin();
  const services = useServices();
  const layout = content.servicesLayout || "marquee";

  // ---------- Shared header ----------
  const Header = (
    <div className="container relative">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Our Services
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold">{content.servicesTitle}</h2>
          <p className="mt-3 text-primary-foreground/80">{content.servicesBlurb}</p>
        </div>
        <Link
          to="/services"
          className="text-sm font-semibold text-accent inline-flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  // ---------- Grid layout (3 columns × 2 rows, no animation) ----------
  if (layout === "grid") {
    const gridServices = services.slice(0, 6);
    return (
      <section className="py-20 lg:py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden />

        {Header}

        <div className="container relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {gridServices.map((s) => {
              const sp = servicePreviews?.[s.slug];
              const title = sp?.title?.trim() || s.title;
              const desc = sp?.desc?.trim() || s.desc;
              return (
                <Link
                  key={s.slug}
                  to={`/services/${s.publicSlug}`}
                  className="group relative flex flex-col bg-card text-foreground rounded-2xl p-7 shadow-elegant border border-primary-foreground/5 hover:border-accent/40 hover:shadow-glow transition-smooth"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="h-14 w-14 rounded-xl bg-accent/15 grid place-items-center text-accent">
                      <s.icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <span className="h-9 w-9 rounded-full border border-border grid place-items-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-smooth">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {desc}
                  </p>
                  <span className="mt-5 pt-4 border-t border-border/60 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Learn more
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <SectionNote id="servicesPreview" tone="onDark" />
      </section>
    );
  }

  // ---------- Marquee layout (original) ----------
  const loop = [...services, ...services];
  return (
    <section className="py-20 lg:py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden />

      {Header}

      {/* Continuous auto-scroll marquee (also manually swipeable) */}
      <div
        className="relative w-full overflow-x-auto overflow-y-hidden group [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex gap-6 w-max animate-services-marquee [animation-duration:18s] md:[animation-duration:40s] group-hover:[animation-play-state:paused] hover:[animation-play-state:paused] active:[animation-play-state:paused] focus-within:[animation-play-state:paused]">

          {loop.map((s, idx) => {
            const sp = servicePreviews?.[s.slug];
            return (
            <Link
              key={`${s.slug}-${idx}`}
              to={`/services/${s.publicSlug}`}
              className="group/card block w-[280px] sm:w-[320px] shrink-0 bg-card rounded-3xl p-6 shadow-elegant hover:scale-[1.02] transition-smooth"
            >
              <div className="aspect-square rounded-2xl bg-accent/20 grid place-items-center mb-5 overflow-hidden group-hover/card:bg-gradient-accent transition-smooth">
                {sp?.image ? (
                  <img src={sp.image} alt={sp.imageAlt || s.title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <s.icon
                    className="h-20 w-20 text-accent group-hover/card:text-accent-foreground transition-smooth"
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2 text-center">
                {sp?.title?.trim() || s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-center italic line-clamp-3">
                {sp?.desc?.trim() || s.desc}
              </p>
            </Link>
            );
          })}
        </div>
      </div>
      <SectionNote id="servicesPreview" tone="onDark" />
    </section>
  );
};
