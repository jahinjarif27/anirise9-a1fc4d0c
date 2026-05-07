import { Search, ShoppingCart, Code2, Megaphone, PenTool, Smartphone, LucideIcon } from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const services: Service[] = [
  { slug: "website-seo", icon: Search, title: "Website SEO",
    desc: "Rank higher on Google. We optimize your site's structure, content, and authority to drive organic traffic that converts." },
  { slug: "ecommerce-seo", icon: ShoppingCart, title: "Ecommerce SEO",
    desc: "Get your products in front of buyers. Product-page optimization, schema, and category strategy built to scale revenue." },
  { slug: "website-development", icon: Code2, title: "Website Development",
    desc: "Fast, modern, mobile-first websites engineered for performance, conversions, and a seamless brand experience." },
  { slug: "social-media-marketing", icon: Megaphone, title: "Social Media Marketing",
    desc: "Grow your audience on Facebook & Instagram with content and ad campaigns that build community and drive sales." },
  { slug: "graphics-design", icon: PenTool, title: "Graphics Design",
    desc: "Eye-catching visuals, brand identity, and marketing creatives that make your brand instantly recognizable." },
  { slug: "digital-marketing", icon: Smartphone, title: "Digital Marketing",
    desc: "Full-funnel campaigns across search, social, and email — measured, optimized, and engineered for ROI." },
];
