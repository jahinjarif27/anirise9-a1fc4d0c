import { Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAdmin } from "@/context/AdminContext";

type Props = { slug: string; title?: string };

export const ServiceFAQ = ({ slug, title = "Frequently Asked Questions" }: Props) => {
  const { serviceFaqs } = useAdmin();
  const faqs = serviceFaqs[slug] || [];
  if (!faqs.length) return null;
  return (
    <section className="py-20 bg-secondary/40">
      <div className="container max-w-3xl">
        <div className="mb-10 text-center">
          <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
          <h2 className="text-4xl font-extrabold text-foreground">{title}</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f) => (
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
