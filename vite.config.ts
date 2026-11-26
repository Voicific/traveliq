import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

const GEMINI_UPSTREAM = 'https://generativelanguage.googleapis.com'

/**
 * Dev-only mirror of functions/api/gemini/[[path]].ts.
 *
 * Production serves the Gemini proxy as a Cloudflare Pages Function, which does
 * not run under `vite dev`. This middleware gives `pnpm dev` the same
 * `/api/gemini/*` endpoint so the chatbots work locally — reading GOOGLE_API_KEY
 * from the Node process (NOT a VITE_ var), so the key is never inlined into the
 * client bundle, in dev or prod.
 */
function geminiDevProxy(apiKey: string): Plugin {
  return {
    name: 'gemini-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gemini', async (req: IncomingMessage, res: ServerResponse) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'GET' && req.method !== 'POST') return send(405, { error: 'method_not_allowed' })
        if (!apiKey) return send(503, { error: 'not_configured' })

        // Connect strips the '/api/gemini' mount prefix, so req.url is the upstream path + query.
        const upstreamUrl = `${GEMINI_UPSTREAM}${req.url}`

        const headers: Record<string, string> = { 'x-goog-api-key': apiKey }
        if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'] as string

        let body: Buffer | undefined
        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          body = Buffer.concat(chunks)
        }

        try {
          const upstream = await fetch(upstreamUrl, { method: req.method, headers, body })
          const buf = Buffer.from(await upstream.arrayBuffer())
          res.statusCode = upstream.status
          const ct = upstream.headers.get('Content-Type')
          if (ct) res.setHeader('Content-Type', ct)
          res.setHeader('Cache-Control', 'no-store')
          res.end(buf)
        } catch {
          send(502, { error: 'fetch_failed' })
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), geminiDevProxy(env.GOOGLE_API_KEY ?? '')],
  }
})
