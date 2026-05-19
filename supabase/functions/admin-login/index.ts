import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Naive in-memory rate limiter per cold start. Slows brute force enough for low-volume admin gate.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function b64url(bytes: Uint8Array): string {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return b64url(new Uint8Array(sig));
}

async function signToken(secret: string, ttlSec: number): Promise<{ token: string; exp: number }> {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp, role: 'admin' })));
  const sig = await hmac(secret, payload);
  return { token: `${payload}.${sig}`, exp };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders });
    }

    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');
    const ADMIN_JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET');
    if (!ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
      console.error('admin-login: missing secrets');
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: jsonHeaders });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    const rec = attempts.get(ip);
    if (rec && now - rec.first < WINDOW_MS && rec.count >= MAX_ATTEMPTS) {
      return new Response(JSON.stringify({ error: 'Too many attempts. Try again later.' }), { status: 429, headers: jsonHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === 'string' ? body.password : '';

    if (password !== ADMIN_PASSWORD) {
      if (!rec || now - rec.first > WINDOW_MS) attempts.set(ip, { count: 1, first: now });
      else attempts.set(ip, { count: rec.count + 1, first: rec.first });
      // Small delay to slow scripted brute-force
      await new Promise((r) => setTimeout(r, 300));
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401, headers: jsonHeaders });
    }

    attempts.delete(ip);
    const { token, exp } = await signToken(ADMIN_JWT_SECRET, 12 * 60 * 60); // 12h
    return new Response(JSON.stringify({ token, exp }), { headers: jsonHeaders });
  } catch (e) {
    console.error('admin-login error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
