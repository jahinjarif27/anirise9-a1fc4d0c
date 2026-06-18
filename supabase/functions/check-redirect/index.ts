import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: jsonHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.url === "string" ? body.url.trim() : "";
    if (!raw) return new Response(JSON.stringify({ error: "url required" }), { status: 400, headers: jsonHeaders });
    let target: URL;
    try { target = new URL(raw); } catch {
      return new Response(JSON.stringify({ error: "invalid url" }), { status: 400, headers: jsonHeaders });
    }
    if (!/^https?:$/.test(target.protocol)) {
      return new Response(JSON.stringify({ error: "http(s) only" }), { status: 400, headers: jsonHeaders });
    }
    // Block private/loopback to avoid SSRF.
    const host = target.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      return new Response(JSON.stringify({ error: "forbidden host" }), { status: 400, headers: jsonHeaders });
    }

    const res = await fetch(target.toString(), {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "AniRise-RedirectChecker/1.0 (+admin)",
        "Cache-Control": "no-cache",
      },
    });
    const status = res.status;
    const location = res.headers.get("location");
    const xRedirectBy = res.headers.get("x-redirect-by");
    // Drain body to free socket.
    try { await res.body?.cancel(); } catch { /* noop */ }
    return new Response(
      JSON.stringify({ status, location, xRedirectBy, isRedirect: status >= 300 && status < 400 }),
      { headers: jsonHeaders },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message || "fetch failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
