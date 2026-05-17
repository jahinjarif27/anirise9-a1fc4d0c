import { useAdmin } from "@/context/AdminContext";

export const StatsBand = () => {
  const { stats } = useAdmin();
  if (!stats.length) return null;
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((s) => (
            <div key={s.id} className="bg-card rounded-2xl p-6 lg:p-8 shadow-card border border-border/40 text-center">
              <p className="text-3xl lg:text-5xl font-extrabold text-gradient-accent">{s.value}</p>
              <p className="mt-2 text-xs lg:text-sm text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
