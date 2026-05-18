import { createClient } from '@supabase/supabase-js';
const url = 'https://xlrmuspmekwbtnyeutxz.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key);
const { data, error } = await sb.from('site_settings').select('portfolio').eq('id', 1).single();
if (error) { console.error(error); process.exit(1); }
const enrich = {
  p1: {
    description: "Shopify store er full SEO overhaul — product schema, faceted nav fix, ar conversion-focused copy diye revenue dramatic boost.",
    eyebrow: "Shopify · Fashion retail",
    intro: "Ekta mid-size Shopify fashion store-er jonno 6-mash er end-to-end SEO + CRO project — technical cleanup theke shuru kore product page rewrite ar internal linking, sob kichu pure data-driven.",
    client: "Aurelle Apparel", role: "Lead SEO & CRO partner", timeline: "Jan 2025 – Jun 2025", liveUrl: "",
    overview: "Store ti 20,000+ SKU niye chhilo kintu duplicate content, slow LCP ar broken faceted URLs er karone organic visibility prai flat chhilo. Goal chhilo 6 maser moddhe organic revenue minimum 2x kora.",
    approach: "Phase 1 — Technical audit, canonical fix, image CDN ar Core Web Vitals tuning.\nPhase 2 — Product/category copy rewrite with schema (Product, BreadcrumbList, FAQ).\nPhase 3 — Internal linking hubs + 24 ta buyer-intent blog post.\nPhase 4 — CRO: PDP redesign, sticky ATC, ar trust badges.",
    outcome: "Organic revenue 2.6x, transaction count 3.1x, ar avg LCP 4.8s theke 1.9s e neme esheche. Brand ekhon non-brand keyword e top-3 te 64 ta term er jonno rank kortese.",
    techStack: ["Shopify Plus", "Liquid", "Klaviyo", "GA4", "Search Console", "Ahrefs", "Screaming Frog"],
    deliverables: ["120-page technical SEO audit","Product & category schema rollout","24 buyer-intent blog posts","PDP redesign + sticky ATC","Monthly performance dashboard"],
    metrics: [
      { id: "m1", label: "Organic revenue", value: "+162%" },
      { id: "m2", label: "Organic transactions", value: "3.1x" },
      { id: "m3", label: "LCP (mobile)", value: "4.8s → 1.9s" },
      { id: "m4", label: "Top-3 keywords", value: "8 → 64" },
    ],
    chart: { title: "Monthly organic revenue (USD)", type: "area", data: [
      { id:"c1",label:"Jan",value:12400},{id:"c2",label:"Feb",value:15800},{id:"c3",label:"Mar",value:19200},
      { id:"c4",label:"Apr",value:24500},{id:"c5",label:"May",value:28700},{id:"c6",label:"Jun",value:32400}]},
    table: { title: "Core Web Vitals — before vs after", headers: ["Metric","Before","After","Δ"], rows: [
      ["LCP (mobile)","4.8s","1.9s","-60%"],["CLS","0.28","0.04","-86%"],["INP","420ms","180ms","-57%"],["Indexed pages","8,400","14,200","+69%"]]},
  },
  p2: {
    description: "Competitive B2B SaaS keyword er jonno 90-din-er sprint — content cluster + digital PR diye position #1.",
    eyebrow: "B2B SaaS · 90-day sprint",
    intro: "Ekta project management SaaS-er flagship keyword (\"team workflow software\") page-9 theke page-1 e ana hoyeche — only 90 din e, paid push chhara.",
    client: "Lattice PM", role: "SEO strategist & content lead", timeline: "90 days", liveUrl: "",
    overview: "Target keyword er monthly search volume 18,000 chhilo kintu competition extremely high (KD 72). Strategy chhilo topical authority + earned backlinks er moddhe organic SERP dominance.",
    approach: "Week 1-2 — SERP gap analysis, intent mapping.\nWeek 3-6 — Pillar page rewrite (4,200 words) + 11 supporting cluster posts.\nWeek 7-10 — Digital PR outreach, 28 referring domains earned.\nWeek 11-13 — Internal link sculpting + featured snippet optimization.",
    outcome: "Target keyword position 87 → 1, featured snippet captured, ar 14 ta related keyword o top-10 e enter koreche. Organic signup 4.5x.",
    techStack: ["Webflow","HubSpot","Ahrefs","Surfer SEO","Pitchbox","GA4"],
    deliverables: ["Pillar + 11 cluster pages","28 earned backlinks","Featured snippet capture","Internal linking blueprint"],
    metrics: [
      { id:"m1", label:"Target keyword", value:"#87 → #1" },
      { id:"m2", label:"Referring domains", value:"+28" },
      { id:"m3", label:"Organic signups", value:"4.5x" },
      { id:"m4", label:"DR increase", value:"41 → 56" },
    ],
    chart: { title: "Target keyword position (lower is better)", type: "area", data: [
      {id:"c1",label:"W2",value:87},{id:"c2",label:"W4",value:62},{id:"c3",label:"W6",value:38},
      {id:"c4",label:"W8",value:19},{id:"c5",label:"W10",value:7},{id:"c6",label:"W12",value:2},{id:"c7",label:"W13",value:1}]},
    table: { title: "Cluster performance snapshot", headers:["Page","Sessions / mo","Top position"], rows:[
      ["Pillar — team workflow software","11,400","1"],["Cluster — kanban for remote teams","3,200","4"],
      ["Cluster — async standup tools","2,100","6"],["Cluster — sprint planning guide","1,850","3"]]},
  },
  p3: {
    description: "Legacy WordPress site theke modern headless Next.js stack e migration — speed, conversion ar SEO all-in-one.",
    eyebrow: "Web · Headless rebuild",
    intro: "Ekta professional services firm-er 10-bochor purono WordPress site ke headless architecture e migrate kora hoyeche — design system, performance, ar conversion sob kichu ek shathe rebuild.",
    client: "Northwind Consulting", role: "Design + engineering lead", timeline: "10 weeks", liveUrl: "",
    overview: "Purono site er Lighthouse score 38 chhilo, mobile conversion 0.6%, ar editor ra content update korte CMS struggle korten. Goal — fast, modern, easy-to-edit, ar SEO retain.",
    approach: "Discovery — stakeholder interview + analytics audit.\nDesign — token-based design system in Figma.\nBuild — Next.js + Sanity CMS, ISR for speed.\nMigration — 301 map for 240 URLs, zero ranking loss.",
    outcome: "Lighthouse 38 → 98, mobile conversion 0.6% → 2.1%, ar editor publish time 25 min theke 4 min e neme esheche. Organic traffic relaunch er por o steady — kono drop nei.",
    techStack: ["Next.js 14","Sanity CMS","Tailwind","Vercel","Figma","TypeScript"],
    deliverables: ["Figma design system","Headless Next.js build","Sanity CMS schema","301 redirect map (240 URLs)","Editor training docs"],
    metrics: [
      { id:"m1", label:"Lighthouse score", value:"38 → 98" },
      { id:"m2", label:"Mobile conversion", value:"0.6% → 2.1%" },
      { id:"m3", label:"Publish time", value:"25m → 4m" },
      { id:"m4", label:"Organic traffic", value:"Held +6%" },
    ],
    chart: { title: "Lighthouse score across launch", type: "bar", data: [
      {id:"c1",label:"Old site",value:38},{id:"c2",label:"Beta",value:72},{id:"c3",label:"Launch",value:94},{id:"c4",label:"Post-tune",value:98}]},
    table: { title: "Stack comparison", headers:["Area","Before","After"], rows:[
      ["Frontend","WordPress theme","Next.js 14 (App Router)"],["CMS","WP Admin","Sanity Studio"],
      ["Hosting","Shared LAMP","Vercel Edge"],["Build time","n/a","42s"],["Avg TTFB","1.4s","180ms"]]},
  },
};
const merged = data.portfolio.map(p => {
  const extra = enrich[p.id];
  if (!extra) return p;
  const gallery = [{ id: "g1", image: p.image, alt: p.imageAlt || p.title }];
  return { ...p, ...extra, gallery };
});
const { error: uerr } = await sb.from('site_settings').update({ portfolio: merged }).eq('id', 1);
if (uerr) { console.error(uerr); process.exit(1); }
console.log('Updated', merged.length, 'projects');
