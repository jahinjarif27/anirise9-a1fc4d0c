import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Portfolio } from "@/components/site/Portfolio";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Blog } from "@/components/site/Blog";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";

const Index = () => {
  const { pageLocation, homeSections, customPages } = useAdmin();
  const onHome = (k: string) => (pageLocation[k] ?? "home") === "home";
  useEffect(() => {
    document.title = "AniRise — Visibility · Growth · Success | SEO & Web Agency";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta(
      "description",
      "AniRise is a digital agency helping brands rise online with SEO, ecommerce SEO, web development, and digital marketing. Visibility, growth, success.",
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {onHome("hero") && <Hero />}
        {onHome("services") && <Services />}
        {onHome("about") && <About />}
        {onHome("portfolio") && <Portfolio />}
        {onHome("blog") && <Blog />}
        {onHome("testimonials") && <Testimonials />}
        {onHome("contact") && <Contact />}
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
