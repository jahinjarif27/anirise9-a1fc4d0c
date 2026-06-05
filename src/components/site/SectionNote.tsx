// Admin-managed paragraph note appended under any section.
// Supports: heading, subheading, paragraph (with Markdown links), alignment.
// Hidden when all fields empty.

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAdmin } from "@/context/AdminContext";
import type { TextAlign } from "@/context/AdminContext";

const ALIGN: Record<TextAlign, string> = {
  left: "text-left mr-auto items-start",
  center: "text-center mx-auto items-center",
  right: "text-right ml-auto items-end",
  justify: "text-justify mx-auto items-start",
};

export const SectionNote = ({ id, tone = "light" }: { id: string; tone?: "light" | "onDark" }) => {
  const { content } = useAdmin();
  const note = content.sectionNotes?.[id];
  if (!note) return null;
  const heading = note.heading?.trim() || "";
  const subheading = note.subheading?.trim() || "";
  const text = note.text?.trim() || "";
  if (!heading && !subheading && !text) return null;
  const align = (note.align || "left") as TextAlign;

  const headingClass = tone === "onDark" ? "text-primary-foreground" : "text-foreground";
  const subheadingClass = tone === "onDark" ? "text-primary-foreground/70" : "text-accent";
  const textClass = tone === "onDark" ? "text-primary-foreground/85" : "text-muted-foreground";
  const linkClass = tone === "onDark"
    ? "text-accent-foreground underline decoration-accent decoration-2 underline-offset-4 hover:opacity-80 font-medium"
    : "text-accent underline decoration-accent/40 decoration-2 underline-offset-4 hover:decoration-accent transition-colors font-medium";

  return (
    <div className="container mt-12 lg:mt-16">
      <div className={`max-w-3xl flex flex-col gap-3 ${ALIGN[align]}`}>
        {heading && (
          <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${headingClass}`}>
            {heading}
          </h3>
        )}
        {subheading && (
          <p className={`text-sm sm:text-base font-semibold tracking-wide uppercase ${subheadingClass}`}>
            {subheading}
          </p>
        )}
        {text && (
          <div className={`text-base sm:text-lg leading-relaxed ${textClass}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...p }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap" {...p} />,
                a: ({ node, href, ...p }) => (
                  <a
                    href={href}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={linkClass}
                    {...p}
                  />
                ),
                strong: ({ node, ...p }) => <strong className="font-bold text-foreground" {...p} />,
                em: ({ node, ...p }) => <em className="italic" {...p} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
