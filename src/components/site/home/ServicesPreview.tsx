import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useServices } from "@/lib/useServices";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";

export const ServicesPreview = () => {
  const { content, servicePreviews } = useAdmin();
  const services = useServices();
  // Duplicate list so marquee loops seamlessly
  const loop = [...services, ...services];

  return (
    <section className="py-20 lg:py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden />

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

      {/* Continuous auto-scroll marquee */}
      <div
        className="relative w-full overflow-hidden group"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex gap-6 w-max animate-services-marquee group-hover:[animation-play-state:paused]">
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
