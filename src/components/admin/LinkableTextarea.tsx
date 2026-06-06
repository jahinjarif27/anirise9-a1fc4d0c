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
    const [linkLabel, setLinkLabel] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [open, setOpen] = useState(false);

    const insertLink = () => {
      const url = linkUrl.trim();
      if (!url) return;
      const ta = innerRef.current;
      const current = value || "";
      const start = ta?.selectionStart ?? current.length;
      const end = ta?.selectionEnd ?? current.length;
      const selected = current.slice(start, end);
      const text = selected || linkLabel.trim() || url;
      const md = `[${text}](${url})`;
      const next = current.slice(0, start) + md + current.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta?.focus();
        const pos = start + md.length;
        ta?.setSelectionRange(pos, pos);
      });
      setLinkLabel(""); setLinkUrl(""); setOpen(false);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
          ) : <span />}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Insert link
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-2">
              <p className="text-xs font-semibold">Add a link</p>
              <Input placeholder="Link text (optional)" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
              <Input placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") insertLink(); }} />
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button size="sm" variant="hero" onClick={insertLink} disabled={!linkUrl.trim()}>Insert</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Tip: select text first to turn it into a link.</p>
            </PopoverContent>
          </Popover>
        </div>
        <Textarea ref={innerRef} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
        {hint ?? (
          <p className="text-[11px] text-muted-foreground">
            Links use Markdown — <code className="px-1 rounded bg-secondary/60">[label](https://link.com)</code>. Bare URLs auto-link too.
          </p>
        )}
      </div>
    );
  }
);
LinkableTextarea.displayName = "LinkableTextarea";
