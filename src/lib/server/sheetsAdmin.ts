/**
 * Shared helpers for the admin-only Cloudflare Pages Functions that front the
 * Google Apps Script (leads, blog management).
 *
 * Why this exists: the Apps Script web app must stay publicly callable so the
 * site can file leads, which means anything it will hand back to an anonymous
 * caller is public. Admin actions (reading leads, writing blog posts) are
 * therefore refused by the script unless the request carries a shared secret.
 * That secret can never be shipped to a browser, so the browser calls these
 * functions instead; they prove the caller is a signed-in TravelIQ admin and
 * only then add the secret and forward the request.
 *
 * Cloudflare env vars (plain names, NOT VITE_ prefixed):
 *   SHEETS_ADMIN_SECRET   required. Same value as the Apps Script property
 *                         ADMIN_SECRET. Store it as an encrypted Secret.
 *   SUPABASE_URL          optional override of the project URL.
 *   SUPABASE_ANON_KEY     optional override of the public anon key.
 *
 * Server-only: imported by /functions, never by the browser bundle. It lives
 * under src/ rather than functions/ so it can never be mistaken for a route.
 */
import { GOOGLE_SCRIPT_URL } from '../../config.ts';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../supabasePublic.ts';

export interface AdminEnv {
  SHEETS_ADMIN_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/**
 * Returns null when the caller is a signed-in admin, otherwise the Response to
 * send back. The caller's own Supabase access token is checked with Supabase
 * (so a forged or expired token fails) and then used to read the caller's own
 * profile row, where `role` must be 'admin'.
 */
export async function requireAdmin(request: Request, env: AdminEnv): Promise<Response | null> {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return json({ error: 'not_signed_in' }, 401);

  const base = (env.SUPABASE_URL || SUPABASE_URL).replace(/\/$/, '');
  const headers = {
    apikey: env.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };

  try {
    const userRes = await fetch(`${base}/auth/v1/user`, { headers });
    if (!userRes.ok) return json({ error: 'not_signed_in' }, 401);
    const user = (await userRes.json()) as { id?: string };
    if (!user.id) return json({ error: 'not_signed_in' }, 401);

    const profileRes = await fetch(
      `${base}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
      { headers },
    );
    if (!profileRes.ok) return json({ error: 'forbidden' }, 403);
    const rows = (await profileRes.json()) as Array<{ role?: string }>;
    if (rows[0]?.role !== 'admin') return json({ error: 'forbidden' }, 403);
    return null;
  } catch {
    // Could not confirm who this is: refuse.
    return json({ error: 'auth_unavailable' }, 503);
  }
}

/** Forward an admin action to the Apps Script with the shared secret attached. */
export async function callScript(env: AdminEnv, body: Record<string, unknown>): Promise<Response> {
  if (!env.SHEETS_ADMIN_SECRET) return json({ error: 'not_configured' }, 503);
  try {
    const upstream = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, secret: env.SHEETS_ADMIN_SECRET }),
      redirect: 'follow',
    });
    const text = await upstream.text();
    try {
      return json(JSON.parse(text), 200);
    } catch {
      // Apps Script answered with HTML (sign-in page, error page).
      return json({ success: false, error: 'upstream_not_json', status: upstream.status }, 502);
    }
  } catch {
    return json({ success: false, error: 'upstream_unreachable' }, 502);
  }
}
