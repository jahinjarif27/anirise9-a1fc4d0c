import { Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";

export const HomeFAQ = () => {
  const { homeFaqs } = useAdmin();
  if (!homeFaqs.length) return null;
  return (
    <section className="py-20 lg:py-24 bg-secondary/40">
      <div className="container max-w-3xl">
        <div className="mb-10 text-center">
          <Sparkles className="h-7 w-7 text-accent mx-auto mb-3" />
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-2">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Frequently asked questions</h2>
          <p className="mt-3 text-muted-foreground">Working with AniRise — answered up front.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {homeFaqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="bg-card rounded-xl border border-border/40 px-5 shadow-card">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
