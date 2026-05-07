import { Quote } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const items = [
  {
    quote:
      "AniRise turned our quiet website into our #1 source of leads. Their SEO work paid for itself within months.",
    name: "Rafiq Ahmed",
    role: "Founder, Local Retail Brand",
  },
  {
    quote:
      "Clear strategy, clean reporting, real results. The team genuinely cares about our growth.",
    name: "Sumi Khan",
    role: "Marketing Lead, E-commerce",
  },
  {
    quote:
      "Our new website is fast, beautiful, and converts. AniRise delivered beyond expectations.",
    name: "Tanvir Hossain",
    role: "CEO, Startup",
  },
];

export const Testimonials = () => {
  const { content } = useAdmin();

  return (
    <section id="testimonials" className="py-24 bg-secondary/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">{content.testimonialsTitle}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <figure
              key={t.name}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-smooth border border-border/40"
            >
              <Quote className="h-8 w-8 text-accent mb-4" />
              <blockquote className="text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border">
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};