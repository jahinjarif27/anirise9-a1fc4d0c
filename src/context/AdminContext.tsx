import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { BlogPost } from "@/data/blog";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-illustration.jpg";
import logoImg from "@/assets/anirise-logo.jpg";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { defaultServiceContent, ServiceContent } from "@/data/serviceContentDefaults";
export type { ServiceContent } from "@/data/serviceContentDefaults";

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
  image: string;
  imageAlt: string;
  tag: string;
  category?: string;
  title: string;
  description?: string;
  body?: string;
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

export type PageSeo = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export type CustomPageSection = { id: string; title: string; body: string };

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
  // rich page-builder fields (all optional)
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
export type ServicePreview = { image: string; imageAlt: string };
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
  blog: "home", testimonials: "", contact: "",
};
const defaultHomeMembership: Record<SectionKey, boolean> = {
  hero: true, services: false, about: false, portfolio: false, blog: true, testimonials: false, contact: false,
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
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(defaultPortfolio);
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
  const [homeFaqs, setHomeFaqs] = useState<FaqItem[]>(defaultHomeFaqs);
  const [serviceFaqs, setServiceFaqs] = useState<Record<string, FaqItem[]>>(defaultServiceFaqs);
  const [stats, setStats] = useState<StatItem[]>(defaultStats);
  const [trustLogos, setTrustLogos] = useState<TrustLogo[]>(defaultTrustLogos);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(defaultCaseStudies);
  const [finalCta, setFinalCta] = useState<FinalCta>(defaultFinalCta);
  const [servicePreviews, setServicePreviews] = useState<Record<string, ServicePreview>>({});
  const [serviceContent, setServiceContent] = useState<Record<string, ServiceContent>>(defaultServiceContent);
  const [processFlow, setProcessFlow] = useState<ProcessFlow>(defaultProcessFlow);

  // Prevent the initial DB-load setState from triggering a save back to DB
  const hydrated = useRef(false);

  // ---------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      const [settingsRes, postsRes, leadsRes, visitsRes, reviewsRes] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("blog_posts").select("*").order("date", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("page_visits").select("created_at, visitor_id").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
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
        const sa = s as any;
        if (sa.home_blocks && Object.keys(sa.home_blocks).length) setHomeBlocks({ ...defaultHomeBlocks, ...sa.home_blocks });
        if (Array.isArray(sa.home_faqs) && sa.home_faqs.length) setHomeFaqs(sa.home_faqs);
        if (sa.service_faqs && Object.keys(sa.service_faqs).length) setServiceFaqs({ ...defaultServiceFaqs, ...sa.service_faqs });
        if (Array.isArray(sa.stats) && sa.stats.length) setStats(sa.stats);
        if (Array.isArray(sa.trust_logos) && sa.trust_logos.length) setTrustLogos(sa.trust_logos);
        if (Array.isArray(sa.case_studies) && sa.case_studies.length) setCaseStudies(sa.case_studies);
        if (sa.final_cta && Object.keys(sa.final_cta).length) setFinalCta({ ...defaultFinalCta, ...sa.final_cta });
        if (sa.service_previews && Object.keys(sa.service_previews).length) setServicePreviews(sa.service_previews);
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
      }
      if (postsRes.data) setPosts(postsRes.data.map(fromDbPost));
      if (leadsRes.data) setLeads(leadsRes.data.map(fromDbLead));
      if (reviewsRes.data) setReviews(reviewsRes.data.map((r: any) => ({
        id: r.id, name: r.name, role: r.role ?? "", quote: r.quote,
        rating: r.rating ?? 5, approved: !!r.approved,
        createdAt: new Date(r.created_at).getTime(),
      })));
      if (visitsRes.data) {
        // Unique visitors (30d): distinct visitor_id, falling back to row id for legacy rows.
        const uniqueIds = new Set<string>();
        visitsRes.data.forEach((v: any, i: number) => uniqueIds.add(v.visitor_id || `legacy-${i}`));
        setVisits(uniqueIds.size);

        // Daily unique visitors for last 14 days
        const buckets: Record<string, Set<string>> = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
          buckets[d] = new Set();
        }
        visitsRes.data.forEach((v: any, i: number) => {
          const d = new Date(v.created_at).toISOString().slice(0, 10);
          if (d in buckets) buckets[d].add(v.visitor_id || `legacy-${i}`);
        });
        setVisitSeries(Object.entries(buckets).map(([day, set]) => ({ day: day.slice(5), visits: set.size })));
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
        home_blocks: homeBlocks as any,
        home_faqs: homeFaqs as any,
        service_faqs: serviceFaqs as any,
        stats: stats as any,
        trust_logos: trustLogos as any,
        case_studies: caseStudies as any,
        final_cta: finalCta as any,
        service_previews: servicePreviews as any,
        service_content: serviceContent as any,
        process_flow: processFlow as any,
        updated_at: new Date().toISOString(),
      }).eq("id", 1).then(({ error }) => {
        if (error) console.error("[site_settings] save failed", error);
      });
    }, 500);
  }, [content, contact, portfolio, seo, appearance, customPages, homeSections, sectionGroups, pageLocation, homeMembership, homeBlocks, homeFaqs, serviceFaqs, stats, trustLogos, caseStudies, finalCta, servicePreviews, serviceContent, processFlow]);

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
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    supabase.functions.invoke("notify-admin", {
      body: {
        subject: `New Lead: ${l.name}`,
        html: `<h2>New Strategy Call Request</h2>
<p><b>Name:</b> ${esc(l.name)}</p>
<p><b>Email:</b> ${esc(l.email)}</p>
<p><b>Phone:</b> ${esc(l.phone)}</p>
<p><b>Service:</b> ${esc(l.service || "-")}</p>
<p><b>Message:</b><br/>${esc(l.message || "-").replace(/\n/g, "<br/>")}</p>`,
      },
    }).catch((e) => console.error("notify-admin failed", e));
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

  // Reviews (DB-backed)
  const addReview = async (r: Omit<Review, "id" | "createdAt" | "approved">) => {
    const { data, error } = await supabase.from("reviews").insert({
      name: r.name, role: r.role, quote: r.quote, rating: r.rating, approved: false,
    }).select().single();
    if (error || !data) { console.error(error); return; }
    setReviews((prev) => [{
      id: data.id, name: data.name, role: data.role ?? "", quote: data.quote,
      rating: data.rating ?? 5, approved: !!data.approved,
      createdAt: new Date(data.created_at).getTime(),
    }, ...prev]);
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    supabase.functions.invoke("notify-admin", {
      body: {
        subject: `New Review (${r.rating}★) from ${r.name}`,
        html: `<h2>New Review Submitted</h2>
<p><b>Name:</b> ${esc(r.name)}</p>
<p><b>Role:</b> ${esc(r.role || "-")}</p>
<p><b>Rating:</b> ${r.rating} / 5</p>
<p><b>Review:</b><br/>${esc(r.quote).replace(/\n/g, "<br/>")}</p>
<p style="color:#666;font-size:13px">Pending approval in admin panel.</p>`,
      },
    }).catch((e) => console.error("notify-admin failed", e));
  };
  const approveReview = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
    if (error) return console.error(error);
    setReviews((prev) => prev.map((x) => (x.id === id ? { ...x, approved } : x)));
  };
  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return console.error(error);
    setReviews((prev) => prev.filter((x) => x.id !== id));
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
    setServicePreviews((prev) => ({ ...prev, [slug]: { image: "", imageAlt: "", ...(prev[slug] || {}), ...sp } }));
  const updateServiceContent = (slug: string, patch: Partial<ServiceContent>) =>
    setServiceContent((prev) => {
      const base = prev[slug] ?? defaultServiceContent[slug] ?? defaultServiceContent["website-seo"];
      return { ...prev, [slug]: { ...base, ...patch } };
    });

  const updateProcessFlow = (patch: Partial<ProcessFlow>) => setProcessFlow((prev) => ({ ...prev, ...patch }));
  const addProcessFlowStep = () =>
    setProcessFlow((prev) => ({ ...prev, steps: [...prev.steps, { id: newId(), icon: "Sparkles", title: "New step", chip: "Tag" }] }));
  const updateProcessFlowStep = (id: string, patch: Partial<ProcessFlowStep>) =>
    setProcessFlow((prev) => ({ ...prev, steps: prev.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const deleteProcessFlowStep = (id: string) =>
    setProcessFlow((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.id !== id) }));

  const buildSitemap = (base: string, slugs: string[], customSlugs: string[]) => {
    const staticPaths = ["/", "/services", "/portfolio", "/testimonials", "/contact", "/blog", "/services/website-seo", "/services/ecommerce-seo", "/services/graphics-design"];
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
