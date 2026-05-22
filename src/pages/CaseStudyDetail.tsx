import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, Building2, Briefcase } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CaseStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { caseStudies, seo, loading } = useAdmin();
  const cs = caseStudies.find((c) => c.id === id);
  const override: any = (cs && seo.pageSeo?.[`case:${cs.id}`]) || {};
  const isDraft = override.status === "draft";

  useSEO({
    title: override.metaTitle || (cs ? `${cs.title} — Case Study | AniRise` : "Case Study | AniRise"),
    description: override.metaDescription || cs?.description || "AniRise case study.",
    path: `/case-studies/${id}`,
    canonical: override.canonicalAuto === false ? override.canonicalUrl : undefined,
    robots: override.robots === "noindex" || isDraft ? "noindex, nofollow" : undefined,
    og: {
      title: override.ogTitle || undefined,
      description: override.ogDescription || undefined,
      image: override.ogImage || cs?.image || undefined,
      type: "article",
    },
    ...((): any => {
      const x = fromPageSeo(override);
      return { keywords: x.keywords, schemas: x.schemas };
    })(),
  });

  if (loading) return null;
  if (!cs || isDraft) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Case study not found</h1>
          <Link to="/" className="text-accent underline">Back to home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = [
    cs.client && { icon: Building2, label: "Client", value: cs.client },
    cs.industry && { icon: Briefcase, label: "Industry", value: cs.industry },
    cs.duration && { icon: Calendar, label: "Duration", value: cs.duration },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-20 lg:py-24">
        <div className="container max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-accent mb-6 hover:gap-2 transition-all">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {cs.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{cs.eyebrow}</p>
          )}

          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full mb-4">
            <TrendingUp className="h-3.5 w-3.5" /> {cs.metric}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">{cs.title}</h1>

          {cs.intro && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">{cs.intro}</p>
          )}

          {meta.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {meta.map((m) => (
                <div key={m.label} className="p-4 rounded-xl border border-border/60 bg-card flex items-start gap-3">
                  <m.icon className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cs.image && (
            <img src={cs.image} alt={cs.imageAlt || cs.title} className="w-full rounded-2xl mb-10 aspect-video object-cover" />
          )}

          <p className="text-base text-muted-foreground leading-relaxed mb-10">{cs.description}</p>

          {cs.stats && cs.stats.length > 0 && (
            <section className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cs.stats.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cs.challenge && (
            <Section title="The Challenge" body={cs.challenge} />
          )}
          {cs.solution && (
            <Section title="Our Solution" body={cs.solution} />
          )}
          {cs.results && (
            <Section title="The Results" body={cs.results} />
          )}

          {cs.chart && cs.chart.data?.length > 0 && (
            <section className="mb-12">
              {cs.chart.title && <h2 className="text-2xl font-bold text-foreground mb-4">{cs.chart.title}</h2>}
              <div className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {cs.chart.type === "bar" ? (
                      <BarChart data={cs.chart.data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={cs.chart.data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {cs.table && cs.table.rows?.length > 0 && (
            <section className="mb-12">
              {cs.table.title && <h2 className="text-2xl font-bold text-foreground mb-4">{cs.table.title}</h2>}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {cs.table.headers.map((h, i) => (
                        <TableHead key={i} className="font-bold text-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cs.table.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}

          {cs.body && (
            <div className="prose prose-lg max-w-none whitespace-pre-line text-foreground/85">{cs.body}</div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const Section = ({ title, body }: { title: string; body: string }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
  </section>
);

export default CaseStudyDetail;
