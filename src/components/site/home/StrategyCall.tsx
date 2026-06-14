import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";
import { useServices } from "@/lib/useServices";
import { SectionNote } from "@/components/site/SectionNote";

const TIMELINE_OPTIONS = [
  "As Soon As Possible",
  "Within 1 Month",
  "1-3 Months",
  "Just Exploring",
];
const BUDGET_OPTIONS = [
  "Below $500",
  "$500 - $1000",
  "$1000 - $3000",
  "$3000+",
];

export const StrategyCall = () => {
  const { addLead } = useAdmin();
  const dynServices = useServices();
  const SERVICE_OPTIONS = [...dynServices.map((s) => s.title), "Custom Web Development", "Other"];
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: SERVICE_OPTIONS[0],
    timeline: TIMELINE_OPTIONS[0],
    business: "",
    budget: BUDGET_OPTIONS[0],
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.business.trim()) {
      toast.error("Please fill in name, phone, email, and business.");
      return;
    }
    const phoneDigits = form.phone.replace(/[^\d+]/g, "");
    if (phoneDigits.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    const message = [
      `Business: ${form.business.trim()}`,
      `When to Start: ${form.timeline}`,
      `Budget: ${form.budget}`,
      form.note.trim() && `Note: ${form.note.trim()}`,
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 1000);
    try {
      setSubmitting(true);
      await addLead({
        name: form.name.trim().slice(0, 100),
        email: form.email.trim().slice(0, 255),
        phone: phoneDigits.slice(0, 20),
        service: form.service.slice(0, 100),
        message,
      });
      toast.success("Request received! We'll respond within 24 hours.");
      setForm({
        name: "",
        phone: "",
        email: "",
        service: SERVICE_OPTIONS[0],
        timeline: TIMELINE_OPTIONS[0],
        business: "",
        budget: BUDGET_OPTIONS[0],
        note: "",
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="strategy-call" className="py-20 lg:py-24 bg-background">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Free Consultation
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">
            Book A Strategy Call
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Share your requirements and challenges. We'll respond with clarity, strategy,
            and a plan tailored to your business.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl p-6 sm:p-10 shadow-elegant border border-border/40 space-y-6"
        >
          <Field label="Full Name" required>
            <Input
              required
              maxLength={100}
              placeholder="Full Name*"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>

          <Field label="Phone Number" required>
            <Input
              required
              type="tel"
              inputMode="tel"
              maxLength={20}
              placeholder="Phone Number*"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>

          <Field label="Email Address" required>
            <Input
              required
              type="email"
              maxLength={255}
              placeholder="Email Address*"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>

          <Field label="Type of Service You Need" required>
            <Select
              value={form.service}
              onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="When to Start?" required>
            <Select
              value={form.timeline}
              onValueChange={(v) => setForm((f) => ({ ...f, timeline: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMELINE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Business Name/Type" required>
            <Input
              required
              maxLength={120}
              placeholder="Business Name/Type"
              value={form.business}
              onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
            />
          </Field>

          <Field label="Budget Range" required>
            <Select
              value={form.budget}
              onValueChange={(v) => setForm((f) => ({ ...f, budget: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Note">
            <Textarea
              rows={4}
              maxLength={500}
              placeholder="Note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </Field>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              variant="hero"
              size="xl"
              disabled={submitting}
              className="min-w-[200px]"
            >
              {submitting ? "Sending..." : "Submit"} <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      <SectionNote id="strategyCall" />
    </section>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-sm font-medium text-foreground mb-2 block">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);
