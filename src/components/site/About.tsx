import { CheckCircle2, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAdmin } from "@/context/AdminContext";
import { SectionNote } from "@/components/site/SectionNote";

const FALLBACK_PILLARS = [
  { title: "Visibility", desc: "Get discovered by the right audience at the right moment." },
  { title: "Growth", desc: "Scale traffic, leads, and revenue with proven strategies." },
  { title: "Success", desc: "A clear roadmap toward measurable, lasting business success." },
];

const OurStory = () => {
  const { content } = useAdmin();
  const eyebrow = content.aboutStoryEyebrow || "Our Story";
  const title = content.aboutStoryTitle || "";
  const body = content.aboutStoryBody || "";
  const image = content.aboutStoryImage;
  if (!title && !body && !image) return null;
  return (
    <section id="our-story" className="py-20 lg:py-28 bg-background">
      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight mb-6">{title}</h2>
          )}
          {body && (
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed [&_p]:mb-4 [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-accent [&_a]:font-medium">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-primary rounded-[2.5rem] opacity-10 blur-2xl" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-elegant bg-gradient-primary">
              {image ? (
                <img src={image} alt={content.aboutStoryImageAlt || "Our story"} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full grid place-items-center text-primary-foreground/40">
                  <Users className="h-24 w-24" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const OurTeam = () => {
  const { content } = useAdmin();
  const team = content.aboutTeam || [];
  if (team.length === 0) return null;
  const eyebrow = content.aboutTeamEyebrow || "Our Team";
  const title = content.aboutTeamTitle || "";
  const blurb = content.aboutTeamBlurb || "";
  return (
    <section id="our-team" className="py-20 lg:py-28 bg-secondary/40">
      <div className="container">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">{title}</h2>
          )}
          {blurb && (
            <p className="mt-4 text-lg text-muted-foreground">{blurb}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {team.map((m) => (
            <div key={m.id} className="group bg-card rounded-2xl overflow-hidden border border-border/40 shadow-card hover:shadow-elegant transition-smooth">
              <div className="aspect-square overflow-hidden bg-gradient-primary">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-primary-foreground/40">
                    <Users className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground">{m.name}</h3>
                {m.role && <p className="text-sm font-semibold text-accent mt-1">{m.role}</p>}
                {m.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const About = () => {
  const { content, seo } = useAdmin();
  const { pathname } = useLocation();
  const pillars = (content.aboutPillars && content.aboutPillars.length > 0) ? content.aboutPillars : FALLBACK_PILLARS;
  const eyebrow = content.aboutEyebrow || "About AniRise";
  const statValue = content.aboutStatValue || "100%";
  const statLabel = content.aboutStatLabel || "Client Focused";

  // Match /about (and any admin-overridden slug for the about page).
  const aboutSlug = (seo?.pageSeo?.about?.slug?.trim() || "about").replace(/^\/+|\/+$/g, "");
  const onAboutPage = pathname.replace(/^\/+|\/+$/g, "") === aboutSlug;

  return (
    <>
      <section id="about" className="py-24 bg-secondary/40">
        <div className="container grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="aspect-square max-w-md lg:max-w-sm mx-auto rounded-[2rem] bg-gradient-primary p-10 shadow-elegant grid place-items-center">
              <img src={content.aboutImage} alt={content.aboutImageAlt} width={320} height={320} className="w-2/3 rounded-3xl shadow-elegant object-cover" loading="lazy" />
            </div>
            {(statValue || statLabel) && (
              <div className="absolute -bottom-6 right-6 bg-card rounded-2xl shadow-elegant px-6 py-4">
                {statValue && <p className="text-3xl font-extrabold text-gradient-primary">{statValue}</p>}
                {statLabel && <p className="text-xs text-muted-foreground font-medium">{statLabel}</p>}
              </div>
            )}
          </div>

          <div>
            {eyebrow && (
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
                {eyebrow}
              </p>
            )}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
              {content.aboutHeadline}
            </h2>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
              {content.aboutBlurb}
            </p>

            <div className="mt-8 space-y-4">
              {pillars.map((p, i) => (
                <div key={`${p.title}-${i}`} className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SectionNote id="about" />
      </section>

      {onAboutPage && (
        <>
          <OurStory />
          <OurTeam />
        </>
      )}
    </>
  );
};
