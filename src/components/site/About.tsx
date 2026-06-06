import { CheckCircle2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const FALLBACK_PILLARS = [
  { title: "Visibility", desc: "Get discovered by the right audience at the right moment." },
  { title: "Growth", desc: "Scale traffic, leads, and revenue with proven strategies." },
  { title: "Success", desc: "A clear roadmap toward measurable, lasting business success." },
];

export const About = () => {
  const { content } = useAdmin();
  const pillars = (content.aboutPillars && content.aboutPillars.length > 0) ? content.aboutPillars : FALLBACK_PILLARS;
  const eyebrow = content.aboutEyebrow || "About AniRise";
  const statValue = content.aboutStatValue || "100%";
  const statLabel = content.aboutStatLabel || "Client Focused";

  return (
    <section id="about" className="py-24 bg-secondary/40">
      <div className="container grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative">
          <div className="aspect-square max-w-md mx-auto rounded-[2rem] bg-gradient-primary p-10 shadow-elegant grid place-items-center">
            <img src={content.aboutImage} alt={content.aboutImageAlt} width={320} height={320} className="w-2/3 rounded-3xl shadow-elegant object-cover" loading="lazy" />
          </div>
          {(statValue || statLabel) && (
            <div className="absolute -bottom-6 right-6 bg-card rounded-2xl shadow-elegant px-6 py-4">
              {statValue && <p className="text-3xl font-extrabold text-gradient-primary">{statValue}</p>}
              {statLabel && <p className="text-xs text-muted-foreground font-medium">{statLabel}</p>}
            </div>
          )}
        </div>

        <div>
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
              {eyebrow}
            </p>
          )}
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
            {content.aboutHeadline}
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            {content.aboutBlurb}
          </p>

          <div className="mt-8 space-y-4">
            {pillars.map((p, i) => (
              <div key={`${p.title}-${i}`} className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
