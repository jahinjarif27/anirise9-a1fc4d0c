import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { useAdmin } from "@/context/AdminContext";

export const ServicesPreview = () => {
  const { content } = useAdmin();
  const preview = services.slice(0, 6);

  return (
    <section className="py-20 lg:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Services</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">{content.servicesTitle}</h2>
            <p className="mt-3 text-muted-foreground">{content.servicesBlurb}</p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-accent inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {preview.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-smooth border border-border/40">
              <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent grid place-items-center mb-4 group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-smooth">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
