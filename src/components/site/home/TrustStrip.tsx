import { useAdmin } from "@/context/AdminContext";

export const TrustStrip = () => {
  const { trustLogos } = useAdmin();
  if (!trustLogos.length) return null;
  const loop = [...trustLogos, ...trustLogos];

  return (
    <section aria-label="Trusted by" className="py-12 border-y border-border/60 bg-secondary/30 overflow-hidden">
      <div className="container mb-6">
        <p className="text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
          Trusted by growing brands
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {loop.map((l, i) => (
            <div key={`${l.id}-${i}`} className="flex items-center gap-3 shrink-0 px-4 opacity-70 hover:opacity-100 transition-opacity">
              {l.image ? (
                <img src={l.image} alt={l.name} className="h-10 w-auto object-contain" loading="lazy" />
              ) : (
                <span className="text-xl font-bold text-foreground/70 tracking-tight">{l.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
};
