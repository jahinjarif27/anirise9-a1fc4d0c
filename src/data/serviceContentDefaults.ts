// Default editable content for each service page. The admin can override any field
// from the dashboard; whatever is empty falls back to these defaults.

export type ServiceStat = { id: string; value: string; label: string };
export type ServiceWhyCard = { id: string; icon: string; title: string; desc: string };
export type ServiceProcessStep = { id: string; icon: string; title: string; desc: string };
export type ServiceDeliverable = { id: string; text: string };
export type ServiceChartBar = { id: string; name: string; value: number };
export type ServicePricingFeature = { id: string; text: string };
export type ServicePricingTier = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted: boolean;
  badge: string;
  icon: string;
  features: ServicePricingFeature[];
  ctaLabel: string;
  ctaUrl: string;
};
export type ServicePricing = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  blurb: string;
  tiers: ServicePricingTier[];
};

export type ServicePricingParagraphTab = { id: string; label: string };
export type ServicePricingParagraph = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  titleAccent: string;
  tabs: ServicePricingParagraphTab[];
  paragraph: string;
};


export type ServiceChart = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  paragraph?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bars: ServiceChartBar[];
};

/** Default paragraph shown next to the service performance chart when no override exists. */
export const DEFAULT_CHART_PARAGRAPH =
  "Every bar here ties back to a real client engagement — measured rankings, traffic, and revenue impact. See the full case-by-case breakdown of how we delivered these results in our portfolio.";
export const DEFAULT_CHART_CTA_LABEL = "See our work";
export const DEFAULT_CHART_CTA_URL = "/portfolio";

export type ServiceContent = {
  enabled: boolean;
  heroEyebrow: string;
  heroHeadlineBefore: string;
  heroHeadlineAccent: string;
  heroBlurb: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroSecondaryLabel: string;
  heroSecondaryUrl: string;
  stats: ServiceStat[];
  whyEyebrow: string;
  whyTitle: string;
  whyCards: ServiceWhyCard[];
  processEyebrow: string;
  processTitle: string;
  processSteps: ServiceProcessStep[];
  deliverablesEyebrow: string;
  deliverablesTitle: string;
  deliverablesBlurb: string;
  deliverables: ServiceDeliverable[];
  chart: ServiceChart;
  pricing: ServicePricing;
  pricingParagraph: ServicePricingParagraph;
  ctaHeadline: string;
  ctaBlurb: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Optional order of internal sections. Unknown/missing ids fall back to default order. */
  sectionOrder?: string[];
};

/** Canonical list of internal sections on a service page (in default order). */
export const SERVICE_SECTION_IDS = ["hero", "whyCards", "process", "deliverables", "pricing", "pricingParagraph", "chart", "faq", "cta"] as const;
export type ServiceSectionId = typeof SERVICE_SECTION_IDS[number];
export const SERVICE_SECTION_LABELS: Record<ServiceSectionId, string> = {
  hero: "Hero",
  whyCards: "Why cards",
  process: "Process",
  deliverables: "Deliverables",
  pricing: "Pricing",
  pricingParagraph: "Pricing paragraph",
  chart: "Chart",
  faq: "FAQ",
  cta: "CTA",
};


const blank: ServiceContent = {
  enabled: true,
  heroEyebrow: "",
  heroHeadlineBefore: "",
  heroHeadlineAccent: "",
  heroBlurb: "",
  heroPrimaryLabel: "Get a Free Audit",
  heroPrimaryUrl: "/#contact",
  heroSecondaryLabel: "See Our Process",
  heroSecondaryUrl: "#process",
  stats: [],
  whyEyebrow: "Why us",
  whyTitle: "What you get with AniRise",
  whyCards: [],
  processEyebrow: "Our Process",
  processTitle: "A clear path to results",
  processSteps: [],
  deliverablesEyebrow: "What you get",
  deliverablesTitle: "Everything you need to win",
  deliverablesBlurb: "",
  deliverables: [],
  chart: { enabled: false, eyebrow: "", title: "", subtitle: "", bars: [] },
  pricing: { enabled: false, eyebrow: "", title: "", blurb: "", tiers: [] },
  pricingParagraph: { enabled: false, eyebrow: "", title: "", titleAccent: "", tabs: [], paragraph: "" },

  ctaHeadline: "Ready to grow?",
  ctaBlurb: "Get a free audit — no commitment, no jargon.",
  ctaLabel: "Book Free Audit",
  ctaUrl: "/#contact",
};

export const defaultServiceContent: Record<string, ServiceContent> = {
  "website-seo": {
    ...blank,
    heroEyebrow: "Website SEO",
    heroHeadlineBefore: "Rank Higher.",
    heroHeadlineAccent: "Earn More.",
    heroBlurb:
      "We build SEO strategies that move the needle — not just rankings, but real traffic that converts into customers and revenue.",
    stats: [
      { id: "s1", value: "+187%", label: "Avg. organic traffic growth" },
      { id: "s2", value: "Top 3", label: "Google rankings achieved" },
      { id: "s3", value: "60+", label: "Keywords ranked per project" },
      { id: "s4", value: "4.2x", label: "Avg. ROI within 6 months" },
    ],
    whyEyebrow: "Why Website SEO",
    whyTitle: "Visibility, growth and authority",
    whyCards: [
      { id: "w1", icon: "Search", title: "Visibility", desc: "Show up where buyers search. We make Google understand and rank your site." },
      { id: "w2", icon: "TrendingUp", title: "Growth", desc: "Compounding organic traffic that grows month after month — without paying per click." },
      { id: "w3", icon: "Globe2", title: "Authority", desc: "Build a brand Google trusts and customers recognize as the expert in your space." },
    ],
    processEyebrow: "Our Process",
    processTitle: "A proven 5-step path to rankings",
    processSteps: [
      { id: "p1", icon: "FileSearch", title: "Audit & Discovery", desc: "Deep technical and content audit to find what's holding you back." },
      { id: "p2", icon: "Target", title: "Keyword Strategy", desc: "Find high-intent keywords your buyers actually search for." },
      { id: "p3", icon: "Gauge", title: "On-Page Optimization", desc: "Titles, meta, schema, internal linking, Core Web Vitals." },
      { id: "p4", icon: "Link2", title: "Authority Building", desc: "Quality backlinks and digital PR to grow domain authority." },
      { id: "p5", icon: "BarChart3", title: "Track & Iterate", desc: "Monthly reports with rankings, traffic, and revenue impact." },
    ],
    deliverablesEyebrow: "What you get",
    deliverablesTitle: "Everything you need to win on Google",
    deliverablesBlurb:
      "Each engagement is tailored, but here's what's typically included in a Website SEO partnership with AniRise.",
    deliverables: [
      { id: "d1", text: "Full technical SEO audit (PDF)" },
      { id: "d2", text: "Keyword research & content map" },
      { id: "d3", text: "On-page optimization for 20+ pages" },
      { id: "d4", text: "Schema markup & rich results setup" },
      { id: "d5", text: "Core Web Vitals & speed optimization" },
      { id: "d6", text: "Monthly ranking & traffic reports" },
      { id: "d7", text: "Competitor gap analysis" },
      { id: "d8", text: "Google Search Console & Analytics setup" },
    ],
    chart: {
      enabled: true,
      eyebrow: "Real Results",
      title: "Growth across recent clients",
      subtitle: "Snapshot of avg. metrics our SEO clients see within 6 months.",
      bars: [
        { id: "b1", name: "Traffic %", value: 187 },
        { id: "b2", name: "Keywords", value: 62 },
        { id: "b3", name: "Leads %", value: 145 },
        { id: "b4", name: "Revenue %", value: 220 },
      ],
    },
    pricingParagraph: {
      enabled: true,
      eyebrow: "",
      title: "Our",
      titleAccent: "SEO Values",
      tabs: [
        { id: "t1", label: "SEO Pricing" },
        { id: "t2", label: "Reporting" },
        { id: "t3", label: "Accountability" },
      ],
      paragraph:
        "Our SEO packages are customized for your goals. We definitely don't offer the cheapest services out there, but we do offer the most value for your money. Many factors determine the SEO pricing. For example, the SEO pricing in Bangladesh is not the same as the SEO pricing in the USA. The price also depends on your current keyword positions, the nature of keywords, the landing page strategy, business location, and many more. Our SEO packages cost starts from $500/month in the BD market for small businesses and goes up from there for medium and large businesses.",
    },
    ctaHeadline: "Ready to outrank your competition?",
    ctaBlurb: "Get a free SEO audit — no commitment, no jargon. Just clear next steps.",
    ctaLabel: "Book Free Audit",
    ctaUrl: "/#contact",
  },

  "ecommerce-seo": {
    ...blank,
    heroEyebrow: "Ecommerce SEO",
    heroHeadlineBefore: "Turn Product Searches Into",
    heroHeadlineAccent: "Sales.",
    heroBlurb:
      "AniRise helps online stores rank for buyer-intent keywords, clean up product architecture, and convert organic visitors into paying customers.",
    heroPrimaryLabel: "Grow my store",
    heroSecondaryLabel: "View deliverables",
    heroSecondaryUrl: "#deliverables",
    stats: [
      { id: "s1", value: "+86%", label: "Category rankings" },
      { id: "s2", value: "+142%", label: "Product clicks" },
      { id: "s3", value: "+64%", label: "Organic revenue" },
      { id: "s4", value: "3x", label: "Avg. ROI" },
    ],
    whyEyebrow: "Store growth system",
    whyTitle: "SEO built around products, categories, and checkout value",
    whyCards: [
      { id: "w1", icon: "PackageSearch", title: "Product discovery", desc: "Optimize product titles, filters, collections, and category intent so buyers find items faster." },
      { id: "w2", icon: "Tags", title: "Revenue keywords", desc: "Target search terms with clear buying intent instead of chasing vanity traffic." },
      { id: "w3", icon: "Star", title: "Rich results", desc: "Add product, review, offer, and breadcrumb schema for stronger Google visibility." },
      { id: "w4", icon: "BarChart3", title: "Conversion tracking", desc: "Measure rankings, clicks, carts, and sales impact in one simple reporting flow." },
    ],
    processSteps: [
      { id: "p1", icon: "FileSearch", title: "Store audit", desc: "Full technical + content audit of your store." },
      { id: "p2", icon: "Target", title: "Buyer-intent keywords", desc: "Map revenue keywords to categories and products." },
      { id: "p3", icon: "Gauge", title: "Optimize", desc: "Titles, meta, schema, internal linking, speed." },
      { id: "p4", icon: "BarChart3", title: "Track revenue", desc: "Monthly reports tied to organic sales." },
    ],
    deliverables: [
      { id: "d1", text: "Ecommerce technical SEO audit" },
      { id: "d2", text: "Product and category keyword map" },
      { id: "d3", text: "Collection-page structure plan" },
      { id: "d4", text: "Product schema and rich-snippet setup" },
      { id: "d5", text: "Duplicate-content and filter-indexing fixes" },
      { id: "d6", text: "Monthly revenue-focused SEO report" },
    ],
    chart: {
      enabled: true,
      eyebrow: "Store Performance",
      title: "Revenue lift after our work",
      subtitle: "Average results across recent ecommerce engagements.",
      bars: [
        { id: "b1", name: "Category Rank", value: 86 },
        { id: "b2", name: "Product Clicks", value: 142 },
        { id: "b3", name: "Organic Rev %", value: 64 },
      ],
    },
    pricingParagraph: {
      enabled: true,
      eyebrow: "",
      title: "Our",
      titleAccent: "Ecommerce SEO Values",
      tabs: [
        { id: "t1", label: "Ecommerce Pricing" },
        { id: "t2", label: "Reporting" },
        { id: "t3", label: "Accountability" },
      ],
      paragraph:
        "Our Ecommerce SEO packages are customized for your store, catalog size, and target markets. We don't offer the cheapest service out there, but we do deliver the highest value per dollar. Pricing depends on the platform, number of products, current ranking positions, competition level, and the scope of optimization required. Ecommerce SEO packages typically start from $600/month for small stores and scale up for larger catalogs and competitive niches — always tied to measurable revenue impact, never vanity metrics.",
    },
    ctaHeadline: "Want more buyers from organic search?",
    ctaBlurb: "Let's map your highest-value products and categories into an SEO growth plan.",
    ctaLabel: "Request ecommerce audit",
  },

  "graphics-design": {
    ...blank,
    heroEyebrow: "Graphics Design",
    heroHeadlineBefore: "Visuals That Make Your Brand",
    heroHeadlineAccent: "Recognizable.",
    heroBlurb:
      "AniRise creates clean, strategic graphics for social media, campaigns, and brand identity — designed to look premium and convert attention into action.",
    heroPrimaryLabel: "Start a design project",
    heroSecondaryLabel: "See scope",
    heroSecondaryUrl: "#design-work",
    whyEyebrow: "Creative scope",
    whyTitle: "Design support for every growth channel",
    whyCards: [
      { id: "w1", icon: "Palette", title: "Brand identity", desc: "Logo direction, color system, typography, and visual rules that make your brand memorable." },
      { id: "w2", icon: "Image", title: "Social creatives", desc: "Facebook and Instagram post designs, ad banners, stories, and campaign visuals." },
      { id: "w3", icon: "LayoutGrid", title: "Marketing assets", desc: "Flyers, covers, thumbnails, presentation graphics, and launch visuals for every channel." },
    ],
    processSteps: [],
    deliverables: [
      { id: "d1", text: "Logo and brand refresh concepts" },
      { id: "d2", text: "Social media post templates" },
      { id: "d3", text: "Ad creative variations" },
      { id: "d4", text: "Business card and print-ready files" },
      { id: "d5", text: "Campaign visual direction" },
      { id: "d6", text: "Editable source-file handoff" },
    ],
    ctaHeadline: "Let's design something memorable",
    ctaBlurb: "Tell us about your brand and we'll send back a creative direction within 48 hours.",
    ctaLabel: "Start your design project",
  },
  "website-development": {
    ...blank,
    heroEyebrow: "Website Development",
    heroHeadlineBefore: "Fast, Modern Websites Built To",
    heroHeadlineAccent: "Convert.",
    heroBlurb:
      "Mobile-first websites engineered for speed, SEO, and a seamless brand experience.",
    whyCards: [],
    deliverables: [
      { id: "d1", text: "Custom design system" },
      { id: "d2", text: "Mobile-first responsive build" },
      { id: "d3", text: "Core Web Vitals optimization" },
      { id: "d4", text: "On-page SEO setup" },
      { id: "d5", text: "Analytics & conversion tracking" },
      { id: "d6", text: "Post-launch support" },
    ],
    pricing: {
      enabled: true,
      eyebrow: "Pricing",
      title: "Choose The Plan That Fits Your Business",
      blurb: "Transparent, all-inclusive packages. No hidden fees — pick a tier and we'll have your site live in weeks.",
      tiers: [
        {
          id: "t1",
          name: "Basic",
          price: "$299",
          period: "/ project",
          description: "A clean, professional starter site for new brands.",
          highlighted: false,
          badge: "",
          icon: "Rocket",
          ctaLabel: "Get Started",
          ctaUrl: "/#contact",
          features: [
            { id: "f1", text: "Up to 5 pages" },
            { id: "f2", text: "Mobile responsive design" },
            { id: "f3", text: "Basic on-page SEO" },
            { id: "f4", text: "Contact form" },
            { id: "f5", text: "1 round of revisions" },
          ],
        },
        {
          id: "t2",
          name: "Standard",
          price: "$699",
          period: "/ project",
          description: "Everything growing businesses need to convert visitors.",
          highlighted: true,
          badge: "Most Popular",
          icon: "Zap",
          ctaLabel: "Choose Standard",
          ctaUrl: "/#contact",
          features: [
            { id: "f1", text: "Up to 12 pages" },
            { id: "f2", text: "Custom design system" },
            { id: "f3", text: "Advanced SEO + schema" },
            { id: "f4", text: "Blog / CMS setup" },
            { id: "f5", text: "Analytics & tracking" },
            { id: "f6", text: "3 rounds of revisions" },
          ],
        },
        {
          id: "t3",
          name: "Premium",
          price: "$1,499",
          period: "/ project",
          description: "Tailor-made build for ecommerce & high-traffic brands.",
          highlighted: false,
          badge: "",
          icon: "Crown",
          ctaLabel: "Talk To Us",
          ctaUrl: "/#contact",
          features: [
            { id: "f1", text: "Unlimited pages" },
            { id: "f2", text: "Ecommerce / booking setup" },
            { id: "f3", text: "Performance & Core Web Vitals" },
            { id: "f4", text: "Conversion-focused copy" },
            { id: "f5", text: "Priority support 30 days" },
            { id: "f6", text: "Unlimited revisions" },
          ],
        },
      ],
    },
  },
  "social-media-marketing": {
    ...blank,
    heroEyebrow: "Social Media Marketing",
    heroHeadlineBefore: "Grow Your Audience &",
    heroHeadlineAccent: "Drive Sales.",
    heroBlurb:
      "Content and ad campaigns on Facebook & Instagram that build community and convert.",
    deliverables: [
      { id: "d1", text: "Content calendar" },
      { id: "d2", text: "Post & reel creatives" },
      { id: "d3", text: "Paid ad campaigns" },
      { id: "d4", text: "Audience targeting & retargeting" },
      { id: "d5", text: "Monthly performance report" },
    ],
  },
  "digital-marketing": {
    ...blank,
    heroEyebrow: "Digital Marketing",
    heroHeadlineBefore: "Full-Funnel Growth.",
    heroHeadlineAccent: "Measured ROI.",
    heroBlurb:
      "Search, social, and email campaigns — measured, optimized, and engineered for return on investment.",
    deliverables: [
      { id: "d1", text: "Marketing strategy & funnel design" },
      { id: "d2", text: "Google Ads / Meta Ads management" },
      { id: "d3", text: "Email automation flows" },
      { id: "d4", text: "Landing page conversion optimization" },
      { id: "d5", text: "Monthly ROI report" },
    ],
  },
};
