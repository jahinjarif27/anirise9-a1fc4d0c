// Default deep-dive paragraphs and headings for each service.
// Used as fallback in admin editor AND on the public /services page.

import type { ServicePreview } from "@/context/AdminContext";

export const defaultServicePreviews: Record<string, ServicePreview> = {
  "website-seo": {
    image: "",
    imageAlt: "Website SEO dashboard showing keyword rankings and organic traffic growth",
    title: "Website SEO that earns lasting visibility",
    desc:
      "Your website is the foundation of every digital touchpoint — and **Website SEO** is what makes it actually findable. We start with a deep technical audit to fix crawl issues, broken links, slow pages, and weak metadata. Then we research the keywords your real customers are typing into Google and map them across the right pages so each one has a clear purpose. From there we strengthen on-page content, internal links, schema markup, and site architecture so search engines understand exactly what you offer. Over the long run we build topical authority through high-quality content and trusted backlinks. The result isn't a one-time traffic bump — it's compounding organic visibility that brings in qualified leads month after month, without paying for every click.",
  },
  "ecommerce-seo": {
    image: "",
    imageAlt: "Ecommerce product pages optimized for search with structured data",
    title: "Ecommerce SEO built to grow revenue",
    desc:
      "Selling online means competing with thousands of stores for the same buyers. Our **Ecommerce SEO** approach is engineered to put your products in front of shoppers who are ready to purchase. We optimize product titles, descriptions, images, and category pages around high-intent keywords, then layer in product schema, review markup, and breadcrumbs so your listings stand out in search results. We fix duplicate content, faceted-navigation issues, and indexation bloat that quietly bleed traffic. On top of that we build content hubs around buying guides, comparisons, and seasonal trends to capture customers earlier in the funnel. The outcome: more organic sessions, higher click-through rates from search, and a steady lift in revenue without depending entirely on paid ads.",
  },
  "website-development": {
    image: "",
    imageAlt: "Modern responsive website on desktop and mobile devices",
    title: "Websites engineered for speed and conversions",
    desc:
      "A beautiful website that loads slowly or breaks on mobile costs you customers every day. We build **fast, modern, mobile-first websites** using React, Tailwind, and best-in-class performance practices so your site scores high on Core Web Vitals and feels instant on any device. Every page is structured for SEO from day one — clean semantic markup, optimized images, proper headings, and lightning-fast load times. We design with conversion in mind: clear hierarchy, strong calls-to-action, trust signals, and frictionless contact paths that turn visitors into leads. Whether you need a polished marketing site, a service business hub, or a fully custom platform, we ship something you'll be proud to share — and something Google loves to rank.",
  },
  "social-media-marketing": {
    image: "",
    imageAlt: "Social media content calendar and engagement analytics dashboard",
    title: "Social media that builds community and sales",
    desc:
      "Social media isn't just about posting — it's about showing up consistently with content that actually resonates. Our **Social Media Marketing** service combines strategy, creative, and paid amplification to grow your presence on Facebook and Instagram. We start by understanding your audience and what makes them stop scrolling, then craft a content calendar of reels, carousels, stories, and posts that tell your brand story. We pair organic content with smart ad campaigns — retargeting warm visitors, prospecting lookalike audiences, and testing creative weekly to drive down cost-per-result. You get a real community of engaged followers, more inbound DMs, and a measurable stream of sales coming directly from social — not vanity metrics on a slide deck.",
  },
  "graphics-design": {
    image: "",
    imageAlt: "Brand identity design samples including logo, colors, and marketing creatives",
    title: "Graphics design that makes your brand unmistakable",
    desc:
      "Great design is what makes a brand feel trustworthy in three seconds or less. Our **Graphics Design** service gives you a complete visual identity — logo, color system, typography, and brand guidelines — that stays consistent across every touchpoint, from your website to your packaging. Beyond identity, we produce the day-to-day creatives that keep your marketing alive: social posts, ad creatives, banners, presentations, brochures, and product mockups. Every piece is designed with intent: clear hierarchy, strong contrast, and on-brand visuals that drive attention to the message that matters. Whether you're launching a new brand or refreshing an existing one, we make sure your business looks as professional and premium as it actually is — so customers take you seriously from the first impression.",
  },
  "digital-marketing": {
    image: "",
    imageAlt: "Digital marketing funnel showing search, social, and email channels with ROI metrics",
    title: "Digital marketing that delivers measurable ROI",
    desc:
      "**Digital Marketing** done right means every dollar you spend is tracked, tested, and optimized. We run full-funnel campaigns across Google Search, Meta Ads, YouTube, and email — connected by a shared strategy instead of disconnected silos. Top of funnel, we use search and social to put your brand in front of the right people. In the middle, we retarget visitors with personalized content and offers that nudge them toward action. At the bottom, we run conversion campaigns and email sequences that turn warm leads into paying customers. Every campaign is wired to clean analytics so you see real numbers: cost per lead, return on ad spend, lifetime value — not just clicks and impressions. The goal isn't activity; it's profitable, repeatable growth you can actually scale.",
  },
};
