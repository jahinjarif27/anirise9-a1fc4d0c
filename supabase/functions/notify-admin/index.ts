import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const ADMIN_EMAIL = 'jahinjarif27@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Internal-only: must be called from another edge function with the shared token.
    const INTERNAL_TOKEN = Deno.env.get('NOTIFY_INTERNAL_TOKEN');
    const provided = req.headers.get('x-internal-token');
    if (!INTERNAL_TOKEN || provided !== INTERNAL_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      throw new Error('Email credentials not configured');
    }

    const { subject, html } = await req.json();
    if (!subject || !html || typeof subject !== 'string' || typeof html !== 'string') {
      return new Response(JSON.stringify({ error: 'subject and html required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'AniRise Notify <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: subject.slice(0, 200),
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error', res.status, data);
      return new Response(JSON.stringify({ error: 'send failed', details: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-admin error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
