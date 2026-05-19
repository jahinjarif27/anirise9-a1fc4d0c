import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const rate = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const NOTIFY_TOKEN = Deno.env.get('NOTIFY_INTERNAL_TOKEN');
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: jsonHeaders });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    const r = rate.get(ip);
    if (r && now - r.first < WINDOW_MS && r.count >= MAX_PER_WINDOW) {
      return new Response(JSON.stringify({ error: 'Too many submissions. Please try again later.' }), { status: 429, headers: jsonHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? '').trim().slice(0, 120);
    const role = String(body?.role ?? '').trim().slice(0, 120);
    const quote = String(body?.quote ?? '').trim().slice(0, 1000);
    const rating = Math.max(1, Math.min(5, Math.round(Number(body?.rating) || 5)));

    if (!name || !quote) {
      return new Response(JSON.stringify({ error: 'Name and review are required' }), { status: 400, headers: jsonHeaders });
    }

    if (!r || now - r.first > WINDOW_MS) rate.set(ip, { count: 1, first: now });
    else rate.set(ip, { count: r.count + 1, first: r.first });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await sb
      .from('reviews')
      .insert({ name, role, quote, rating, approved: false })
      .select()
      .single();
    if (error) {
      console.error('insert review failed', error);
      return new Response(JSON.stringify({ error: 'Could not save review' }), { status: 500, headers: jsonHeaders });
    }

    if (NOTIFY_TOKEN) {
      const html = `<h2>New Review Submitted</h2>
<p><b>Name:</b> ${esc(name)}</p>
<p><b>Role:</b> ${esc(role || '-')}</p>
<p><b>Rating:</b> ${rating} / 5</p>
<p><b>Review:</b><br/>${esc(quote).replace(/\n/g, '<br/>')}</p>
<p style="color:#666;font-size:13px">Pending approval in admin panel.</p>`;
      fetch(`${SUPABASE_URL}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-token': NOTIFY_TOKEN,
          'Authorization': `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({ subject: `New Review (${rating}★) from ${name}`, html }),
      }).catch((e) => console.error('notify-admin call failed', e));
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), { headers: jsonHeaders });
  } catch (e) {
    console.error('submit-review error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
