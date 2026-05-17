import { ServiceLayout } from "./ServiceLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Search, TrendingUp, Target, BarChart3, Globe2, FileSearch, Link2, Gauge } from "lucide-react";
import { ServiceFAQ } from "@/components/site/ServiceFAQ";

const stats = [
  { value: "+187%", label: "Avg. organic traffic growth" },
  { value: "Top 3", label: "Google rankings achieved" },
  { value: "60+", label: "Keywords ranked per project" },
  { value: "4.2x", label: "Avg. ROI within 6 months" },
];

const process = [
  { icon: FileSearch, title: "Audit & Discovery", desc: "Deep technical and content audit to find what's holding you back." },
  { icon: Target, title: "Keyword Strategy", desc: "Find high-intent keywords your buyers actually search for." },
  { icon: Gauge, title: "On-Page Optimization", desc: "Titles, meta, schema, internal linking, Core Web Vitals." },
  { icon: Link2, title: "Authority Building", desc: "Quality backlinks and digital PR to grow domain authority." },
  { icon: BarChart3, title: "Track & Iterate", desc: "Monthly reports with rankings, traffic, and revenue impact." },
];

const deliverables = [
  "Full technical SEO audit (PDF)",
  "Keyword research & content map",
  "On-page optimization for 20+ pages",
  "Schema markup & rich results setup",
  "Core Web Vitals & speed optimization",
  "Monthly ranking & traffic reports",
  "Competitor gap analysis",
  "Google Search Console & Analytics setup",
];

const WebsiteSEOPage = () => {
  return (
    <ServiceLayout
      title="Website SEO"
      description="Website SEO from AniRise — technical audits, keyword strategy, on-page optimization, and authority building that grow organic traffic and revenue."
      path="/services/website-seo"
    >
      {/* Hero */}
      <section className="bg-gradient-hero py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">
              Website SEO
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
              Rank Higher.<br />
              <span className="text-gradient-accent">Earn More.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              We build SEO strategies that move the needle — not just rankings, but real traffic that converts into customers and revenue.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/#contact">Get a Free Audit <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="rounded-full">
                <a href="#process">See Our Process</a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-6 shadow-card border border-border/40">
                <p className="text-3xl font-extrabold text-gradient-accent">{s.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Visibility", desc: "Show up where buyers search. We make Google understand and rank your site." },
            { icon: TrendingUp, title: "Growth", desc: "Compounding organic traffic that grows month after month — without paying per click." },
            { icon: Globe2, title: "Authority", desc: "Build a brand Google trusts and customers recognize as the expert in your space." },
          ].map((b) => (
            <div key={b.title} className="bg-card rounded-2xl p-8 shadow-card border border-border/40">
              <div className="h-12 w-12 rounded-xl bg-gradient-accent text-accent-foreground grid place-items-center mb-5">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Our Process</p>
            <h2 className="text-4xl font-extrabold text-foreground">A proven 5-step path to rankings</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {process.map((p, i) => (
              <div key={p.title} className="relative bg-card rounded-2xl p-6 shadow-card border border-border/40">
                <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-gradient-accent text-accent-foreground grid place-items-center text-sm font-bold">{i + 1}</span>
                <p.icon className="h-7 w-7 text-accent mb-3" />
                <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">What you get</p>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Everything you need to win on Google</h2>
            <p className="text-muted-foreground text-lg">
              Each engagement is tailored, but here's what's typically included in a Website SEO partnership with AniRise.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card border border-border/40">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-secondary/40">
        <div className="container max-w-3xl">
          <div className="mb-10 text-center">
            <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
            <h2 className="text-4xl font-extrabold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-card rounded-xl p-5 shadow-card border border-border/40">
                <summary className="cursor-pointer font-semibold text-foreground flex items-center justify-between">
                  {f.q}
                  <span className="text-accent group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="bg-gradient-primary rounded-3xl p-10 lg:p-16 text-center shadow-elegant">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground">Ready to outrank your competition?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">Get a free SEO audit — no commitment, no jargon. Just clear next steps.</p>
            <Button asChild variant="hero" size="xl" className="mt-8">
              <Link to="/#contact">Book Free Audit <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
};

export default WebsiteSEOPage;
