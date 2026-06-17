import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { getPageSlug } from "@/lib/pageConfig";

export const Blog = () => {
  const { posts, content, seo } = useAdmin();
  const featured = posts.slice(0, 3);
  const blogSlug = getPageSlug("blog", seo.pageSeo);

  return (
    <section id="blog" className="py-24 bg-secondary/40">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Blog</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">
              {content.blogTitle}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {content.blogBlurb}
            </p>
          </div>
          <Link to={`/${blogSlug}`} className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
            View all posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={p.id}
              to={`/${blogSlug}/${seo.pageSeo?.[`blog/${p.slug}`]?.slug?.trim() || p.slug}`}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/40 hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.cover} alt={p.coverAlt || p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-6">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">{p.category}</span>
                <h3 className="mt-3 text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-smooth">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{p.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
