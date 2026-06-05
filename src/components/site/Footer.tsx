import logo from "@/assets/anirise-logo.jpg";
import { Facebook, Mail, Phone, Instagram, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useServices } from "@/lib/useServices";

const PAGE_KEYS = [
  { key: "home", label: "Home", defaultSlug: "" },
  { key: "portfolio", label: "Portfolio", defaultSlug: "portfolio" },
  { key: "blog", label: "Blog", defaultSlug: "blog" },
  { key: "contact", label: "Contact", defaultSlug: "contact" },
  { key: "strategy-call", label: "Book A Strategy Call", defaultSlug: "strategy-call" },
];

export const Footer = () => {
  const { contact, seo } = useAdmin();
  const services = useServices();
  const pages = PAGE_KEYS
    .filter((p) => seo.pageSeo?.[p.key]?.status !== "draft")
    .map((p) => {
      const custom = seo.pageSeo?.[p.key]?.slug?.trim();
      const slug = custom && custom.length > 0 ? custom.replace(/^\/+/, "") : p.defaultSlug;
      return { label: p.label, href: slug ? `/${slug}` : "/" };
    });
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="AniRise" width={44} height={44} className="h-11 w-11 rounded-full ring-2 ring-primary-foreground/20" />
            <span className="font-display text-xl font-bold">AniRise</span>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-xs mb-5">
            Visibility · Growth · Success. Helping brands rise online with SEO, web, and marketing.
          </p>
          <Link
            to="/strategy-call"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent text-accent-foreground font-bold px-5 py-2.5 text-sm hover:opacity-90 transition-smooth"
          >
            Book A Strategy Call <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Pages</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {pages.map((p) => (
              <li key={p.href}>
                <Link to={p.href} className="hover:text-accent transition-smooth">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.publicSlug}`} className="hover:text-accent transition-smooth">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Connect</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            {contact.facebook && (
              <li>
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-accent transition-smooth">
                  <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary-foreground/10"><Facebook className="h-4 w-4" /></span>
                  Facebook
                </a>
              </li>
            )}
            {contact.instagram && (
              <li>
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-accent transition-smooth">
                  <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary-foreground/10"><Instagram className="h-4 w-4" /></span>
                  Instagram
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-3 hover:text-accent transition-smooth">
                  <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary-foreground/10"><Mail className="h-4 w-4" /></span>
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phoneTel && (
              <li>
                <a href={`tel:${contact.phoneTel}`} className="inline-flex items-center gap-3 hover:text-accent transition-smooth">
                  <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary-foreground/10"><Phone className="h-4 w-4" /></span>
                  {contact.phoneDisplay}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pb-24">
        <div className="container py-5 text-xs text-primary-foreground/60 flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AniRise. All rights reserved.</p>
          <p>Visibility — Growth — Success</p>
        </div>
      </div>
    </footer>
  );
};
