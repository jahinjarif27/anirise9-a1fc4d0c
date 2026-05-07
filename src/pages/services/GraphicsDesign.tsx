import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Brush, CheckCircle2, Image, LayoutGrid, Palette, PenTool, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceLayout } from "./ServiceLayout";

const services = [
  { icon: Palette, title: "Brand identity", desc: "Logo direction, color system, typography, and visual rules that make your brand memorable." },
  { icon: Image, title: "Social creatives", desc: "Facebook and Instagram post designs, ad banners, stories, and campaign visuals." },
  { icon: LayoutGrid, title: "Marketing assets", desc: "Flyers, covers, thumbnails, presentation graphics, and launch visuals for every channel." },
];

const packages = ["Logo and brand refresh concepts", "Social media post templates", "Ad creative variations", "Business card and print-ready files", "Campaign visual direction", "Editable source-file handoff"];

const GraphicsDesignPage = () => (
  <ServiceLayout title="Graphics Design">
    <section className="bg-gradient-hero py-20 lg:py-28">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-4">Graphics Design</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-foreground">
            Visuals That Make Your Brand <span className="text-gradient-accent">Recognizable.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            AniRise creates clean, strategic graphics for social media, campaigns, and brand identity — designed to look premium and convert attention into action.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild variant="hero" size="xl"><Link to="/#contact">Start a design project <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="xl" className="rounded-full"><a href="#design-work">See scope</a></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[Brush, PenTool, Sparkles, BadgeCheck].map((Icon, index) => (
            <div key={index} className="aspect-square rounded-3xl bg-card shadow-card border border-border/40 grid place-items-center">
              <Icon className="h-12 w-12 text-accent" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="design-work" className="py-20">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Creative scope</p>
          <h2 className="text-4xl font-extrabold text-foreground">Design support for every growth channel</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((item) => (
            <article key={item.title} className="bg-card rounded-2xl p-8 shadow-card border border-border/40">
              <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent grid place-items-center mb-5">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20 bg-secondary/40">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Deliverables</p>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">Polished files ready for web, social, and print</h2>
          <p className="text-muted-foreground text-lg">Everything is structured so your brand can keep publishing consistently after the first project.</p>
        </div>
        <ul className="grid gap-3">
          {packages.map((item) => (
            <li key={item} className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card border border-border/40">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </ServiceLayout>
);

export default GraphicsDesignPage;