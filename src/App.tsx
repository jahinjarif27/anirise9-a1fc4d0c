import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
