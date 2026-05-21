import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";


const Ico = ({ name, className }: { name: string; className?: string }) => {
  const C = (Icons as any)[name];
  return C ? <C className={className} /> : <Sparkles className={className} />;
};

// Bento placement: each step gets an asymmetric tile size + position.
// Both mobile (2-col) and desktop (4-col) keep a "messy but balanced" bento layout.
// Tailwind needs full class strings to be detected, so we list them explicitly.
const TILE_SHAPES: { mobile: string; desktop: string; size: "lg" | "md" | "sm" }[] = [
  // Step 1 – big anchor top-left
  { mobile: "col-span-2 row-span-2", desktop: "lg:col-span-2 lg:row-span-2", size: "lg" },
  // Step 2 – tall right
  { mobile: "col-span-2 row-span-1", desktop: "lg:col-span-2 lg:row-span-1", size: "md" },
  // Step 3 – small
  { mobile: "col-span-1 row-span-1", desktop: "lg:col-span-1 lg:row-span-1", size: "sm" },
  // Step 4 – wide
  { mobile: "col-span-1 row-span-1", desktop: "lg:col-span-1 lg:row-span-2", size: "md" },
  // Step 5 – small
  { mobile: "col-span-2 row-span-1", desktop: "lg:col-span-2 lg:row-span-1", size: "md" },
  // Step 6 – big finisher bottom-right
  { mobile: "col-span-2 row-span-2", desktop: "lg:col-span-2 lg:row-span-2", size: "lg" },
];

export const ProcessSteps = () => {
  const { processFlow } = useAdmin();
  const steps = processFlow.steps;

  const [active, setActive] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    setVisible(steps.map(() => false));
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
        { threshold: 0.18 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [steps.length]);

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--accent)/0.10),_transparent_55%)]"
    >
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          {processFlow.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
              {processFlow.eyebrow}
            </p>
          )}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
            {processFlow.titleBefore}{" "}
            <span className="text-gradient-accent">{processFlow.titleAccent}</span>
          </h2>
          {processFlow.blurb && (
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">{processFlow.blurb}</p>
          )}
        </div>

        {/* Bento grid: 2 cols on mobile, 4 cols on desktop. auto-rows give the messy bento feel. */}
        <div
          className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
          style={{ gridAutoRows: "minmax(150px, auto)" }}
        >
          {steps.map((s, i) => {
            const shape = TILE_SHAPES[i % TILE_SHAPES.length];
            const isActive = active === i;
            const sizeClass =
              shape.size === "lg"
                ? "p-5 sm:p-7"
                : shape.size === "md"
                ? "p-4 sm:p-6"
                : "p-4 sm:p-5";
            const titleClass =
              shape.size === "lg"
                ? "text-base sm:text-xl lg:text-2xl"
                : shape.size === "md"
                ? "text-sm sm:text-lg"
                : "text-sm sm:text-base";

            return (
              <div
                key={s.id}
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                className={[
                  shape.mobile,
                  shape.desktop,
                  sizeClass,
                  "group relative rounded-3xl border bg-card/80 backdrop-blur-sm transition-all duration-500 cursor-default outline-none overflow-hidden",
                  "shadow-card hover:shadow-elegant flex flex-col justify-between",
                  isActive ? "border-accent/60 -translate-y-1" : "border-border/50 hover:border-accent/40",
                  visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                ].join(" ")}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {/* accent glow */}
                <div
                  className={[
                    "absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500",
                    "bg-gradient-to-br from-accent/10 via-transparent to-primary/5",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  ].join(" ")}
                  aria-hidden
                />

                {/* flowing connector line: animates from previous step into this card */}
                {visible[i] && (
                  <span
                    aria-hidden
                    className="absolute -top-px left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent process-flow-line"
                    style={{ animationDelay: `${i * 180 + 200}ms` }}
                  />
                )}

                <div className="relative flex items-start justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide">
                    Step · {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={[
                      "rounded-2xl grid place-items-center transition-all duration-500 shrink-0",
                      shape.size === "lg" ? "h-12 w-12" : "h-10 w-10",
                      isActive
                        ? "bg-gradient-accent text-accent-foreground scale-110 rotate-6"
                        : "bg-accent/10 text-accent",
                    ].join(" ")}
                  >
                    <Ico name={s.icon} className={shape.size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
                  </div>
                </div>

                <h3 className={`relative font-extrabold text-foreground leading-snug ${titleClass}`}>
                  {s.title}
                </h3>

                <div className="relative mt-3">
                  <div
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-semibold border transition-all duration-500",
                      isActive
                        ? "bg-gradient-primary text-primary-foreground border-transparent translate-x-1"
                        : "bg-background text-foreground/80 border-border/60",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-4 w-4 rounded-md grid place-items-center text-[9px] font-bold",
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

      {/* keyframes for the flowing connector line */}
      <style>{`
        @keyframes process-flow {
          0%   { transform: scaleX(0); transform-origin: left center; opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: scaleX(1); transform-origin: left center; opacity: 0.9; }
        }
        .process-flow-line {
          transform: scaleX(0);
          animation: process-flow 1.2s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
