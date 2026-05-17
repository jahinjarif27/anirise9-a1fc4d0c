import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Logs one page_visits row per route per browser session.
// Skips the admin panel.
export const useTrackVisit = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const key = `anirise-visit:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const send = () => {
      supabase
        .from("page_visits")
        .insert({ path: pathname, user_agent: navigator.userAgent.slice(0, 500) })
        .then(({ error }) => { if (error) console.warn("[visit]", error.message); });
    };
    const w = window as any;
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(send, { timeout: 3000 });
    else setTimeout(send, 1500);
  }, [pathname]);
};
