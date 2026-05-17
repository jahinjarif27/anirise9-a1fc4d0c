export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  cover: string;
  coverAlt?: string;
  ctaEnabled?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  body?: string;
};

export const initialPosts: BlogPost[] = [
  {
    id: "1",
    slug: "seo-checklist-2026",
    title: "The 2026 SEO Checklist: 12 Wins You Can Ship This Week",
    excerpt: "From Core Web Vitals to AI-overview optimization — the high-impact SEO moves that actually move rankings in 2026.",
    category: "SEO",
    author: "AniRise Team",
    date: "2026-04-18",
    readTime: "7 min",
    cover: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80",
  },
  {
    id: "2",
    slug: "ecommerce-product-pages",
    title: "How We Doubled an Ecommerce Store's Revenue with Product-Page SEO",
    excerpt: "A step-by-step breakdown of the schema, content, and CRO tweaks that turned organic visitors into buyers.",
    category: "Ecommerce",
    author: "AniRise Team",
    date: "2026-04-10",
    readTime: "9 min",
    cover: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&q=80",
  },
  {
    id: "3",
    slug: "facebook-ads-small-budget",
    title: "Running Facebook Ads on a Small Budget Without Burning Cash",
    excerpt: "Audience structure, creative testing, and the campaign setup we use for sub-$500/mo ad spends.",
    category: "Marketing",
    author: "AniRise Team",
    date: "2026-04-02",
    readTime: "6 min",
    cover: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
  },
];
