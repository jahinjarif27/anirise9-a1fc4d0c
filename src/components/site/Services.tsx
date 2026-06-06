import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useServices, type RuntimeService } from "@/lib/useServices";
import { SectionNote } from "@/components/site/SectionNote";

type Service = RuntimeService;

const ServiceCard = ({ service }: { service: Service }) => (
  <Link
    to={`/services/${service.publicSlug}`}
    className="group block bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-smooth border border-border/40"
  >
    <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent grid place-items-center mb-5 group-hover:bg-gradient-accent group-hover:text-accent-foreground transition-smooth">
      <service.icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.desc}</p>
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
      Learn more <ArrowRight className="h-4 w-4" />
    </span>
  </Link>
);

const ZigzagRow = ({ service, index }: { service: Service; index: number }) => {
  const { servicePreviews } = useAdmin();
  const preview = servicePreviews?.[service.slug];
  const image = preview?.image;
  const imageAlt = preview?.imageAlt || `${service.title} preview`;
  const desc = preview?.desc?.trim() || service.desc;
  const reverse = index % 2 === 1;
  const Icon = service.icon;

  return (
    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-14 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="relative">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-primary shadow-elegant grid place-items-center p-6">
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <Icon className="h-20 w-20 text-primary-foreground/80" />
          )}
        </div>
        <div className="hidden md:flex absolute -bottom-5 right-5 items-center gap-2 bg-card rounded-xl shadow-elegant px-4 py-2 border border-border/60">
          <Icon className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold tracking-wide">{service.title}</span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">
          Service {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4">
          {service.title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed mb-5">
          {desc}
        </p>
        <ul className="space-y-2 mb-6">
          {[
            "Tailored strategy for your brand",
            "Measurable results & transparent reporting",
            "Dedicated support across the engagement",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          to={`/services/${service.publicSlug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all"
        >
          Explore {service.title} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export const Services = () => {
  const { content } = useAdmin();
  const services = useServices();

  return (
    <section id="services" className="bg-background py-20 lg:py-24">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Services</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">{content.servicesTitle}</h2>
          <p className="mt-3 text-muted-foreground text-base max-w-2xl">
            {content.servicesBlurb}
          </p>
        </div>
      </div>

      <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>

      {services.length > 0 && (
        <div className="container mt-20 lg:mt-28">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3">Deep dive</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Every service, explained
            </h2>
            <p className="mt-3 text-muted-foreground">
              A closer look at what each service includes and how it moves the needle for your business.
            </p>
          </div>
          <div className="space-y-20 lg:space-y-28">
            {services.map((service, i) => (
              <ZigzagRow key={service.slug} service={service} index={i} />
            ))}
          </div>
        </div>
      )}

      <SectionNote id="servicesPage" />
    </section>
  );
};
