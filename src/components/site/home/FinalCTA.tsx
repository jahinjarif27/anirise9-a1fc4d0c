import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";

const isExternal = (url: string) => /^https?:\/\//i.test(url);

export const FinalCTA = () => {
  const { finalCta } = useAdmin();
  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container">
        <div className="relative overflow-hidden bg-gradient-primary rounded-3xl p-10 lg:p-16 text-center shadow-elegant">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-primary-foreground">{finalCta.headline}</h2>
            <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto text-base lg:text-lg">{finalCta.subline}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {finalCta.primaryLabel && (
                isExternal(finalCta.primaryUrl) ? (
                  <Button asChild variant="hero" size="xl">
                    <a href={finalCta.primaryUrl} target="_blank" rel="noopener noreferrer">{finalCta.primaryLabel} <ArrowRight /></a>
                  </Button>
                ) : (
                  <Button asChild variant="hero" size="xl">
                    <Link to={finalCta.primaryUrl || "/contact"}>{finalCta.primaryLabel} <ArrowRight /></Link>
                  </Button>
                )
              )}
              {finalCta.secondaryLabel && (
                isExternal(finalCta.secondaryUrl) ? (
                  <Button asChild variant="outline" size="xl" className="rounded-full bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20">
                    <a href={finalCta.secondaryUrl} target="_blank" rel="noopener noreferrer"><MessageCircle /> {finalCta.secondaryLabel}</a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="xl" className="rounded-full bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20">
                    <Link to={finalCta.secondaryUrl || "/contact"}><MessageCircle /> {finalCta.secondaryLabel}</Link>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
