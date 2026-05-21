// Phase 3 — multi-paragraph + alignment renderer for public pages.
// Backward compatible: if `blocks` empty/undefined, renders `fallbackBody` as
// MarkdownContent so existing pages keep working unchanged.

import { MarkdownContent } from "@/components/site/MarkdownContent";

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextBlock = { id: string; text: string; align?: TextAlign };

const ALIGN_CLASS: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

export const TextBlocksView = ({
  blocks,
  fallbackBody,
  className = "",
}: {
  blocks?: TextBlock[];
  fallbackBody?: string;
  className?: string;
}) => {
  const list = (blocks ?? []).filter((b) => b && b.text && b.text.trim().length > 0);
  if (list.length === 0) {
    if (fallbackBody && fallbackBody.trim().length > 0) {
      return <MarkdownContent content={fallbackBody} />;
    }
    return null;
  }
  return (
    <div className={`space-y-4 ${className}`}>
      {list.map((b) => (
        <div key={b.id} className={ALIGN_CLASS[b.align || "left"]}>
          <MarkdownContent content={b.text} />
        </div>
      ))}
    </div>
  );
};
