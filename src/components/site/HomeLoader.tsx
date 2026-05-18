import logo from "@/assets/anirise-logo.jpg";

export const HomeLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        <img
          src={logo}
          alt="AniRise"
          className="h-14 w-14 rounded-full ring-2 ring-primary/20 object-cover"
        />
        <div className="text-center">
          <p className="text-xl font-extrabold text-foreground tracking-tight">AniRise</p>
          <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
            Visibility · Growth · Success
          </p>
        </div>

        {/* Center-out fill line */}
        <div className="relative h-[3px] w-48 bg-muted rounded-full overflow-hidden">
          <div className="absolute top-0 left-1/2 h-full w-0 bg-gradient-accent rounded-full -translate-x-1/2 animate-[loader-fill_0.3s_ease-out_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes loader-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
