import { useParams, Link } from "react-router-dom";
import { ServiceLayout } from "./ServiceLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { services } from "@/data/services";

const ComingSoonService = () => {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);
  const Icon = service?.icon;

  return (
    <ServiceLayout
      title={service?.title ?? "Service"}
      description={service?.desc ?? "Detailed page coming soon — get in touch and we'll walk you through it personally."}
      path={`/services/${slug ?? ""}`}
    >
      <section className="py-24">
        <div className="container max-w-2xl text-center">
          {Icon && (
            <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-accent text-accent-foreground grid place-items-center mb-6 shadow-accent">
              <Icon className="h-10 w-10" />
            </div>
          )}
          <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-3 inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Detailed page coming soon
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
            {service?.title ?? "Service"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {service?.desc ?? "We're putting together a detailed page for this service. In the meantime, reach out and we'll walk you through it personally."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/#contact">Talk to us</Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="rounded-full">
              <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
            </Button>
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
};

export default ComingSoonService;
