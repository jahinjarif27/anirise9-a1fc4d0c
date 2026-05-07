import { useAdmin } from "@/context/AdminContext";

export const Portfolio = () => {
  const { content, portfolio } = useAdmin();

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
            Visit Our Portfolio
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">{content.portfolioTitle}</h2>
          <p className="mt-4 text-muted-foreground">
            {content.portfolioBlurb}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((it) => (
            <article
              key={it.id}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-elegant transition-smooth"
            >
              <img
                src={it.image}
                alt={it.imageAlt || it.title}
                width={800}
                height={600}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-smooth"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-smooth">
                <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-1">{it.tag}</p>
                <h3 className="text-xl font-bold text-primary-foreground">{it.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};