import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ---------- Token verification (HMAC SHA-256, mirrors admin-login) ----------
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}
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
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function verifyToken(secret: string, token: string): Promise<boolean> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = await hmac(secret, payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    if (claims.role !== 'admin') return false;
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

// PBKDF2 SHA-256 — must match supabase/functions/admin-login/index.ts
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

async function verifyPrimaryPassword(
  sb: ReturnType<typeof createClient>,
  password: string,
  envPassword: string,
): Promise<boolean> {
  const { data } = await sb.from('site_settings').select('admin_auth').eq('id', 1).maybeSingle();
  const auth: any = (data as any)?.admin_auth ?? {};
  if (auth && typeof auth.hash === 'string' && typeof auth.salt === 'string' && auth.hash && auth.salt) {
    const calc = await pbkdf2(password, auth.salt);
    return timingSafeEqual(calc, auth.hash);
  }
  return password === envPassword;
}
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    if (claims.role !== 'admin') return false;
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

// ---------- Op handlers ----------
type Op = (sb: ReturnType<typeof createClient>, payload: any) => Promise<unknown>;

const ops: Record<string, Op> = {
  ping: async () => ({ ok: true }),

  // Site settings
  update_site_settings: async (sb, p) => {
    const { error } = await sb.from('site_settings').update({ ...p, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) throw error;
    return { ok: true };
  },

  // Blog posts
  blog_create: async (sb, p) => {
    const { data, error } = await sb.from('blog_posts').insert(p).select().single();
    if (error) throw error;
    return data;
  },
  blog_update: async (sb, { id, patch }) => {
    const { data, error } = await sb.from('blog_posts').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  blog_delete: async (sb, { id }) => {
    const { error } = await sb.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },

  // Reviews moderation
  review_update: async (sb, { id, patch }) => {
    const { error } = await sb.from('reviews').update(patch).eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
  review_delete: async (sb, { id }) => {
    const { error } = await sb.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
  reviews_list: async (sb) => {
    const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Leads (admin-only)
  leads_list: async (sb) => {
    const { data, error } = await sb.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  lead_delete: async (sb, { id }) => {
    const { error } = await sb.from('leads').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
  leads_clear: async (sb) => {
    const { error } = await sb.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
    return { ok: true };
  },
  leads_purge_old: async (sb) => {
    const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
    const { data, error } = await sb.from('leads').delete().lt('created_at', cutoff).select('id');
    if (error) throw error;
    return { removed: data?.length ?? 0 };
  },

  // Page visits (analytics)
  visits_list: async (sb, { sinceDays = 30 } = {}) => {
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
    const { data, error } = await sb
      .from('page_visits')
      .select('created_at, visitor_id')
      .gte('created_at', since);
    if (error) throw error;
    return data;
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders });
    }

    const ADMIN_JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!ADMIN_JWT_SECRET || !SUPABASE_URL || !SERVICE_ROLE) {
      console.error('admin-action: missing env');
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: jsonHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const { token, op, payload } = body ?? {};

    const ok = await verifyToken(ADMIN_JWT_SECRET, token);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jsonHeaders });
    }

    const handler = typeof op === 'string' ? ops[op] : undefined;
    if (!handler) {
      return new Response(JSON.stringify({ error: 'Unknown op' }), { status: 400, headers: jsonHeaders });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const data = await handler(sb, payload ?? {});
    return new Response(JSON.stringify({ data }), { headers: jsonHeaders });
  } catch (e) {
    console.error('admin-action error', e);
    return new Response(JSON.stringify({ error: (e as Error).message || 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
