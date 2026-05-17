import { useState, FormEvent } from "react";
import { Quote, Star } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const fallbackItems = [
  { quote: "AniRise turned our quiet website into our #1 source of leads. Their SEO work paid for itself within months.", name: "Rafiq Ahmed", role: "Founder, Local Retail Brand", rating: 5 },
  { quote: "Clear strategy, clean reporting, real results. The team genuinely cares about our growth.", name: "Sumi Khan", role: "Marketing Lead, E-commerce", rating: 5 },
  { quote: "Our new website is fast, beautiful, and converts. AniRise delivered beyond expectations.", name: "Tanvir Hossain", role: "CEO, Startup", rating: 5 },
];

export const Testimonials = () => {
  const { content, reviews, addReview } = useAdmin();
  const approved = reviews.filter((r) => r.approved);
  const items = approved.length > 0
    ? approved.map((r) => ({ quote: r.quote, name: r.name, role: r.role, rating: r.rating }))
    : fallbackItems;

  const [form, setForm] = useState({ name: "", role: "", quote: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("Please add your name and review.");
      return;
    }
    setSubmitting(true);
    await addReview({ name: form.name.trim(), role: form.role.trim(), quote: form.quote.trim(), rating: form.rating });
    setSubmitting(false);
    setForm({ name: "", role: "", quote: "", rating: 5 });
    toast.success("Thank you! Your review will appear after approval.");
  };

  return (
    <section id="testimonials" className="py-24 bg-secondary/40">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">{content.testimonialsTitle}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.slice(0, 9).map((t, i) => (
            <figure key={`${t.name}-${i}`} className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-smooth border border-border/40">
              <Quote className="h-8 w-8 text-accent mb-4" />
              <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} star rating`}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className={`h-4 w-4 ${idx < t.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <blockquote className="text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border">
                <p className="font-bold text-foreground">{t.name}</p>
                {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-card border border-border/40">
          <h3 className="text-2xl font-bold text-foreground mb-2">Share your experience</h3>
          <p className="text-sm text-muted-foreground mb-6">Worked with us? Leave a review — it goes live after a quick review by our team.</p>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Role / company (optional)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>
                  <Star className={`h-6 w-6 ${n <= form.rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Your review *" rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required />
            <Button type="submit" variant="hero" className="rounded-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
