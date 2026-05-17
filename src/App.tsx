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

const RouteEffects = () => {
  useTrackVisit();
  return null;
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
          <BottomNav />
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
