/**
 * Supabase Edge Function — voice-gate
 *
 * The server-side authority for supplier voice. The browser never decides
 * whether voice is allowed and never reports a duration:
 *
 *   - `check`  opens a voice session and, if allowed, mints a single-use,
 *              short-lived Gemini Live token. No allow → no token → no voice.
 *   - `log`    charges the time elapsed since the session's last heartbeat,
 *              measured by THIS function's clock, to supplier_usage.
 *   - `status` read-only: is voice currently available for this supplier?
 *   - `tts`    read-only: may this supplier use the premium ElevenLabs voice?
 *              (called by the Cloudflare /api/elevenlabs-tts proxy)
 *
 * Callers are anonymous travel agents, so deploy with JWT verification off:
 *   supabase functions deploy voice-gate --no-verify-jwt
 *
 * Secrets:
 *   GEMINI_API_KEY             server-side Google AI key (set by you)
 *   SUPABASE_URL               provided automatically
 *   SUPABASE_SERVICE_ROLE_KEY  provided automatically
 *   ALLOWED_ORIGIN_SUFFIXES    optional, comma-separated. Default below.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const FREE_CAP_SECONDS = 30 * 60; // 30 min of voice per UTC month on the free tier
const FREE_SESSION_MAX_SECONDS = 10 * 60; // longest single free-tier session
const PAID_SESSION_MAX_SECONDS = 30 * 60; // token lifetime for paid tiers
const STALE_AFTER_SECONDS = 150; // no heartbeat for this long → session is dead
const STALE_GRACE_SECONDS = 60; // charged past the last heartbeat of a dead session
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const allowedSuffixes = (Deno.env.get('ALLOWED_ORIGIN_SUFFIXES') ?? 'traveliq.biz,.pages.dev,localhost')
  .split(',').map((s) => s.trim()).filter(Boolean);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  let ok = false;
  try {
    const host = new URL(origin).hostname;
    ok = allowedSuffixes.some((s) => host === s.replace(/^\./, '') || host.endsWith(s.startsWith('.') ? s : `.${s}`));
  } catch { /* no / invalid Origin (server-to-server) */ }
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://traveliq.biz',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Vary': 'Origin',
  };
}

const currentPeriod = () => new Date().toISOString().slice(0, 7); // YYYY-MM, UTC

interface SupplierRow {
  id: string;
  tier: string;
  use_eleven_labs: boolean | null;
  eleven_labs_agent_id: string | null;
}

async function getSupplier(id: string): Promise<SupplierRow | null> {
  const { data } = await supabase
    .from('suppliers')
    .select('id, tier, use_eleven_labs, eleven_labs_agent_id')
    .eq('id', id)
    .maybeSingle();
  return (data as SupplierRow | null) ?? null;
}

const isPaid = (tier: string) => tier === 'enhanced' || tier === 'growth';

async function usedSeconds(supplierId: string, period: string): Promise<number> {
  const { data } = await supabase
    .from('supplier_usage')
    .select('voice_seconds_used')
    .eq('supplier_id', supplierId)
    .eq('period', period)
    .maybeSingle();
  return (data?.voice_seconds_used as number | undefined) ?? 0;
}

async function charge(supplierId: string, period: string, seconds: number) {
  if (seconds <= 0) return;
  const { error } = await supabase.rpc('voice_usage_add', {
    p_supplier: supplierId,
    p_period: period,
    p_seconds: seconds,
  });
  if (error) console.error('voice_usage_add failed', error);
}

/** Close sessions whose browser vanished without a final log, and bill them. */
async function settleStaleSessions(supplierId: string) {
  const cutoff = new Date(Date.now() - STALE_AFTER_SECONDS * 1000).toISOString();
  const { data: stale } = await supabase
    .from('voice_sessions')
    .select('id, period, last_seen_at, granted_seconds, charged_seconds')
    .eq('supplier_id', supplierId)
    .is('ended_at', null)
    .lt('last_seen_at', cutoff);

  for (const s of stale ?? []) {
    const headroom = s.granted_seconds == null
      ? STALE_GRACE_SECONDS
      : Math.max(0, s.granted_seconds - s.charged_seconds);
    const extra = Math.min(STALE_GRACE_SECONDS, headroom);
    // `is ended_at null` makes this a no-op if another request settled it first.
    const { data: closed } = await supabase
      .from('voice_sessions')
      .update({ ended_at: new Date().toISOString(), charged_seconds: s.charged_seconds + extra })
      .eq('id', s.id)
      .is('ended_at', null)
      .select('id');
    if (closed && closed.length > 0) await charge(supplierId, s.period, extra);
  }
}

/** Free-tier seconds still available, net of what open sessions may yet use. */
async function freeRemaining(supplierId: string, period: string): Promise<number> {
  const used = await usedSeconds(supplierId, period);
  const { data: open } = await supabase
    .from('voice_sessions')
    .select('granted_seconds, charged_seconds')
    .eq('supplier_id', supplierId)
    .eq('period', period)
    .is('ended_at', null);
  const reserved = (open ?? []).reduce(
    (sum, s) => sum + Math.max(0, (s.granted_seconds ?? 0) - s.charged_seconds),
    0,
  );
  return Math.max(0, FREE_CAP_SECONDS - used - reserved);
}

/** Mint a single-use Gemini Live token that stops working after `seconds`. */
async function mintLiveToken(seconds: number): Promise<string | null> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return null;
  const now = Date.now();
  const res = await fetch('https://generativelanguage.googleapis.com/v1alpha/auth_tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      uses: 1,
      // The session must START within 2 minutes (covers the spoken greeting and
      // the microphone permission prompt) and is cut off by Google at expireTime.
      newSessionExpireTime: new Date(now + 120_000).toISOString(),
      expireTime: new Date(now + (seconds + 120) * 1000).toISOString(),
    }),
  });
  if (!res.ok) {
    console.error('auth_tokens.create failed', res.status, await res.text());
    return null;
  }
  const token = await res.json();
  return typeof token?.name === 'string' ? token.name : null;
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  let body: { action?: string; supplier_id?: string; session_id?: string; final?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const period = currentPeriod();

  try {
    // ---- status / tts / check: keyed on supplier_id --------------------------
    if (body.action === 'status' || body.action === 'tts' || body.action === 'check') {
      if (!body.supplier_id || !UUID_RE.test(body.supplier_id)) {
        return json({ error: 'invalid_supplier_id' }, 400);
      }
      const supplier = await getSupplier(body.supplier_id);
      if (!supplier) return json({ error: 'supplier_not_found' }, 404);
      const paid = isPaid(supplier.tier);

      if (body.action === 'tts') {
        // Premium ElevenLabs voice is a paid-tier feature. Returning the
        // configured voice lets the proxy refuse any other voice ID.
        const allow = paid && !!supplier.use_eleven_labs && !!supplier.eleven_labs_agent_id;
        return json({ allow, voice_id: allow ? supplier.eleven_labs_agent_id : null });
      }

      if (paid && body.action === 'status') {
        return json({ allow: true, remaining_seconds: null, tier: supplier.tier });
      }

      let remaining: number | null = null;
      if (!paid) {
        await settleStaleSessions(supplier.id);
        remaining = await freeRemaining(supplier.id, period);
        if (body.action === 'status') {
          return json({ allow: remaining > 0, remaining_seconds: remaining, tier: supplier.tier });
        }
        if (remaining <= 0) {
          return json({ allow: false, remaining_seconds: 0, reason: 'limit_reached' });
        }
      }

      // ---- check: allowed → mint token, then open the session ----------------
      const granted = paid ? null : Math.min(remaining!, FREE_SESSION_MAX_SECONDS);
      const token = await mintLiveToken(granted ?? PAID_SESSION_MAX_SECONDS);
      if (!token) return json({ allow: false, remaining_seconds: remaining, reason: 'unavailable' }, 503);

      const { data: session, error } = await supabase
        .from('voice_sessions')
        .insert({ supplier_id: supplier.id, period, granted_seconds: granted })
        .select('id')
        .single();
      if (error || !session) {
        console.error('voice_sessions insert failed', error);
        return json({ allow: false, remaining_seconds: remaining, reason: 'unavailable' }, 503);
      }

      return json({
        allow: true,
        remaining_seconds: remaining,
        session_seconds: granted,
        session_id: session.id,
        token,
      });
    }

    // ---- log: heartbeat / end of session, keyed on session_id ----------------
    if (body.action === 'log') {
      if (!body.session_id || !UUID_RE.test(body.session_id)) {
        return json({ error: 'invalid_session_id' }, 400);
      }
      const { data: s } = await supabase
        .from('voice_sessions')
        .select('id, supplier_id, period, last_seen_at, ended_at, granted_seconds, charged_seconds')
        .eq('id', body.session_id)
        .maybeSingle();
      if (!s) return json({ error: 'session_not_found' }, 404);
      if (s.ended_at) return json({ ok: true, ended: true });

      const now = new Date();
      const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(s.last_seen_at).getTime()) / 1000));
      const ceiling = (s.granted_seconds ?? PAID_SESSION_MAX_SECONDS) - s.charged_seconds;
      const delta = Math.max(0, Math.min(elapsed, ceiling));
      const exhausted = s.granted_seconds != null && s.charged_seconds + delta >= s.granted_seconds;
      const end = body.final === true || exhausted;

      // Guard on last_seen_at so two overlapping logs cannot both charge the
      // same stretch of time.
      const { data: updated } = await supabase
        .from('voice_sessions')
        .update({
          last_seen_at: now.toISOString(),
          charged_seconds: s.charged_seconds + delta,
          ...(end ? { ended_at: now.toISOString() } : {}),
        })
        .eq('id', s.id)
        .eq('last_seen_at', s.last_seen_at)
        .is('ended_at', null)
        .select('id');
      if (updated && updated.length > 0) await charge(s.supplier_id, s.period, delta);

      return json({ ok: true, ended: end, session_remaining_seconds: s.granted_seconds == null ? null : Math.max(0, ceiling - delta) });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (err) {
    console.error('voice-gate error', err);
    return json({ allow: false, error: 'internal_error' }, 500);
  }
});
