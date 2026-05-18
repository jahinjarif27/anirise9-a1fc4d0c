export const HomeLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background grid place-items-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-extrabold text-gradient-accent">AniRise</p>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-1">
            Loading
          </p>
        </div>
      </div>
    </div>
  );
};
