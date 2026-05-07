import { useParams } from "react-router-dom";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import NotFound from "./NotFound";

export const CustomPageView = () => {
  const { slug } = useParams();
  const { customPages } = useAdmin();
  const page = customPages.find((p) => p.slug === slug && p.published);
  if (!page) return <NotFound />;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16">
        <article className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{page.title}</h1>
          {page.image && <img src={page.image} alt={page.imageAlt} className="rounded-2xl w-full mb-8" />}
          {page.body && <p className="text-foreground/80 whitespace-pre-line leading-relaxed">{page.body}</p>}
        </article>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CustomPageView;
