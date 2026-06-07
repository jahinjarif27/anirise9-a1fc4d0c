// Textarea + "Insert link" popover. Inserts Markdown links at cursor.
import { forwardRef, useRef, useState, useImperativeHandle } from "react";
import { Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  hint?: React.ReactNode;
};

export const LinkableTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ value, onChange, label, hint, ...rest }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);
    const selRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
    const [linkLabel, setLinkLabel] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [open, setOpen] = useState(false);

    const captureSel = () => {
      const ta = innerRef.current;
      if (!ta) return;
      selRef.current = { start: ta.selectionStart ?? 0, end: ta.selectionEnd ?? 0 };
    };

    const insertLink = () => {
      const url = linkUrl.trim();
      if (!url) return;
      const ta = innerRef.current;
      const current = value || "";
      const { start, end } = selRef.current.start || selRef.current.end
        ? selRef.current
        : { start: current.length, end: current.length };
      const safeStart = Math.min(start, current.length);
      const safeEnd = Math.min(end, current.length);
      const selected = current.slice(safeStart, safeEnd);
      const text = selected || linkLabel.trim() || url;
      const md = `[${text}](${url})`;
      const next = current.slice(0, safeStart) + md + current.slice(safeEnd);
      onChange(next);
      requestAnimationFrame(() => {
        ta?.focus();
        const pos = safeStart + md.length;
        ta?.setSelectionRange(pos, pos);
        selRef.current = { start: pos, end: pos };
      });
      setLinkLabel(""); setLinkUrl(""); setOpen(false);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
          ) : <span />}
          <Popover open={open} onOpenChange={(o) => { if (o) captureSel(); setOpen(o); }}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5" onMouseDown={captureSel}>
                <Link2 className="h-3.5 w-3.5" /> Insert link
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-2">
              <p className="text-xs font-semibold">Add a link</p>
              <Input placeholder="Link text (optional)" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
              <Input placeholder="https://example.com  or  /portfolio" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") insertLink(); }} />
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button size="sm" variant="hero" onClick={insertLink} disabled={!linkUrl.trim()}>Insert</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Tip: place your cursor (or select text) in the paragraph before clicking Insert link. Internal pages: use <code>/portfolio</code>, external: <code>https://…</code>.</p>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea
          ref={innerRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={captureSel}
          onKeyUp={captureSel}
          onMouseUp={captureSel}
          onBlur={captureSel}
          {...rest}
        />
        {hint ?? (
          <p className="text-[11px] text-muted-foreground">
            Links use Markdown — <code className="px-1 rounded bg-secondary/60">[label](https://link.com)</code> or <code className="px-1 rounded bg-secondary/60">[About](/about)</code>. Bare URLs auto-link too.
          </p>
        )}
      </div>
    );
  }
);
LinkableTextarea.displayName = "LinkableTextarea";

