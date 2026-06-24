import { Link } from "react-router-dom";
import { lazy } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceLayout } from "@/pages/services/ServiceLayout";
import { ServiceFAQ } from "@/components/site/ServiceFAQ";
import { SectionNote } from "@/components/site/SectionNote";
import { useAdmin } from "@/context/AdminContext";
import { getPagePath } from "@/lib/pageConfig";
import {
  defaultServiceContent,
  ServiceContent,
  SERVICE_SECTION_IDS,
  type ServiceSectionId,
} from "@/data/serviceContentDefaults";
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
    pricing: {
      ...a.pricing,
      ...(b.pricing || {}),
      tiers: b.pricing?.tiers?.length ? b.pricing.tiers : a.pricing.tiers,
    },
    pricingParagraph: {
      ...(a.pricingParagraph ?? { enabled: false, eyebrow: "", title: "", titleAccent: "", tabs: [], paragraph: "" }),
      ...(b.pricingParagraph || {}),
      tabs: b.pricingParagraph?.tabs?.length ? b.pricingParagraph.tabs : (a.pricingParagraph?.tabs ?? []),
    },
    stats: b.stats?.length ? b.stats : a.stats,
    whyCards: b.whyCards?.length ? b.whyCards : a.whyCards,
    processSteps: b.processSteps?.length ? b.processSteps : a.processSteps,
    deliverables: b.deliverables?.length ? b.deliverables : a.deliverables,
    sectionOrder: b.sectionOrder?.length ? b.sectionOrder : a.sectionOrder,
  };
};


export const ServicePageTemplate = ({ slug: incomingSlug }: { slug: string }) => {
  const { serviceContent, seo } = useAdmin();
  const services = useServices();
  const portfolioPath = getPagePath("portfolio", seo.pageSeo);
  const match = services.find((s) => s.publicSlug === incomingSlug);
  if (!match) return <NotFound />;
  const slug = match.slug;
  const service = match;
  const base = defaultServiceContent[slug] ?? {
    ...defaultServiceContent["website-seo"],
    heroEyebrow: service?.title ?? "Service",
    heroHeadlineBefore: service?.title ?? "Service",
    heroHeadlineAccent: "",
    heroBlurb: service?.desc ?? "",
    stats: [], whyCards: [], processSteps: [], deliverables: [],
    chart: { enabled: false, eyebrow: "", title: "", subtitle: "", bars: [] },
    pricing: { enabled: false, eyebrow: "", title: "", blurb: "", tiers: [] },
    pricingParagraph: { enabled: false, eyebrow: "", title: "", titleAccent: "", tabs: [], paragraph: "" },
  };

  const c = merge(base, serviceContent?.[slug]);

  const publicSlug = service?.publicSlug ?? slug;

  const sections: Record<ServiceSectionId, JSX.Element | null> = {
    hero: (
      <section key="hero" className="bg-gradient-hero py-20 lg:py-28 relative overflow-hidden">
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
    ),
    whyCards: c.whyCards.length > 0 ? (
      <section key="whyCards" className="py-20">
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
    ) : null,
    process: c.processSteps.length > 0 ? (
      <section key="process" id="process" className="py-20 bg-secondary/40">
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
    ) : null,
    deliverables: c.deliverables.length > 0 ? (
      <section key="deliverables" id="deliverables" className="py-20">
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
    ) : null,
    pricing: c.pricing?.enabled && c.pricing.tiers.length > 0 ? (
      <section key="pricing" id="pricing" className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-12">
            {c.pricing.eyebrow && (
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{c.pricing.eyebrow}</p>
            )}
            {c.pricing.title && (
              <h2 className="text-4xl font-extrabold text-foreground">{c.pricing.title}</h2>
            )}
            {c.pricing.blurb && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{c.pricing.blurb}</p>
            )}
          </div>
          <div className={`grid md:grid-cols-2 lg:grid-cols-${Math.min(3, c.pricing.tiers.length)} gap-6 items-stretch max-w-6xl mx-auto`}>
            {c.pricing.tiers.map((t) => (
              <div
                key={t.id}
                className={`relative rounded-2xl p-8 border flex flex-col ${
                  t.highlighted
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-elegant lg:scale-105"
                    : "bg-card text-foreground border-border/40 shadow-card"
                }`}
              >
                {t.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    t.highlighted ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  }`}>{t.badge}</span>
                )}
                <h3 className="text-2xl font-extrabold">{t.name}</h3>
                {t.description && (
                  <p className={`mt-1 text-sm ${t.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{t.description}</p>
                )}
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{t.price}</span>
                  {t.period && (
                    <span className={`text-sm ${t.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t.period}</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${t.highlighted ? "text-primary-foreground" : "text-accent"}`} />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
                {t.ctaLabel && (
                  <Button
                    asChild
                    variant={t.highlighted ? "hero" : "outline"}
                    size="lg"
                    className="mt-8 w-full rounded-full"
                  >
                    <Link to={t.ctaUrl || "/#contact"}>
                      {t.ctaLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    pricingParagraph: c.pricingParagraph?.enabled && (c.pricingParagraph.paragraph || c.pricingParagraph.title) ? (
      <section key="pricingParagraph" className="py-20">
        <div className="container max-w-4xl">
          {(c.pricingParagraph.title || c.pricingParagraph.titleAccent) && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground text-center">
              {c.pricingParagraph.title}{" "}
              {c.pricingParagraph.titleAccent && (
                <span className="text-gradient-accent">{c.pricingParagraph.titleAccent}</span>
              )}
            </h2>
          )}
          {c.pricingParagraph.tabs.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {c.pricingParagraph.tabs.map((tab, idx) => (
                <span
                  key={tab.id}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                    idx === 0
                      ? "bg-accent text-accent-foreground border-transparent shadow-card"
                      : "bg-card text-muted-foreground border-border/60"
                  }`}
                >
                  {tab.label}
                </span>
              ))}
            </div>
          )}
          {c.pricingParagraph.paragraph && (
            <div className="mt-8 bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-card">
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                {c.pricingParagraph.paragraph}
              </p>
            </div>
          )}
        </div>
      </section>
    ) : null,
    chart: c.chart.enabled && c.chart.bars.length > 0 ? (
      <section key="chart" className="py-20 bg-secondary/40">
        <div className="container">
          <div className="bg-card rounded-2xl p-6 sm:p-10 border border-border/40 shadow-elegant grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* RIGHT (desktop): graph */}
            <div className="lg:col-span-3 order-1 lg:order-2 w-full h-[320px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={c.chart.bars} margin={{ top: 10, right: 10, left: -10, bottom: 50 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={32} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--foreground))",
                    }}
                    cursor={{ fill: "hsl(var(--accent) / 0.08)" }}
                  />
                  <Bar dataKey="value" name={service?.title ?? "Result"} fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* LEFT (desktop): copy + CTA */}
            <div className="lg:col-span-2 order-2 lg:order-1 space-y-5">
              {c.chart.eyebrow && (
                <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">{c.chart.eyebrow}</p>
              )}
              {c.chart.title && (
                <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">{c.chart.title}</h3>
              )}
              {c.chart.subtitle && (
                <p className="text-base text-muted-foreground leading-relaxed">{c.chart.subtitle}</p>
              )}
              {(c.chart.paragraph ?? "Every bar here ties back to a real client engagement — measured rankings, traffic, and revenue impact. See the full case-by-case breakdown of how we delivered these results in our portfolio.") && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {c.chart.paragraph ?? "Every bar here ties back to a real client engagement — measured rankings, traffic, and revenue impact. See the full case-by-case breakdown of how we delivered these results in our portfolio."}
                </p>
              )}
              {(c.chart.ctaLabel ?? "See our work") && (
                <Button asChild variant="hero" size="lg" className="rounded-full">
                  <Link to={c.chart.ctaUrl || portfolioPath}>{c.chart.ctaLabel || "See our work"} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    ) : null,
    faq: <ServiceFAQ key="faq" slug={slug} />,
    cta: (c.ctaHeadline || c.ctaLabel) ? (
      <section key="cta" className="py-20">
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
    ) : null,
  };

  const savedOrder = c.sectionOrder?.filter((id): id is ServiceSectionId =>
    (SERVICE_SECTION_IDS as readonly string[]).includes(id),
  ) ?? [];
  const orderedIds: ServiceSectionId[] = [
    ...savedOrder,
    ...SERVICE_SECTION_IDS.filter((id) => !savedOrder.includes(id)),
  ];

  return (
    <ServiceLayout title={service?.title ?? c.heroEyebrow ?? "Service"} description={c.heroBlurb} path={`${getPagePath("services", seo.pageSeo)}/${publicSlug}`} seoKey={`svc:${slug}`}>
      {orderedIds.map((id) => sections[id])}
      <SectionNote id={`svc:${slug}`} />
    </ServiceLayout>
  );
};
