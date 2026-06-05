// Reusable inline editor for a single SectionNote (heading + subheading + paragraph + alignment).
// Paragraph supports Markdown links: [label](https://example.com)

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin, type SectionNote, type TextAlign } from "@/context/AdminContext";

export const SectionNoteEditor = ({
  noteId,
  label = "Paragraph note",
  subtitle = "Optional heading, subheading & paragraph rendered below the section. Leave all empty to hide.",
}: { noteId: string; label?: string; subtitle?: string }) => {
  const { content, updateContent } = useAdmin();
  const note: SectionNote = content.sectionNotes?.[noteId] || {};
  const align = (note.align || "left") as TextAlign;
  const save = (patch: Partial<SectionNote>) => {
    const next = { ...(content.sectionNotes || {}) };
    next[noteId] = { ...note, ...patch };
    updateContent({ sectionNotes: next });
  };
  return (
    <div className="rounded-xl border border-border p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Align</span>
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
      <Input
        placeholder="Heading (optional)"
        value={note.heading || ""}
        onChange={(e) => save({ heading: e.target.value })}
      />
      <Input
        placeholder="Subheading (optional)"
        value={note.subheading || ""}
        onChange={(e) => save({ subheading: e.target.value })}
      />
      <Textarea
        rows={5}
        placeholder="Paragraph (optional). Use [label](https://link.com) to add links. Leave all empty to hide."
        value={note.text || ""}
        onChange={(e) => save({ text: e.target.value })}
      />
      <p className="text-[11px] text-muted-foreground">
        Tip: links use Markdown — <code className="px-1 rounded bg-secondary/60">[Visit Google](https://google.com)</code>.
        Bare URLs auto-link too.
      </p>
    </div>
  );
};
