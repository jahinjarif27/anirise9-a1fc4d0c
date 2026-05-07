import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BlogPost, initialPosts } from "@/data/blog";
import heroImg from "@/assets/hero-illustration.jpg";
import logoImg from "@/assets/anirise-logo.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";

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
  whatsapp: string; // digits only, intl, e.g. 8801337744727
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
    | "Organization"
    | "LocalBusiness"
    | "WebSite"
    | "WebPage"
    | "Article"
    | "BlogPosting"
    | "BreadcrumbList"
    | "Product"
    | "Service"
    | "FAQPage"
    | "Person"
    | "Event";
  enabled: boolean;
  json: string; // raw JSON-LD body (without @context/@type wrapper — we add)
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
  slug: string; // e.g. "about-us" or "company/team"
  parent: string; // parent slug, "" = root
  navLocation: "navbar" | "menu" | "none";
  image: string;
  imageAlt: string;
  body: string;
  seo: PageSeo;
  published: boolean;
  groupKey?: string; // optional — section group this page is grouped under in admin / nav. "" = standalone route
};

export type HomeSection = {
  id: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  enabled: boolean;
  groupKey?: string; // which section group this custom section lives in (defaults to 'home')
};

export type SectionGroup = {
  id: string;
  key: string; // unique stable key, used in pageLocation values
  label: string;
  isHome: boolean; // true for the built-in Home group (cannot be deleted)
};

type SeoSettings = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  canonicalAuto: boolean;
  canonicalPerPage: Record<string, string>; // path -> override URL
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
  baseFontSize: number; // px
};

export type SectionKey = "hero" | "services" | "about" | "portfolio" | "blog" | "testimonials" | "contact";
export const SECTION_KEYS: SectionKey[] = ["hero", "services", "about", "portfolio", "blog", "testimonials", "contact"];

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
  ogImage: "/favicon.jpg", // always the site logo / favicon
  canonicalUrl: "https://anirise9.vercel.app",
  canonicalAuto: true,
  canonicalPerPage: {},
  sitemap: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://anirise9.vercel.app/</loc><priority>1.0</priority></url>
  <url><loc>https://anirise9.vercel.app/blog</loc><priority>0.8</priority></url>
  <url><loc>https://anirise9.vercel.app/services/website-seo</loc><priority>0.8</priority></url>
  <url><loc>https://anirise9.vercel.app/services/ecommerce-seo</loc><priority>0.8</priority></url>
  <url><loc>https://anirise9.vercel.app/services/graphics-design</loc><priority>0.8</priority></url>
</urlset>`,
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://anirise9.vercel.app/sitemap.xml`,
  autoSitemap: true,
  redirects: [
    { id: "r1", from: "/old-blog", to: "/blog", code: 301, enabled: true },
    { id: "r2", from: "/services", to: "/#services", code: 301, enabled: true },
  ],
  schemas: [
    {
      id: "s1",
      type: "Organization",
      enabled: true,
      name: "AniRise — Organization",
      json: JSON.stringify({
        name: "AniRise",
        url: "https://anirise9.vercel.app",
        logo: "https://anirise9.vercel.app/favicon.jpg",
        sameAs: ["https://www.facebook.com/anirisebd"],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+8801337744727",
          contactType: "customer service",
          areaServed: "Worldwide",
        },
      }, null, 2),
    },
    {
      id: "s2",
      type: "WebSite",
      enabled: true,
      name: "AniRise — WebSite",
      json: JSON.stringify({
        name: "AniRise",
        url: "https://anirise9.vercel.app",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://anirise9.vercel.app/blog?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }, null, 2),
    },
  ],
  pageSeo: {
    home: {
      metaTitle: "AniRise — Visibility · Growth · Success",
      metaDescription: "AniRise helps brands rise online with SEO, web development, and digital marketing.",
      metaKeywords: "SEO, web, marketing, AniRise",
    },
    about: { metaTitle: "About AniRise", metaDescription: "Our story and mission.", metaKeywords: "about, AniRise" },
    services: { metaTitle: "Services — AniRise", metaDescription: "SEO, Web, Ads, Design.", metaKeywords: "services" },
    portfolio: { metaTitle: "Portfolio — AniRise", metaDescription: "Recent work.", metaKeywords: "portfolio" },
    blog: { metaTitle: "Blog — AniRise", metaDescription: "Insights from the AniRise team.", metaKeywords: "blog" },
    testimonials: { metaTitle: "Testimonials — AniRise", metaDescription: "What clients say.", metaKeywords: "testimonials" },
    contact: { metaTitle: "Contact AniRise", metaDescription: "Let's make your brand rise.", metaKeywords: "contact" },
  },
};

const FONT_CHOICES = [
  "Inter",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Nunito",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "DM Sans",
  "Work Sans",
] as const;

const defaultAppearance: Appearance = {
  headingFont: "Poppins",
  bodyFont: "Inter",
  baseFontSize: 16,
};

type AdminCtx = {
  isAuthed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
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
  pageLocation: Record<string, string>; // pageKey -> groupKey ("" = standalone route)
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
};

const Ctx = createContext<AdminCtx | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeo);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [homeMembership, setHomeMembershipState] = useState<Record<SectionKey, boolean>>({
    hero: true, services: true, about: true, portfolio: true, blog: true, testimonials: true, contact: true,
  });
  const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>([
    { id: "g-home", key: "home", label: "Home", isHome: true },
    { id: "g-services", key: "services-group", label: "Services", isHome: false },
  ]);
  const [pageLocation, setPageLocationState] = useState<Record<string, string>>({
    hero: "home", services: "home", about: "home", portfolio: "home",
    blog: "home", testimonials: "home", contact: "home",
  });
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    // mock visit counter — increments on mount
    const base = 1240 + Math.floor(Math.random() * 60);
    setVisits(base);
  }, []);

  // Apply SEO settings live to the document head
  useEffect(() => {
    document.title = seo.metaTitle;
    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
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

  // Inject JSON-LD schemas into <head>
  useEffect(() => {
    const ID = "anirise-jsonld";
    document.querySelectorAll(`script[data-anirise="${ID}"]`).forEach((el) => el.remove());
    seo.schemas
      .filter((s) => s.enabled)
      .forEach((s) => {
        try {
          const body = JSON.parse(s.json);
          const payload = { "@context": "https://schema.org", "@type": s.type, ...body };
          const tag = document.createElement("script");
          tag.type = "application/ld+json";
          tag.dataset.anirise = ID;
          tag.text = JSON.stringify(payload);
          document.head.appendChild(tag);
        } catch {
          // invalid JSON — skip silently in preview
        }
      });
  }, [seo.schemas]);

  // Client-side 301 redirect engine
  useEffect(() => {
    const apply = () => {
      const path = window.location.pathname + window.location.search;
      const match = seo.redirects.find((r) => r.enabled && (r.from === path || r.from === window.location.pathname));
      if (match && match.to && match.to !== path) {
        if (/^https?:\/\//i.test(match.to)) {
          window.location.replace(match.to);
        } else {
          window.history.replaceState({}, "", match.to);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      }
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [seo.redirects]);

  // Apply appearance (fonts) live
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
    const param = families
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`)
      .join("&");
    link.href = `https://fonts.googleapis.com/css2?${param}&display=swap`;

    const root = document.documentElement;
    root.style.setProperty("--font-heading", `'${appearance.headingFont}', sans-serif`);
    root.style.setProperty("--font-body", `'${appearance.bodyFont}', sans-serif`);
    root.style.fontSize = `${appearance.baseFontSize}px`;
    document.body.style.fontFamily = `var(--font-body)`;
  }, [appearance]);

  const login = (pw: string) => {
    if (pw === "1122") {
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthed(false);

  const addPost = (p: Omit<BlogPost, "id">) =>
    setPosts((prev) => [{ ...p, id: Date.now().toString() }, ...prev]);
  const updatePost = (id: string, p: Partial<BlogPost>) =>
    setPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deletePost = (id: string) => setPosts((prev) => prev.filter((x) => x.id !== id));
  const updateContent = (c: Partial<SiteContent>) => setContent((prev) => ({ ...prev, ...c }));

  const updateSeo = (s: Partial<SeoSettings>) => setSeo((prev) => ({ ...prev, ...s }));
  const addRedirect = (r: Omit<Redirect, "id">) =>
    setSeo((prev) => ({ ...prev, redirects: [...prev.redirects, { ...r, id: Date.now().toString() }] }));
  const updateRedirect = (id: string, r: Partial<Redirect>) =>
    setSeo((prev) => ({ ...prev, redirects: prev.redirects.map((x) => (x.id === id ? { ...x, ...r } : x)) }));
  const deleteRedirect = (id: string) =>
    setSeo((prev) => ({ ...prev, redirects: prev.redirects.filter((x) => x.id !== id) }));
  const addSchema = (s: Omit<SchemaItem, "id">) =>
    setSeo((prev) => ({ ...prev, schemas: [...prev.schemas, { ...s, id: Date.now().toString() }] }));
  const updateSchema = (id: string, s: Partial<SchemaItem>) =>
    setSeo((prev) => ({ ...prev, schemas: prev.schemas.map((x) => (x.id === id ? { ...x, ...s } : x)) }));
  const deleteSchema = (id: string) =>
    setSeo((prev) => ({ ...prev, schemas: prev.schemas.filter((x) => x.id !== id) }));
  const addCustomPage = (p: Omit<CustomPage, "id">) =>
    setCustomPages((prev) => [...prev, { ...p, id: Date.now().toString() }]);
  const updateCustomPage = (id: string, p: Partial<CustomPage>) =>
    setCustomPages((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deleteCustomPage = (id: string) =>
    setCustomPages((prev) => prev.filter((x) => x.id !== id));
  const addHomeSection = (s: Omit<HomeSection, "id">) =>
    setHomeSections((prev) => [...prev, { ...s, id: Date.now().toString() }]);
  const updateHomeSection = (id: string, s: Partial<HomeSection>) =>
    setHomeSections((prev) => prev.map((x) => (x.id === id ? { ...x, ...s } : x)));
  const deleteHomeSection = (id: string) =>
    setHomeSections((prev) => prev.filter((x) => x.id !== id));
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
      pageSeo: {
        ...prev.pageSeo,
        [key]: { ...(prev.pageSeo[key] || { metaTitle: "", metaDescription: "", metaKeywords: "" }), ...s },
      },
    }));
  const updateContact = (c: Partial<ContactInfo>) => setContact((prev) => ({ ...prev, ...c }));
  const addPortfolioItem = (p: Omit<PortfolioItem, "id">) =>
    setPortfolio((prev) => [...prev, { ...p, id: Date.now().toString() }]);
  const updatePortfolioItem = (id: string, p: Partial<PortfolioItem>) =>
    setPortfolio((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deletePortfolioItem = (id: string) =>
    setPortfolio((prev) => prev.filter((x) => x.id !== id));
  const updateAppearance = (a: Partial<Appearance>) => setAppearance((prev) => ({ ...prev, ...a }));

  const buildSitemap = (base: string, slugs: string[]) => {
    const staticPaths = ["/", "/blog", "/services/website-seo", "/services/ecommerce-seo", "/services/graphics-design"];
    const blogPaths = slugs.map((s) => `/blog/${s}`);
    const all = [...staticPaths, ...blogPaths];
    const urls = all
      .map((p) => `  <url><loc>${base.replace(/\/$/, "")}${p}</loc><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`)
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  };

  const regenerateSitemap = () => {
    setSeo((prev) => ({
      ...prev,
      sitemap: buildSitemap(prev.canonicalUrl, posts.map((p) => p.slug)),
    }));
  };

  // Auto-regenerate sitemap when posts change (if autoSitemap on)
  useEffect(() => {
    if (!seo.autoSitemap) return;
    setSeo((prev) => ({
      ...prev,
      sitemap: buildSitemap(prev.canonicalUrl, posts.map((p) => p.slug)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, seo.autoSitemap, seo.canonicalUrl]);

  return (
    <Ctx.Provider
      value={{
        isAuthed,
        login,
        logout,
        posts,
        addPost,
        updatePost,
        deletePost,
        content,
        updateContent,
        contact,
        updateContact,
        portfolio,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        seo,
        updateSeo,
        regenerateSitemap,
        addRedirect,
        updateRedirect,
        deleteRedirect,
        addSchema,
        updateSchema,
        deleteSchema,
        customPages,
        addCustomPage,
        updateCustomPage,
        deleteCustomPage,
        homeSections,
        addHomeSection,
        updateHomeSection,
        deleteHomeSection,
        homeMembership,
        setHomeMembership,
        pageLocation,
        setPageLocation,
        sectionGroups,
        addSectionGroup,
        updateSectionGroup,
        deleteSectionGroup,
        updatePageSeo,
        appearance,
        updateAppearance,
        fontChoices: FONT_CHOICES,
        visits,
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
