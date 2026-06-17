import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useServices } from "@/lib/useServices";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";
import { getPagePath, getPageSlug } from "@/lib/pageConfig";

// Rotating gradient tints for icon tiles (split layout)
const SPLIT_TINTS = [
  "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground ring-accent/30",
  "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground ring-primary/30",
  "bg-gradient-to-br from-foreground to-foreground/70 text-background ring-foreground/20",
  "bg-gradient-to-br from-accent/90 via-primary/70 to-primary text-primary-foreground ring-primary/30",
  "bg-gradient-to-br from-primary via-accent/70 to-accent text-accent-foreground ring-accent/30",
  "bg-gradient-to-br from-foreground/90 via-primary/70 to-accent text-background ring-foreground/20",
];

export const ServicesPreview = () => {
  const { content, servicePreviews, seo } = useAdmin();
  const services = useServices();
  const servicesPath = getPagePath("services", seo.pageSeo);
  const servicesSlug = getPageSlug("services", seo.pageSeo);
  const layout = content.servicesLayout || "marquee";

  // ---------- Light header (used by grid + split) ----------
  const LightHeader = (
    <div className="container relative">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Our Services
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">
            {content.servicesTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">{content.servicesBlurb}</p>
        </div>
        <Link
          to={servicesPath}
          className="text-sm font-semibold text-accent inline-flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  // ---------- Dark header (marquee) ----------
  const DarkHeader = (
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
          to={servicesPath}
          className="text-sm font-semibold text-accent inline-flex items-center gap-1 hover:gap-2 transition-all"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  // ---------- Grid layout (image-1 style: light, dividers, floating icon tile) ----------
  if (layout === "grid") {
    const gridServices = services.slice(0, 6);
    return (
      <section className="py-20 lg:py-24 bg-background relative overflow-hidden">
        {/* subtle vertical stripes background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, hsl(var(--muted)) 0 1px, transparent 1px 80px)",
          }}
          aria-hidden
        />

        {LightHeader}

        <div className="container relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-y-0 divide-y divide-border/70 border border-border/70 rounded-3xl bg-card/40 backdrop-blur-sm overflow-hidden">
            {gridServices.map((s, i) => {
              const sp = servicePreviews?.[s.slug];
              const title = sp?.title?.trim() || s.title;
              const desc = sp?.desc?.trim() || s.desc;
              const isBottomRow = i >= 3;
              return (
                <Link
                  key={s.slug}
                  to={`/${servicesSlug}/${s.publicSlug}`}
                  className={`group relative flex flex-col items-start text-left p-8 lg:p-10 transition-colors hover:bg-accent/5 ${
                    isBottomRow ? "lg:border-t lg:border-border/70" : ""
                  }`}
                >
                  {/* Floating white icon tile */}
                  <div className="mb-6 h-14 w-14 rounded-2xl bg-card shadow-elegant grid place-items-center text-accent group-hover:-translate-y-0.5 group-hover:shadow-glow transition-smooth">
                    <s.icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {desc}
                  </p>
                  <span className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    Learn more →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <SectionNote id="servicesPreview" tone="light" />
      </section>
    );
  }

  // ---------- Split layout (image-2 style: centered icon-led list) ----------
  if (layout === "split") {
    const splitServices = services.slice(0, 6);
    const rows: typeof splitServices[] = [];
    for (let i = 0; i < splitServices.length; i += 2) {
      rows.push(splitServices.slice(i, i + 2));
    }

    const renderItem = (
      s: (typeof splitServices)[number],
      tintIdx: number,
      side: "left" | "right",
    ) => {
      const sp = servicePreviews?.[s.slug];
      const title = sp?.title?.trim() || s.title;
      const desc = sp?.desc?.trim() || s.desc;
      const tint = SPLIT_TINTS[tintIdx % SPLIT_TINTS.length];
      // On lg+: left side aligns text to the right with icon on the right; right side mirrors.
      // On smaller screens everything is centered.
      const sideClasses =
        side === "left"
          ? "lg:flex-row-reverse lg:text-right"
          : "lg:flex-row lg:text-left";

      return (
        <Link
          to={`/${servicesSlug}/${s.publicSlug}`}
          className={`group flex flex-col items-center text-center gap-5 ${sideClasses} lg:items-center`}
        >
          {/* Icon tile */}
          <div className="relative shrink-0">
            <div
              aria-hidden
              className={`absolute inset-0 rounded-2xl ${tint.split(" ").filter(c => c.startsWith("bg-") || c.startsWith("from-") || c.startsWith("via-") || c.startsWith("to-")).join(" ")} blur-xl opacity-40 group-hover:opacity-70 transition-opacity`}
            />
            <div
              className={`relative h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-2xl ${tint} grid place-items-center shadow-elegant ring-1 ring-inset group-hover:scale-105 group-hover:-rotate-3 transition-smooth`}
            >
              <s.icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.6} />
            </div>
          </div>

          {/* Text */}
          <div className="min-w-0 max-w-xs">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground mb-1 group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {desc}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      );
    };

    return (
      <section className="py-20 lg:py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-accent/5 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-border/60 to-transparent hidden lg:block" aria-hidden />

        {LightHeader}

        <div className="container relative max-w-5xl">
          <div className="space-y-12 lg:space-y-16">
            {rows.map((pair, rIdx) => (
              <div
                key={rIdx}
                className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-10 lg:gap-12 justify-items-center"
              >
                {pair[0] ? (
                  renderItem(pair[0], rIdx * 2, "left")
                ) : (
                  <div className="hidden lg:block" />
                )}

                {/* Center divider — vertical on lg, horizontal on smaller */}
                <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden />
                {pair[1] && (
                  <div className="lg:hidden w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
                )}

                {pair[1] ? (
                  renderItem(pair[1], rIdx * 2 + 1, "right")
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        <SectionNote id="servicesPreview" tone="light" />
      </section>
    );
  }


  // ---------- Marquee layout (original) ----------
  const loop = [...services, ...services];
  return (
    <section className="py-20 lg:py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden />

      {DarkHeader}

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
                to={`/${servicesSlug}/${s.publicSlug}`}
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
