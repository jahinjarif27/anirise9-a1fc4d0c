import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export const AdminLogin = () => {
  const { login } = useAdmin();
  const [pw, setPw] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(pw)) {
      toast.error("Wrong password");
      setPw("");
    } else {
      toast.success("Welcome back!");
    }
  };

  return (
    <div className="min-h-svh grid place-items-start sm:place-items-center bg-gradient-hero px-5 py-20 sm:p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto bg-card rounded-2xl shadow-elegant border border-border/40 p-6 sm:p-8 space-y-5">
        <div className="text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-accent text-accent-foreground grid place-items-center mb-4 shadow-accent">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">AniRise Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
        </div>
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          enterKeyHint="done"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="h-12 text-lg md:text-base"
        />
        <Button type="submit" variant="hero" className="w-full rounded-full">Login</Button>
      </form>
    </div>
  );
};
