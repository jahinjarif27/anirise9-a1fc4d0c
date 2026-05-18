import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import logo from "@/assets/anirise-logo.jpg";

const steps = [
  {
    icon: "Users",
    title: "Understanding Client Requirements & Goals",
    chip: "Identifying Brand",
  },
  {
    icon: "Search",
    title: "Conducting Market Research & Planning Strategy",
    chip: "Strategy Mapping",
  },
  {
    icon: "PenTool",
    title: "Campaign Setup & Content Creation",
    chip: "Compelling Copywriting",
  },
  {
    icon: "Rocket",
    title: "Executing Campaigns, AI Integration & Promotion",
    chip: "Performance Driven SEO",
  },
  {
    icon: "Gauge",
    title: "Monitoring, Optimization & Improvement",
    chip: "Live Tracking",
  },
  {
    icon: "TrendingUp",
    title: "Reporting Results & Client Support",
    chip: "Unstoppable Growth",
  },
];

const Ico = ({ name, className }: { name: string; className?: string }) => {
  const C = (Icons as any)[name];
  return C ? <C className={className} /> : <Sparkles className={className} />;
};

export const ProcessSteps = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Intersection-observer staggered reveal
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(steps.map(() => false));

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => {
              if (prev[i]) return prev;
              const next = [...prev];
              next[i] = true;
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      ref={wrapRef}
      className="py-20 lg:py-28 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--accent)/0.10),_transparent_55%)]"
    >
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            How We Work
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
            Our 6-Step <span className="text-gradient-accent">Growth Process</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            A clear, proven path — from understanding your brand to delivering unstoppable growth.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Center decorative orb (visible on lg) */}
          <div className="hidden lg:grid place-items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 -m-6 rounded-full bg-accent/20 blur-2xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-primary grid place-items-center shadow-elegant ring-4 ring-background overflow-hidden">
                <img src={logo} alt="AniRise" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {steps.map((s, i) => {
            const isActive = active === i;
            return (
              <div
                key={s.title}
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                className={[
                  "group relative rounded-3xl p-6 sm:p-7 border bg-card/80 backdrop-blur-sm transition-all duration-500 cursor-default outline-none",
                  "shadow-card hover:shadow-elegant",
                  isActive
                    ? "border-accent/60 -translate-y-1"
                    : "border-border/50 hover:border-accent/40",
                  visible[i]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6",
                ].join(" ")}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Accent glow */}
                <div
                  className={[
                    "absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500",
                    "bg-gradient-to-br from-accent/10 via-transparent to-primary/5",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  ].join(" ")}
                  aria-hidden
                />

                <div className="relative flex items-start justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold tracking-wide">
                    Step · {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={[
                      "h-11 w-11 rounded-2xl grid place-items-center transition-all duration-500",
                      isActive
                        ? "bg-gradient-accent text-accent-foreground scale-110 rotate-6"
                        : "bg-accent/10 text-accent",
                    ].join(" ")}
                  >
                    <Ico name={s.icon} className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="relative text-lg sm:text-xl font-extrabold text-foreground leading-snug mb-4">
                  {s.title}
                </h3>

                <div className="relative">
                  <div
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold border transition-all duration-500",
                      isActive
                        ? "bg-gradient-primary text-primary-foreground border-transparent translate-x-1"
                        : "bg-background text-foreground/80 border-border/60",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-5 w-5 rounded-md grid place-items-center text-[10px] font-bold",
                        isActive ? "bg-accent text-accent-foreground" : "bg-accent/15 text-accent",
                      ].join(" ")}
                    >
                      ✦
                    </span>
                    {s.chip}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
