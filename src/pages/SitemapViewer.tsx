import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SitemapRow = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

const getText = (node: Element, tag: string) => node.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

function parseSitemap(xml: string): SitemapRow[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) return [];
  return Array.from(doc.getElementsByTagName("url")).map((url) => ({
    loc: getText(url, "loc"),
    lastmod: getText(url, "lastmod"),
    changefreq: getText(url, "changefreq"),
    priority: getText(url, "priority"),
  })).filter((row) => row.loc);
}

async function fetchSitemapXml(tick: number) {
  const cacheBust = `t=${tick}`;
  const local = `/sitemap.xml?${cacheBust}`;
  const response = await fetch(local, { cache: "no-store", headers: { Accept: "application/xml,text/xml,*/*" } });
  const text = await response.text();
  if (response.ok && text.trim().startsWith("<?xml")) return text;

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const fallback = `https://${projectId}.supabase.co/functions/v1/sitemap?format=xml&${cacheBust}`;
  const fallbackResponse = await fetch(fallback, { cache: "no-store", headers: { Accept: "application/xml,text/xml,*/*" } });
  const fallbackText = await fallbackResponse.text();
  if (!fallbackResponse.ok) throw new Error(`HTTP ${fallbackResponse.status}`);
  return fallbackText;
}

export default function SitemapViewer() {
  const [xml, setXml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchSitemapXml(tick)
      .then((text) => {
        if (alive) setXml(text);
      })
      .catch((err) => {
        if (alive) setError(err?.message || "Could not load sitemap");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  const rows = useMemo(() => parseSitemap(xml), [xml]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-2xl font-bold tracking-normal">Live sitemap</h1>
          <p className="mt-2 text-sm text-background/80">
            Auto-generated from your admin. Raw XML:{" "}
            <a className="font-mono text-xs text-background/90 no-underline" href="/sitemap.xml">
              https://anirise.com.bd/sitemap.xml
            </a>
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            Live URLs from <span className="font-mono text-xs">/sitemap.xml</span>{loading ? " — loading…" : ` — ${rows.length} URLs`}
          </div>
          <Button variant="outline" size="sm" onClick={() => setTick(Date.now())}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load live sitemap: {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {rows.length === 0 && !loading ? (
              <div className="p-5 text-sm text-muted-foreground">No URLs in live sitemap yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((row, index) => (
                  <li key={`${row.loc}-${index}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground/70">{index + 1}</span>
                    <a
                      href={row.loc}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-[220px] flex-1 break-all font-mono text-xs text-primary no-underline decoration-transparent hover:no-underline focus:no-underline"
                      style={{ textDecoration: "none", backgroundImage: "none", borderBottom: 0 }}
                    >
                      {row.loc}
                    </a>
                    {row.priority && <Badge variant="secondary" className="text-[10px]">P {row.priority}</Badge>}
                    {row.changefreq && <Badge variant="outline" className="text-[10px]">{row.changefreq}</Badge>}
                    {row.lastmod && <span className="font-mono text-[10px] text-muted-foreground/70">{row.lastmod}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}