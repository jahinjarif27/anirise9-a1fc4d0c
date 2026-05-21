// Phase 3 — admin editor for multi-paragraph blocks with alignment.

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { TextBlock, TextAlign } from "@/components/site/TextBlocksView";

const newId = () => `tb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const ALIGN_OPTS: { value: TextAlign; icon: typeof AlignLeft; label: string }[] = [
  { value: "left", icon: AlignLeft, label: "Left" },
  { value: "center", icon: AlignCenter, label: "Center" },
  { value: "right", icon: AlignRight, label: "Right" },
  { value: "justify", icon: AlignJustify, label: "Justify" },
];

export const TextBlocksEditor = ({
  value,
  onChange,
  label = "Paragraphs",
  hint = "Add multiple paragraphs. Each paragraph can have its own alignment.",
}: {
  value?: TextBlock[];
  onChange: (next: TextBlock[]) => void;
  label?: string;
  hint?: string;
}) => {
  const blocks: TextBlock[] = Array.isArray(value) ? value : [];
  const update = (id: string, patch: Partial<TextBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));
  const add = () => onChange([...blocks, { id: newId(), text: "", align: "left" }]);
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Add paragraph
        </Button>
      </div>

      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground italic px-3 py-2 rounded-md border border-dashed border-border">
          No paragraphs yet. Click "Add paragraph" to start.
        </p>
      )}

      <div className="space-y-3">
        {blocks.map((b, idx) => (
          <div key={b.id} className="rounded-xl border border-border bg-background p-3 space-y-2">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
                {ALIGN_OPTS.map((opt) => {
                  const active = (b.align || "left") === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => update(b.id, { align: opt.value })}
                      className={`px-2 py-1 rounded ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">¶ {idx + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(b.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <Textarea
              rows={4}
              placeholder="Write a paragraph. Markdown (**bold**, [link](url), lists) is supported."
              value={b.text}
              onChange={(e) => update(b.id, { text: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
