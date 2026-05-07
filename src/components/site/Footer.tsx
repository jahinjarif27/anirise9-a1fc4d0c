import logo from "@/assets/anirise-logo.jpg";
import { Facebook, Mail, Phone, Instagram } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const Footer = () => {
  const { contact } = useAdmin();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="AniRise" width={44} height={44} className="h-11 w-11 rounded-full ring-2 ring-primary-foreground/20" />
            <span className="font-display text-xl font-bold">AniRise</span>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-xs">
            Visibility · Growth · Success. Helping brands rise online with SEO, web, and marketing.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li>Website SEO</li>
            <li>Ecommerce SEO</li>
            <li>Website Development</li>
            <li>Social Media Marketing</li>
            <li>Graphics Design</li>
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
      <div className="border-t border-primary-foreground/10">
        <div className="container py-5 text-xs text-primary-foreground/60 flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AniRise. All rights reserved.</p>
          <p>Visibility — Growth — Success</p>
        </div>
      </div>
    </footer>
  );
};