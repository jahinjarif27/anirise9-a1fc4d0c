import { Fragment } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SectionNoteEditor } from "@/components/admin/SectionNoteEditor";
import { SeoBlock } from "@/pages/admin/AdminDashboard";
import { useAdmin } from "@/context/AdminContext";

/**
 * Full editor for the Case Studies collection. Each case study renders
 * exactly like a project: every field on the public /case-studies/:id page
 * (title, metric, eyebrow, client/industry/duration, intro, description,
 * image, challenge/solution/results, stats cards, chart, data table,
 * long-form body) is editable here.
 *
 * Used both in the Home → Case Studies block editor and in the standalone
 * Case Studies admin page so editors can find/edit each case study from
 * either entry point.
 */
export const CaseStudiesEditor = () => {
  const { caseStudies, addCaseStudy, updateCaseStudy, deleteCaseStudy, seo, updatePageSeo } = useAdmin();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            addCaseStudy({
              title: "New case study",
              metric: "+100%",
              description: "",
              image: "",
              link: "",
              imageAlt: "",
              body: "",
              eyebrow: "",
              intro: "",
              client: "",
              industry: "",
              duration: "",
              challenge: "",
              solution: "",
              results: "",
              stats: [],
              table: { title: "", headers: ["Metric", "Before", "After"], rows: [["", "", ""]] },
              chart: { title: "", type: "bar", data: [] },
            } as any);
            toast.success("Added");
          }}
        >
          <Plus className="h-4 w-4" /> Add case study
        </Button>
      </div>
      <div className="space-y-4">
        {caseStudies.map((c) => {
          const stats = c.stats || [];
          const table = c.table || { title: "", headers: ["Metric", "Before", "After"], rows: [] };
          const chart = c.chart || { title: "", type: "bar" as const, data: [] };
          const updateTable = (patch: Partial<typeof table>) => updateCaseStudy(c.id, { table: { ...table, ...patch } } as any);
          const updateChart = (patch: Partial<typeof chart>) => updateCaseStudy(c.id, { chart: { ...chart, ...patch } } as any);
          return (
            <details key={c.id} className="p-4 rounded-xl border border-border/60 bg-card group" open>
              <summary className="cursor-pointer font-semibold text-foreground flex items-center justify-between">
                <span>{c.title || "Untitled case study"}</span>
                <span className="text-xs text-muted-foreground">{c.metric}</span>
              </summary>
              <div className="mt-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input value={c.title} onChange={(e) => updateCaseStudy(c.id, { title: e.target.value })} placeholder="Title" />
                  <Input value={c.metric} onChange={(e) => updateCaseStudy(c.id, { metric: e.target.value })} placeholder="Metric (e.g. +180% traffic)" />
                  <Input value={c.eyebrow || ""} onChange={(e) => updateCaseStudy(c.id, { eyebrow: e.target.value })} placeholder="Eyebrow (e.g. SEO case study)" />
                  <Input value={c.client || ""} onChange={(e) => updateCaseStudy(c.id, { client: e.target.value })} placeholder="Client name" />
                  <Input value={c.industry || ""} onChange={(e) => updateCaseStudy(c.id, { industry: e.target.value })} placeholder="Industry" />
                  <Input value={c.duration || ""} onChange={(e) => updateCaseStudy(c.id, { duration: e.target.value })} placeholder="Duration (e.g. 90 days)" />
                </div>
                <Textarea value={c.intro || ""} onChange={(e) => updateCaseStudy(c.id, { intro: e.target.value })} placeholder="Intro / lead paragraph (shown big under the title)" rows={2} />
                <Textarea value={c.description} onChange={(e) => updateCaseStudy(c.id, { description: e.target.value })} placeholder="Short description (used on the home card and as a summary)" rows={2} />
                <ImageUpload value={c.image} onChange={(url) => updateCaseStudy(c.id, { image: url })} />
                <Input value={c.imageAlt || ""} onChange={(e) => updateCaseStudy(c.id, { imageAlt: e.target.value })} placeholder="Image alt text" />

                <div className="grid sm:grid-cols-3 gap-2">
                  <Textarea value={c.challenge || ""} onChange={(e) => updateCaseStudy(c.id, { challenge: e.target.value })} placeholder="The Challenge" rows={4} />
                  <Textarea value={c.solution || ""} onChange={(e) => updateCaseStudy(c.id, { solution: e.target.value })} placeholder="Our Solution" rows={4} />
                  <Textarea value={c.results || ""} onChange={(e) => updateCaseStudy(c.id, { results: e.target.value })} placeholder="The Results" rows={4} />
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-background/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Result stats (big number cards)</p>
                    <Button size="sm" variant="outline" onClick={() => updateCaseStudy(c.id, { stats: [...stats, { id: `s${Date.now()}`, label: "New metric", value: "+0%" }] } as any)}><Plus className="h-3 w-3" /> Add stat</Button>
                  </div>
                  {stats.map((s, idx) => (
                    <div key={s.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={s.value} onChange={(e) => { const next = [...stats]; next[idx] = { ...s, value: e.target.value }; updateCaseStudy(c.id, { stats: next } as any); }} placeholder="Value (+180%)" />
                      <Input value={s.label} onChange={(e) => { const next = [...stats]; next[idx] = { ...s, label: e.target.value }; updateCaseStudy(c.id, { stats: next } as any); }} placeholder="Label" />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateCaseStudy(c.id, { stats: stats.filter((x) => x.id !== s.id) } as any)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-background/40 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold">Chart</p>
                    <div className="flex gap-2">
                      <select className="text-xs rounded-md border border-input bg-background px-2 py-1" value={chart.type} onChange={(e) => updateChart({ type: e.target.value as "bar" | "line" })}>
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => updateChart({ data: [...chart.data, { id: `p${Date.now()}`, label: "New", value: 0 }] })}><Plus className="h-3 w-3" /> Add point</Button>
                    </div>
                  </div>
                  <Input value={chart.title || ""} onChange={(e) => updateChart({ title: e.target.value })} placeholder="Chart title" />
                  {chart.data.map((p, idx) => (
                    <div key={p.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input value={p.label} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...p, label: e.target.value }; updateChart({ data: next }); }} placeholder="Label (e.g. Mo 1)" />
                      <Input type="number" value={p.value} onChange={(e) => { const next = [...chart.data]; next[idx] = { ...p, value: Number(e.target.value) }; updateChart({ data: next }); }} placeholder="Value" />
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateChart({ data: chart.data.filter((x) => x.id !== p.id) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-background/40 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold">Data table</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateTable({ headers: [...table.headers, "Col"], rows: table.rows.map((r) => [...r, ""]) })}><Plus className="h-3 w-3" /> Column</Button>
                      <Button size="sm" variant="outline" onClick={() => updateTable({ rows: [...table.rows, table.headers.map(() => "")] })}><Plus className="h-3 w-3" /> Row</Button>
                    </div>
                  </div>
                  <Input value={table.title || ""} onChange={(e) => updateTable({ title: e.target.value })} placeholder="Table title" />
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0,1fr)) auto` }}>
                    {table.headers.map((h, i) => (
                      <Input key={`h${i}`} value={h} onChange={(e) => { const next = [...table.headers]; next[i] = e.target.value; updateTable({ headers: next }); }} placeholder={`Header ${i + 1}`} className="font-semibold" />
                    ))}
                    <Button size="icon" variant="ghost" disabled className="opacity-0 pointer-events-none"><Trash2 className="h-4 w-4" /></Button>
                    {table.rows.map((row, ri) => (
                      <Fragment key={`r${ri}`}>
                        {table.headers.map((_, ci) => (
                          <Input key={`r${ri}c${ci}`} value={row[ci] || ""} onChange={(e) => { const next = table.rows.map((r) => [...r]); next[ri][ci] = e.target.value; updateTable({ rows: next }); }} placeholder="..." />
                        ))}
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateTable({ rows: table.rows.filter((_, i) => i !== ri) })}><Trash2 className="h-4 w-4" /></Button>
                      </Fragment>
                    ))}
                  </div>
                  {table.headers.length > 1 && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateTable({ headers: table.headers.slice(0, -1), rows: table.rows.map((r) => r.slice(0, -1)) })}><Trash2 className="h-3 w-3" /> Remove last column</Button>
                  )}
                </div>

                <Textarea value={c.body || ""} onChange={(e) => updateCaseStudy(c.id, { body: e.target.value })} placeholder="Extra long-form content (appended below)" rows={4} />

                <SectionNoteEditor noteId={`case:${c.id}`} label="Paragraph for this case study page" />

                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCaseStudy(c.id)}><Trash2 className="h-4 w-4" /> Remove case study</Button>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
};
