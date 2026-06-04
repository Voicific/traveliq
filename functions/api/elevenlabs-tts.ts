/**
 * Cloudflare Pages Function — ElevenLabs text-to-speech proxy.
 *
 * Holds the ElevenLabs API key server-side so it is NEVER shipped in the public
 * client bundle. The browser POSTs `{ text, voiceId, modelId? }` to
 * `/api/elevenlabs-tts`; this function adds the key, calls ElevenLabs, and
 * streams the MP3 audio back.
 *
 * Required Cloudflare env var (plain, NOT VITE_ prefixed):
 *   ELEVENLABS_API_KEY
 *
 * If the key is not configured the function returns 503; callers treat any
 * non-OK response as a failure and fall back to Gemini TTS.
 */

interface Env {
  ELEVENLABS_API_KEY?: string;
}

interface TtsRequest {
  text?: string;
  voiceId?: string;
  modelId?: string;
}

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const apiKey = context.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return json({ error: 'not_configured' }, 503);
  }

  let body: TtsRequest;
  try {
    body = (await context.request.json()) as TtsRequest;
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const { text, voiceId, modelId } = body;
  if (!text || !voiceId) {
    return json({ error: 'missing_text_or_voice' }, 400);
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!upstream.ok) {
      return json({ error: 'upstream_error', status: upstream.status }, 502);
    }

    // Stream the audio straight back to the browser.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return json({ error: 'fetch_failed' }, 502);
  }
}
