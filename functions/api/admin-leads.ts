/**
 * Cloudflare Pages Function — admin-only read of the Leads sheet.
 *
 * GET /api/admin-leads with `Authorization: Bearer <Supabase access token>`.
 * Returns the leads only to a signed-in TravelIQ admin. Lead data is personal
 * data: it must never be reachable without this check. See src/lib/server/sheetsAdmin.ts.
 */
import { AdminEnv, callScript, requireAdmin } from '../../src/lib/server/sheetsAdmin.ts';

export async function onRequestGet(context: { request: Request; env: AdminEnv }): Promise<Response> {
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;
  return callScript(context.env, { action: 'getLeads' });
}
