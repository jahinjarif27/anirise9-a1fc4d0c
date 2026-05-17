import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Portfolio } from "@/components/site/Portfolio";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Blog } from "@/components/site/Blog";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useAdmin } from "@/context/AdminContext";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  const { pageLocation, homeSections, customPages } = useAdmin();
  const onHome = (k: string) => (pageLocation[k] ?? "home") === "home";
  useSEO({
    title: "AniRise — Visibility · Growth · Success | SEO & Web Agency",
    description:
      "AniRise is a digital agency helping brands rise online with SEO, ecommerce SEO, web development, and digital marketing. Visibility, growth, success.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AniRise",
      url: "https://anirise.com.bd/",
      logo: "https://anirise.com.bd/favicon.jpg",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {onHome("hero") && <Hero />}
        {onHome("blog") && <Blog />}
        {homeSections.filter((s) => s.enabled && (s.groupKey ?? "home") === "home").map((s) => (
          <section key={s.id} className="py-16 md:py-24">
            <div className="container">
              {s.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{s.title}</h2>}
              {s.image && <img src={s.image} alt={s.imageAlt} className="rounded-2xl w-full mb-6" />}
              {s.body && <p className="text-foreground/80 whitespace-pre-line max-w-3xl">{s.body}</p>}
            </div>
          </section>
        ))}
        {customPages.filter((p) => p.published && (p.groupKey ?? "") === "home").map((p) => (
          <section key={p.id} className="py-16 md:py-24">
            <div className="container">
              {p.title && <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{p.title}</h2>}
              {p.image && <img src={p.image} alt={p.imageAlt} className="rounded-2xl w-full mb-6" />}
              {p.body && <p className="text-foreground/80 whitespace-pre-line max-w-3xl">{p.body}</p>}
            </div>
          </section>
        ))}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
