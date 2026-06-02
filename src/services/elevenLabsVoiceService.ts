/**
 * ElevenLabs voice service (client side).
 *
 * The ElevenLabs API key is NO LONGER used in the browser. All requests go
 * through the Cloudflare Pages Function at `/api/elevenlabs-tts`, which holds
 * the key server-side. If that endpoint is unavailable (e.g. local `vite dev`
 * without `wrangler pages dev`, or the key is not configured) the request
 * throws and callers fall back to Gemini TTS.
 */

class ElevenLabsVoiceService {
  private proxyUrl = '/api/elevenlabs-tts';

  private async synthesize(text: string, voiceId: string, modelId: string): Promise<string> {
    if (!voiceId) {
      throw new Error('Voice ID is required');
    }

    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId, modelId }),
    });

    if (!response.ok) {
      // 503 = key not configured, 404 = function not deployed (e.g. plain vite dev),
      // 502 = upstream error. In every case fall back to Gemini TTS.
      throw new Error(`ElevenLabs proxy error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  }

  async generateSpeech(text: string, voiceId: string): Promise<string> {
    return this.synthesize(text, voiceId, 'eleven_monolingual_v1');
  }

  async generateSpeechWithAgent(agentId: string, text: string): Promise<string> {
    return this.synthesize(text, agentId, 'eleven_multilingual_v2');
  }
}

export const elevenLabsService = new ElevenLabsVoiceService();
