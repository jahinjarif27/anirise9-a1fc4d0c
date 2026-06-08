import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Hero = () => {
  const { content, contact } = useAdmin();
  const [videoOpen, setVideoOpen] = useState(false);

  const videoUrl = content.heroVideoUrl?.trim();
  const isMp4 = !!videoUrl && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-hero overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">
            {content.heroEyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
            {content.heroHeadline}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {content.heroTagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              variant="hero"
              size="xl"
              onClick={() => setVideoOpen(true)}
            >
              <Play /> Watch How We Work
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link to="/services">Our Services</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase mb-3">
                Find with us
              </p>
              <div className="flex gap-3">
                <a
                  href={contact.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 w-11 grid place-items-center rounded-xl bg-card shadow-card text-primary hover:text-accent-foreground hover:bg-gradient-accent transition-smooth"
                  aria-label="AniRise on Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase mb-3">
                Best Skills On
              </p>
              <div className="flex gap-3">
                {["SEO", "Web", "Ads"].map((s) => (
                  <span
                    key={s}
                    className="h-11 px-4 grid place-items-center rounded-xl bg-card shadow-card text-sm font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards] w-full max-w-md lg:max-w-lg mx-auto hidden lg:block">
          <div className="absolute inset-0 bg-gradient-primary rounded-[2rem] rotate-3 opacity-20" aria-hidden />
          <img
            src={content.heroImage}
            alt={content.heroImageAlt}
            width={1024}
            height={1024}
            {...({ fetchpriority: "high" } as any)}
            decoding="async"
            className="relative rounded-[2rem] shadow-elegant w-full"
          />
          <div className="absolute -bottom-6 -left-6 bg-card shadow-elegant rounded-2xl px-5 py-4 hidden sm:flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-accent grid place-items-center text-accent-foreground font-bold">↑</div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">+187%</p>
              <p className="text-xs text-muted-foreground">Avg. Traffic Growth</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
          <div className="aspect-video w-full bg-black">
            {videoOpen && videoUrl && (
              isMp4 ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full" />
              ) : (
                <iframe
                  src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
                  title="Hero video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            )}
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ready to grow your brand?</p>
              <p className="text-lg font-semibold text-foreground">Book a free strategy call with our team.</p>
            </div>
            <Button asChild variant="hero" size="lg" onClick={() => setVideoOpen(false)}>
              <Link to="/strategy-call">
                Book A Strategy Call <ArrowRight />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
