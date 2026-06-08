import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, ArrowRight, Play, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const addPreconnect = (href: string) => {
  if (typeof document === "undefined") return;
  if (document.head.querySelector(`link[data-pc="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "preconnect";
  l.href = href;
  l.crossOrigin = "";
  l.setAttribute("data-pc", href);
  document.head.appendChild(l);
};

export const Hero = () => {
  const { content, contact } = useAdmin();
  const [videoOpen, setVideoOpen] = useState(false);

  const rawVideoUrl = content.heroVideoUrl?.trim();
  const isMp4 = !!rawVideoUrl && /\.(mp4|webm|ogg)(\?|$)/i.test(rawVideoUrl);

  const getYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        if (u.pathname === "/watch") return u.searchParams.get("v");
        const parts = u.pathname.split("/").filter(Boolean);
        const i = parts.findIndex((p) => ["embed", "shorts", "v", "live"].includes(p));
        if (i >= 0 && parts[i + 1]) return parts[i + 1];
      }
      return null;
    } catch {
      return null;
    }
  };

  const ytId = rawVideoUrl && !isMp4 ? getYouTubeId(rawVideoUrl) : null;
  const videoUrl = rawVideoUrl
    ? isMp4
      ? rawVideoUrl
      : ytId
        ? `https://www.youtube.com/embed/${ytId}`
        : rawVideoUrl
    : undefined;
  const videoEnabled = content.heroVideoEnabled !== false && !!videoUrl;

  const videoTitle = content.heroVideoTitle?.trim() || "Hero video";
  const videoDescription = content.heroVideoDescription?.trim() || "";
  const videoThumbnail = content.heroVideoThumbnail?.trim()
    || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");
  const videoUploadDate = content.heroVideoUploadDate?.trim() || "";
  const videoDuration = content.heroVideoDuration?.trim() || "";

  useEffect(() => {
    if (!videoEnabled) return;
    const payload: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: videoTitle,
      description: videoDescription || videoTitle,
      contentUrl: rawVideoUrl,
    };
    if (!isMp4 && ytId) payload.embedUrl = `https://www.youtube.com/embed/${ytId}`;
    if (videoThumbnail) payload.thumbnailUrl = videoThumbnail;
    if (videoUploadDate) payload.uploadDate = videoUploadDate;
    if (videoDuration) payload.duration = videoDuration;
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.setAttribute("data-hero-video-jsonld", "true");
    tag.text = JSON.stringify(payload);
    document.head.querySelectorAll('script[data-hero-video-jsonld="true"]').forEach((n) => n.remove());
    document.head.appendChild(tag);
    return () => {
      document.head.querySelectorAll('script[data-hero-video-jsonld="true"]').forEach((n) => n.remove());
    };
  }, [videoEnabled, videoTitle, videoDescription, videoThumbnail, videoUploadDate, videoDuration, rawVideoUrl, isMp4, ytId]);

  useEffect(() => {
    if (!videoEnabled || isMp4) return;
    addPreconnect("https://www.youtube.com");
    addPreconnect("https://www.google.com");
    addPreconnect("https://i.ytimg.com");
    addPreconnect("https://s.ytimg.com");
    addPreconnect("https://yt3.ggpht.com");
  }, [videoEnabled, isMp4]);

  const warmYouTube = () => {
    if (!videoEnabled || isMp4) return;
    addPreconnect("https://www.youtube.com");
    addPreconnect("https://i.ytimg.com");
    addPreconnect("https://s.ytimg.com");
  };

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
            {videoEnabled ? (
              <Button
                variant="hero"
                size="xl"
                onClick={() => setVideoOpen(true)}
                onMouseEnter={warmYouTube}
                onFocus={warmYouTube}
                onTouchStart={warmYouTube}
              >
                <Play /> Watch How We Work
              </Button>
            ) : (
              <Button asChild variant="hero" size="xl">
                <Link to="/strategy-call">
                  Book A Strategy Call <ArrowRight />
                </Link>
              </Button>
            )}
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
        <DialogContent className="max-w-[92vw] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden bg-background rounded-2xl [&>button]:hidden">
          <div className="relative aspect-video w-full bg-black">
            {videoOpen && videoUrl && (
              isMp4 ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full" />
              ) : (
                <iframe
                  src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                  title={videoTitle}
                  className="w-full h-full"
                  loading="eager"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            )}
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
              className="absolute top-2 right-2 z-10 h-9 w-9 grid place-items-center rounded-full bg-background/90 text-foreground shadow-md hover:bg-background transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5 flex flex-col items-center text-center gap-3">
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
