// Default editable content for each service page. The admin can override any field
// from the dashboard; whatever is empty falls back to these defaults.

export type ServiceStat = { id: string; value: string; label: string };
export type ServiceWhyCard = { id: string; icon: string; title: string; desc: string };
export type ServiceProcessStep = { id: string; icon: string; title: string; desc: string };
export type ServiceDeliverable = { id: string; text: string };
export type ServiceChartBar = { id: string; name: string; value: number };

export type ServiceChart = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  bars: ServiceChartBar[];
};

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
  ctaHeadline: string;
  ctaBlurb: string;
  ctaLabel: string;
  ctaUrl: string;
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
