import { CheckCircle2, Smile, Target, Rocket, Users, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

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

const chartData = [
  { name: "Projects", value: 15 },
  { name: "Clients", value: 12 },
  { name: "Avg. Traffic Lift %", value: 180 },
  { name: "Avg. ROI %", value: 220 },
  { name: "Retention %", value: 95 },
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

        <div className="mt-16 bg-card rounded-2xl p-6 sm:p-8 border border-border/40 shadow-elegant">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-2">
                AniRise By The Numbers
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Performance you can measure
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              A snapshot of what working with AniRise has looked like across recent client engagements.
            </p>
          </div>
          <div className="w-full h-[360px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={36} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  cursor={{ fill: "hsl(var(--accent) / 0.1)" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))", paddingTop: 8 }} />
                <Bar
                  dataKey="value"
                  name="AniRise"
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
