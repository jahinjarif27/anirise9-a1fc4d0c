import { Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import { Calendar, Clock } from "lucide-react";

const BlogPage = () => {
  const { posts } = useAdmin();
  useSEO({
    title: "Blog — SEO, Marketing & Growth Insights | AniRise",
    description:
      "Practical SEO, marketing, and growth tactics from the AniRise team. Read our latest articles to grow your traffic, leads, and revenue.",
    path: "/blog",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Blog</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">All Articles</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-12">SEO, marketing, and growth tactics from the AniRise team.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth border border-border/40 hover:-translate-y-1">
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
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
export default BlogPage;
