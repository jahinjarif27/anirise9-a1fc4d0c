import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Mail, MapPin, Send, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

export const Contact = () => {
  const { content, contact } = useAdmin();
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Please fill in name, email, phone, and message.");
      return;
    }
    const phoneDigits = form.phone.replace(/[^\d+]/g, "");
    if (phoneDigits.replace(/\D/g, "").length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    const subject = `New enquiry from ${form.name.trim()}${form.service ? ` — ${form.service.trim()}` : ""}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Phone: ${phoneDigits}`,
      `Service: ${form.service.trim() || "-"}`,
      "",
      "Message:",
      form.message.trim(),
    ].join("\n");
    const to = contact.email || "hello@anirise.com";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app to send the message.");
    setForm({ name: "", email: "", phone: "", service: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">
            {content.contactHeadline}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.contactBlurb}
          </p>

          <div className="mt-10 space-y-5">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <span className="h-12 w-12 grid place-items-center rounded-xl bg-accent/10 text-accent group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-smooth">
                  <Facebook className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Facebook</p>
                  <p className="font-semibold text-foreground break-all">{contact.facebook.replace(/^https?:\/\//, "")}</p>
                </div>
              </a>
            )}
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className="flex items-center gap-4 group">
                <span className="h-12 w-12 grid place-items-center rounded-xl bg-accent/10 text-accent group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-smooth">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Call Us</p>
                  <p className="font-semibold text-foreground">{contact.phoneDisplay}</p>
                </div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-4 group">
                <span className="h-12 w-12 grid place-items-center rounded-xl bg-accent/10 text-accent group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-smooth">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Email Us</p>
                  <p className="font-semibold text-foreground">{contact.email}</p>
                </div>
              </a>
            )}
            {contact.address && (
              <div className="flex items-center gap-4">
                <span className="h-12 w-12 grid place-items-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Service Area</p>
                  <p className="font-semibold text-foreground">{contact.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl p-8 shadow-elegant border border-border/40 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
              <Input
                required
                maxLength={100}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                required
                type="email"
                maxLength={255}
                placeholder="you@brand.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Mobile Number</label>
            <Input
              required
              type="tel"
              inputMode="tel"
              maxLength={20}
              placeholder="+8801XXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Service</label>
            <Input
              maxLength={100}
              placeholder="e.g. Website SEO, Web Development"
              value={form.service}
              onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
            <Textarea
              required
              rows={5}
              maxLength={1000}
              placeholder="Tell us about your project..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full rounded-full">
            Send Message <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  );
};
