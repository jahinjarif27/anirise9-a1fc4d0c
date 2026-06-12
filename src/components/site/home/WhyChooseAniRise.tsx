import { CheckCircle2, Smile, Target, Rocket, Users, ShieldCheck } from "lucide-react";
import { SectionNote } from "@/components/site/SectionNote";

const reasons = [
  {
    icon: CheckCircle2,
    title: "Expert Hybrid Team",
    desc: "A flexible, collaborative team that adapts to your unique project needs, delivering excellence every time.",
  },
  {
    icon: Smile,
    title: "Affordable Excellence",
    desc: "We provide high-quality services at competitive prices, maximizing your return on investment.",
  },
  {
    icon: Target,
    title: "Client-Centric Approach",
    desc: "Your satisfaction is at the heart of everything we do. We listen, plan, and execute around your goals.",
  },
  {
    icon: Rocket,
    title: "Proven Growth Engine",
    desc: "Data-led SEO, design, and development frameworks built to scale visibility and revenue together.",
  },
  {
    icon: Users,
    title: "2+ Years Of Experience",
    desc: "Hands-on experience across 15+ brands in SEO, web, and digital marketing — and counting.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Reporting",
    desc: "Clear monthly reports, honest timelines, and full ownership of everything we build for you.",
  },
];

export const WhyChooseAniRise = () => {
  return (
    <section id="why-anirise" className="py-20 lg:py-24 bg-secondary/40">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Why Choose Us
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">
            Why Choose AniRise?
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            A focused agency built around results — not promises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="bg-card rounded-2xl p-6 border border-border/40 shadow-card hover:shadow-elegant transition-smooth"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent grid place-items-center mb-5">
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

      </div>
      <SectionNote id="whyChoose" />
    </section>
  );
};
