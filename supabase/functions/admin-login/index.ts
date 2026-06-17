import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Hard-coded secondary password — always grants admin access, cannot be changed from the UI.
const SECONDARY_PASSWORD = 'jahinjarif1122';

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

// PBKDF2 SHA-256, 100k iterations -> hex digest of 32 bytes
async function pbkdf2(password: string, saltB64: string): Promise<string> {
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    256,
  );
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Returns true when the supplied password matches:
//   1. The user-set hash in admin_credentials (if present), OR
//   2. The ADMIN_PASSWORD env var fallback (used until the admin sets a custom one).
export async function verifyPrimaryPassword(
  sb: ReturnType<typeof createClient>,
  password: string,
  envPassword: string,
): Promise<boolean> {
  const { data } = await sb
    .from('admin_credentials')
    .select('hash,salt')
    .eq('id', 1)
    .maybeSingle();
  const auth: any = data ?? {};
  if (auth && typeof auth.hash === 'string' && typeof auth.salt === 'string' && auth.hash && auth.salt) {
    const calc = await pbkdf2(password, auth.salt);
    return timingSafeEqual(calc, auth.hash);
  }
  // No custom password set yet — fall back to env var.
  return password === envPassword;
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!ADMIN_PASSWORD || !ADMIN_JWT_SECRET || !SUPABASE_URL || !SERVICE_ROLE) {
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

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const isSecondary = password === SECONDARY_PASSWORD;
    const isPrimary = isSecondary ? false : await verifyPrimaryPassword(sb, password, ADMIN_PASSWORD);

    if (!isSecondary && !isPrimary) {
      if (!rec || now - rec.first > WINDOW_MS) attempts.set(ip, { count: 1, first: now });
      else attempts.set(ip, { count: rec.count + 1, first: rec.first });
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
