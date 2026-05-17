import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { BlogPost } from "@/data/blog";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-illustration.jpg";
import logoImg from "@/assets/anirise-logo.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";

// ============================================================
// Types (exported API unchanged so existing UI keeps working)
// ============================================================

type SiteContent = {
  heroEyebrow: string;
  heroHeadline: string;
  heroTagline: string;
  heroImage: string;
  heroImageAlt: string;
  servicesTitle: string;
  servicesBlurb: string;
  servicesImage: string;
  servicesImageAlt: string;
  aboutHeadline: string;
  aboutBlurb: string;
  aboutImage: string;
  aboutImageAlt: string;
  portfolioTitle: string;
  portfolioBlurb: string;
  portfolioImage: string;
  portfolioImageAlt: string;
  blogTitle: string;
  blogBlurb: string;
  blogImage: string;
  blogImageAlt: string;
  testimonialsTitle: string;
  testimonialsImage: string;
  testimonialsImageAlt: string;
  contactHeadline: string;
  contactBlurb: string;
  contactImage: string;
  contactImageAlt: string;
};

type ContactInfo = {
  whatsapp: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  facebook: string;
  instagram: string;
  address: string;
};

export type PortfolioItem = {
  id: string;
  image: string;
  imageAlt: string;
  tag: string;
  title: string;
};

export type Redirect = {
  id: string;
  from: string;
  to: string;
  code: 301 | 302 | 307 | 308;
  enabled: boolean;
};

export type SchemaItem = {
  id: string;
  type:
    | "Organization" | "LocalBusiness" | "WebSite" | "WebPage" | "Article"
    | "BlogPosting" | "BreadcrumbList" | "Product" | "Service" | "FAQPage"
    | "Person" | "Event";
  enabled: boolean;
  json: string;
  name: string;
};

export type PageSeo = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export type CustomPage = {
  id: string;
  title: string;
  slug: string;
  parent: string;
  /** Where the page link appears. Empty array = hidden (direct URL only). Multiple locations allowed. */
  navLocation: ("navbar" | "menu")[];
  image: string;
  imageAlt: string;
  body: string;
  seo: PageSeo;
  published: boolean;
  groupKey?: string;
};

export type HomeSection = {
  id: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  enabled: boolean;
  groupKey?: string;
};

export type SectionGroup = {
  id: string;
  key: string;
  label: string;
  isHome: boolean;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: number;
};

export type SectionKey = "hero" | "services" | "about" | "portfolio" | "blog" | "testimonials" | "contact";
export const SECTION_KEYS: SectionKey[] = ["hero", "services", "about", "portfolio", "blog", "testimonials", "contact"];

type SeoSettings = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  canonicalAuto: boolean;
  canonicalPerPage: Record<string, string>;
  sitemap: string;
  robotsTxt: string;
  autoSitemap: boolean;
  redirects: Redirect[];
  schemas: SchemaItem[];
  pageSeo: Record<string, PageSeo>;
};

type Appearance = {
  headingFont: string;
  bodyFont: string;
  baseFontSize: number;
};

// ============================================================
// Defaults (used if DB row is empty)
// ============================================================

const defaultContent: SiteContent = {
  heroEyebrow: "Welcome to AniRise",
  heroHeadline: "We Help Your Brand Rise & Be Seen.",
  heroTagline: "AniRise drives Visibility, fuels Growth, and builds a clear roadmap toward Success.",
  heroImage: heroImg,
  heroImageAlt: "AniRise: SEO and growth illustration",
  servicesTitle: "What We Do",
  servicesBlurb: "From visibility to growth — every service is built around helping your business succeed online.",
  servicesImage: "",
  servicesImageAlt: "",
  aboutHeadline: "Visibility · Growth · Success",
  aboutBlurb: "AniRise is a digital agency helping brands rise online with SEO, web development, and marketing.",
  aboutImage: logoImg,
  aboutImageAlt: "AniRise brand mark",
  portfolioTitle: "Recent Work",
  portfolioBlurb: "A snapshot of projects where we've turned visibility into real business growth.",
  portfolioImage: "",
  portfolioImageAlt: "",
  blogTitle: "Insights From The AniRise Team",
  blogBlurb: "Practical SEO, marketing, and growth playbooks — written by the people running the campaigns.",
  blogImage: "",
  blogImageAlt: "",
  testimonialsTitle: "What Clients Say",
  testimonialsImage: "",
  testimonialsImageAlt: "",
  contactHeadline: "Let's Make Your Brand Rise.",
  contactBlurb: "Tell us about your business. We'll reply within 24 hours with a clear, honest path forward.",
  contactImage: "",
  contactImageAlt: "",
};

const defaultContact: ContactInfo = {
  whatsapp: "8801337744727",
  phoneDisplay: "+880 1337-744727",
  phoneTel: "+8801337744727",
  email: "hello@anirise.com",
  facebook: "https://www.facebook.com/anirisebd",
  instagram: "",
  address: "Working Globally",
};

const defaultPortfolio: PortfolioItem[] = [
  { id: "p1", image: portfolio1, imageAlt: "Ecommerce SEO case study cover", tag: "Ecommerce SEO", title: "Online Store Growth" },
  { id: "p2", image: portfolio2, imageAlt: "SEO analytics dashboard preview", tag: "SEO Analytics", title: "Ranked Page #1 in 90 Days" },
  { id: "p3", image: portfolio3, imageAlt: "Brand website redesign mockup", tag: "Web Development", title: "Brand Website Redesign" },
];

const defaultSeo: SeoSettings = {
  metaTitle: "AniRise — Visibility · Growth · Success | SEO & Web Agency",
  metaDescription:
    "AniRise helps brands rise online with SEO, ecommerce SEO, web development, and digital marketing. Visibility, growth, success.",
  metaKeywords: "SEO, ecommerce SEO, web development, digital marketing, AniRise",
  ogImage: "/favicon.jpg",
  canonicalUrl: "https://anirise.com.bd",
  canonicalAuto: true,
  canonicalPerPage: {},
  sitemap: "",
  robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://anirise.com.bd/sitemap.xml`,
  autoSitemap: true,
  redirects: [
    { id: "r1", from: "/old-blog", to: "/blog", code: 301, enabled: true },
  ],
  schemas: [
    {
      id: "s1",
      type: "Organization",
      enabled: true,
      name: "AniRise — Organization",
      json: JSON.stringify({
        name: "AniRise",
        url: "https://anirise.com.bd",
        logo: "https://anirise.com.bd/favicon.jpg",
        sameAs: ["https://www.facebook.com/anirisebd"],
      }, null, 2),
    },
  ],
  pageSeo: {
    home: { metaTitle: "AniRise — Visibility · Growth · Success", metaDescription: "AniRise helps brands rise online with SEO, web development, and digital marketing.", metaKeywords: "SEO, web, marketing, AniRise" },
    about: { metaTitle: "About AniRise", metaDescription: "Our story and mission.", metaKeywords: "about, AniRise" },
    services: { metaTitle: "Services — AniRise", metaDescription: "SEO, Web, Ads, Design.", metaKeywords: "services" },
    portfolio: { metaTitle: "Portfolio — AniRise", metaDescription: "Recent work.", metaKeywords: "portfolio" },
    blog: { metaTitle: "Blog — AniRise", metaDescription: "Insights from the AniRise team.", metaKeywords: "blog" },
    testimonials: { metaTitle: "Testimonials — AniRise", metaDescription: "What clients say.", metaKeywords: "testimonials" },
    contact: { metaTitle: "Contact AniRise", metaDescription: "Let's make your brand rise.", metaKeywords: "contact" },
  },
};

const FONT_CHOICES = [
  "Inter", "Poppins", "Roboto", "Montserrat", "Open Sans", "Lato",
  "Nunito", "Raleway", "Playfair Display", "Merriweather", "DM Sans", "Work Sans",
] as const;

const defaultAppearance: Appearance = { headingFont: "Poppins", bodyFont: "Inter", baseFontSize: 16 };

const defaultSectionGroups: SectionGroup[] = [
  { id: "g-home", key: "home", label: "Home", isHome: true },
  { id: "g-services", key: "services-group", label: "Services", isHome: false },
];
const defaultPageLocation: Record<string, string> = {
  hero: "home", services: "home", about: "home", portfolio: "home",
  blog: "home", testimonials: "home", contact: "home",
};
const defaultHomeMembership: Record<SectionKey, boolean> = {
  hero: true, services: true, about: true, portfolio: true, blog: true, testimonials: true, contact: true,
};

// ============================================================
// Context
// ============================================================

type AdminCtx = {
  isAuthed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
  loading: boolean;
  posts: BlogPost[];
  addPost: (p: Omit<BlogPost, "id">) => void;
  updatePost: (id: string, p: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  content: SiteContent;
  updateContent: (c: Partial<SiteContent>) => void;
  contact: ContactInfo;
  updateContact: (c: Partial<ContactInfo>) => void;
  portfolio: PortfolioItem[];
  addPortfolioItem: (p: Omit<PortfolioItem, "id">) => void;
  updatePortfolioItem: (id: string, p: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;
  seo: SeoSettings;
  updateSeo: (s: Partial<SeoSettings>) => void;
  regenerateSitemap: () => void;
  addRedirect: (r: Omit<Redirect, "id">) => void;
  updateRedirect: (id: string, r: Partial<Redirect>) => void;
  deleteRedirect: (id: string) => void;
  addSchema: (s: Omit<SchemaItem, "id">) => void;
  updateSchema: (id: string, s: Partial<SchemaItem>) => void;
  deleteSchema: (id: string) => void;
  customPages: CustomPage[];
  addCustomPage: (p: Omit<CustomPage, "id">) => void;
  updateCustomPage: (id: string, p: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;
  homeSections: HomeSection[];
  addHomeSection: (s: Omit<HomeSection, "id">) => void;
  updateHomeSection: (id: string, s: Partial<HomeSection>) => void;
  deleteHomeSection: (id: string) => void;
  homeMembership: Record<SectionKey, boolean>;
  setHomeMembership: (k: SectionKey, v: boolean) => void;
  pageLocation: Record<string, string>;
  setPageLocation: (pageKey: string, groupKey: string) => void;
  sectionGroups: SectionGroup[];
  addSectionGroup: (label: string) => string;
  updateSectionGroup: (id: string, s: Partial<SectionGroup>) => void;
  deleteSectionGroup: (id: string) => void;
  updatePageSeo: (key: string, s: Partial<PageSeo>) => void;
  appearance: Appearance;
  updateAppearance: (a: Partial<Appearance>) => void;
  fontChoices: readonly string[];
  visits: number;
  visitSeries: { day: string; visits: number }[];
  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  deleteLead: (id: string) => void;
  clearLeads: () => void;
  pruneOldLeads: () => Promise<number>;
};

const Ctx = createContext<AdminCtx | null>(null);

// Helpers to map DB rows ↔ app types
const fromDbPost = (r: any): BlogPost => ({
  id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt,
  category: r.category, author: r.author, date: r.date,
  readTime: r.read_time, cover: r.cover, coverAlt: r.cover_alt ?? "",
  ctaEnabled: !!r.cta_enabled, ctaLabel: r.cta_label ?? "", ctaUrl: r.cta_url ?? "",
  body: r.body ?? "",
});
const toDbPost = (p: Partial<BlogPost>) => {
  const out: any = {};
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.title !== undefined) out.title = p.title;
  if (p.excerpt !== undefined) out.excerpt = p.excerpt;
  if (p.category !== undefined) out.category = p.category;
  if (p.author !== undefined) out.author = p.author;
  if (p.date !== undefined) out.date = p.date;
  if (p.readTime !== undefined) out.read_time = p.readTime;
  if (p.cover !== undefined) out.cover = p.cover;
  if (p.coverAlt !== undefined) out.cover_alt = p.coverAlt;
  if (p.ctaEnabled !== undefined) out.cta_enabled = p.ctaEnabled;
  if (p.ctaLabel !== undefined) out.cta_label = p.ctaLabel;
  if (p.ctaUrl !== undefined) out.cta_url = p.ctaUrl;
  if (p.body !== undefined) out.body = p.body;
  return out;
};
const fromDbLead = (r: any): Lead => ({
  id: r.id, name: r.name, email: r.email, phone: r.phone,
  service: r.service, message: r.message, createdAt: new Date(r.created_at).getTime(),
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeo);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [homeMembership, setHomeMembershipState] = useState<Record<SectionKey, boolean>>(defaultHomeMembership);
  const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>(defaultSectionGroups);
  const [pageLocation, setPageLocationState] = useState<Record<string, string>>(defaultPageLocation);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState(0);
  const [visitSeries, setVisitSeries] = useState<{ day: string; visits: number }[]>([]);

  // Prevent the initial DB-load setState from triggering a save back to DB
  const hydrated = useRef(false);

  // ---------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      const [settingsRes, postsRes, leadsRes, visitsRes] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("blog_posts").select("*").order("date", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("page_visits").select("created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);
      if (!alive) return;

      const s = settingsRes.data;
      if (s) {
        if (s.content && Object.keys(s.content).length) setContent({ ...defaultContent, ...(s.content as any) });
        if (s.contact && Object.keys(s.contact).length) setContact({ ...defaultContact, ...(s.contact as any) });
        if (Array.isArray(s.portfolio) && (s.portfolio as any[]).length) setPortfolio(s.portfolio as any);
        if (s.seo && Object.keys(s.seo).length) setSeo({ ...defaultSeo, ...(s.seo as any) });
        if (s.appearance && Object.keys(s.appearance).length) setAppearance({ ...defaultAppearance, ...(s.appearance as any) });
        if (Array.isArray(s.custom_pages)) setCustomPages((s.custom_pages as any[]).map((p) => ({
          ...p,
          navLocation: Array.isArray(p.navLocation)
            ? p.navLocation
            : p.navLocation === "none" || !p.navLocation ? [] : [p.navLocation],
        })) as any);
        if (Array.isArray(s.home_sections)) setHomeSections(s.home_sections as any);
        if (Array.isArray(s.section_groups) && (s.section_groups as any[]).length) setSectionGroups(s.section_groups as any);
        if (s.page_location && Object.keys(s.page_location).length) setPageLocationState({ ...defaultPageLocation, ...(s.page_location as any) });
        if (s.home_membership && Object.keys(s.home_membership).length) setHomeMembershipState({ ...defaultHomeMembership, ...(s.home_membership as any) });
      }
      if (postsRes.data) setPosts(postsRes.data.map(fromDbPost));
      if (leadsRes.data) setLeads(leadsRes.data.map(fromDbLead));
      if (visitsRes.data) {
        setVisits(visitsRes.data.length);
        // group by day for last 14 days
        const buckets: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
          buckets[d] = 0;
        }
        visitsRes.data.forEach((v: any) => {
          const d = new Date(v.created_at).toISOString().slice(0, 10);
          if (d in buckets) buckets[d]++;
        });
        setVisitSeries(Object.entries(buckets).map(([day, visits]) => ({ day: day.slice(5), visits })));
      }

      setLoading(false);
      // Allow the persist effect to fire on subsequent edits
      setTimeout(() => { hydrated.current = true; }, 0);
    })();
    return () => { alive = false; };
  }, []);

  // ---------------------------------------------------------------
  // Persist site_settings on any change (debounced)
  // ---------------------------------------------------------------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from("site_settings").update({
        content: content as any,
        contact: contact as any,
        portfolio: portfolio as any,
        seo: seo as any,
        appearance: appearance as any,
        custom_pages: customPages as any,
        home_sections: homeSections as any,
        section_groups: sectionGroups as any,
        page_location: pageLocation as any,
        home_membership: homeMembership as any,
        updated_at: new Date().toISOString(),
      }).eq("id", 1).then(({ error }) => {
        if (error) console.error("[site_settings] save failed", error);
      });
    }, 500);
  }, [content, contact, portfolio, seo, appearance, customPages, homeSections, sectionGroups, pageLocation, homeMembership]);

  // ---------------------------------------------------------------
  // Live document.head effects (unchanged)
  // ---------------------------------------------------------------
  useEffect(() => {
    document.title = seo.metaTitle;
    const setMeta = (selector: string, attr: string, name: string, contentVal: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentVal);
    };
    setMeta('meta[name="description"]', "name", "description", seo.metaDescription);
    setMeta('meta[name="keywords"]', "name", "keywords", seo.metaKeywords);
    setMeta('meta[property="og:title"]', "property", "og:title", seo.metaTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", seo.metaDescription);
    setMeta('meta[property="og:image"]', "property", "og:image", seo.ogImage);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.metaTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.metaDescription);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", seo.ogImage);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", seo.canonicalUrl);
  }, [seo]);

  useEffect(() => {
    const ID = "anirise-jsonld";
    document.querySelectorAll(`script[data-anirise="${ID}"]`).forEach((el) => el.remove());
    seo.schemas.filter((s) => s.enabled).forEach((s) => {
      try {
        const body = JSON.parse(s.json);
        const payload = { "@context": "https://schema.org", "@type": s.type, ...body };
        const tag = document.createElement("script");
        tag.type = "application/ld+json";
        tag.dataset.anirise = ID;
        tag.text = JSON.stringify(payload);
        document.head.appendChild(tag);
      } catch { /* ignore */ }
    });
  }, [seo.schemas]);

  useEffect(() => {
    const apply = () => {
      const path = window.location.pathname + window.location.search;
      const match = seo.redirects.find((r) => r.enabled && (r.from === path || r.from === window.location.pathname));
      if (match && match.to && match.to !== path) {
        if (/^https?:\/\//i.test(match.to)) window.location.replace(match.to);
        else { window.history.replaceState({}, "", match.to); window.dispatchEvent(new PopStateEvent("popstate")); }
      }
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [seo.redirects]);

  useEffect(() => {
    const families = Array.from(new Set([appearance.headingFont, appearance.bodyFont]));
    const id = "anirise-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const param = families.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`).join("&");
    link.href = `https://fonts.googleapis.com/css2?${param}&display=swap`;
    const root = document.documentElement;
    root.style.setProperty("--font-heading", `'${appearance.headingFont}', sans-serif`);
    root.style.setProperty("--font-body", `'${appearance.bodyFont}', sans-serif`);
    root.style.fontSize = `${appearance.baseFontSize}px`;
    document.body.style.fontFamily = `var(--font-body)`;
  }, [appearance]);

  // ---------------------------------------------------------------
  // Auth (simple gate, unchanged)
  // ---------------------------------------------------------------
  const login = (pw: string) => { if (pw === "1122") { setIsAuthed(true); return true; } return false; };
  const logout = () => setIsAuthed(false);

  // ---------------------------------------------------------------
  // Blog (DB-backed)
  // ---------------------------------------------------------------
  const addPost = async (p: Omit<BlogPost, "id">) => {
    const { data, error } = await supabase.from("blog_posts").insert(toDbPost(p)).select().single();
    if (error || !data) return console.error(error);
    setPosts((prev) => [fromDbPost(data), ...prev]);
  };
  const updatePost = async (id: string, p: Partial<BlogPost>) => {
    const { data, error } = await supabase.from("blog_posts").update(toDbPost(p)).eq("id", id).select().single();
    if (error || !data) return console.error(error);
    setPosts((prev) => prev.map((x) => (x.id === id ? fromDbPost(data) : x)));
  };
  const deletePost = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return console.error(error);
    setPosts((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------------------------------------------------------------
  // Leads (DB-backed)
  // ---------------------------------------------------------------
  const addLead = async (l: Omit<Lead, "id" | "createdAt">) => {
    const { data, error } = await supabase.from("leads").insert(l).select().single();
    if (error || !data) { console.error(error); return; }
    setLeads((prev) => [fromDbLead(data), ...prev]);
  };
  const deleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return console.error(error);
    setLeads((prev) => prev.filter((x) => x.id !== id));
  };
  const clearLeads = async () => {
    const { error } = await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return console.error(error);
    setLeads([]);
  };
  const pruneOldLeads = async (): Promise<number> => {
    const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
    const { data, error } = await supabase.from("leads").delete().lt("created_at", cutoff).select("id");
    if (error) { console.error(error); return 0; }
    const removed = data?.length ?? 0;
    if (removed) {
      const cutoffMs = Date.now() - 90 * 86400000;
      setLeads((prev) => prev.filter((l) => l.createdAt >= cutoffMs));
    }
    return removed;
  };

  // ---------------------------------------------------------------
  // Local-state mutators (persisted via the site_settings effect)
  // ---------------------------------------------------------------
  const updateContent = (c: Partial<SiteContent>) => setContent((prev) => ({ ...prev, ...c }));
  const updateContact = (c: Partial<ContactInfo>) => setContact((prev) => ({ ...prev, ...c }));
  const addPortfolioItem = (p: Omit<PortfolioItem, "id">) => setPortfolio((prev) => [...prev, { ...p, id: Date.now().toString() }]);
  const updatePortfolioItem = (id: string, p: Partial<PortfolioItem>) => setPortfolio((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deletePortfolioItem = (id: string) => setPortfolio((prev) => prev.filter((x) => x.id !== id));
  const updateSeo = (s: Partial<SeoSettings>) => setSeo((prev) => ({ ...prev, ...s }));
  const addRedirect = (r: Omit<Redirect, "id">) => setSeo((prev) => ({ ...prev, redirects: [...prev.redirects, { ...r, id: Date.now().toString() }] }));
  const updateRedirect = (id: string, r: Partial<Redirect>) => setSeo((prev) => ({ ...prev, redirects: prev.redirects.map((x) => (x.id === id ? { ...x, ...r } : x)) }));
  const deleteRedirect = (id: string) => setSeo((prev) => ({ ...prev, redirects: prev.redirects.filter((x) => x.id !== id) }));
  const addSchema = (s: Omit<SchemaItem, "id">) => setSeo((prev) => ({ ...prev, schemas: [...prev.schemas, { ...s, id: Date.now().toString() }] }));
  const updateSchema = (id: string, s: Partial<SchemaItem>) => setSeo((prev) => ({ ...prev, schemas: prev.schemas.map((x) => (x.id === id ? { ...x, ...s } : x)) }));
  const deleteSchema = (id: string) => setSeo((prev) => ({ ...prev, schemas: prev.schemas.filter((x) => x.id !== id) }));
  const addCustomPage = (p: Omit<CustomPage, "id">) => setCustomPages((prev) => [...prev, { ...p, id: Date.now().toString() }]);
  const updateCustomPage = (id: string, p: Partial<CustomPage>) => setCustomPages((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deleteCustomPage = (id: string) => setCustomPages((prev) => prev.filter((x) => x.id !== id));
  const addHomeSection = (s: Omit<HomeSection, "id">) => setHomeSections((prev) => [...prev, { ...s, id: Date.now().toString() }]);
  const updateHomeSection = (id: string, s: Partial<HomeSection>) => setHomeSections((prev) => prev.map((x) => (x.id === id ? { ...x, ...s } : x)));
  const deleteHomeSection = (id: string) => setHomeSections((prev) => prev.filter((x) => x.id !== id));
  const setHomeMembership = (k: SectionKey, v: boolean) => {
    setHomeMembershipState((prev) => ({ ...prev, [k]: v }));
    setPageLocationState((prev) => ({ ...prev, [k]: v ? "home" : "" }));
  };
  const setPageLocation = (pageKey: string, groupKey: string) => {
    setPageLocationState((prev) => ({ ...prev, [pageKey]: groupKey }));
    if ((SECTION_KEYS as string[]).includes(pageKey)) {
      setHomeMembershipState((prev) => ({ ...prev, [pageKey as SectionKey]: groupKey === "home" }));
    }
  };
  const addSectionGroup = (label: string) => {
    const id = `g-${Date.now()}`;
    const key = `grp-${Date.now().toString(36)}`;
    setSectionGroups((prev) => [...prev, { id, key, label, isHome: false }]);
    return key;
  };
  const updateSectionGroup = (id: string, s: Partial<SectionGroup>) =>
    setSectionGroups((prev) => prev.map((x) => (x.id === id ? { ...x, ...s, isHome: x.isHome } : x)));
  const deleteSectionGroup = (id: string) => {
    const grp = sectionGroups.find((g) => g.id === id);
    if (!grp || grp.isHome) return;
    setSectionGroups((prev) => prev.filter((x) => x.id !== id));
    setPageLocationState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (next[k] === grp.key) next[k] = ""; });
      return next;
    });
    setCustomPages((prev) => prev.map((p) => (p.groupKey === grp.key ? { ...p, groupKey: "" } : p)));
    setHomeSections((prev) => prev.map((p) => (p.groupKey === grp.key ? { ...p, groupKey: "home" } : p)));
  };
  const updatePageSeo = (key: string, s: Partial<PageSeo>) =>
    setSeo((prev) => ({
      ...prev,
      pageSeo: { ...prev.pageSeo, [key]: { ...(prev.pageSeo[key] || { metaTitle: "", metaDescription: "", metaKeywords: "" }), ...s } },
    }));
  const updateAppearance = (a: Partial<Appearance>) => setAppearance((prev) => ({ ...prev, ...a }));

  const buildSitemap = (base: string, slugs: string[], customSlugs: string[]) => {
    const staticPaths = ["/", "/services", "/about", "/portfolio", "/testimonials", "/contact", "/blog", "/services/website-seo", "/services/ecommerce-seo", "/services/graphics-design"];
    const blogPaths = slugs.map((s) => `/blog/${s}`);
    const customPaths = customSlugs.map((s) => `/${s}`);
    const all = [...staticPaths, ...blogPaths, ...customPaths];
    const urls = all.map((p) => `  <url><loc>${base.replace(/\/$/, "")}${p}</loc><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  };
  const regenerateSitemap = () => setSeo((prev) => ({ ...prev, sitemap: buildSitemap(prev.canonicalUrl, posts.map((p) => p.slug), customPages.filter((p) => p.published).map((p) => p.slug)) }));

  useEffect(() => {
    if (!seo.autoSitemap) return;
    setSeo((prev) => ({ ...prev, sitemap: buildSitemap(prev.canonicalUrl, posts.map((p) => p.slug), customPages.filter((p) => p.published).map((p) => p.slug)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, customPages, seo.autoSitemap, seo.canonicalUrl]);

  return (
    <Ctx.Provider
      value={{
        isAuthed, login, logout, loading,
        posts, addPost, updatePost, deletePost,
        content, updateContent,
        contact, updateContact,
        portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
        seo, updateSeo, regenerateSitemap,
        addRedirect, updateRedirect, deleteRedirect,
        addSchema, updateSchema, deleteSchema,
        customPages, addCustomPage, updateCustomPage, deleteCustomPage,
        homeSections, addHomeSection, updateHomeSection, deleteHomeSection,
        homeMembership, setHomeMembership,
        pageLocation, setPageLocation,
        sectionGroups, addSectionGroup, updateSectionGroup, deleteSectionGroup,
        updatePageSeo,
        appearance, updateAppearance,
        fontChoices: FONT_CHOICES,
        visits, visitSeries,
        leads, addLead, deleteLead, clearLeads, pruneOldLeads,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAdmin = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used inside AdminProvider");
  return c;
};
