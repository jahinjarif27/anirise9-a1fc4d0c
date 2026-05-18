import { useParams } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";
import NotFound from "./NotFound";
import { MarkdownContent } from "@/components/site/MarkdownContent";

export const CustomPageView = () => {
  const { slug } = useParams();
  const { customPages } = useAdmin();
  const page = customPages.find((p) => p.slug === slug && p.published);

  useSEO({
    title: page?.seo?.metaTitle || (page ? `${page.title} — AniRise` : "AniRise"),
    description: page?.seo?.metaDescription || (page?.body ? page.body.slice(0, 158) : undefined),
    path: page ? `/${page.slug}` : undefined,
    image: page?.image || undefined,
  });


  if (!page) return <NotFound />;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16">
        <article className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground">{page.title}</h1>
          {page.image && <img src={page.image} alt={page.imageAlt} className="rounded-2xl w-full mb-8 shadow-elegant" />}
          {page.body && <MarkdownContent content={page.body} />}
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CustomPageView;
