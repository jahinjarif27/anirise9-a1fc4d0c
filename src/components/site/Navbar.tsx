import { useEffect, useRef, useState } from "react";
import { Menu, Phone, Search, TrendingUp, Facebook, Instagram, ChevronDown } from "lucide-react";
import logo from "@/assets/anirise-logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";
import { useServices } from "@/lib/useServices";

const SECTION_LABELS: Record<string, string> = {
  hero: "Home", services: "Services", about: "About", portfolio: "Portfolio",
  "case-studies": "Case studies",
  blog: "Blog", testimonials: "Testimonials", contact: "Contact",
};

export const Navbar = () => {
  const { contact, customPages, login, seo } = useAdmin();
  const services = useServices();
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  // Built-in section nav — use admin-set slug + filter draft pages.
  type NavKey = "hero" | "services" | "about" | "portfolio" | "case-studies" | "blog" | "testimonials" | "contact";
  const NAV_TO_SEO_KEY: Record<NavKey, string> = {
    hero: "home", services: "services", about: "about", portfolio: "portfolio",
    "case-studies": "case-studies",
    blog: "blog", testimonials: "testimonials", contact: "contact",
  };
  const sectionKeys: NavKey[] = ["hero", "services", "about", "portfolio", "case-studies", "blog", "testimonials", "contact"];
  const links = sectionKeys
    .filter((k) => {
      const seoKey = NAV_TO_SEO_KEY[k];
      return seo.pageSeo?.[seoKey]?.status !== "draft";
    })
    .map((k) => {
      const label = SECTION_LABELS[k];
      if (k === "hero") return { label, href: "/" };
      const seoKey = NAV_TO_SEO_KEY[k];
      const customSlug = seo.pageSeo?.[seoKey]?.slug?.trim();
      const slug = customSlug && customSlug.length > 0 ? customSlug.replace(/^\/+/, "") : k;
      return { label, href: `/${slug}` };
    });
  const customLinks = customPages
    .filter((p) => p.published && Array.isArray(p.navLocation) && p.navLocation.length > 0)
    .map((p) => ({ label: p.title || p.slug, href: `/${p.slug}` }));
  const allLinks = [...links, ...customLinks];

  
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setAdminOpen(true);
      return;
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      navigate("/");
    }, 400);
  };

  const submitAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(adminPw);
    if (ok) {
      setAdminOpen(false);
      setAdminPw("");
      navigate("/admin");
      return;
    }
    toast.error("Wrong password");
    setAdminPw("");
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setPastHero(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", pastHero ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100")}>
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
        <div className="container flex items-center justify-between gap-3 py-2.5">
          <a href={`tel:${contact.phoneTel}`} className="inline-flex items-center gap-2 font-bold hover:underline min-w-0">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-primary-foreground/15 shrink-0">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-sm sm:text-base">{contact.phoneDisplay}</span>
          </a>
          {(content.topBarLabel || content.topBarValue) && (
            <div className="hidden md:flex items-center gap-2 ml-2">
              {content.topBarLabel && (
                <span className="font-semibold tracking-wider uppercase text-[10px] opacity-90">{content.topBarLabel}</span>
              )}
              {content.topBarValue && (
                <span className="inline-flex items-center gap-1 font-bold">
                  <TrendingUp className="h-4 w-4" /> {content.topBarValue}
                </span>
              )}
            </div>
          )}
          <a
            href="/strategy-call"
            className="inline-flex items-center rounded-full bg-background text-primary font-bold px-4 sm:px-5 py-1.5 text-xs sm:text-sm hover:opacity-90 shrink-0"
          >
            Book A Call
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className={cn("transition-smooth", scrolled ? "bg-background/90 backdrop-blur-md shadow-card" : "bg-background/70 backdrop-blur-sm")}> 
        <nav className="container flex items-center justify-between py-3">
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-3 select-none">
            <img src={logo} alt="AniRise logo" width={40} height={40} className="h-10 w-10 rounded-full ring-2 ring-primary/20" />
            <span className="font-display text-xl font-bold text-foreground">AniRise</span>
          </a>
          <ul className="hidden lg:flex items-center gap-8 mx-auto">
            {allLinks.map((l) => {
              const isServices = l.label === "Services";
              if (!isServices) {
                return (
                  <li key={l.href}>
                    <a href={l.href} className="text-sm font-medium text-foreground/80 hover:text-accent transition-smooth">
                      {l.label}
                    </a>
                  </li>
                );
              }
              return (
                <li key={l.href} className="relative group">
                  <a href={l.href} className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-accent transition-smooth">
                    {l.label} <ChevronDown className="h-3.5 w-3.5" />
                  </a>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="min-w-[260px] bg-background border border-border rounded-2xl shadow-elegant p-2">
                      {services.map((s) => (
                        <a key={s.slug} href={`/services/${s.publicSlug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors">
                          <span className="h-9 w-9 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0">
                            <s.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-foreground">{s.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="h-10 w-10 grid place-items-center rounded-full hover:bg-secondary text-foreground">
              <Search className="h-5 w-5" />
            </button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="h-10 w-10 grid place-items-center rounded-full hover:bg-secondary text-foreground"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="w-full max-h-[90vh] overflow-y-auto p-0 rounded-b-3xl border-b border-border shadow-elegant"
              >
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
                            <a
                              href={l.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between py-3 text-base font-medium text-foreground/90 hover:text-accent border-b border-border/40 group"
                            >
                              <span>{l.label}</span>
                              <span className="opacity-0 group-hover:opacity-100 transition-smooth text-accent">→</span>
                            </a>
                          </li>
                        );
                      }
                      return (
                        <li key={l.href}>
                          <Collapsible open={mobileServicesOpen} onOpenChange={setMobileServicesOpen}>
                            <div className="flex items-center justify-between border-b border-border/40">
                              <a
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3 text-base font-medium text-foreground/90 hover:text-accent"
                              >
                                {l.label}
                              </a>
                              <CollapsibleTrigger
                                aria-label="Toggle services"
                                className="p-2 text-foreground/70 hover:text-accent"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <ul className="pl-3 ml-1 border-l border-border/40 py-1 space-y-0.5">
                                {services.map((s) => (
                                  <li key={s.slug}>
                                    <a
                                      href={`/services/${s.publicSlug}`}
                                      onClick={() => setOpen(false)}
                                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-accent hover:bg-secondary/50"
                                    >
                                      <span className="h-8 w-8 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0">
                                        <s.icon className="h-4 w-4" />
                                      </span>
                                      <span className="flex-1">{s.title}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                    <Button asChild size="lg" className="sm:flex-1 rounded-full bg-gradient-accent text-accent-foreground hover:opacity-90 min-h-14 h-14 text-base font-bold">
                      <a href="/strategy-call" onClick={() => setOpen(false)} className="flex items-center justify-center w-full h-full">Book A Strategy Call</a>
                    </Button>
                    <div className="flex items-center gap-2">
                      {contact.facebook && (
                        <a
                          href={contact.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="h-12 w-12 grid place-items-center rounded-xl bg-card shadow-card text-primary"
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
                          className="h-12 w-12 grid place-items-center rounded-xl bg-card shadow-card text-primary"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
    <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl">
        <DialogHeader>
          <DialogTitle>AniRise Admin</DialogTitle>
          <DialogDescription>Enter the admin password to continue.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submitAdminPassword} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            enterKeyHint="done"
            placeholder="Password"
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
            className="h-12 text-lg md:text-base"
          />
          <Button type="submit" variant="hero" className="w-full rounded-full">Open admin</Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};