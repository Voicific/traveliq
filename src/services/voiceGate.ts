/**
 * Client wrapper for the `voice-gate` Supabase edge function.
 *
 * The gate — not this file — decides whether a supplier's voice AI may run. A
 * voice session can only be opened with the single-use token `check` returns,
 * and usage is measured by the server's clock, so nothing here can grant voice
 * past a supplier's allowance. Every failure (network, function not deployed,
 * non-200) is treated as "voice not available" and the chat stays in text.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ypciahmwkiivenlvcoev.supabase.co';
const GATE_URL = `${SUPABASE_URL}/functions/v1/voice-gate`;

export const VOICE_LIMIT_MESSAGE = 'Voice limit reached for this month — still here to help by text.';
export const VOICE_UNAVAILABLE_MESSAGE = 'Voice is unavailable right now — still here to help by text.';

export interface VoiceStatus {
  allow: boolean;
  /** Seconds left this month on the free tier; null = unlimited (paid). */
  remainingSeconds: number | null;
  /** Why voice was refused, when it was. */
  reason?: 'limit_reached' | 'unavailable';
}

export interface VoiceGrant extends VoiceStatus {
  sessionId?: string;
  /** Single-use Gemini Live token. Only present when allow is true. */
  token?: string;
}

async function post(body: object, keepalive = false): Promise<any | null> {
  try {
    const res = await fetch(GATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive,
    });
    const data = await res.json().catch(() => null);
    return data;
  } catch {
    return null;
  }
}

const refused = (data: any): VoiceStatus => ({
  allow: false,
  remainingSeconds: typeof data?.remaining_seconds === 'number' ? data.remaining_seconds : null,
  reason: data?.reason === 'limit_reached' || data?.remaining_seconds === 0 ? 'limit_reached' : 'unavailable',
});

/** Read-only: is voice currently available for this supplier? */
export async function getVoiceStatus(supplierId: string | undefined): Promise<VoiceStatus> {
  if (!supplierId) return refused(null);
  const data = await post({ action: 'status', supplier_id: supplierId });
  if (!data || data.allow !== true) return refused(data);
  return { allow: true, remainingSeconds: data.remaining_seconds ?? null };
}

/** Ask the gate to open a voice session. Must be called before any voice starts. */
export async function checkVoice(supplierId: string | undefined): Promise<VoiceGrant> {
  if (!supplierId) return refused(null);
  const data = await post({ action: 'check', supplier_id: supplierId });
  if (!data || data.allow !== true || !data.token || !data.session_id) return refused(data);
  return {
    allow: true,
    remainingSeconds: data.remaining_seconds ?? null,
    sessionId: data.session_id,
    token: data.token,
  };
}

/**
 * Heartbeat (final = false) or end-of-session (final = true). The server
 * charges the time since the previous call by its own clock. `keepalive` lets
 * the final call complete while the tab is closing. Returns true if the server
 * has ended the session (allowance used up).
 */
export async function logVoice(sessionId: string, final: boolean): Promise<boolean> {
  const data = await post({ action: 'log', session_id: sessionId, final }, final);
  return data?.ended === true;
}
