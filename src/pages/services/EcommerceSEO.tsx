import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, PackageSearch, Search, ShoppingCart, Star, Tags, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceLayout } from "./ServiceLayout";
import { ServiceFAQ } from "@/components/site/ServiceFAQ";

const focusAreas = [
  { icon: PackageSearch, title: "Product discovery", desc: "Optimize product titles, filters, collections, and category intent so buyers find the right items faster." },
  { icon: Tags, title: "Revenue keywords", desc: "Target search terms with clear buying intent instead of chasing vanity traffic." },
  { icon: Star, title: "Rich results", desc: "Add product, review, offer, and breadcrumb schema for stronger Google visibility." },
  { icon: BarChart3, title: "Conversion tracking", desc: "Measure rankings, product clicks, carts, and sales impact in one simple reporting flow." },
];

const deliverables = [
  "Ecommerce technical SEO audit",
  "Product and category keyword map",
  "Collection-page structure plan",
  "Product schema and rich-snippet setup",
  "Duplicate-content and filter-indexing fixes",
  "Monthly revenue-focused SEO report",
];

const EcommerceSEOPage = () => (
  <ServiceLayout
    title="Ecommerce SEO"
    description="Ecommerce SEO that turns product searches into sales — product schema, category structure, and revenue keywords for Shopify, WooCommerce, and custom stores."
    path="/services/ecommerce-seo"
  >
    <section className="bg-gradient-hero py-20 lg:py-28 overflow-hidden">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">Ecommerce SEO</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
            Turn Product Searches Into <span className="text-gradient-accent">Sales.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            AniRise helps online stores rank for buyer-intent keywords, clean up product architecture, and convert organic visitors into paying customers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="hero" size="xl"><Link to="/#contact">Grow my store <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="xl" className="rounded-full"><a href="#deliverables">View deliverables</a></Button>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-elegant border border-border/40">
          <div className="rounded-2xl bg-secondary/60 p-5">
            <ShoppingCart className="h-12 w-12 text-accent mb-6" />
            <div className="grid gap-4">
              {["Category rankings", "Product clicks", "Organic revenue"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-card">
                  <span className="font-semibold text-foreground">{label}</span>
                  <span className="text-accent font-extrabold">+{index === 0 ? 86 : index === 1 ? 142 : 64}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Store growth system</p>
          <h2 className="text-4xl font-extrabold text-foreground">SEO built around products, categories, and checkout value</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusAreas.map((item) => (
            <article key={item.title} className="bg-card rounded-2xl p-6 shadow-card border border-border/40">
              <item.icon className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="deliverables" className="py-20 bg-secondary/40">
      <div className="container grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">What we handle</p>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">A clean path from Google search to checkout</h2>
          <p className="text-muted-foreground text-lg">We focus on technical fixes, category strategy, and product-page improvements that help customers find and trust your store.</p>
        </div>
        <ul className="grid gap-3">
          {deliverables.map((item) => (
            <li key={item} className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card border border-border/40">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="py-20">
      <div className="container text-center max-w-3xl">
        <Search className="h-10 w-10 text-accent mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Want more buyers from organic search?</h2>
        <p className="mt-3 text-muted-foreground text-lg">Let's map your highest-value products and categories into an SEO growth plan.</p>
        <Button asChild variant="hero" size="xl" className="mt-8"><Link to="/#contact">Request ecommerce audit <TrendingUp /></Link></Button>
      </div>
    </section>
  </ServiceLayout>
);

export default EcommerceSEOPage;