import { Link, Navigate } from "react-router-dom";
import { lazy } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceLayout } from "@/pages/services/ServiceLayout";
import { ServiceFAQ } from "@/components/site/ServiceFAQ";
import { useAdmin } from "@/context/AdminContext";
import { defaultServiceContent, ServiceContent } from "@/data/serviceContentDefaults";
import { useServices } from "@/lib/useServices";
const NotFound = lazy(() => import("@/pages/NotFound"));
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

const Icon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return null;
  const Cmp = (Icons as any)[name] as React.ComponentType<{ className?: string }>;
  if (!Cmp) return <Sparkles className={className} />;
  return <Cmp className={className} />;
};

const merge = (a: ServiceContent, b?: Partial<ServiceContent>): ServiceContent => {
  if (!b) return a;
  return {
    ...a,
    ...b,
    chart: { ...a.chart, ...(b.chart || {}), bars: b.chart?.bars?.length ? b.chart.bars : a.chart.bars },
    stats: b.stats?.length ? b.stats : a.stats,
    whyCards: b.whyCards?.length ? b.whyCards : a.whyCards,
    processSteps: b.processSteps?.length ? b.processSteps : a.processSteps,
    deliverables: b.deliverables?.length ? b.deliverables : a.deliverables,
  };
};

export const ServicePageTemplate = ({ slug: incomingSlug }: { slug: string }) => {
  const { serviceContent } = useAdmin();
  const services = useServices();
  // Accept either identity slug OR public URL slug.
  const match = services.find((s) => s.slug === incomingSlug || s.publicSlug === incomingSlug);
  const slug = match?.slug ?? incomingSlug;
  const service = match;
  const base = defaultServiceContent[slug] ?? {
    ...defaultServiceContent["website-seo"],
    heroEyebrow: service?.title ?? "Service",
    heroHeadlineBefore: service?.title ?? "Service",
    heroHeadlineAccent: "",
    heroBlurb: service?.desc ?? "",
    stats: [], whyCards: [], processSteps: [], deliverables: [],
    chart: { enabled: false, eyebrow: "", title: "", subtitle: "", bars: [] },
  };
  const c = merge(base, serviceContent?.[slug]);

  const publicSlug = service?.publicSlug ?? slug;
  return (
    <ServiceLayout title={service?.title ?? c.heroEyebrow ?? "Service"} description={c.heroBlurb} path={`/services/${publicSlug}`}>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {c.heroEyebrow && (
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">{c.heroEyebrow}</p>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground break-words">
              {c.heroHeadlineBefore}{" "}
              {c.heroHeadlineAccent && <span className="text-gradient-accent">{c.heroHeadlineAccent}</span>}
            </h1>
            {c.heroBlurb && (
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{c.heroBlurb}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              {c.heroPrimaryLabel && (
                <Button asChild variant="hero" size="xl">
                  <Link to={c.heroPrimaryUrl || "/#contact"}>
                    {c.heroPrimaryLabel} <ArrowRight />
                  </Link>
                </Button>
              )}
              {c.heroSecondaryLabel && (
                <Button asChild variant="outline" size="xl" className="rounded-full">
                  <a href={c.heroSecondaryUrl || "#process"}>{c.heroSecondaryLabel}</a>
                </Button>
              )}
            </div>
          </div>
          {c.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {c.stats.map((s) => (
                <div key={s.id} className="bg-card rounded-2xl p-6 shadow-card border border-border/40">
                  <p className="text-3xl font-extrabold text-gradient-accent">{s.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why cards */}
      {c.whyCards.length > 0 && (
        <section className="py-20">
          <div className="container">
            {(c.whyEyebrow || c.whyTitle) && (
              <div className="max-w-2xl mb-12">
                {c.whyEyebrow && <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{c.whyEyebrow}</p>}
                {c.whyTitle && <h2 className="text-4xl font-extrabold text-foreground">{c.whyTitle}</h2>}
              </div>
            )}
            <div className={`grid md:grid-cols-2 lg:grid-cols-${Math.min(4, c.whyCards.length)} gap-6`}>
              {c.whyCards.map((b) => (
                <div key={b.id} className="bg-card rounded-2xl p-8 shadow-card border border-border/40">
                  <div className="h-12 w-12 rounded-xl bg-gradient-accent text-accent-foreground grid place-items-center mb-5">
                    <Icon name={b.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      {c.processSteps.length > 0 && (
        <section id="process" className="py-20 bg-secondary/40">
          <div className="container">
            <div className="max-w-2xl mb-12">
              {c.processEyebrow && <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{c.processEyebrow}</p>}
              {c.processTitle && <h2 className="text-4xl font-extrabold text-foreground">{c.processTitle}</h2>}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {c.processSteps.map((p, i) => (
                <div key={p.id} className="relative bg-card rounded-2xl p-6 shadow-card border border-border/40">
                  <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-gradient-accent text-accent-foreground grid place-items-center text-sm font-bold">{i + 1}</span>
                  <Icon name={p.icon} className="h-7 w-7 text-accent mb-3" />
                  <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deliverables */}
      {c.deliverables.length > 0 && (
        <section id="deliverables" className="py-20">
          <div className="container grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {c.deliverablesEyebrow && <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{c.deliverablesEyebrow}</p>}
              {c.deliverablesTitle && <h2 className="text-4xl font-extrabold text-foreground mb-4">{c.deliverablesTitle}</h2>}
              {c.deliverablesBlurb && <p className="text-muted-foreground text-lg">{c.deliverablesBlurb}</p>}
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {c.deliverables.map((d) => (
                <li key={d.id} className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card border border-border/40">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground">{d.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Chart */}
      {c.chart.enabled && c.chart.bars.length > 0 && (
        <section className="py-20 bg-secondary/40">
          <div className="container">
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/40 shadow-elegant">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                  {c.chart.eyebrow && <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-2">{c.chart.eyebrow}</p>}
                  {c.chart.title && <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">{c.chart.title}</h3>}
                </div>
                {c.chart.subtitle && <p className="text-sm text-muted-foreground max-w-sm">{c.chart.subtitle}</p>}
              </div>
              <div className="w-full h-[360px] sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={c.chart.bars} margin={{ top: 10, right: 10, left: -15, bottom: 60 }}>
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
                    <Bar dataKey="value" name={service?.title ?? "Result"} fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <ServiceFAQ slug={slug} />

      {/* CTA */}
      {(c.ctaHeadline || c.ctaLabel) && (
        <section className="py-20">
          <div className="container">
            <div className="bg-gradient-primary rounded-3xl p-10 lg:p-16 text-center shadow-elegant">
              {c.ctaHeadline && <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground">{c.ctaHeadline}</h2>}
              {c.ctaBlurb && <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">{c.ctaBlurb}</p>}
              {c.ctaLabel && (
                <Button asChild variant="hero" size="xl" className="mt-8">
                  <Link to={c.ctaUrl || "/#contact"}>{c.ctaLabel} <ArrowRight /></Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </ServiceLayout>
  );
};
