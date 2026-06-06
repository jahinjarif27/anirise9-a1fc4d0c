// Reusable inline editor for a single SectionNote (heading + subheading + paragraph + alignment).
// Paragraph supports Markdown links: [label](https://example.com)
// Includes an "Insert link" helper that inserts a link at the cursor.

import { useRef, useState } from "react";
import { Link2, Type, AlignLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdmin, type SectionNote, type TextAlign } from "@/context/AdminContext";

export const SectionNoteEditor = ({
  noteId,
  label = "Paragraph note",
  subtitle = "Optional heading, subheading & paragraph rendered below the section. Leave all empty to hide.",
}: { noteId: string; label?: string; subtitle?: string }) => {
  const { content, updateContent } = useAdmin();
  const note: SectionNote = content.sectionNotes?.[noteId] || {};
  const align = (note.align || "left") as TextAlign;
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const save = (patch: Partial<SectionNote>) => {
    const next = { ...(content.sectionNotes || {}) };
    next[noteId] = { ...note, ...patch };
    updateContent({ sectionNotes: next });
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const label = linkLabel.trim() || url;
    const md = `[${label}](${url})`;
    const ta = textRef.current;
    const current = note.text || "";
    if (ta) {
      const start = ta.selectionStart ?? current.length;
      const end = ta.selectionEnd ?? current.length;
      const selected = current.slice(start, end);
      const insert = selected ? `[${selected}](${url})` : md;
      const next = current.slice(0, start) + insert + current.slice(end);
      save({ text: next });
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + insert.length;
        ta.setSelectionRange(pos, pos);
      });
    } else {
      save({ text: (current ? current + " " : "") + md });
    }
    setLinkLabel("");
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <div className="rounded-xl border border-border p-4 sm:p-5 space-y-4 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-bold text-sm flex items-center gap-2"><Type className="h-4 w-4 text-accent" /> {label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={align} onValueChange={(v) => save({ align: v as TextAlign })}>
            <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Heading</label>
        <Input
          placeholder="e.g. Why this matters"
          value={note.heading || ""}
          onChange={(e) => save({ heading: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subheading</label>
        <Input
          placeholder="Short eyebrow line shown above the heading"
          value={note.subheading || ""}
          onChange={(e) => save({ subheading: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Paragraph</label>
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Insert link
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-2">
              <p className="text-xs font-semibold">Add a link</p>
              <Input
                placeholder="Link text (optional)"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") insertLink(); }}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="ghost" onClick={() => setLinkOpen(false)}>Cancel</Button>
                <Button size="sm" variant="hero" onClick={insertLink} disabled={!linkUrl.trim()}>Insert</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Tip: select text in the paragraph first to turn it into a link.</p>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea
          ref={textRef}
          rows={6}
          placeholder="Write your paragraph. Use Insert link or type [label](https://link.com)."
          value={note.text || ""}
          onChange={(e) => save({ text: e.target.value })}
          className="leading-relaxed"
        />
        <p className="text-[11px] text-muted-foreground">
          Links use Markdown — <code className="px-1 rounded bg-secondary/60">[Visit Google](https://google.com)</code>.
          Bare URLs auto-link too. Use <code className="px-1 rounded bg-secondary/60">**bold**</code> and <code className="px-1 rounded bg-secondary/60">*italic*</code>.
        </p>
      </div>
    </div>
  );
};
