import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, BarChart3, Sparkles, Target, Layers } from "lucide-react";
import type {
  ServiceContent,
  ServiceStat,
  ServiceWhyCard,
  ServiceProcessStep,
  ServiceDeliverable,
  ServiceChartBar,
} from "@/data/serviceContentDefaults";

type Props = {
  slug: string;
  content: ServiceContent;
  onChange: (patch: Partial<ServiceContent>) => void;
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const Section = ({ title, icon: Icon, children, action }: any) => (
  <Card className="p-5 sm:p-6 space-y-3">
    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-bold">{title}</h4>
      </div>
      {action}
    </div>
    {children}
  </Card>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold mb-1.5 block text-foreground/80">{label}</label>
    {children}
  </div>
);

export const ServiceContentEditor = ({ slug, content, onChange }: Props) => {
  // List helpers
  const setList = <T extends { id: string }>(key: keyof ServiceContent, items: T[]) => onChange({ [key]: items } as any);
  const editItem = <T extends { id: string }>(key: keyof ServiceContent, list: T[], id: string, patch: Partial<T>) =>
    setList(key, list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addItem = <T extends { id: string }>(key: keyof ServiceContent, list: T[], blank: Omit<T, "id">) =>
    setList(key, [...list, { ...blank, id: newId() } as T]);
  const delItem = <T extends { id: string }>(key: keyof ServiceContent, list: T[], id: string) =>
    setList(key, list.filter((x) => x.id !== id));

  return (
    <div className="space-y-4">
      {/* HERO */}
      <Section title="Hero section" icon={Sparkles}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Eyebrow (small label)"><Input value={content.heroEyebrow} onChange={(e) => onChange({ heroEyebrow: e.target.value })} /></Field>
          <Field label="Headline — start"><Input value={content.heroHeadlineBefore} onChange={(e) => onChange({ heroHeadlineBefore: e.target.value })} /></Field>
          <Field label="Headline — accent word(s)"><Input value={content.heroHeadlineAccent} onChange={(e) => onChange({ heroHeadlineAccent: e.target.value })} placeholder="Highlighted in accent color" /></Field>
        </div>
        <Field label="Hero blurb"><Textarea rows={3} value={content.heroBlurb} onChange={(e) => onChange({ heroBlurb: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Primary CTA label"><Input value={content.heroPrimaryLabel} onChange={(e) => onChange({ heroPrimaryLabel: e.target.value })} /></Field>
          <Field label="Primary CTA URL"><Input value={content.heroPrimaryUrl} onChange={(e) => onChange({ heroPrimaryUrl: e.target.value })} /></Field>
          <Field label="Secondary CTA label"><Input value={content.heroSecondaryLabel} onChange={(e) => onChange({ heroSecondaryLabel: e.target.value })} /></Field>
          <Field label="Secondary CTA URL/anchor"><Input value={content.heroSecondaryUrl} onChange={(e) => onChange({ heroSecondaryUrl: e.target.value })} /></Field>
        </div>
      </Section>

      {/* STATS */}
      <Section
        title="Hero stat cards"
        icon={Target}
        action={<Button size="sm" onClick={() => addItem<ServiceStat>("stats", content.stats, { value: "100%", label: "New metric" })}><Plus className="h-4 w-4" /> Add stat</Button>}
      >
        {!content.stats.length && <p className="text-xs text-muted-foreground">No stats. Add up to 4 for the 2x2 grid.</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          {content.stats.map((s) => (
            <div key={s.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
              <Input value={s.value} onChange={(e) => editItem<ServiceStat>("stats", content.stats, s.id, { value: e.target.value })} placeholder="Value e.g. +180%" />
              <Input value={s.label} onChange={(e) => editItem<ServiceStat>("stats", content.stats, s.id, { label: e.target.value })} placeholder="Label" />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => delItem<ServiceStat>("stats", content.stats, s.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY CARDS */}
      <Section
        title="Why / feature cards"
        icon={Layers}
        action={<Button size="sm" onClick={() => addItem<ServiceWhyCard>("whyCards", content.whyCards, { icon: "Sparkles", title: "New benefit", desc: "Describe it" })}><Plus className="h-4 w-4" /> Add card</Button>}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input value={content.whyEyebrow} onChange={(e) => onChange({ whyEyebrow: e.target.value })} /></Field>
          <Field label="Section title"><Input value={content.whyTitle} onChange={(e) => onChange({ whyTitle: e.target.value })} /></Field>
        </div>
        <div className="space-y-3">
          {content.whyCards.map((w) => (
            <div key={w.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="grid sm:grid-cols-3 gap-2">
                <Input value={w.icon} onChange={(e) => editItem<ServiceWhyCard>("whyCards", content.whyCards, w.id, { icon: e.target.value })} placeholder="lucide icon e.g. Search" />
                <div className="sm:col-span-2"><Input value={w.title} onChange={(e) => editItem<ServiceWhyCard>("whyCards", content.whyCards, w.id, { title: e.target.value })} placeholder="Title" /></div>
              </div>
              <Textarea rows={2} value={w.desc} onChange={(e) => editItem<ServiceWhyCard>("whyCards", content.whyCards, w.id, { desc: e.target.value })} placeholder="Description" />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => delItem<ServiceWhyCard>("whyCards", content.whyCards, w.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          ))}
          {!content.whyCards.length && <p className="text-xs text-muted-foreground">No cards yet.</p>}
        </div>
      </Section>

      {/* PROCESS */}
      <Section
        title="Process steps"
        icon={GripVertical}
        action={<Button size="sm" onClick={() => addItem<ServiceProcessStep>("processSteps", content.processSteps, { icon: "Target", title: "New step", desc: "What happens in this step" })}><Plus className="h-4 w-4" /> Add step</Button>}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input value={content.processEyebrow} onChange={(e) => onChange({ processEyebrow: e.target.value })} /></Field>
          <Field label="Section title"><Input value={content.processTitle} onChange={(e) => onChange({ processTitle: e.target.value })} /></Field>
        </div>
        <div className="space-y-3">
          {content.processSteps.map((p, i) => (
            <div key={p.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">Step {i + 1}</div>
              <div className="grid sm:grid-cols-3 gap-2">
                <Input value={p.icon} onChange={(e) => editItem<ServiceProcessStep>("processSteps", content.processSteps, p.id, { icon: e.target.value })} placeholder="lucide icon" />
                <div className="sm:col-span-2"><Input value={p.title} onChange={(e) => editItem<ServiceProcessStep>("processSteps", content.processSteps, p.id, { title: e.target.value })} placeholder="Title" /></div>
              </div>
              <Textarea rows={2} value={p.desc} onChange={(e) => editItem<ServiceProcessStep>("processSteps", content.processSteps, p.id, { desc: e.target.value })} placeholder="Description" />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => delItem<ServiceProcessStep>("processSteps", content.processSteps, p.id)}><Trash2 className="h-4 w-4" /> Remove</Button>
            </div>
          ))}
          {!content.processSteps.length && <p className="text-xs text-muted-foreground">No process steps.</p>}
        </div>
      </Section>

      {/* DELIVERABLES */}
      <Section
        title="Deliverables list"
        icon={Layers}
        action={<Button size="sm" onClick={() => addItem<ServiceDeliverable>("deliverables", content.deliverables, { text: "New deliverable" })}><Plus className="h-4 w-4" /> Add item</Button>}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input value={content.deliverablesEyebrow} onChange={(e) => onChange({ deliverablesEyebrow: e.target.value })} /></Field>
          <Field label="Section title"><Input value={content.deliverablesTitle} onChange={(e) => onChange({ deliverablesTitle: e.target.value })} /></Field>
        </div>
        <Field label="Blurb"><Textarea rows={2} value={content.deliverablesBlurb} onChange={(e) => onChange({ deliverablesBlurb: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-2">
          {content.deliverables.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Input value={d.text} onChange={(e) => editItem<ServiceDeliverable>("deliverables", content.deliverables, d.id, { text: e.target.value })} />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => delItem<ServiceDeliverable>("deliverables", content.deliverables, d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* CHART */}
      <Section
        title="Performance chart"
        icon={BarChart3}
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
            <Switch checked={content.chart.enabled} onCheckedChange={(v) => onChange({ chart: { ...content.chart, enabled: v } })} />
            <span className="text-sm font-medium">{content.chart.enabled ? "Visible" : "Hidden"}</span>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Eyebrow"><Input value={content.chart.eyebrow} onChange={(e) => onChange({ chart: { ...content.chart, eyebrow: e.target.value } })} /></Field>
          <Field label="Heading / Title"><Input value={content.chart.title} onChange={(e) => onChange({ chart: { ...content.chart, title: e.target.value } })} /></Field>
        </div>
        <Field label="Subtitle"><Input value={content.chart.subtitle} onChange={(e) => onChange({ chart: { ...content.chart, subtitle: e.target.value } })} /></Field>
        <Field label="Paragraph (shown next to chart)">
          <Textarea
            rows={4}
            value={content.chart.paragraph ?? ""}
            placeholder="Every bar here ties back to a real client engagement — measured rankings, traffic, and revenue impact. See the full case-by-case breakdown of how we delivered these results in our portfolio."
            onChange={(e) => onChange({ chart: { ...content.chart, paragraph: e.target.value } })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="CTA button label">
            <Input
              value={content.chart.ctaLabel ?? ""}
              placeholder="See our work"
              onChange={(e) => onChange({ chart: { ...content.chart, ctaLabel: e.target.value } })}
            />
          </Field>
          <Field label="CTA button URL">
            <Input
              value={content.chart.ctaUrl ?? ""}
              placeholder="/portfolio"
              onChange={(e) => onChange({ chart: { ...content.chart, ctaUrl: e.target.value } })}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground/80">Chart bars</label>
          <Button size="sm" onClick={() => onChange({ chart: { ...content.chart, bars: [...content.chart.bars, { id: newId(), name: "New", value: 50 }] } })}><Plus className="h-4 w-4" /> Add bar</Button>
        </div>
        <div className="space-y-2">
          {content.chart.bars.map((b) => (
            <div key={b.id} className="grid grid-cols-[1fr_120px_auto] gap-2">
              <Input value={b.name} onChange={(e) => onChange({ chart: { ...content.chart, bars: content.chart.bars.map((x) => x.id === b.id ? { ...x, name: e.target.value } : x) } })} placeholder="Bar label" />
              <Input type="number" value={b.value} onChange={(e) => onChange({ chart: { ...content.chart, bars: content.chart.bars.map((x) => x.id === b.id ? { ...x, value: Number(e.target.value) } : x) } })} />
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onChange({ chart: { ...content.chart, bars: content.chart.bars.filter((x) => x.id !== b.id) } })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {!content.chart.bars.length && <p className="text-xs text-muted-foreground">No chart data.</p>}
        </div>
      </Section>

      {/* CTA */}
      <Section title="Bottom CTA section" icon={Sparkles}>
        <Field label="Headline"><Input value={content.ctaHeadline} onChange={(e) => onChange({ ctaHeadline: e.target.value })} /></Field>
        <Field label="Blurb"><Textarea rows={2} value={content.ctaBlurb} onChange={(e) => onChange({ ctaBlurb: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Button label"><Input value={content.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value })} /></Field>
          <Field label="Button URL"><Input value={content.ctaUrl} onChange={(e) => onChange({ ctaUrl: e.target.value })} /></Field>
        </div>
      </Section>
    </div>
  );
};
