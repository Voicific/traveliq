/**
 * Cloudflare Pages Function — admin-only blog writes.
 *
 * POST /api/admin-blog with `Authorization: Bearer <Supabase access token>` and
 * a body of `{ action: 'saveBlogPost', post }` or `{ action: 'deleteBlogPost', id }`.
 * Only a signed-in TravelIQ admin may create, edit or delete posts.
 * See src/lib/server/sheetsAdmin.ts.
 */
import { AdminEnv, callScript, json, requireAdmin } from '../../src/lib/server/sheetsAdmin.ts';

interface BlogRequest {
  action?: string;
  post?: unknown;
  id?: unknown;
}

export async function onRequestPost(context: { request: Request; env: AdminEnv }): Promise<Response> {
  const denied = await requireAdmin(context.request, context.env);
  if (denied) return denied;

  let body: BlogRequest;
  try {
    body = (await context.request.json()) as BlogRequest;
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  // Same envelope the site has always sent the script: { action, payload }.
  if (body.action === 'saveBlogPost' && body.post) {
    return callScript(context.env, { action: 'saveBlogPost', payload: { post: body.post } });
  }
  if (body.action === 'deleteBlogPost' && typeof body.id === 'string' && body.id) {
    return callScript(context.env, { action: 'deleteBlogPost', payload: { id: body.id } });
  }
  return json({ error: 'bad_request' }, 400);
}
