import { Facebook, Instagram, Mail, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";

export const FinalCTA = () => {
  const { finalCta, contact } = useAdmin();
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container max-w-3xl text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-snug">
          {finalCta.headline}
        </h2>
        {finalCta.subline && (
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {finalCta.subline}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {contact.facebook && (
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="h-11 w-11 grid place-items-center rounded-full bg-secondary text-foreground/70 hover:text-accent hover:bg-secondary/80 transition-smooth"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {contact.instagram && (
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="h-11 w-11 grid place-items-center rounded-full bg-secondary text-foreground/70 hover:text-accent hover:bg-secondary/80 transition-smooth"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              aria-label="Email"
              className="h-11 w-11 grid place-items-center rounded-full bg-secondary text-foreground/70 hover:text-accent hover:bg-secondary/80 transition-smooth"
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
          {contact.phoneTel && (
            <a
              href={`tel:${contact.phoneTel}`}
              aria-label="Phone"
              className="h-11 w-11 grid place-items-center rounded-full bg-secondary text-foreground/70 hover:text-accent hover:bg-secondary/80 transition-smooth"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>

        <div className="mt-10">
          <Button asChild variant="hero" size="xl" className="min-w-[240px]">
            <Link to="/strategy-call">
              {finalCta.primaryLabel || "Book A Strategy Call"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
