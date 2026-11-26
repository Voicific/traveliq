/**
 * Cloudflare Pages Function — Google Gemini reverse proxy (catch-all).
 *
 * Holds the Google AI API key server-side so it is NEVER shipped in the public
 * client bundle. The browser's @google/genai SDK is pointed at `/api/gemini`
 * (via httpOptions.baseUrl in src/context/AIContext.tsx) with a throwaway key.
 * Every REST call the SDK makes — generateContent, generateImages,
 * generateVideos, operation polling, file download — lands here; this function
 * strips whatever key the browser sent, injects the real one, forwards to
 * Google, and streams the response straight back.
 *
 * The exposed VITE_GOOGLE_API_KEY is gone: the key now lives only in this
 * function's environment, exactly like the ElevenLabs and Serper proxies.
 *
 * Required Cloudflare env var (plain, NOT VITE_ prefixed):
 *   GOOGLE_API_KEY
 *
 * If the key is not configured the function returns 503 `{ error: 'not_configured' }`;
 * the SDK surfaces that as a request error and the chat shows a friendly message.
 *
 * NOTE (defence in depth, not a hard gate): the upstream host is hard-pinned to
 * generativelanguage.googleapis.com and only GET/POST to a versioned path are
 * allowed, so the proxy can reach nothing but the Gemini API. A same-origin
 * guard blocks other sites' browsers from spending our quota. Per-request
 * metering/gating (like the Supabase voice-gate on the Live voice path) is a
 * sensible future hardening step if abuse ever shows up.
 */

const UPSTREAM = 'https://generativelanguage.googleapis.com';
const ALLOWED_VERSIONS = new Set(['v1', 'v1beta', 'v1alpha', 'v1beta1']);
const ALLOWED_METHODS = new Set(['GET', 'POST']);

interface Env {
  GOOGLE_API_KEY?: string;
}

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** Allow same-origin requests; block other sites' browsers. Fails open when no Origin is sent (same-origin GETs). */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // same-origin GET/HEAD send no Origin header
  try {
    const originHost = new URL(origin).hostname;
    const selfHost = new URL(request.url).hostname;
    if (originHost === selfHost) return true;
    if (originHost === 'localhost' || originHost === '127.0.0.1') return true;
    if (originHost === 'traveliq.biz' || originHost.endsWith('.traveliq.biz')) return true;
    // Cloudflare Pages preview deployments
    if (originHost.endsWith('.pages.dev')) return true;
    return false;
  } catch {
    return false;
  }
}

export async function onRequest(context: { request: Request; env: Env; params: { path?: string[] } }): Promise<Response> {
  const { request, env } = context;

  if (!ALLOWED_METHODS.has(request.method)) {
    return json({ error: 'method_not_allowed' }, 405);
  }
  if (!originAllowed(request)) {
    return json({ error: 'forbidden_origin' }, 403);
  }

  const apiKey = env.GOOGLE_API_KEY;
  if (!apiKey) {
    return json({ error: 'not_configured' }, 503);
  }

  // params.path is the catch-all segments, e.g. ['v1beta','models','gemini-3-pro-preview:generateContent'].
  const segments = context.params.path ?? [];
  if (segments.length === 0 || !ALLOWED_VERSIONS.has(segments[0])) {
    return json({ error: 'bad_path' }, 400);
  }
  if (segments.some((s) => s.includes('..') || s.includes('://'))) {
    return json({ error: 'bad_path' }, 400);
  }

  // Preserve the query string but drop any client-supplied key.
  const incoming = new URL(request.url);
  incoming.searchParams.delete('key');
  const query = incoming.searchParams.toString();
  const upstreamUrl = `${UPSTREAM}/${segments.join('/')}${query ? `?${query}` : ''}`;

  // Build a clean header set — never forward the browser's throwaway key or cookies.
  const headers = new Headers();
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);
  const apiClient = request.headers.get('x-goog-api-client');
  if (apiClient) headers.set('x-goog-api-client', apiClient);
  headers.set('x-goog-api-key', apiKey);

  const init: RequestInit = { method: request.method, headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
    const respHeaders = new Headers();
    const upstreamType = upstream.headers.get('Content-Type');
    if (upstreamType) respHeaders.set('Content-Type', upstreamType);
    respHeaders.set('Cache-Control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  } catch {
    return json({ error: 'fetch_failed' }, 502);
  }
}
