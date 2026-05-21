// Admin-managed paragraph note that can be appended under any section.
// Renders nothing when both heading and text are empty (default behavior).
// When set, the parent section visually grows because this adds its own padding.

import { useAdmin } from "@/context/AdminContext";
import type { TextAlign } from "@/context/AdminContext";

const ALIGN: Record<TextAlign, string> = {
  left: "text-left mr-auto",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
  justify: "text-justify mx-auto",
};

export const SectionNote = ({ id, tone = "light" }: { id: string; tone?: "light" | "onDark" }) => {
  const { content } = useAdmin();
  const note = content.sectionNotes?.[id];
  if (!note) return null;
  const heading = note.heading?.trim() || "";
  const text = note.text?.trim() || "";
  if (!heading && !text) return null;
  const align = (note.align || "left") as TextAlign;
  const headingClass = tone === "onDark" ? "text-primary-foreground" : "text-foreground";
  const textClass = tone === "onDark" ? "text-primary-foreground/80" : "text-muted-foreground";
  return (
    <div className="container mt-10 lg:mt-14">
      <div className={`max-w-3xl ${ALIGN[align]}`}>
        {heading && (
          <h3 className={`text-2xl sm:text-3xl font-extrabold mb-3 ${headingClass}`}>{heading}</h3>
        )}
        {text && (
          <p className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${textClass}`}>{text}</p>
        )}
      </div>
    </div>
  );
};
