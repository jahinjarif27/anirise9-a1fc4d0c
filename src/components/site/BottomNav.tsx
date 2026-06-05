import { useEffect, useState } from "react";
import { Home, LayoutGrid, Briefcase, Menu as MenuIcon, Phone, Facebook, Instagram, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/anirise-logo.jpg";
import { useAdmin } from "@/context/AdminContext";
import { useServices } from "@/lib/useServices";

const SECTION_LABELS: Record<string, string> = {
  hero: "Home", services: "Services", portfolio: "Portfolio",
  blog: "Blog", testimonials: "Testimonials", contact: "Contact",
};

export const BottomNav = () => {
  const { contact, customPages } = useAdmin();
  const services = useServices();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const itemCls = (href: string) =>
    `flex flex-col items-center gap-0.5 py-1 transition-colors ${isActive(href) ? "text-accent" : "text-foreground/80 hover:text-accent"}`;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionKeys = ["hero", "services", "portfolio", "blog", "testimonials", "contact"];
  const allLinks = [
    ...sectionKeys.map((k) => ({
      label: SECTION_LABELS[k],
      href: k === "hero" ? "/" : k === "blog" ? "/blog" : `/${k}`,
    })),
    ...customPages
      .filter((p) => p.published && Array.isArray(p.navLocation) && p.navLocation.length > 0)
      .map((p) => ({ label: p.title || p.slug, href: `/${p.slug}` })),
  ];

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <div
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        style={{ width: "min(94vw, 440px)" }}
      >
        <nav className="relative bg-background/95 backdrop-blur-md shadow-elegant rounded-full border border-border/60 px-2 py-2 grid grid-cols-5 items-center">
          <button onClick={() => go("/")} className={itemCls("/")}>
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-wide">HOME</span>
          </button>
          <button onClick={() => go("/services")} className={itemCls("/services")}>
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-wide">SERVICES</span>
          </button>
          <div className="flex justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Top"
              className="-mt-7 h-14 w-14 rounded-full overflow-hidden grid place-items-center shadow-elegant ring-4 ring-background bg-background"
            >
              <img src={logo} alt="AniRise" className="h-full w-full object-cover" />
            </button>
          </div>
          <button onClick={() => go("/portfolio")} className={itemCls("/portfolio")}>
            <Briefcase className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-wide">PORTFOLIO</span>
          </button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-0.5 py-1 text-foreground/80 hover:text-accent">
                <MenuIcon className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-wide">MORE</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-0">
              <div className="container py-6">
                <div className="flex items-center gap-3 pb-5 border-b border-border/60">
                  <img src={logo} alt="AniRise" className="h-10 w-10 rounded-full ring-2 ring-primary/20" />
                  <span className="font-display text-xl font-bold">AniRise</span>
                </div>
                <ul className="grid gap-x-6 gap-y-1 py-5">
                  {allLinks.map((l) => {
                    const isServices = l.label === "Services";
                    if (!isServices) {
                      return (
                        <li key={l.href}>
                          <button
                            onClick={() => go(l.href)}
                            className="w-full flex items-center justify-between py-3 text-base font-medium text-foreground/90 hover:text-accent border-b border-border/40"
                          >
                            <span>{l.label}</span>
                            <span className="text-accent">→</span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={l.href}>
                        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
                          <div className="flex items-center justify-between border-b border-border/40">
                            <button
                              onClick={() => go(l.href)}
                              className="flex-1 text-left py-3 text-base font-medium text-foreground/90 hover:text-accent"
                            >
                              {l.label}
                            </button>
                            <CollapsibleTrigger aria-label="Toggle services" className="p-2 text-foreground/70 hover:text-accent">
                              <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <ul className="pl-3 ml-1 border-l border-border/40 py-1 space-y-0.5">
                              {services.map((s) => (
                                <li key={s.slug}>
                                  <button
                                    onClick={() => go(`/services/${s.publicSlug}`)}
                                    className="w-full text-left flex items-center gap-3 py-2.5 px-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-accent hover:bg-secondary/50"
                                  >
                                    <span className="h-8 w-8 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0">
                                      <s.icon className="h-4 w-4" />
                                    </span>
                                    <span className="flex-1">{s.title}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3">
                  <Button asChild size="lg" className="sm:flex-1 rounded-full bg-gradient-accent text-accent-foreground hover:opacity-90 min-h-14 h-14 text-base font-bold">
                    <a href={`tel:${contact.phoneTel}`} className="flex items-center justify-center gap-2">
                      <Phone className="h-5 w-5" /> Call Now
                    </a>
                  </Button>
                  <div className="flex items-center gap-2">
                    {contact.facebook && (
                      <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-12 w-12 grid place-items-center rounded-xl bg-card shadow-card text-primary">
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {contact.instagram && (
                      <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-12 w-12 grid place-items-center rounded-xl bg-card shadow-card text-primary">
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
};
