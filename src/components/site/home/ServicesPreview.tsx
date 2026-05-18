import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { services } from "@/data/services";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

export const ServicesPreview = () => {
  const { content } = useAdmin();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  return (
    <section className="py-20 lg:py-24 bg-gradient-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 blur-3xl" aria-hidden />

      <div className="container relative">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
              Our Services
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold">{content.servicesTitle}</h2>
            <p className="mt-3 text-primary-foreground/80">{content.servicesBlurb}</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-accent inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {services.map((s) => (
              <div
                key={s.slug}
                className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 px-3"
              >
                <Link
                  to={`/services/${s.slug}`}
                  className="group block bg-gradient-to-br from-accent/20 via-card to-accent/10 rounded-3xl p-8 shadow-elegant border border-primary-foreground/10 hover:scale-[1.02] transition-smooth h-full"
                >
                  <div className="aspect-square rounded-2xl bg-accent/20 grid place-items-center mb-6 group-hover:bg-gradient-accent transition-smooth">
                    <s.icon className="h-24 w-24 text-accent group-hover:text-accent-foreground transition-smooth" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-2 text-center">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center italic">
                    {s.desc}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {services.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                selected === i ? "w-8 bg-accent" : "w-2.5 bg-primary-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
