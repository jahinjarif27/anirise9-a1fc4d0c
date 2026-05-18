import logo from "@/assets/anirise-logo.jpg";

export const HomeLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="relative">
          <img
            src={logo}
            alt="AniRise"
            className="h-16 w-16 rounded-full ring-2 ring-primary/20 object-cover animate-pulse"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 animate-ping" />
        </div>

        {/* Brand text */}
        <div className="text-center">
          <p className="text-2xl font-extrabold text-gradient-accent">AniRise</p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1.5">
            Visibility · Growth · Success
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Loading</span>
          <span className="flex gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  );
};
