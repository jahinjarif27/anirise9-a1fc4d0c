import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Building2, UserCircle2, Calendar, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { portfolio, loading } = useAdmin();
  const p = portfolio.find((x) => x.id === id || (x.slug && x.slug === id));
  const publicTail = p?.slug?.trim() || p?.id || id || "";
  // If a custom slug exists, only that slug should resolve; redirect from raw id.
  const shouldRedirect = !!p && !!p.slug?.trim() && id !== p.slug;

  useSEO({
    title: p ? `${p.title} — Project | AniRise` : "Project | AniRise",
    description: p?.description || "AniRise project case.",
    path: `/portfolio/${publicTail}`,
  });

  if (loading) return null;
  if (!p) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Project not found</h1>
          <Link to="/portfolio" className="text-accent underline">Back to projects</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = [
    p.client && { icon: Building2, label: "Client", value: p.client },
    p.role && { icon: UserCircle2, label: "Role", value: p.role },
    p.timeline && { icon: Calendar, label: "Timeline", value: p.timeline },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <Link to="/portfolio" className="inline-flex items-center gap-1 text-sm font-semibold text-accent mb-6 hover:gap-2 transition-all">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>

          {(p.eyebrow || p.tag) && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{p.eyebrow || p.tag}</p>
          )}

          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5">{p.title}</h1>

          {p.intro && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">{p.intro}</p>
          )}

          {p.liveUrl && (
            <Button asChild variant="hero" className="mb-8">
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                Visit live site <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          {meta.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-3 mb-10">
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

          {p.image && (
            <img src={p.image} alt={p.imageAlt || p.title} className="w-full rounded-2xl mb-12 aspect-[16/9] object-cover" />
          )}

          {p.techStack && p.techStack.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">Tech stack</h2>
              <div className="flex flex-wrap gap-2">
                {p.techStack.map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-sm px-3 py-1">{t}</Badge>
                ))}
              </div>
            </section>
          )}

          {p.metrics && p.metrics.length > 0 && (
            <section className="mb-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {p.metrics.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/30">
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.overview && <Section title="Overview" body={p.overview} />}
          {p.approach && <Section title="Approach" body={p.approach} />}
          {p.outcome && <Section title="Outcome" body={p.outcome} />}

          {p.deliverables && p.deliverables.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Deliverables</h2>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {p.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-card">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.chart && p.chart.data?.length > 0 && (
            <section className="mb-12">
              {p.chart.title && <h2 className="text-2xl font-bold text-foreground mb-4">{p.chart.title}</h2>}
              <div className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {p.chart.type === "bar" ? (
                      <BarChart data={p.chart.data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={p.chart.data}>
                        <defs>
                          <linearGradient id="projArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#projArea)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {p.table && p.table.rows?.length > 0 && (
            <section className="mb-12">
              {p.table.title && <h2 className="text-2xl font-bold text-foreground mb-4">{p.table.title}</h2>}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {p.table.headers.map((h, i) => (
                        <TableHead key={i} className="font-bold text-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {p.table.rows.map((row, i) => (
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

          {p.gallery && p.gallery.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {p.gallery.map((g) => (
                  <img key={g.id} src={g.image} alt={g.alt} className="w-full rounded-2xl aspect-[4/3] object-cover border border-border/60" />
                ))}
              </div>
            </section>
          )}

          {p.description && !p.intro && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{p.description}</p>
          )}

          {p.body && (
            <div className="prose prose-lg max-w-none whitespace-pre-line text-foreground/85">{p.body}</div>
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

export default ProjectDetail;
