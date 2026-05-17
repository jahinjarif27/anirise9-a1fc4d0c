import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MarkdownContent = ({ content, className = "" }: { content: string; className?: string }) => {
  return (
    <div className={`prose prose-lg max-w-none text-foreground/90 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...p }) => <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-8 mb-4" {...p} />,
          h2: ({ node, ...p }) => <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-8 mb-3" {...p} />,
          h3: ({ node, ...p }) => <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-2" {...p} />,
          p: ({ node, ...p }) => <p className="text-base leading-relaxed text-foreground/85 my-4" {...p} />,
          a: ({ node, ...p }) => <a className="text-accent font-medium underline underline-offset-2 hover:opacity-80" target={p.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...p} />,
          ul: ({ node, ...p }) => <ul className="list-disc pl-6 space-y-2 my-4 text-foreground/85" {...p} />,
          ol: ({ node, ...p }) => <ol className="list-decimal pl-6 space-y-2 my-4 text-foreground/85" {...p} />,
          blockquote: ({ node, ...p }) => <blockquote className="border-l-4 border-accent bg-accent/5 pl-4 py-2 my-5 italic text-foreground/80 rounded-r" {...p} />,
          code: ({ node, className, children, ...p }: any) => {
            const isInline = !className;
            return isInline
              ? <code className="bg-secondary/60 text-accent px-1.5 py-0.5 rounded text-[0.9em] font-mono" {...p}>{children}</code>
              : <code className={`block bg-secondary/60 text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono ${className || ""}`} {...p}>{children}</code>;
          },
          pre: ({ node, ...p }) => <pre className="bg-secondary/60 rounded-lg overflow-x-auto my-5" {...p} />,
          img: ({ node, ...p }) => <img className="rounded-xl my-6 w-full" loading="lazy" {...p} />,
          table: ({ node, ...p }) => <div className="overflow-x-auto my-5"><table className="w-full border-collapse text-sm" {...p} /></div>,
          th: ({ node, ...p }) => <th className="border border-border bg-secondary/50 p-2 text-left font-bold" {...p} />,
          td: ({ node, ...p }) => <td className="border border-border p-2" {...p} />,
          hr: () => <hr className="border-border my-8" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
