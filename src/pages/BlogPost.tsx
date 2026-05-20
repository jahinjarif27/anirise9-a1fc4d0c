import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { MarkdownContent } from "@/components/site/MarkdownContent";

const BlogPostPage = () => {
  const { slug } = useParams();
  const { posts, seo, loading } = useAdmin();
  const post = posts.find((p) => p.slug === slug);
  const override = seo.pageSeo?.[`blog/${slug ?? ""}`];

  useSEO({
    title: override?.metaTitle || (post ? `${post.title} — AniRise` : "Article — AniRise"),
    description: override?.metaDescription || post?.excerpt?.slice(0, 158) || "Article from the AniRise blog.",
    path: `/blog/${slug ?? ""}`,
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          publisher: {
            "@type": "Organization",
            name: "AniRise",
            logo: { "@type": "ImageObject", url: "https://anirise.com.bd/favicon.jpg" },
          },
          mainEntityOfPage: `https://anirise.com.bd/blog/${slug ?? ""}`,
        }
      : undefined,
  });

  if (loading) return null;
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold text-foreground">Post not found</h1>
          <Link to="/blog" className="mt-4 inline-block text-accent">← Back to blog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="container max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">{post.category}</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {post.author}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
          </div>
          <img src={post.cover} alt={post.coverAlt || post.title} className="mt-8 w-full rounded-2xl shadow-elegant aspect-[16/9] object-cover" />
          <div className="mt-8 space-y-5">
            <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
            {post.body && post.body.trim().length > 0 ? (
              <MarkdownContent content={post.body} />
            ) : (
              <p className="text-foreground/80">Full article coming soon. Manage content from the admin dashboard.</p>
            )}
          </div>
          {post.ctaEnabled && post.ctaLabel && post.ctaUrl && (
            <div className="mt-10 rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-primary/5 p-6 sm:p-8 text-center">
              <a
                href={post.ctaUrl}
                target={post.ctaUrl.startsWith("http") ? "_blank" : undefined}
                rel={post.ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center rounded-full bg-gradient-accent text-accent-foreground font-bold px-7 py-3.5 text-base shadow-elegant hover:opacity-90 transition-opacity"
              >
                {post.ctaLabel}
              </a>
            </div>
          )}
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
export default BlogPostPage;
