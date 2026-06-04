/**
 * Cloudflare Pages Function — Serper news proxy.
 *
 * Holds the Serper API key server-side so it is NEVER shipped in the public
 * client bundle. The browser calls `/api/news` (no key); this function adds the
 * key and forwards the request to Serper.
 *
 * Required Cloudflare env var (plain, NOT VITE_ prefixed):
 *   SERPER_API_KEY
 *
 * If the key is not configured the function returns 503 and the NewsTicker
 * falls back to its hardcoded headlines — graceful degradation, no crash.
 */

interface Env {
  SERPER_API_KEY?: string;
}

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const apiKey = context.env.SERPER_API_KEY;
  if (!apiKey) {
    return json({ error: 'not_configured' }, 503);
  }

  try {
    const upstream = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'travel trade news 2025 UK agents suppliers',
        gl: 'uk',
        num: 10,
        tbs: 'qdr:d', // last day
      }),
    });

    if (!upstream.ok) {
      return json({ error: 'upstream_error', status: upstream.status }, 502);
    }

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache at the edge for 5 minutes to limit Serper usage.
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return json({ error: 'fetch_failed' }, 502);
  }
}
