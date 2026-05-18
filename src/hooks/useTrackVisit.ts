import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Persistent visitor id so the same browser is never double-counted.
const VISITOR_KEY = "anirise-visitor-id";
const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto as any).randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
};

// Logs at most ONE page_visits row per visitor per day.
// Skips the admin panel.
export const useTrackVisit = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const today = new Date().toISOString().slice(0, 10);
    const dayKey = `anirise-visit-day:${today}`;
    try {
      if (localStorage.getItem(dayKey)) return;
      localStorage.setItem(dayKey, "1");
    } catch {
      // ignore storage errors
    }
    const visitorId = getVisitorId();
    const send = () => {
      supabase
        .from("page_visits")
        .insert({
          path: pathname,
          user_agent: navigator.userAgent.slice(0, 500),
          visitor_id: visitorId,
        })
        .then(({ error }) => { if (error) console.warn("[visit]", error.message); });
    };
    const w = window as any;
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(send, { timeout: 3000 });
    else setTimeout(send, 1500);
  }, [pathname]);
};
