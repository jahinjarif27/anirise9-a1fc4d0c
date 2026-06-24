import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/context/AdminContext";
import ScrollToTop from "@/components/ScrollToTop";
import { AppRoutes } from "./pages/AppRoutes";
import { useTrackVisit } from "@/hooks/useTrackVisit";
import { BottomNav } from "@/components/site/BottomNav";
import { useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { getPageSlug } from "@/lib/pageConfig";

const RouteEffects = () => {
  useTrackVisit();
  return null;
};

const ConditionalBottomNav = () => {
  const { pathname } = useLocation();
  const { seo } = useAdmin();
  const strategyCallSlug = getPageSlug("strategy-call", seo.pageSeo);
  const blogSlug = getPageSlug("blog", seo.pageSeo);
  if (pathname.startsWith("/admin")) return null;
  if (pathname === `/${strategyCallSlug}` || pathname.startsWith(`/${strategyCallSlug}/`)) return null;
  if (pathname === `/${blogSlug}` || pathname.startsWith(`/${blogSlug}/`)) return null;
  return <BottomNav />;
};

const ConstructionBanner = () => {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.style.setProperty("--banner-h", "0px");
      document.body.style.paddingTop = "";
      return;
    }
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty("--banner-h", `${h}px`);
      document.body.style.paddingTop = `${h}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.setProperty("--banner-h", "0px");
      document.body.style.paddingTop = "";
    };
  }, [isAdmin]);

  if (isAdmin) return null;
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground text-center text-xs sm:text-sm font-semibold py-1.5 px-3 shadow-md"
      role="alert"
    >
      This website is currently under construction
    </div>
  );
};



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ConstructionBanner />
          <ScrollToTop />
          <RouteEffects />
          <AppRoutes />
          <ConditionalBottomNav />
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
