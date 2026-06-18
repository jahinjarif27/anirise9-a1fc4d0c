import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { BlogPost } from "@/data/blog";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-illustration.jpg";
import logoImg from "@/assets/anirise-logo.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { defaultServiceContent, ServiceContent } from "@/data/serviceContentDefaults";
import { defaultServicePreviews } from "@/data/servicePreviewDefaults";
export type { ServiceContent } from "@/data/serviceContentDefaults";

// ------------------------------------------------------------
// Stale bundler-asset URL repair
// ------------------------------------------------------------
// Older site_settings rows may contain hashed Vite asset URLs like
// "/assets/hero-illustration-jyDNbWvQ.jpg" that 404 after every rebuild
// because the hash changes. Map known prefixes back to the current
// bundled import so persisted data keeps rendering.
const STALE_ASSET_MAP: Record<string, string> = {
  "hero-illustration": heroImg,
  "anirise-logo": logoImg,
  "portfolio-1": portfolio1,
  "portfolio-2": portfolio2,
  "portfolio-3": portfolio3,
};
const STALE_ASSET_RE = /^\/assets\/(.+)-[A-Za-z0-9_-]{6,}\.(?:jpg|jpeg|png|webp|svg|gif)$/i;
const repairAssetUrl = (s: string): string => {
  const m = STALE_ASSET_RE.exec(s);
  if (!m) return s;
  return STALE_ASSET_MAP[m[1]] ?? s;
};
const sanitizeStaleAssets = <T,>(value: T): T => {
  if (typeof value === "string") return repairAssetUrl(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeStaleAssets(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value as any)) out[k] = sanitizeStaleAssets((value as any)[k]);
    return out;
  }
  return value;
};



// ============================================================
// Types (exported API unchanged so existing UI keeps working)
// ============================================================

type SiteContent = {
  heroEyebrow: string;
  heroHeadline: string;
  heroTagline: string;
  heroImage: string;
  heroImageAlt: string;
  heroVideoUrl?: string;
  heroVideoEnabled?: boolean;
  heroVideoTitle?: string;
  heroVideoDescription?: string;
  heroVideoThumbnail?: string;
  heroVideoUploadDate?: string;
  heroVideoDuration?: string;
  servicesTitle: string;
  servicesBlurb: string;
  servicesImage: string;
  servicesImageAlt: string;
  /** Home → Services preview layout. "marquee" = original auto-scroll carousel, "grid" = clean 3×2 grid with dividers, "split" = list with centered icons (image-2 style). */
  servicesLayout?: "marquee" | "grid" | "split";
  aboutHeadline: string;
  aboutBlurb: string;
  aboutImage: string;
  aboutImageAlt: string;
  aboutEyebrow?: string;
  aboutStatValue?: string;
  aboutStatLabel?: string;
  aboutPillars?: { title: string; desc: string }[];
  /** "Our Story" section on the About page. Body supports markdown links: [text](url). */
  aboutStoryTitle?: string;
  aboutStoryEyebrow?: string;
  aboutStoryBody?: string;
  aboutStoryImage?: string;
  aboutStoryImageAlt?: string;
  /** "Our Team" section on the About page. */
  aboutTeamTitle?: string;
  aboutTeamEyebrow?: string;
  aboutTeamBlurb?: string;
  aboutTeam?: { id: string; name: string; role: string; image: string; bio: string }[];
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
  /** Navbar top bar — small label + value chip (e.g. "Revenue Driven for our clients" / "$10,000+"). Editable from Home → Trust strip. */
  topBarLabel?: string;
  topBarValue?: string;
  /** Footer — admin-editable from Pages → Footer. */
  footerLogo?: string;
  footerBrandName?: string;
  footerTagline?: string;
  footerCtaLabel?: string;
  footerCtaHref?: string;
  footerPagesHeading?: string;
  footerServicesHeading?: string;
  footerConnectHeading?: string;
  footerCopyright?: string;
  footerByline?: string;
  /** Admin-managed footer link lists. When non-empty, replace the auto-generated lists. */
  footerPagesItems?: { id: string; label: string; href: string }[];
  footerServicesItems?: { id: string; label: string; href: string }[];
  /** Admin-managed services list (replaces hardcoded src/data/services.ts) */
  servicesList?: AdminService[];
  /** Phase 4 — drag-and-drop home page block order. Unknown ids fall back to default. */
  homeOrder?: string[];
  /** Per-section admin paragraph notes (heading + text + alignment), keyed by section id. */
  sectionNotes?: Record<string, SectionNote>;
};

export type SectionNote = { heading?: string; subheading?: string; text?: string; align?: TextAlign };

// Phase 3 — multi-paragraph blocks (re-exported for consumers)
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextBlock = { id: string; text: string; align?: TextAlign };

// Phase 4 — canonical default home block order. Built-in IDs only.
export const DEFAULT_HOME_ORDER = [
  "hero",
  "trustStrip",
  "stats",
  "servicesPreview",
  "about",
  "caseStudies",
  "processFlow",
  "whyChoose",
  "strategyCall",
  "homeFaq",
  "blog",
  "finalCta",
] as const;
export type HomeBlockId = typeof DEFAULT_HOME_ORDER[number];

export type AdminService = {
  id: string;
  /** Internal identity slug — used as key for serviceContent, faqs, etc. NEVER changes after creation. */
  slug: string;
  /** Optional public-URL trailing slug. When set, page lives at /services/{urlSlug}. Default = identity slug. */
  urlSlug?: string;
  title: string;
  desc: string;
  /** Lucide icon name, e.g. "Search". Rendered via lucide-react Icons map. */
  iconName: string;
  published: boolean;
  order: number;
};

/** Curated lucide-react icon names admin can pick from. */
export const SERVICE_ICON_CHOICES = [
  "Search", "ShoppingCart", "Code2", "Megaphone", "PenTool", "Smartphone",
  "Globe", "Rocket", "TrendingUp", "BarChart3", "Mail", "Camera",
  "Video", "Palette", "Settings", "Zap", "Award", "Target",
  "Layout", "Layers", "Briefcase", "MessageSquare", "Star", "Sparkles",
];

type ContactInfo = {
  whatsapp: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  facebook: string;
  instagram: string;
  address: string;
};

export type ProjectStat = { id: string; label: string; value: string };
export type ProjectTable = { title?: string; headers: string[]; rows: string[][] };
export type ProjectChartPoint = { id: string; label: string; value: number };
export type ProjectChart = { title?: string; type: "area" | "bar"; data: ProjectChartPoint[] };
export type GalleryImage = { id: string; image: string; alt: string };

export const PROJECT_CATEGORIES = [
  "Website SEO",
  "Ecommerce SEO",
  "Website Development",
  "Social Media Marketing",
  "Graphics Design",
  "Digital Marketing",
] as const;
export type ProjectCategory = typeof PROJECT_CATEGORIES[number];

export type PortfolioItem = {
  id: string;
  /** Vanity URL slug. When set, /portfolio/{slug} resolves; /portfolio/{id} still works. */
  slug?: string;
  image: string;
  imageAlt: string;
  tag: string;
  category?: string;
  title: string;
  description?: string;
  body?: string;
  /** Display order on the Projects page. Lower numbers render first. */
  order?: number;
  // rich detail-page fields (all optional)
  eyebrow?: string;
  intro?: string;
  client?: string;
  role?: string;
  timeline?: string;
  liveUrl?: string;
  overview?: string;
  approach?: string;
  outcome?: string;
  techStack?: string[];
  deliverables?: string[];
  metrics?: ProjectStat[];
  gallery?: GalleryImage[];
  table?: ProjectTable;
  chart?: ProjectChart;
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

export type PageStatus = "published" | "draft";
export type PageRobots = "index" | "noindex";

export type PageSeo = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  // Phase 1 extensions — all optional, backward compatible with existing rows.
  /** Public URL slug override. Empty / undefined = use default. */
  slug?: string;
  /** Draft pages 404 on public site, are hidden from nav/footer, excluded from sitemap. */
  status?: PageStatus;
  /** Full canonical URL override. When empty, hook builds from path. */
  canonicalUrl?: string;
  canonicalAuto?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  /** OG image URL (absolute or root-relative). */
  ogImage?: string;
  /** Robots meta value — "index" / "noindex". */
  robots?: PageRobots;
  /** Per-page JSON-LD schema blocks. */
  schemas?: SchemaItem[];
  /** Sitemap hints */
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
};

export type CustomPageSection = { id: string; title: string; body: string; textBlocks?: TextBlock[] };

export type CustomPage = {
  id: string;
  title: string;
  slug: string;
  parent: string;
  navLocation: ("navbar" | "menu")[];
  image: string;
  imageAlt: string;
  body: string;
  /** Phase 3 — multi-paragraph + alignment. When non-empty, replaces `body` on render. */
  textBlocks?: TextBlock[];
  seo: PageSeo;
  published: boolean;
  groupKey?: string;
  eyebrow?: string;
  intro?: string;
  sections?: CustomPageSection[];
  metrics?: ProjectStat[];
  deliverables?: string[];
  table?: ProjectTable;
  chart?: ProjectChart;
  gallery?: GalleryImage[];
  ctaLabel?: string;
  ctaUrl?: string;
};

export type HomeSection = {
  id: string;
  title: string;
  body: string;
  /** Phase 3 — multi-paragraph + alignment alternative to `body`. */
  textBlocks?: TextBlock[];
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

export type Review = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  approved: boolean;
  createdAt: number;
};

export type SectionKey = "hero" | "services" | "about" | "portfolio" | "blog" | "testimonials" | "contact";
export const SECTION_KEYS: SectionKey[] = ["hero", "services", "about", "portfolio", "blog", "testimonials", "contact"];

// ============= Home builder structured data =============
export type FaqItem = { id: string; question: string; answer: string };
export type StatItem = { id: string; value: string; label: string };
export type TrustLogo = { id: string; name: string; image: string };
export type CaseStudyStat = { id: string; label: string; value: string };
export type CaseStudyTable = { title?: string; headers: string[]; rows: string[][] };
export type CaseStudyChartPoint = { id: string; label: string; value: number };
export type CaseStudyChart = { title?: string; type: "bar" | "line"; data: CaseStudyChartPoint[] };
export type CaseStudy = {
  id: string;
  title: string;
  metric: string;
  description: string;
  image: string;
  link: string;
  imageAlt?: string;
  body?: string;
  // rich detail page fields (all optional)
  eyebrow?: string;
  intro?: string;
  client?: string;
  industry?: string;
  duration?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  stats?: CaseStudyStat[];
  table?: CaseStudyTable;
  chart?: CaseStudyChart;
};
export type ServicePreview = { image: string; imageAlt: string; title?: string; desc?: string };
export type FinalCta = {
  headline: string;
  subline: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
};
export type HomeBlockKey = "trustStrip" | "stats" | "servicesPreview" | "caseStudies" | "processFlow" | "homeFaq" | "finalCta";
export type HomeBlocks = Record<HomeBlockKey, boolean>;
export const HOME_BLOCK_KEYS: HomeBlockKey[] = ["trustStrip", "stats", "servicesPreview", "caseStudies", "processFlow", "homeFaq", "finalCta"];

export type ProcessFlowStep = { id: string; icon: string; title: string; chip: string };
export type ProcessFlow = {
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  blurb: string;
  steps: ProcessFlowStep[];
};

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
  heroVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  heroVideoEnabled: true,
  heroVideoTitle: "How AniRise Helps Your Brand Rise",
  heroVideoDescription: "A quick look at how AniRise drives visibility, growth, and success for modern brands.",
  heroVideoThumbnail: "",
  heroVideoUploadDate: "",
  heroVideoDuration: "",
  servicesTitle: "What We Do",
  servicesBlurb: "From visibility to growth — every service is built around helping your business succeed online.",
  servicesImage: "",
  servicesImageAlt: "",
  servicesLayout: "marquee",
  aboutHeadline: "Visibility · Growth · Success",
  aboutBlurb: "AniRise is a digital agency helping brands rise online with SEO, web development, and marketing.",
  aboutImage: logoImg,
  aboutImageAlt: "AniRise brand mark",
  aboutEyebrow: "About AniRise",
  aboutStatValue: "100%",
  aboutStatLabel: "Client Focused",
  aboutPillars: [
    { title: "Visibility", desc: "Get discovered by the right audience at the right moment." },
    { title: "Growth", desc: "Scale traffic, leads, and revenue with proven strategies." },
    { title: "Success", desc: "A clear roadmap toward measurable, lasting business success." },
  ],
  aboutStoryEyebrow: "Our Story",
  aboutStoryTitle: "Built to help brands rise — honestly.",
  aboutStoryBody: "AniRise started with a simple idea: small and growing brands deserve the same quality of digital growth work as the biggest names. We blend SEO, web development and design into one focused process — so every campaign drives visibility, every page converts, and every report makes sense.\n\nOver the last two years we've worked with 15+ brands across Bangladesh and beyond. If you want to talk strategy, [start a conversation](#contact) — we'll reply within 24 hours.",
  aboutStoryImage: "",
  aboutStoryImageAlt: "AniRise team at work",
  aboutTeamEyebrow: "Our Team",
  aboutTeamTitle: "The people behind your growth",
  aboutTeamBlurb: "A focused, senior team that owns your project end-to-end.",
  aboutTeam: [
    { id: "t1", name: "Anik Sarker", role: "Founder & SEO Lead", image: "", bio: "Leads SEO strategy and growth roadmaps for every AniRise client." },
    { id: "t2", name: "Web Team", role: "Design & Development", image: "", bio: "Builds fast, conversion-ready websites tied to your SEO plan." },
  ],
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
  topBarLabel: "Revenue Driven for our clients",
  topBarValue: "$10,000+",
  footerLogo: "",
  footerBrandName: "AniRise",
  footerTagline: "Visibility · Growth · Success. Helping brands rise online with SEO, web, and marketing.",
  footerCtaLabel: "Book A Strategy Call",
  footerCtaHref: "/strategy-call",
  footerPagesHeading: "Pages",
  footerServicesHeading: "Services",
  footerConnectHeading: "Connect",
  footerCopyright: "© {year} AniRise. All rights reserved.",
  footerByline: "Visibility — Growth — Success",
  footerPagesItems: [],
  footerServicesItems: [],
  servicesList: [
    { id: "svc-website-seo",          slug: "website-seo",          title: "Website SEO",           desc: "Rank higher on Google. We optimize your site's structure, content, and authority to drive organic traffic that converts.", iconName: "Search",       published: true, order: 1 },
    { id: "svc-ecommerce-seo",        slug: "ecommerce-seo",        title: "Ecommerce SEO",         desc: "Get your products in front of buyers. Product-page optimization, schema, and category strategy built to scale revenue.",       iconName: "ShoppingCart", published: true, order: 2 },
    { id: "svc-website-development",  slug: "website-development",  title: "Website Development",   desc: "Fast, modern, mobile-first websites engineered for performance, conversions, and a seamless brand experience.",               iconName: "Code2",        published: true, order: 3 },
    { id: "svc-social-media",         slug: "social-media-marketing", title: "Social Media Marketing", desc: "Grow your audience on Facebook & Instagram with content and ad campaigns that build community and drive sales.",               iconName: "Megaphone",    published: true, order: 4 },
    { id: "svc-graphics-design",      slug: "graphics-design",      title: "Graphics Design",       desc: "Eye-catching visuals, brand identity, and marketing creatives that make your brand instantly recognizable.",                       iconName: "PenTool",      published: true, order: 5 },
    { id: "svc-digital-marketing",    slug: "digital-marketing",    title: "Digital Marketing",     desc: "Full-funnel campaigns across search, social, and email — measured, optimized, and engineered for ROI.",                            iconName: "Smartphone",   published: true, order: 6 },
  ],
  sectionNotes: {
    servicesPreview: {
      heading: "Built for measurable growth",
      text: "Every service above is part of one connected growth engine — SEO, design, and marketing working together so your visibility, traffic, and revenue all rise in sync. Pick a single service or combine them into a full roadmap.",
      align: "center",
    },
  },
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
  {
    id: "p1",
    image: portfolio1,
    imageAlt: "Ecommerce SEO case study cover",
    tag: "Ecommerce SEO",
    category: "Ecommerce SEO",
    title: "Online Store Growth",
    description: "Shopify store er full SEO overhaul — product schema, faceted nav fix, ar conversion-focused copy diye revenue dramatic boost.",
    eyebrow: "Shopify · Fashion retail",
    intro: "Ekta mid-size Shopify fashion store-er jonno 6-mash er end-to-end SEO + CRO project — technical cleanup theke shuru kore product page rewrite ar internal linking, sob kichu pure data-driven.",
    client: "Aurelle Apparel",
    role: "Lead SEO & CRO partner",
    timeline: "Jan 2025 – Jun 2025",
    liveUrl: "",
    overview: "Store ti 20,000+ SKU niye chhilo kintu duplicate content, slow LCP ar broken faceted URLs er karone organic visibility prai flat chhilo. Goal chhilo 6 maser moddhe organic revenue minimum 2x kora.",
    approach: "Phase 1 — Technical audit, canonical fix, image CDN ar Core Web Vitals tuning.\nPhase 2 — Product/category copy rewrite with schema (Product, BreadcrumbList, FAQ).\nPhase 3 — Internal linking hubs + 24 ta buyer-intent blog post.\nPhase 4 — CRO: PDP redesign, sticky ATC, ar trust badges.",
    outcome: "Organic revenue 2.6x, transaction count 3.1x, ar avg LCP 4.8s theke 1.9s e neme esheche. Brand ekhon non-brand keyword e top-3 te 64 ta term er jonno rank kortese.",
    techStack: ["Shopify Plus", "Liquid", "Klaviyo", "GA4", "Search Console", "Ahrefs", "Screaming Frog"],
    deliverables: [
      "120-page technical SEO audit",
      "Product & category schema rollout",
      "24 buyer-intent blog posts",
      "PDP redesign + sticky ATC",
      "Monthly performance dashboard",
    ],
    metrics: [
      { id: "m1", label: "Organic revenue", value: "+162%" },
      { id: "m2", label: "Organic transactions", value: "3.1x" },
      { id: "m3", label: "LCP (mobile)", value: "4.8s → 1.9s" },
      { id: "m4", label: "Top-3 keywords", value: "8 → 64" },
    ],
    chart: {
      title: "Monthly organic revenue (USD)",
      type: "area",
      data: [
        { id: "c1", label: "Jan", value: 12400 },
        { id: "c2", label: "Feb", value: 15800 },
        { id: "c3", label: "Mar", value: 19200 },
        { id: "c4", label: "Apr", value: 24500 },
        { id: "c5", label: "May", value: 28700 },
        { id: "c6", label: "Jun", value: 32400 },
      ],
    },
    table: {
      title: "Core Web Vitals — before vs after",
      headers: ["Metric", "Before", "After", "Δ"],
      rows: [
        ["LCP (mobile)", "4.8s", "1.9s", "-60%"],
        ["CLS", "0.28", "0.04", "-86%"],
        ["INP", "420ms", "180ms", "-57%"],
        ["Indexed pages", "8,400", "14,200", "+69%"],
      ],
    },
    gallery: [
      { id: "g1", image: portfolio1, alt: "PDP redesign preview" },
      { id: "g2", image: portfolio2, alt: "Analytics dashboard" },
    ],
  },
  {
    id: "p2",
    image: portfolio2,
    imageAlt: "SEO analytics dashboard preview",
    tag: "Website SEO",
    category: "Website SEO",
    title: "Ranked Page #1 in 90 Days",
    description: "Competitive B2B SaaS keyword er jonno 90-din-er sprint — content cluster + digital PR diye position #1.",
    eyebrow: "B2B SaaS · 90-day sprint",
    intro: "Ekta project management SaaS-er flagship keyword (\"team workflow software\") page-9 theke page-1 e ana hoyeche — only 90 din e, paid push chhara.",
    client: "Lattice PM",
    role: "SEO strategist & content lead",
    timeline: "90 days",
    liveUrl: "",
    overview: "Target keyword er monthly search volume 18,000 chhilo kintu competition extremely high (KD 72). Strategy chhilo topical authority + earned backlinks er moddhe organic SERP dominance.",
    approach: "Week 1-2 — SERP gap analysis, intent mapping.\nWeek 3-6 — Pillar page rewrite (4,200 words) + 11 supporting cluster posts.\nWeek 7-10 — Digital PR outreach, 28 referring domains earned.\nWeek 11-13 — Internal link sculpting + featured snippet optimization.",
    outcome: "Target keyword position 87 → 1, featured snippet captured, ar 14 ta related keyword o top-10 e enter koreche. Organic signup 4.5x.",
    techStack: ["Webflow", "HubSpot", "Ahrefs", "Surfer SEO", "Pitchbox", "GA4"],
    deliverables: [
      "Pillar + 11 cluster pages",
      "28 earned backlinks",
      "Featured snippet capture",
      "Internal linking blueprint",
    ],
    metrics: [
      { id: "m1", label: "Target keyword", value: "#87 → #1" },
      { id: "m2", label: "Referring domains", value: "+28" },
      { id: "m3", label: "Organic signups", value: "4.5x" },
      { id: "m4", label: "DR increase", value: "41 → 56" },
    ],
    chart: {
      title: "Target keyword position (lower is better)",
      type: "area",
      data: [
        { id: "c1", label: "W2", value: 87 },
        { id: "c2", label: "W4", value: 62 },
        { id: "c3", label: "W6", value: 38 },
        { id: "c4", label: "W8", value: 19 },
        { id: "c5", label: "W10", value: 7 },
        { id: "c6", label: "W12", value: 2 },
        { id: "c7", label: "W13", value: 1 },
      ],
    },
    table: {
      title: "Cluster performance snapshot",
      headers: ["Page", "Sessions / mo", "Top position"],
      rows: [
        ["Pillar — team workflow software", "11,400", "1"],
        ["Cluster — kanban for remote teams", "3,200", "4"],
        ["Cluster — async standup tools", "2,100", "6"],
        ["Cluster — sprint planning guide", "1,850", "3"],
      ],
    },
    gallery: [{ id: "g1", image: portfolio2, alt: "Ranking dashboard snapshot" }],
  },
  {
    id: "p3",
    image: portfolio3,
    imageAlt: "Brand website redesign mockup",
    tag: "Website Development",
    category: "Website Development",
    title: "Brand Website Redesign",
    description: "Legacy WordPress site theke modern headless Next.js stack e migration — speed, conversion ar SEO all-in-one.",
    eyebrow: "Web · Headless rebuild",
    intro: "Ekta professional services firm-er 10-bochor purono WordPress site ke headless architecture e migrate kora hoyeche — design system, performance, ar conversion sob kichu ek shathe rebuild.",
    client: "Northwind Consulting",
    role: "Design + engineering lead",
    timeline: "10 weeks",
    liveUrl: "",
    overview: "Purono site er Lighthouse score 38 chhilo, mobile conversion 0.6%, ar editor ra content update korte CMS struggle korten. Goal — fast, modern, easy-to-edit, ar SEO retain.",
    approach: "Discovery — stakeholder interview + analytics audit.\nDesign — token-based design system in Figma.\nBuild — Next.js + Sanity CMS, ISR for speed.\nMigration — 301 map for 240 URLs, zero ranking loss.",
    outcome: "Lighthouse 38 → 98, mobile conversion 0.6% → 2.1%, ar editor publish time 25 min theke 4 min e neme esheche. Organic traffic relaunch er por o steady — kono drop nei.",
    techStack: ["Next.js 14", "Sanity CMS", "Tailwind", "Vercel", "Figma", "TypeScript"],
    deliverables: [
      "Figma design system",
      "Headless Next.js build",
      "Sanity CMS schema",
      "301 redirect map (240 URLs)",
      "Editor training docs",
    ],
    metrics: [
      { id: "m1", label: "Lighthouse score", value: "38 → 98" },
      { id: "m2", label: "Mobile conversion", value: "0.6% → 2.1%" },
      { id: "m3", label: "Publish time", value: "25m → 4m" },
      { id: "m4", label: "Organic traffic", value: "Held +6%" },
    ],
    chart: {
      title: "Lighthouse score across launch",
      type: "bar",
      data: [
        { id: "c1", label: "Old site", value: 38 },
        { id: "c2", label: "Beta", value: 72 },
        { id: "c3", label: "Launch", value: 94 },
        { id: "c4", label: "Post-tune", value: 98 },
      ],
    },
    table: {
      title: "Stack comparison",
      headers: ["Area", "Before", "After"],
      rows: [
        ["Frontend", "WordPress theme", "Next.js 14 (App Router)"],
        ["CMS", "WP Admin", "Sanity Studio"],
        ["Hosting", "Shared LAMP", "Vercel Edge"],
        ["Build time", "n/a", "42s"],
        ["Avg TTFB", "1.4s", "180ms"],
      ],
    },
    gallery: [
      { id: "g1", image: portfolio3, alt: "Homepage redesign mockup" },
      { id: "g2", image: portfolio1, alt: "Inner page layout" },
    ],
  },
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
  redirects: [],
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
    "strategy-call": { metaTitle: "Book A Strategy Call — AniRise", metaDescription: "Book a free strategy call with AniRise. Share your business challenges and get a tailored growth plan within 24 hours.", metaKeywords: "strategy call, free consultation, AniRise" },
  },
};

const FONT_CHOICES = [
  "Inter", "Poppins", "Roboto", "Montserrat", "Open Sans", "Lato",
  "Nunito", "Raleway", "Playfair Display", "Merriweather", "DM Sans", "Work Sans",
] as const;

const defaultAppearance: Appearance = { headingFont: "Poppins", bodyFont: "Inter", baseFontSize: 16 };

const defaultHomeBlocks: HomeBlocks = {
  trustStrip: true, stats: true, servicesPreview: true,
  caseStudies: true, processFlow: true, homeFaq: true, finalCta: true,
};

const defaultProcessFlow: ProcessFlow = {
  eyebrow: "How We Work",
  titleBefore: "Our 6-Step",
  titleAccent: "Growth Process",
  blurb: "A clear, proven path — from understanding your brand to delivering unstoppable growth.",
  steps: [
    { id: "pf1", icon: "Users", title: "Understanding Client Requirements & Goals", chip: "Identifying Brand" },
    { id: "pf2", icon: "Search", title: "Conducting Market Research & Planning Strategy", chip: "Strategy Mapping" },
    { id: "pf3", icon: "PenTool", title: "Campaign Setup & Content Creation", chip: "Compelling Copywriting" },
    { id: "pf4", icon: "Rocket", title: "Executing Campaigns, AI Integration & Promotion", chip: "Performance Driven SEO" },
    { id: "pf5", icon: "Gauge", title: "Monitoring, Optimization & Improvement", chip: "Live Tracking" },
    { id: "pf6", icon: "TrendingUp", title: "Reporting Results & Client Support", chip: "Unstoppable Growth" },
  ],
};

const defaultHomeFaqs: FaqItem[] = [
  { id: "hf1", question: "Apnara kothai based?", answer: "AniRise globally kaj kore. Bangladesh and bairer client der jonno fully remote ebong on-call support pawa jay." },
  { id: "hf2", question: "Project shuru korte koto somoy lage?", answer: "Initial call er por 3–5 din er moddhe proposal, ar approval er 7 din er moddhe kickoff hoy." },
  { id: "hf3", question: "Apnader pricing model kemon?", answer: "Project-based and monthly retainer — duitai available. Free consultation er por scope onujayi quote dei." },
  { id: "hf4", question: "Result kobe theke dekhte parbo?", answer: "SEO 60–90 din, web/graphics deliverables 2–4 soptaher moddhe, marketing campaigns 2–3 soptah er moddhe early signals." },
  { id: "hf5", question: "Contract sign korte hobe?", answer: "Onek shomoy simple SOW e kaj suru hoy. Long-term retainer er jonno standard service agreement thake." },
  { id: "hf6", question: "Payment terms ki?", answer: "Project shurute 50% advance, delivery er por 50%. Retainer hole monthly upfront billing." },
  { id: "hf7", question: "Communication kivabe hoy?", answer: "WhatsApp, email, ar weekly Zoom/Meet call e regular update. Dedicated project manager assign kora hoy." },
  { id: "hf8", question: "Project er ownership kar?", answer: "Final payment er por shob deliverable (code, design source, content) apnar — full ownership transfer hoy." },
  { id: "hf9", question: "Revisions koto bar pabo?", answer: "Most package e 2–3 round revision included. Scope onujayi extra revisions discuss kora jay." },
  { id: "hf10", question: "NDA sign korte parben?", answer: "Obossoi. Sensitive project er jonno NDA sign kore tarpor kaj suru kori." },
];


const defaultServiceFaqs: Record<string, FaqItem[]> = {
  "website-seo": [
    { id: "wseo1", question: "How long until I see results?", answer: "Most clients see ranking improvements in 60–90 days, with significant traffic growth by month 4–6." },
    { id: "wseo2", question: "Do you guarantee #1 rankings?", answer: "No reputable agency does. We guarantee a documented, ethical process and measurable progress." },
    { id: "wseo3", question: "What makes AniRise different?", answer: "We combine technical depth with conversion-focused content — rankings without revenue is vanity." },
    { id: "wseo4", question: "Do you work with small businesses?", answer: "Absolutely. We tailor scope to your stage and budget, from local SEO to enterprise campaigns." },
  ],
  "ecommerce-seo": [
    { id: "eseo1", question: "Do you optimize product pages?", answer: "Yes — titles, descriptions, schema, internal linking, and category architecture." },
    { id: "eseo2", question: "Which platforms do you support?", answer: "Shopify, WooCommerce, Magento, and custom builds." },
  ],
  "graphics-design": [
    { id: "gd1", question: "Koto rounds revision pabo?", answer: "Standard package e 3 round revision included. Extra round chaile small fee." },
    { id: "gd2", question: "File format ki ki pabo?", answer: "Source file (AI/PSD/Figma) + print-ready PDF + web-ready PNG/JPG." },
  ],
};

const defaultStats: StatItem[] = [
  { id: "st1", value: "15+", label: "Projects Delivered" },
  { id: "st2", value: "10+", label: "Happy Clients" },
  { id: "st3", value: "2+", label: "Years Experience" },
  { id: "st4", value: "95%", label: "Client Retention" },
];

const defaultTrustLogos: TrustLogo[] = [
  { id: "tl1", name: "Brand One", image: "" },
  { id: "tl2", name: "Brand Two", image: "" },
  { id: "tl3", name: "Brand Three", image: "" },
  { id: "tl4", name: "Brand Four", image: "" },
  { id: "tl5", name: "Brand Five", image: "" },
  { id: "tl6", name: "Brand Six", image: "" },
];

const defaultCaseStudies: CaseStudy[] = [
  {
    id: "cs1",
    title: "Local Brand SEO Sprint",
    metric: "+180% organic traffic",
    description: "3 maser moddhe organic traffic prai 3x — high-intent keyword targeting and on-page optimization e.",
    image: portfolio1,
    link: "/portfolio",
    eyebrow: "SEO case study",
    intro: "Ekta local lifestyle brand-er jonno 90-din-er sprint — technical fix, content cluster ar link strategy diye organic traffic prai tin gun kora hoyeche.",
    client: "Local Lifestyle Brand",
    industry: "D2C / Retail",
    duration: "90 days",
    challenge: "Brand-er site rank korchhilo na top 50 te-o, page speed kharap chhilo ar product page-e proper schema chhilo na.",
    solution: "Full technical audit, on-page rewrite, internal linking restructure, ar 12 ta high-intent blog cluster publish kora hoyeche.",
    results: "3 maser moddhe organic traffic 2.8x, top-10 keyword 4 theke 38 te giyeche, ar lead form submission proti maashe doubled.",
    stats: [
      { id: "s1", label: "Organic traffic", value: "+180%" },
      { id: "s2", label: "Top-10 keywords", value: "4 → 38" },
      { id: "s3", label: "Monthly leads", value: "2x" },
      { id: "s4", label: "Bounce rate", value: "-22%" },
    ],
    table: {
      title: "Before vs After (90 days)",
      headers: ["Metric", "Before", "After"],
      rows: [
        ["Organic sessions / mo", "3,200", "8,950"],
        ["Indexed pages", "42", "118"],
        ["Avg. position", "47", "14"],
        ["Domain authority", "12", "24"],
      ],
    },
    chart: {
      title: "Monthly organic sessions",
      type: "line",
      data: [
        { id: "m1", label: "Mo 1", value: 3200 },
        { id: "m2", label: "Mo 2", value: 4100 },
        { id: "m3", label: "Mo 3", value: 8950 },
      ],
    },
  },
  {
    id: "cs2",
    title: "Ecommerce Revenue Lift",
    metric: "3x leads",
    description: "Product schema + category restructure er moddhe lead 3 gun briddhi.",
    image: portfolio2,
    link: "/portfolio",
    eyebrow: "Ecommerce case study",
    intro: "Ekta multi-category ecommerce store-er jonno schema implementation, category restructure ar conversion-focused CRO diye revenue track e ene fela hoyeche.",
    client: "Multi-category Ecommerce",
    industry: "Ecommerce",
    duration: "120 days",
    challenge: "Category pages indexing problem, duplicate meta, ar checkout funnel-e high drop-off chhilo.",
    solution: "Product/Category schema, canonical fix, category URL restructure, ar checkout simplification.",
    results: "Lead 3x, revenue per visitor 64% briddhi, ar cart abandonment 18% kome.",
    stats: [
      { id: "s1", label: "Leads", value: "3x" },
      { id: "s2", label: "Revenue / visitor", value: "+64%" },
      { id: "s3", label: "Cart abandonment", value: "-18%" },
    ],
    table: {
      title: "Quarterly impact",
      headers: ["Quarter", "Sessions", "Conversions", "Revenue"],
      rows: [
        ["Q1", "12,400", "184", "৳2.1L"],
        ["Q2", "21,800", "412", "৳4.8L"],
        ["Q3", "34,200", "742", "৳9.2L"],
      ],
    },
    chart: {
      title: "Quarterly conversions",
      type: "bar",
      data: [
        { id: "q1", label: "Q1", value: 184 },
        { id: "q2", label: "Q2", value: 412 },
        { id: "q3", label: "Q3", value: 742 },
      ],
    },
  },
  {
    id: "cs3",
    title: "SaaS Signup Surge",
    metric: "+220% signups",
    description: "Landing page redesign + intent-driven content diye trial signup 3 gun bariye fela hoyeche.",
    image: portfolio3,
    link: "/portfolio",
    eyebrow: "SaaS case study",
    intro: "Ekta B2B SaaS startup-er jonno landing page CRO, messaging refresh ar bottom-funnel content strategy diye qualified trial signup dramatically bariye fela hoyeche.",
    client: "B2B SaaS Startup",
    industry: "SaaS",
    duration: "60 days",
    challenge: "High traffic chhilo kintu trial signup conversion rate kub low (0.8%), ar messaging target audience-er sathe resonate korchhilo na.",
    solution: "Hero section rewrite, social proof integration, pricing page simplification, ar 8 ta comparison/alternative blog post publish.",
    results: "Trial signup 220% briddhi, conversion rate 0.8% theke 2.6% e giyeche, ar qualified demo booking proti maashe 4x.",
    stats: [
      { id: "s1", label: "Trial signups", value: "+220%" },
      { id: "s2", label: "Conversion rate", value: "0.8% → 2.6%" },
      { id: "s3", label: "Demo bookings", value: "4x" },
      { id: "s4", label: "CAC", value: "-35%" },
    ],
    table: {
      title: "Before vs After (60 days)",
      headers: ["Metric", "Before", "After"],
      rows: [
        ["Monthly signups", "120", "384"],
        ["Conversion rate", "0.8%", "2.6%"],
        ["Demo bookings / mo", "8", "32"],
        ["Avg. CAC", "৳4,200", "৳2,730"],
      ],
    },
    chart: {
      title: "Weekly signups",
      type: "line",
      data: [
        { id: "w1", label: "Wk 1", value: 28 },
        { id: "w2", label: "Wk 3", value: 62 },
        { id: "w3", label: "Wk 6", value: 96 },
        { id: "w4", label: "Wk 8", value: 134 },
      ],
    },
  },
];

const defaultFinalCta: FinalCta = {
  headline: "Ready to make your brand rise?",
  subline: "Free 30-min strategy call. Clear next steps, honest scope, no jargon.",
  primaryLabel: "Get Free Proposal",
  primaryUrl: "/contact",
  secondaryLabel: "WhatsApp Us",
  secondaryUrl: "https://wa.me/8801337744727",
};

const defaultSectionGroups: SectionGroup[] = [
  { id: "g-home", key: "home", label: "Home", isHome: true },
  { id: "g-services", key: "services-group", label: "Services", isHome: false },
];
const defaultPageLocation: Record<string, string> = {
  hero: "home", services: "", about: "", portfolio: "",
  blog: "home", testimonials: "", contact: "", "case-studies": "", footer: "home",
};
const defaultHomeMembership: Record<SectionKey, boolean> = {
  hero: true, services: false, about: false, portfolio: false, blog: true, testimonials: false, contact: false,
};

// Default legal pages — seeded on first load if missing. Admin can fully edit
// them afterwards from the Custom Pages section like any other page.
const defaultLegalPages: CustomPage[] = [
  {
    id: "legal-privacy-policy",
    title: "Privacy Policy",
    slug: "privacy-policy",
    parent: "",
    navLocation: [],
    image: "",
    imageAlt: "",
    body: "",
    published: true,
    eyebrow: "Legal",
    intro: "This Privacy Policy explains how AniRise collects, uses, and protects the information you share with us when you visit our website or engage our services.",
    sections: [
      { id: "pp-1", title: "Information we collect", body: "We collect information you provide directly — such as your name, email, phone number, and project details when you fill out a contact form, book a strategy call, or sign up for our newsletter. We also collect basic technical information automatically (IP address, browser type, pages visited) through cookies and analytics tools to improve our website." },
      { id: "pp-2", title: "How we use your information", body: "We use your information to respond to inquiries, deliver the services you request, send relevant updates about your project, improve our website and offerings, and comply with legal obligations. We never sell your personal data to third parties." },
      { id: "pp-3", title: "Cookies and analytics", body: "Our site uses cookies and similar technologies (including Google Analytics) to understand how visitors interact with our content. You can disable cookies in your browser settings, though some features of the site may not function properly without them." },
      { id: "pp-4", title: "Data sharing", body: "We share information only with trusted service providers who help us run our business (such as hosting, email, and analytics platforms), all under strict confidentiality. We may also disclose information when required by law." },
      { id: "pp-5", title: "Data retention and security", body: "We retain personal information only as long as necessary to fulfil the purposes outlined here or as required by law. We use industry-standard security measures to protect your data, but no method of transmission over the internet is 100% secure." },
      { id: "pp-6", title: "Your rights", body: "You can request access to, correction of, or deletion of your personal information at any time by emailing us. You can also unsubscribe from marketing communications using the link in any email we send." },
      { id: "pp-7", title: "Changes to this policy", body: "We may update this Privacy Policy from time to time. The latest version will always be posted on this page with an updated effective date." },
      { id: "pp-8", title: "Contact us", body: "If you have any questions about this Privacy Policy or how we handle your data, please reach out via our Contact page or email us directly." },
    ],
    seo: {
      metaTitle: "Privacy Policy — AniRise",
      metaDescription: "How AniRise collects, uses, and protects your personal information when you use our website or services.",
      keywords: "privacy policy, data protection, anirise",
      canonicalAuto: true,
      canonicalUrl: "",
      robots: "index",
      ogImage: "",
      schemas: [],
      status: "published",
      slug: "privacy-policy",
      changefreq: "yearly",
      priority: "0.3",
    } as any,
  },
  {
    id: "legal-terms-of-service",
    title: "Terms of Service",
    slug: "terms-of-service",
    parent: "",
    navLocation: [],
    image: "",
    imageAlt: "",
    body: "",
    published: true,
    eyebrow: "Legal",
    intro: "These Terms of Service govern your use of the AniRise website and the services we provide. By accessing our site or engaging us, you agree to the terms below.",
    sections: [
      { id: "tos-1", title: "Acceptance of terms", body: "By using anirise.com.bd or contracting AniRise for any service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our site or services." },
      { id: "tos-2", title: "Services", body: "AniRise provides digital marketing services including SEO, web development, ecommerce optimization, and graphics design. Specific deliverables, timelines, and fees for each engagement are defined in a separate written agreement or proposal." },
      { id: "tos-3", title: "Payment terms", body: "Unless otherwise agreed in writing, projects require a 50% advance and 50% on delivery. Retainer engagements are billed monthly in advance. Late payments may incur additional fees or pause active work." },
      { id: "tos-4", title: "Client responsibilities", body: "Clients are responsible for providing timely access to accounts, content, and feedback needed to complete the work. Delays caused by missing information may extend project timelines." },
      { id: "tos-5", title: "Intellectual property", body: "Upon full payment, the client owns the final deliverables created specifically for them. AniRise retains the right to display the work in our portfolio and case studies unless otherwise agreed in writing." },
      { id: "tos-6", title: "Confidentiality", body: "Both parties agree to keep confidential any non-public information shared during an engagement. We are happy to sign a mutual NDA when required." },
      { id: "tos-7", title: "Warranties and disclaimers", body: "We deliver our services with skill and care but cannot guarantee specific rankings, traffic numbers, or revenue outcomes, as these depend on factors outside our control (search algorithms, competitor activity, market conditions). The website and its content are provided 'as is' without warranties of any kind." },
      { id: "tos-8", title: "Limitation of liability", body: "To the maximum extent permitted by law, AniRise's total liability for any claim arising out of an engagement will not exceed the fees paid by the client in the three months preceding the claim." },
      { id: "tos-9", title: "Termination", body: "Either party may terminate an ongoing engagement with written notice as specified in the relevant agreement. Fees for work completed up to the termination date remain payable." },
      { id: "tos-10", title: "Governing law", body: "These terms are governed by the laws of Bangladesh. Any disputes will be resolved in the courts of Dhaka." },
      { id: "tos-11", title: "Changes to these terms", body: "We may update these Terms of Service from time to time. The latest version will always be posted on this page with an updated effective date." },
      { id: "tos-12", title: "Contact us", body: "Questions about these terms? Reach out via our Contact page or email us directly." },
    ],
    seo: {
      metaTitle: "Terms of Service — AniRise",
      metaDescription: "The terms governing your use of the AniRise website and the services we provide.",
      keywords: "terms of service, terms and conditions, anirise",
      canonicalAuto: true,
      canonicalUrl: "",
      robots: "index",
      ogImage: "",
      schemas: [],
      status: "published",
      slug: "terms-of-service",
      changefreq: "yearly",
      priority: "0.3",
    } as any,
  },
  {
    id: "legal-refund-policy",
    title: "Refund Policy",
    slug: "refund-policy",
    parent: "",
    navLocation: [],
    image: "",
    imageAlt: "",
    body: "",
    published: true,
    eyebrow: "Legal",
    intro: "This Refund Policy explains when refunds may be issued for services purchased from AniRise. Because our work is custom and time-intensive, refund eligibility is limited and based on the stage of the project.",
    sections: [
      { id: "rp-1", title: "Scope", body: "This policy applies to all services purchased directly from AniRise — including SEO, web development, ecommerce optimization, graphics design, and retainer engagements. Specific terms in a signed proposal or contract override this general policy where they differ." },
      { id: "rp-2", title: "Before work begins", body: "If you cancel a project in writing before any work has started, you are entitled to a full refund of the advance payment, minus any payment-processing fees already incurred." },
      { id: "rp-3", title: "After work has started", body: "Once work begins, refunds are calculated based on the percentage of work completed. You will be billed for the time, deliverables, and third-party costs incurred up to the cancellation date, and the remaining balance of the advance (if any) will be refunded." },
      { id: "rp-4", title: "Completed deliverables", body: "Final deliverables that have been approved and handed over are non-refundable, as the work has been fully performed and ownership transferred to you." },
      { id: "rp-5", title: "Monthly retainers", body: "Retainer fees are billed monthly in advance and are non-refundable once the billing month has started. You may cancel a retainer with 15 days' written notice; service continues through the end of the current billing month." },
      { id: "rp-6", title: "Performance disclaimer", body: "Refunds will not be issued based on SEO rankings, traffic, conversions, or revenue outcomes. These results depend on many factors outside our control (search algorithms, market conditions, your own site changes) and are never guaranteed." },
      { id: "rp-7", title: "How to request a refund", body: "Send a written refund request to our official email with your project name, the reason for cancellation, and any supporting details. We will review and respond within 7 business days." },
      { id: "rp-8", title: "Processing time", body: "Approved refunds are processed within 10–14 business days to the original payment method. Depending on your bank or payment provider, additional time may be required for the funds to appear in your account." },
      { id: "rp-9", title: "Chargebacks", body: "We ask that you contact us first to resolve any billing issue. Initiating a chargeback without first reaching out may result in suspension of services and additional administrative fees." },
      { id: "rp-10", title: "Changes to this policy", body: "We may update this Refund Policy from time to time. The latest version will always be posted on this page with an updated effective date." },
      { id: "rp-11", title: "Contact us", body: "Questions about refunds or this policy? Reach out via our Contact page or email us directly." },
    ],
    seo: {
      metaTitle: "Refund Policy — AniRise",
      metaDescription: "When and how refunds are issued for services purchased from AniRise.",
      keywords: "refund policy, cancellation, anirise",
      canonicalAuto: true,
      canonicalUrl: "",
      robots: "index",
      ogImage: "",
      schemas: [],
      status: "published",
      slug: "refund-policy",
      changefreq: "yearly",
      priority: "0.3",
    } as any,
  },
];

// Ensure seeded legal pages exist; never overwrite admin edits.
function mergeLegalPages(pages: CustomPage[]): CustomPage[] {
  const have = new Set(pages.map((p) => p.slug));
  const missing = defaultLegalPages.filter((p) => !have.has(p.slug));
  return missing.length ? [...pages, ...missing] : pages;
}


// ============================================================
// Context
// ============================================================

type AdminCtx = {
  isAuthed: boolean;
  login: (pw: string) => Promise<boolean>;
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  posts: BlogPost[];
  addPost: (p: Omit<BlogPost, "id">) => Promise<boolean>;
  updatePost: (id: string, p: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
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
  buildSitemap: (base: string) => string;
  saveAllNow: () => Promise<{ ok: boolean; error?: string }>;
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
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "createdAt" | "approved">) => Promise<void>;
  approveReview: (id: string, approved: boolean) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  // Home builder
  homeBlocks: HomeBlocks;
  setHomeBlock: (k: HomeBlockKey, v: boolean) => void;
  homeFaqs: FaqItem[];
  addHomeFaq: (f: Omit<FaqItem, "id">) => void;
  updateHomeFaq: (id: string, f: Partial<FaqItem>) => void;
  deleteHomeFaq: (id: string) => void;
  serviceFaqs: Record<string, FaqItem[]>;
  addServiceFaq: (slug: string, f: Omit<FaqItem, "id">) => void;
  updateServiceFaq: (slug: string, id: string, f: Partial<FaqItem>) => void;
  deleteServiceFaq: (slug: string, id: string) => void;
  stats: StatItem[];
  addStat: (s: Omit<StatItem, "id">) => void;
  updateStat: (id: string, s: Partial<StatItem>) => void;
  deleteStat: (id: string) => void;
  trustLogos: TrustLogo[];
  addTrustLogo: (t: Omit<TrustLogo, "id">) => void;
  updateTrustLogo: (id: string, t: Partial<TrustLogo>) => void;
  deleteTrustLogo: (id: string) => void;
  caseStudies: CaseStudy[];
  addCaseStudy: (c: Omit<CaseStudy, "id">) => void;
  updateCaseStudy: (id: string, c: Partial<CaseStudy>) => void;
  deleteCaseStudy: (id: string) => void;
  finalCta: FinalCta;
  updateFinalCta: (c: Partial<FinalCta>) => void;
  servicePreviews: Record<string, ServicePreview>;
  updateServicePreview: (slug: string, sp: Partial<ServicePreview>) => void;
  serviceContent: Record<string, ServiceContent>;
  updateServiceContent: (slug: string, patch: Partial<ServiceContent>) => void;
  addService: (s?: Partial<AdminService>) => AdminService;
  updateService: (id: string, patch: Partial<AdminService>) => void;
  deleteService: (id: string) => void;
  processFlow: ProcessFlow;
  updateProcessFlow: (patch: Partial<ProcessFlow>) => void;
  addProcessFlowStep: () => void;
  updateProcessFlowStep: (id: string, patch: Partial<ProcessFlowStep>) => void;
  deleteProcessFlowStep: (id: string) => void;
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
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeo);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [homeMembership, setHomeMembershipState] = useState<Record<SectionKey, boolean>>(defaultHomeMembership);
  const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>(defaultSectionGroups);
  const [pageLocation, setPageLocationState] = useState<Record<string, string>>(defaultPageLocation);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visits, setVisits] = useState(0);
  const [visitSeries, setVisitSeries] = useState<{ day: string; visits: number }[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlocks>(defaultHomeBlocks);
  const [homeFaqs, setHomeFaqs] = useState<FaqItem[]>([]);
  const [serviceFaqs, setServiceFaqs] = useState<Record<string, FaqItem[]>>(defaultServiceFaqs);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [trustLogos, setTrustLogos] = useState<TrustLogo[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [finalCta, setFinalCta] = useState<FinalCta>(defaultFinalCta);
  const [servicePreviews, setServicePreviews] = useState<Record<string, ServicePreview>>({ ...defaultServicePreviews });
  const [serviceContent, setServiceContent] = useState<Record<string, ServiceContent>>(defaultServiceContent);
  const [processFlow, setProcessFlow] = useState<ProcessFlow>(defaultProcessFlow);
  const latestSettingsRef = useRef<any>(null);

  latestSettingsRef.current = {
    content, contact, portfolio, seo, appearance,
    custom_pages: customPages, home_sections: homeSections, section_groups: sectionGroups,
    page_location: pageLocation, home_membership: homeMembership, home_blocks: homeBlocks,
    home_faqs: homeFaqs, service_faqs: serviceFaqs, stats, trust_logos: trustLogos,
    case_studies: caseStudies, final_cta: finalCta, service_previews: servicePreviews,
    service_content: serviceContent, process_flow: processFlow,
  };

  // Prevent the initial DB-load setState from triggering a save back to DB
  const hydrated = useRef(false);

  // Admin session token (HMAC token from admin-login edge function)
  const adminTokenRef = useRef<string | null>(null);

  // Call admin-action edge function with the current token.
  // Returns { ok: boolean, data?: any, error?: string }.
  const adminCall = async (op: string, payload: any = {}): Promise<{ ok: boolean; data?: any; error?: string }> => {
    const token = adminTokenRef.current;
    if (!token) return { ok: false, error: "Not authenticated" };
    try {
      const { data, error } = await supabase.functions.invoke("admin-action", {
        body: { token, op, payload },
      });
      if (error) return { ok: false, error: error.message };
      if (data?.error) return { ok: false, error: data.error };
      return { ok: true, data: data?.data };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Network error" };
    }
  };

  // Load admin-only data (full leads list, all reviews, visit analytics).
  const loadAdminData = async () => {
    const [leadsR, reviewsR, visitsR] = await Promise.all([
      adminCall("leads_list"),
      adminCall("reviews_list"),
      adminCall("visits_list", { sinceDays: 30 }),
    ]);
    if (leadsR.ok && Array.isArray(leadsR.data)) setLeads(leadsR.data.map(fromDbLead));
    if (reviewsR.ok && Array.isArray(reviewsR.data)) {
      setReviews(reviewsR.data.map((r: any) => ({
        id: r.id, name: r.name, role: r.role ?? "", quote: r.quote,
        rating: r.rating ?? 5, approved: !!r.approved,
        createdAt: new Date(r.created_at).getTime(),
      })));
    }
    if (visitsR.ok && Array.isArray(visitsR.data)) {
      const rows = visitsR.data;
      const uniqueIds = new Set<string>();
      rows.forEach((v: any, i: number) => uniqueIds.add(v.visitor_id || `legacy-${i}`));
      setVisits(uniqueIds.size);
      const buckets: Record<string, Set<string>> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        buckets[d] = new Set();
      }
      rows.forEach((v: any, i: number) => {
        const d = new Date(v.created_at).toISOString().slice(0, 10);
        if (d in buckets) buckets[d].add(v.visitor_id || `legacy-${i}`);
      });
      setVisitSeries(Object.entries(buckets).map(([day, set]) => ({ day: day.slice(5), visits: set.size })));
    }
  };

  // ---------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      // Public-readable tables only. leads + all-reviews + visits load after admin login.
      const [settingsRes, postsRes, reviewsRes] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("blog_posts").select("*").order("date", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      ]);
      if (!alive) return;

      const s = sanitizeStaleAssets(settingsRes.data);
      if (s) {
        if (s.content && Object.keys(s.content).length) setContent({ ...defaultContent, ...(s.content as any) });
        if (s.contact && Object.keys(s.contact).length) setContact({ ...defaultContact, ...(s.contact as any) });
        if (Array.isArray(s.portfolio)) setPortfolio(s.portfolio as any);
        if (s.seo && Object.keys(s.seo).length) {
          const incomingSeo = s.seo as any;
          setSeo({
            ...defaultSeo,
            ...incomingSeo,
            redirects: Array.isArray(incomingSeo.redirects)
              ? incomingSeo.redirects.map((r: any) => {
                  const allowed = [301, 302, 307, 308];
                  return { ...r, code: allowed.includes(r?.code) ? r.code : 301 };
                })
              : defaultSeo.redirects,
          });
        }
        if (s.appearance && Object.keys(s.appearance).length) setAppearance({ ...defaultAppearance, ...(s.appearance as any) });
        if (Array.isArray(s.custom_pages)) setCustomPages(mergeLegalPages((s.custom_pages as any[]).map((p) => ({
          ...p,
          navLocation: Array.isArray(p.navLocation)
            ? p.navLocation
            : p.navLocation === "none" || !p.navLocation ? [] : [p.navLocation],
        })) as any));
        else setCustomPages(mergeLegalPages([]));
        if (Array.isArray(s.home_sections)) setHomeSections(s.home_sections as any);
        if (Array.isArray(s.section_groups) && (s.section_groups as any[]).length) setSectionGroups(s.section_groups as any);
        if (s.page_location && Object.keys(s.page_location).length) setPageLocationState({ ...defaultPageLocation, ...(s.page_location as any) });
        if (s.home_membership && Object.keys(s.home_membership).length) setHomeMembershipState({ ...defaultHomeMembership, ...(s.home_membership as any) });
        const sa = s as any;
        if (sa.home_blocks && Object.keys(sa.home_blocks).length) setHomeBlocks({ ...defaultHomeBlocks, ...sa.home_blocks });
        if (Array.isArray(sa.home_faqs)) setHomeFaqs(sa.home_faqs);
        if (sa.service_faqs && Object.keys(sa.service_faqs).length) setServiceFaqs({ ...defaultServiceFaqs, ...sa.service_faqs });
        if (Array.isArray(sa.stats)) setStats(sa.stats);
        if (Array.isArray(sa.trust_logos)) setTrustLogos(sa.trust_logos);
        if (Array.isArray(sa.case_studies)) setCaseStudies(sa.case_studies);
        if (sa.final_cta && Object.keys(sa.final_cta).length) setFinalCta({ ...defaultFinalCta, ...sa.final_cta });
        if (sa.service_previews && Object.keys(sa.service_previews).length) {
          // Merge defaults so newly added services and empty fields get sensible copy.
          const merged: Record<string, ServicePreview> = { ...defaultServicePreviews };
          Object.keys(sa.service_previews).forEach((k) => {
            const def = defaultServicePreviews[k] ?? { image: "", imageAlt: "", title: "", desc: "" };
            const inc = sa.service_previews[k] ?? {};
            merged[k] = {
              image: inc.image ?? def.image,
              imageAlt: inc.imageAlt || def.imageAlt,
              title: inc.title || def.title,
              desc: inc.desc || def.desc,
            };
          });
          setServicePreviews(merged);
        }
        if (sa.service_content && Object.keys(sa.service_content).length) {
          const merged: Record<string, ServiceContent> = { ...defaultServiceContent };
          Object.keys(sa.service_content).forEach((k) => {
            merged[k] = { ...(defaultServiceContent[k] ?? defaultServiceContent["website-seo"]), ...sa.service_content[k] };
          });
          setServiceContent(merged);
        }
        if (sa.process_flow && Object.keys(sa.process_flow).length) {
          setProcessFlow({ ...defaultProcessFlow, ...sa.process_flow, steps: Array.isArray(sa.process_flow.steps) && sa.process_flow.steps.length ? sa.process_flow.steps : defaultProcessFlow.steps });
        }
      } else {
        // No DB row yet — seed in-memory state with defaults so fresh installs render sample data.
        setPortfolio(defaultPortfolio);
        setHomeFaqs(defaultHomeFaqs);
        setStats(defaultStats);
        setTrustLogos(defaultTrustLogos);
        setCaseStudies(defaultCaseStudies);
      }
      if (postsRes.data) setPosts(postsRes.data.map(fromDbPost));
      if (reviewsRes.data) setReviews(reviewsRes.data.map((r: any) => ({
        id: r.id, name: r.name, role: r.role ?? "", quote: r.quote,
        rating: r.rating ?? 5, approved: !!r.approved,
        createdAt: new Date(r.created_at).getTime(),
      })));

      setLoading(false);

      // Restore admin session from localStorage; ping to validate.
      const saved = typeof window !== "undefined" ? localStorage.getItem("anirise_admin_token") : null;
      if (saved) {
        adminTokenRef.current = saved;
        const ok = await adminCall("ping");
        if (ok.ok) {
          setIsAuthed(true);
          await loadAdminData();
        } else {
          adminTokenRef.current = null;
          try { localStorage.removeItem("anirise_admin_token"); } catch {}
        }
      }

      setTimeout(() => { hydrated.current = true; }, 0);
    })();
    return () => { alive = false; };
  }, []);

  // ---------------------------------------------------------------
  // Persist site_settings on any change (debounced)
  // ---------------------------------------------------------------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build the full payload sent to update_site_settings — used by both the
  // debounced auto-save and the explicit saveAllNow() force-flush.
  const buildSettingsPayload = () => {
    const payload = latestSettingsRef.current;
    if (payload?.seo?.autoSitemap) {
      return { ...payload, seo: { ...payload.seo, sitemap: buildSitemap(payload.seo.canonicalUrl) } };
    }
    return payload;
  };

  // Force-flush any pending debounced save and persist immediately.
  // Returns { ok, error? } so the caller can show feedback.
  const saveAllNow = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!isAuthed) return { ok: false, error: "Not authenticated" };
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    await new Promise((resolve) => setTimeout(resolve, 0));
    const r = await adminCall("update_site_settings", buildSettingsPayload());
    return { ok: r.ok, error: r.error };
  };

  useEffect(() => {
    if (!hydrated.current) return;
    if (!isAuthed) return; // Only admins can persist site_settings now (RLS enforces this server-side too).
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      adminCall("update_site_settings", buildSettingsPayload()).then((r) => {
        if (!r.ok) console.error("[site_settings] save failed", r.error);
      });
    }, 250);
  }, [isAuthed, content, contact, portfolio, seo, appearance, customPages, homeSections, sectionGroups, pageLocation, homeMembership, homeBlocks, homeFaqs, serviceFaqs, stats, trustLogos, caseStudies, finalCta, servicePreviews, serviceContent, processFlow]);

  // ---------------------------------------------------------------
  // Live document.head effects (unchanged)
  // ---------------------------------------------------------------
  useEffect(() => {
    // Sitewide fallback only — per-page useSEO() owns title/description/canonical/og:*
    // for each route. We intentionally do NOT write canonical, og:*, twitter:*, title
    // or description here, because doing so would clobber the per-page values that
    // route components set via useSEO (which caused every page's canonical to point
    // at the homepage URL).
    if (seo.metaKeywords) {
      let el = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "keywords");
        document.head.appendChild(el);
      }
      el.setAttribute("content", seo.metaKeywords);
    }
  }, [seo.metaKeywords]);

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
  // Auth — password verified server-side by admin-login edge function.
  // ---------------------------------------------------------------
  const login = async (pw: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-login", { body: { password: pw } });
      if (error || !data?.token) return false;
      adminTokenRef.current = data.token;
      try { localStorage.setItem("anirise_admin_token", data.token); } catch {}
      setIsAuthed(true);
      await loadAdminData();
      return true;
    } catch (e) {
      console.error("login failed", e);
      return false;
    }
  };
  const logout = () => {
    adminTokenRef.current = null;
    try { localStorage.removeItem("anirise_admin_token"); } catch {}
    setIsAuthed(false);
  };

  const changeAdminPassword = async (oldPassword: string, newPassword: string) => {
    const r = await adminCall("change_password", { oldPassword, newPassword });
    return { ok: r.ok, error: r.error };
  };


  // ---------------------------------------------------------------
  // Blog (admin-action backed)
  // ---------------------------------------------------------------
  const addPost = async (p: Omit<BlogPost, "id">): Promise<boolean> => {
    const r = await adminCall("blog_create", toDbPost(p));
    if (!r.ok || !r.data) { console.error("blog_create failed", r.error); return false; }
    setPosts((prev) => [fromDbPost(r.data), ...prev]);
    return true;
  };
  const updatePost = async (id: string, p: Partial<BlogPost>): Promise<boolean> => {
    const r = await adminCall("blog_update", { id, patch: toDbPost(p) });
    if (!r.ok || !r.data) { console.error("blog_update failed", r.error); return false; }
    setPosts((prev) => prev.map((x) => (x.id === id ? fromDbPost(r.data) : x)));
    return true;
  };
  const deletePost = async (id: string): Promise<boolean> => {
    const r = await adminCall("blog_delete", { id });
    if (!r.ok) { console.error("blog_delete failed", r.error); return false; }
    setPosts((prev) => prev.filter((x) => x.id !== id));
    return true;
  };

  // ---------------------------------------------------------------
  // Leads — public submit goes through submit-lead; admin ops via admin-action
  // ---------------------------------------------------------------
  const addLead = async (l: Omit<Lead, "id" | "createdAt">) => {
    try {
      const { data, error } = await supabase.functions.invoke("submit-lead", { body: l });
      if (error || data?.error) console.error("submit-lead failed", error || data?.error);
    } catch (e) {
      console.error("submit-lead failed", e);
    }
  };
  const deleteLead = async (id: string) => {
    const r = await adminCall("lead_delete", { id });
    if (!r.ok) return console.error("lead_delete failed", r.error);
    setLeads((prev) => prev.filter((x) => x.id !== id));
  };
  const clearLeads = async () => {
    const r = await adminCall("leads_clear");
    if (!r.ok) return console.error("leads_clear failed", r.error);
    setLeads([]);
  };
  const pruneOldLeads = async (): Promise<number> => {
    const r = await adminCall("leads_purge_old");
    if (!r.ok) return 0;
    const removed = r.data?.removed ?? 0;
    if (removed) {
      const cutoffMs = Date.now() - 90 * 86400000;
      setLeads((prev) => prev.filter((l) => l.createdAt >= cutoffMs));
    }
    return removed;
  };

  // Reviews — public submit via submit-review; admin moderation via admin-action
  const addReview = async (r: Omit<Review, "id" | "createdAt" | "approved">) => {
    try {
      const { data, error } = await supabase.functions.invoke("submit-review", { body: r });
      if (error || data?.error) console.error("submit-review failed", error || data?.error);
    } catch (e) {
      console.error("submit-review failed", e);
    }
  };
  const approveReview = async (id: string, approved: boolean) => {
    const r = await adminCall("review_update", { id, patch: { approved } });
    if (!r.ok) return console.error("review_update failed", r.error);
    setReviews((prev) => prev.map((x) => (x.id === id ? { ...x, approved } : x)));
  };
  const deleteReview = async (id: string) => {
    const r = await adminCall("review_delete", { id });
    if (!r.ok) return console.error("review_delete failed", r.error);
    setReviews((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------------------------------------------------------------
  // Local-state mutators (persisted via the site_settings effect)
  // ---------------------------------------------------------------
  const updateContent = (c: Partial<SiteContent>) => setContent((prev) => ({ ...prev, ...c }));
  const updateContact = (c: Partial<ContactInfo>) => setContact((prev) => ({ ...prev, ...c }));
  const addPortfolioItem = (p: Omit<PortfolioItem, "id">) => setPortfolio((prev) => {
    const maxOrder = prev.reduce((m, x) => Math.max(m, x.order ?? 0), 0);
    return [...prev, { order: maxOrder + 1, ...p, id: Date.now().toString() }];
  });
  const updatePortfolioItem = (id: string, p: Partial<PortfolioItem>) => setPortfolio((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deletePortfolioItem = (id: string) => setPortfolio((prev) => prev.filter((x) => x.id !== id));
  const updateSeo = (s: Partial<SeoSettings>) => setSeo((prev) => ({ ...prev, ...s }));
  const normalizeRedirect = (r: Partial<Redirect>) => {
    const allowed: Redirect["code"][] = [301, 302, 307, 308];
    const code = (allowed.includes(r.code as Redirect["code"]) ? r.code : 301) as Redirect["code"];
    return { ...r, code };
  };
  const addRedirect = (r: Omit<Redirect, "id">) => setSeo((prev) => ({ ...prev, redirects: [...prev.redirects, { ...normalizeRedirect(r), id: Date.now().toString() } as Redirect] }));
  const updateRedirect = (id: string, r: Partial<Redirect>) => setSeo((prev) => ({ ...prev, redirects: prev.redirects.map((x) => (x.id === id ? { ...x, ...normalizeRedirect(r) } : x)) }));
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
  const updatePageSeo = (key: string, s: Partial<PageSeo>) => {
    const sitemapFields = new Set(["slug", "status", "robots", "changefreq", "priority"]);
    const touchesSitemap = Object.keys(s).some((field) => sitemapFields.has(field));
    setSeo((prev) => ({
      ...prev,
      autoSitemap: touchesSitemap ? true : prev.autoSitemap,
      pageSeo: { ...prev.pageSeo, [key]: { ...(prev.pageSeo[key] || { metaTitle: "", metaDescription: "", metaKeywords: "" }), ...s } },
    }));
  };
  const updateAppearance = (a: Partial<Appearance>) => setAppearance((prev) => ({ ...prev, ...a }));

  // ---------------------------------------------------------------
  // Home builder mutators
  // ---------------------------------------------------------------
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const setHomeBlock = (k: HomeBlockKey, v: boolean) => setHomeBlocks((prev) => ({ ...prev, [k]: v }));
  const addHomeFaq = (f: Omit<FaqItem, "id">) => setHomeFaqs((prev) => [...prev, { ...f, id: newId() }]);
  const updateHomeFaq = (id: string, f: Partial<FaqItem>) => setHomeFaqs((prev) => prev.map((x) => x.id === id ? { ...x, ...f } : x));
  const deleteHomeFaq = (id: string) => setHomeFaqs((prev) => prev.filter((x) => x.id !== id));
  const addServiceFaq = (slug: string, f: Omit<FaqItem, "id">) =>
    setServiceFaqs((prev) => ({ ...prev, [slug]: [...(prev[slug] || []), { ...f, id: newId() }] }));
  const updateServiceFaq = (slug: string, id: string, f: Partial<FaqItem>) =>
    setServiceFaqs((prev) => ({ ...prev, [slug]: (prev[slug] || []).map((x) => x.id === id ? { ...x, ...f } : x) }));
  const deleteServiceFaq = (slug: string, id: string) =>
    setServiceFaqs((prev) => ({ ...prev, [slug]: (prev[slug] || []).filter((x) => x.id !== id) }));
  const addStat = (s: Omit<StatItem, "id">) => setStats((prev) => [...prev, { ...s, id: newId() }]);
  const updateStat = (id: string, s: Partial<StatItem>) => setStats((prev) => prev.map((x) => x.id === id ? { ...x, ...s } : x));
  const deleteStat = (id: string) => setStats((prev) => prev.filter((x) => x.id !== id));
  const addTrustLogo = (t: Omit<TrustLogo, "id">) => setTrustLogos((prev) => [...prev, { ...t, id: newId() }]);
  const updateTrustLogo = (id: string, t: Partial<TrustLogo>) => setTrustLogos((prev) => prev.map((x) => x.id === id ? { ...x, ...t } : x));
  const deleteTrustLogo = (id: string) => setTrustLogos((prev) => prev.filter((x) => x.id !== id));
  const addCaseStudy = (c: Omit<CaseStudy, "id">) => setCaseStudies((prev) => [...prev, { ...c, id: newId() }]);
  const updateCaseStudy = (id: string, c: Partial<CaseStudy>) => setCaseStudies((prev) => prev.map((x) => x.id === id ? { ...x, ...c } : x));
  const deleteCaseStudy = (id: string) => setCaseStudies((prev) => prev.filter((x) => x.id !== id));
  const updateFinalCta = (c: Partial<FinalCta>) => setFinalCta((prev) => ({ ...prev, ...c }));
  const updateServicePreview = (slug: string, sp: Partial<ServicePreview>) =>
    setServicePreviews((prev) => ({ ...prev, [slug]: { image: "", imageAlt: "", title: "", desc: "", ...(prev[slug] || {}), ...sp } }));
  const updateServiceContent = (slug: string, patch: Partial<ServiceContent>) =>
    setServiceContent((prev) => {
      const base = prev[slug] ?? defaultServiceContent[slug] ?? defaultServiceContent["website-seo"];
      return { ...prev, [slug]: { ...base, ...patch } };
    });

  const addService = (s: Partial<AdminService> = {}): AdminService => {
    const list = content.servicesList || [];
    const baseSlug = (s.slug || `service-${Date.now().toString(36)}`).toLowerCase().replace(/[^a-z0-9\-_]/g, "-");
    // Ensure identity slug is unique
    let slug = baseSlug, n = 2;
    while (list.some((x) => x.slug === slug)) { slug = `${baseSlug}-${n++}`; }
    const order = list.length ? Math.max(...list.map((x) => x.order || 0)) + 1 : 1;
    const item: AdminService = {
      id: `svc_${newId()}`,
      slug,
      title: s.title || "New service",
      desc: s.desc || "",
      iconName: s.iconName || "Sparkles",
      published: s.published ?? true,
      order,
      ...(s.urlSlug ? { urlSlug: s.urlSlug } : {}),
    };
    setContent((p) => ({ ...p, servicesList: [...(p.servicesList || []), item] }));
    return item;
  };
  const updateService = (id: string, patch: Partial<AdminService>) =>
    setContent((p) => ({ ...p, servicesList: (p.servicesList || []).map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const deleteService = (id: string) =>
    setContent((p) => ({ ...p, servicesList: (p.servicesList || []).filter((x) => x.id !== id) }));

  const updateProcessFlow = (patch: Partial<ProcessFlow>) => setProcessFlow((prev) => ({ ...prev, ...patch }));
  const addProcessFlowStep = () =>
    setProcessFlow((prev) => ({ ...prev, steps: [...prev.steps, { id: newId(), icon: "Sparkles", title: "New step", chip: "Tag" }] }));
  const updateProcessFlowStep = (id: string, patch: Partial<ProcessFlowStep>) =>
    setProcessFlow((prev) => ({ ...prev, steps: prev.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const deleteProcessFlowStep = (id: string) =>
    setProcessFlow((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.id !== id) }));

  const buildSitemap = (base: string, sourceSeo: SeoSettings = seo) => {
    const origin = (base || "https://anirise.com.bd").replace(/\/$/, "");
    const ps = sourceSeo.pageSeo || {};
    type E = { path: string; changefreq?: string; priority?: string; lastmod?: string };
    const entries: E[] = [];

    const builtins: Array<{ key: string; defaultSlug: string; cf: string; pr: string }> = [
      { key: "home",          defaultSlug: "",              cf: "weekly",  pr: "1.0" },
      { key: "services",      defaultSlug: "services",      cf: "monthly", pr: "0.9" },
      { key: "about",         defaultSlug: "about",         cf: "monthly", pr: "0.8" },
      { key: "portfolio",     defaultSlug: "portfolio",     cf: "monthly", pr: "0.8" },
      { key: "testimonials",  defaultSlug: "testimonials",  cf: "monthly", pr: "0.7" },
      { key: "contact",       defaultSlug: "contact",       cf: "monthly", pr: "0.8" },
      { key: "blog",          defaultSlug: "blog",          cf: "weekly",  pr: "0.9" },
      { key: "strategy-call", defaultSlug: "strategy-call", cf: "monthly", pr: "0.8" },
    ];
    for (const b of builtins) {
      const cfg: any = ps[b.key] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const slug = ((cfg.slug && String(cfg.slug).trim()) || b.defaultSlug).replace(/^\/+/, "");
      entries.push({ path: slug ? `/${slug}` : "/", changefreq: cfg.changefreq || b.cf, priority: cfg.priority || b.pr });
    }

    // Effective parent slugs (honor admin overrides)
    const servicesParent = (ps["services"]?.slug?.trim() || "services").replace(/^\/+/, "");
    const blogParent = (ps["blog"]?.slug?.trim() || "blog").replace(/^\/+/, "");
    const portfolioParent = (ps["portfolio"]?.slug?.trim() || "portfolio").replace(/^\/+/, "");
    const caseStudiesParent = (ps["case-studies"]?.slug?.trim() || "case-studies").replace(/^\/+/, "");

    // Services (admin-managed) — public detail pages
    for (const s of (content.servicesList || []).filter((x) => x.published)) {
      const cfg: any = ps[`svc:${s.slug}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const tail = (s.urlSlug && s.urlSlug.trim()) || s.slug;
      entries.push({ path: `/${servicesParent}/${tail}`, changefreq: cfg.changefreq || "monthly", priority: cfg.priority || "0.8" });
    }

    // Blog posts
    for (const p of posts) {
      const cfg: any = ps[`blog/${p.slug}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const publicSlug = (cfg.slug && String(cfg.slug).trim()) ? String(cfg.slug).trim().replace(/^\/+/, "") : p.slug;
      entries.push({ path: `/${blogParent}/${publicSlug}`, lastmod: p.date, changefreq: cfg.changefreq || "monthly", priority: cfg.priority || "0.7" });
    }

    // Portfolio items
    for (const it of portfolio) {
      const cfg: any = ps[`proj:${it.id}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const tail = (it.slug && it.slug.trim()) || it.id;
      entries.push({ path: `/${portfolioParent}/${tail}`, changefreq: cfg.changefreq || "monthly", priority: cfg.priority || "0.7" });
    }

    // Case studies
    for (const c of caseStudies) {
      const cfg: any = ps[`case:${c.id}`] || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const tail = (cfg.slug && String(cfg.slug).trim()) ? String(cfg.slug).trim().replace(/^\/+/, "") : c.id;
      entries.push({ path: `/${caseStudiesParent}/${tail}`, changefreq: cfg.changefreq || "monthly", priority: cfg.priority || "0.7" });
    }

    // Custom pages (with optional parent)
    for (const cp of customPages) {
      if (!cp.published || !cp.slug) continue;
      const cfg: any = cp.seo || {};
      if (cfg.status === "draft" || cfg.robots === "noindex") continue;
      const path = `/${cp.parent ? cp.parent + "/" : ""}${cp.slug.replace(/^\/+/, "")}`;
      entries.push({ path, changefreq: cfg.changefreq || "monthly", priority: cfg.priority || "0.6" });
    }

    const urls = entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${origin}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ].filter(Boolean).join("\n"),
    ).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  };
  const regenerateSitemap = () => setSeo((prev) => ({ ...prev, sitemap: buildSitemap(prev.canonicalUrl) }));

  // Auto-regenerate the admin-stored sitemap blob whenever any source of truth
  // changes (pages, slugs, posts, portfolio, services, custom pages, case studies).
  // The live `/sitemap.xml` edge function always rebuilds from DB, but this keeps
  // the admin preview / saved blob in sync so it never looks stale.
  useEffect(() => {
    if (!isAuthed && loading) return;
    if (!seo.autoSitemap) return;
    const next = buildSitemap(seo.canonicalUrl);
    if (next !== seo.sitemap) {
      setSeo((prev) => ({ ...prev, sitemap: next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    seo.autoSitemap, seo.pageSeo, seo.canonicalUrl, posts, portfolio, caseStudies, customPages,
    content.servicesList,
  ]);


  return (
    <Ctx.Provider
      value={{
        isAuthed, login, changeAdminPassword, logout, loading,
        posts, addPost, updatePost, deletePost,
        content, updateContent,
        contact, updateContact,
        portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
        seo, updateSeo, regenerateSitemap, buildSitemap, saveAllNow,
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
        reviews, addReview, approveReview, deleteReview,
        homeBlocks, setHomeBlock,
        homeFaqs, addHomeFaq, updateHomeFaq, deleteHomeFaq,
        serviceFaqs, addServiceFaq, updateServiceFaq, deleteServiceFaq,
        stats, addStat, updateStat, deleteStat,
        trustLogos, addTrustLogo, updateTrustLogo, deleteTrustLogo,
        caseStudies, addCaseStudy, updateCaseStudy, deleteCaseStudy,
        finalCta, updateFinalCta,
        servicePreviews, updateServicePreview,
        serviceContent, updateServiceContent,
        addService, updateService, deleteService,
        processFlow, updateProcessFlow, addProcessFlowStep, updateProcessFlowStep, deleteProcessFlowStep,
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
