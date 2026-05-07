import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const BlogPostPage = () => {
  const { slug } = useParams();
  const { posts } = useAdmin();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => { document.title = post ? `${post.title} — AniRise` : "Article — AniRise"; }, [post]);

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
          <div className="mt-8 prose prose-lg max-w-none text-foreground/90 leading-relaxed space-y-5">
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
            <p>This is a demo article preview. In a full setup, the rich body content for "{post.title}" would render here — managed from the AniRise admin dashboard.</p>
            <p>You can publish, edit, or delete posts from the admin panel. Visit <code className="text-accent">/admin</code> or triple-click the AniRise logo and enter the password.</p>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
export default BlogPostPage;
