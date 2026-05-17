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

const RouteEffects = () => {
  useTrackVisit();
  return null;
};

const ConditionalBottomNav = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
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
