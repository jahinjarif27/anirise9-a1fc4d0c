import { useParams, Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO, fromPageSeo } from "@/hooks/useSEO";
import { getPageSlug } from "@/lib/pageConfig";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { MarkdownContent } from "@/components/site/MarkdownContent";

const BlogPostPage = () => {
  const params = useParams<{ slug?: string; id?: string }>();
  const slug = params.slug ?? params.id;
  const location = useLocation();
  const { posts, seo, loading } = useAdmin();
  const post = posts.find((p) => {
    const customSlug = seo.pageSeo?.[`blog/${p.slug}`]?.slug?.trim();
    return (customSlug || p.slug) === slug;
  });
  const blogSlug = getPageSlug("blog", seo.pageSeo);
  const publicPostSlug = post ? (seo.pageSeo?.[`blog/${post.slug}`]?.slug?.trim() || post.slug) : (slug ?? "");
  const expectedPath = `/${blogSlug}/${publicPostSlug}`;
  const wrongPath = !!post && location.pathname.replace(/\/+$/, "") !== expectedPath.replace(/\/+$/, "");
  const override: any = post ? (seo.pageSeo?.[`blog/${post.slug}`] || {}) : {};
  const overrideExtra = fromPageSeo(override);
  // If the user added their own schemas via admin, use them; otherwise fall back to BlogPosting JSON-LD.
  const userSchemas = overrideExtra.schemas;
  // Use admin OG; default OG image to the post cover if none provided.
  const ogMerged = {
    title: override.ogTitle || undefined,
    description: override.ogDescription || undefined,
    image: override.ogImage || post?.cover || undefined,
    type: "article",
  };

  useSEO({
    title: override.metaTitle || (post ? `${post.title} — AniRise` : "Article — AniRise"),
    description: override.metaDescription || post?.excerpt?.slice(0, 158) || "Article from the AniRise blog.",
    keywords: overrideExtra.keywords,
    path: expectedPath,
    canonical: override.canonicalAuto === false ? override.canonicalUrl : undefined,
    robots: override.robots === "noindex" ? "noindex, nofollow" : undefined,
    og: ogMerged,
    schemas: userSchemas,
    jsonLd: !userSchemas && post
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
          mainEntityOfPage: `https://anirise.com.bd${expectedPath}`,
        }
      : undefined,
  });

  if (loading) return null;
  if (!post || wrongPath || override.status === "draft") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20 container text-center">
          <h1 className="text-3xl font-bold text-foreground">Post not found</h1>
          <Link to={`/${blogSlug}`} className="mt-4 inline-block text-accent">← Back to blog</Link>
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
          <Link to={`/${blogSlug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
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
