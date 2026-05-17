import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LayoutTemplate, ChevronDown } from "lucide-react";

type Template = { id: string; name: string; description: string; body: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  templates: Template[];
  label?: string;
  minHeight?: number;
};

export const RichTextEditor = ({ value, onChange, templates, label = "Content", minHeight = 360 }: Props) => {
  const [pending, setPending] = useState<Template | null>(null);
  const apply = (tpl: Template) => {
    if (value && value.trim().length > 0) setPending(tpl);
    else onChange(tpl.body);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="text-xs font-semibold text-foreground/80">{label}</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <LayoutTemplate className="h-3.5 w-3.5" /> Insert template <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Ready-made templates</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {templates.map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => apply(t)} className="flex flex-col items-start gap-0.5 py-2">
                <span className="font-semibold text-sm">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div data-color-mode="light" className="rounded-lg overflow-hidden border border-input">
        <MDEditor
          value={value}
          onChange={(v) => onChange(v ?? "")}
          height={minHeight}
          preview="edit"
          visibleDragbar={false}
          textareaProps={{ placeholder: "Write your content here… You can use Markdown for headings (#), **bold**, *italic*, lists, links, images, tables, and more. Click 'Insert template' to start from a polished layout." }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Supports Markdown — headings, lists, links, images, tables, code blocks, quotes. Use the toolbar above the editor to format quickly.
      </p>
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing content?</AlertDialogTitle>
            <AlertDialogDescription>
              Inserting the "{pending?.name}" template will replace your current content. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pending) { onChange(pending.body); setPending(null); } }}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
