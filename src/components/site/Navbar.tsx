import { useEffect, useRef, useState } from "react";
import { Menu, Phone, Search, TrendingUp, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/anirise-logo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdmin } from "@/context/AdminContext";

const SECTION_LABELS: Record<string, string> = {
  hero: "Home", services: "Services", portfolio: "Projects",
  blog: "Blog", testimonials: "Testimonials", contact: "Contact",
};

export const Navbar = () => {
  const { contact, pageLocation, customPages, login } = useAdmin();

  const sectionKeys = ["hero", "services", "portfolio", "blog", "testimonials", "contact"];
  const links = sectionKeys.map((k) => {
    const label = SECTION_LABELS[k];
    if (k === "hero") return { label, href: "/" };
    if (k === "blog") return { label, href: "/blog" };
    return { label, href: `/${k}` };
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
          <div className="hidden md:flex items-center gap-2 ml-2">
            <span className="font-semibold tracking-wider uppercase text-[10px] opacity-90">Revenue Driven for our clients</span>
            <span className="inline-flex items-center gap-1 font-bold">
              <TrendingUp className="h-4 w-4" /> $10,000+
            </span>
          </div>
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
            {allLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-foreground/80 hover:text-accent transition-smooth"
                >
                  {l.label}
                </a>
              </li>
            ))}
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
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 py-5">
                    {allLinks.map((l) => (
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
                    ))}
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