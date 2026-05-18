import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import NotFound from "./NotFound";
import { MarkdownContent } from "@/components/site/MarkdownContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

function CustomPageContent({ page }: { page: NonNullable<ReturnType<typeof useAdmin>["customPages"][number]> }) {
  useSEO({
    title: page.seo?.metaTitle || `${page.title} — AniRise`,
    description: page.seo?.metaDescription || page.intro || (page.body ? page.body.slice(0, 158) : undefined),
    path: `/${page.slug}`,
    image: page.image || undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <article className="container max-w-5xl px-4 break-words">
          {page.eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{page.eyebrow}</p>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-foreground break-words">{page.title}</h1>
          {page.intro && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">{page.intro}</p>
          )}

          {page.ctaLabel && page.ctaUrl && (
            <Button asChild variant="hero" className="mb-8">
              <a href={page.ctaUrl} target={page.ctaUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {page.ctaLabel}
              </a>
            </Button>
          )}

          {page.image && <img src={page.image} alt={page.imageAlt} className="rounded-2xl w-full mb-10 aspect-[16/9] object-cover shadow-elegant" />}

          {page.metrics && page.metrics.length > 0 && (
            <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {page.metrics.map((m) => (
                <div key={m.id} className="p-5 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/30">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </section>
          )}

          {page.sections && page.sections.length > 0 && (
            <div className="space-y-10 mb-12">
              {page.sections.filter((s) => s.title || s.body).map((s) => (
                <section key={s.id}>
                  {s.title && <h2 className="text-2xl font-bold text-foreground mb-3">{s.title}</h2>}
                  {s.body && (
                    <div className="text-base text-muted-foreground leading-relaxed">
                      <MarkdownContent content={s.body} />
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {page.deliverables && page.deliverables.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">What's included</h2>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {page.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-card">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {page.chart && page.chart.data?.length > 0 && (
            <section className="mb-12">
              {page.chart.title && <h2 className="text-2xl font-bold text-foreground mb-4">{page.chart.title}</h2>}
              <div className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {page.chart.type === "bar" ? (
                      <BarChart data={page.chart.data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={page.chart.data}>
                        <defs>
                          <linearGradient id="cpArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#cpArea)" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {page.table && page.table.rows?.length > 0 && (
            <section className="mb-12">
              {page.table.title && <h2 className="text-2xl font-bold text-foreground mb-4">{page.table.title}</h2>}
              <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {page.table.headers.map((h, i) => (
                        <TableHead key={i} className="font-bold text-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {page.table.rows.map((row, i) => (
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

          {page.gallery && page.gallery.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {page.gallery.map((g) => (
                  <img key={g.id} src={g.image} alt={g.alt} className="w-full rounded-2xl aspect-[4/3] object-cover border border-border/60" />
                ))}
              </div>
            </section>
          )}

          {page.body && (
            <div className="mb-8">
              <MarkdownContent content={page.body} />
            </div>
          )}
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export const CustomPageView = () => {
  const { slug } = useParams();
  const { customPages, loading } = useAdmin();
  const page = customPages.find((p) => p.slug === slug && p.published);

  if (loading) return null;
  if (!page) return <NotFound />;
  return <CustomPageContent page={page} />;
};

export default CustomPageView;
