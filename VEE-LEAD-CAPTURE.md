# Vee structured lead capture (capture_demo_lead)

Replaces the old regex transcript-scraping in `SupplierChatbot.tsx` with an
explicit, intent-gated tool call. Two problems solved in one change:

1. **Scope** — the old regex fired on ANY Vee conversation containing an
   email/phone, so a travel agent volunteering contact details during an
   agent-redirect conversation would be misfiled as a supplier demo lead.
   Now the model must call `capture_demo_lead` with `visitorType`, and the
   frontend only records the lead when `visitorType === "supplier"`.
2. **Voice reliability** — spoken emails transcribe as
   "john dot smith at gmail dot com", which the old regex never matched.
   Now the model passes a structured `email` field; the frontend also
   normalises "dot"/"at" patterns and rejects invalid emails with a tool
   result asking Vee to re-confirm the spelling with the visitor.

## Architecture

- `src/services/veeLeadTool.ts` — tool name, Gemini function declaration,
  param validation/normalisation (`processVeeLeadCall`).
- `src/components/SupplierChatbot.tsx`:
  - `submitVeeLead()` — single entry point for both modes. Validates, gates on
    `visitorType === "supplier"`, calls `addLead({ type: 'AI Lead Capture', … })`
    (→ Google Sheet via Apps Script, as before), and dedupes to one lead per
    session. Returns a message that is fed back to the model.
  - **Text chat (Gemini):** `capture_demo_lead` is declared in `tools` alongside
    googleSearch/googleMaps. When the model calls it, the frontend processes it
    and issues a follow-up `generateContent` with the `functionResponse` so Vee
    confirms (or re-asks for a corrected email) in natural language.
  - **Voice chat (ElevenLabs):** the WebSocket handler now processes
    `client_tool_call` events and replies with `client_tool_result`.

Leads still land in the same Google Sheet with type `AI Lead Capture`; the
`message` column now ends with `Captured via Vee chat|voice (structured tool)`
so you can distinguish new-style entries from any legacy regex ones.

## REQUIRED: ElevenLabs dashboard configuration (voice path)

The voice agent (`agent_9701k60px56gezba55q83jamzhbk`) will never emit
`client_tool_call` until the tool is registered on it. In the ElevenLabs
dashboard → Conversational AI → the Vee agent:

### 1. Add a Client Tool

- **Type:** Client
- **Name:** `capture_demo_lead` (must match exactly)
- **Wait for response:** enabled (Vee must hear validation results)
- **Description:**
  > Save a confirmed demo request from a TRAVEL SUPPLIER. Call ONLY after the
  > visitor has identified as a travel supplier (not a travel agent), agreed to
  > book a demo, and confirmed their details read back to them. Never call for
  > travel agents or casual enquiries.
- **Parameters** (all `string`):
  | Name | Required | Description |
  |---|---|---|
  | `visitorType` | yes | `supplier`, `agent`, or `other`. Leads only recorded for `supplier`. |
  | `name` | yes | Full name as confirmed by the visitor. |
  | `email` | yes | Standard form (`john.smith@example.com`). Convert spoken "dot"/"at" before calling. |
  | `company` | no | Company / brand name. |
  | `phone` | no | Phone number if provided. |
  | `notes` | no | Short context (supplier type, main interest). |

### 2. Update the agent's system prompt

Add (aligned with the text-chat prompt in `SupplierChatbot.tsx`):

> **Lead capture (SUPPLIERS ONLY):** When a travel supplier agrees to book a
> demo, collect their name, company, email, and phone. Read every detail back
> for confirmation — spell the email address back letter by letter. Once
> confirmed, call the `capture_demo_lead` tool with `visitorType` "supplier".
> If the tool reports the email looks invalid, re-confirm the spelling and call
> it again. After success, tell them our team will be in touch within one
> business day. NEVER call this tool for travel agents — direct agents to the
> Suppliers directory and the Affiliate Programme instead.

## Testing checklist (before merge)

1. **Text — supplier path:** identify as a supplier, ask for a demo, give
   details, confirm → expect Vee to confirm booking; a new `AI Lead Capture`
   row in the Sheet with `(structured tool)` in the message; notification email.
2. **Text — agent path:** identify as a travel agent, volunteer an email
   address mid-conversation → expect NO lead row (this was the old bug).
3. **Text — invalid email:** give a garbled email, confirm → expect Vee to ask
   to re-confirm, then a correct row after fixing it.
4. **Voice — end-to-end (requires dashboard config above):** real spoken
   conversation as a supplier, spell out an email → expect confirmed lead with
   a correctly-formed email; and as an agent → no lead.
5. **Duplicate guard:** try to book twice in one session → one row only.

## Known risks / notes

- **Gemini multi-tool mixing:** the text path now sends `googleSearch`,
  `googleMaps`, AND `functionDeclarations` together. `gemini-3-pro-preview`
  supports mixed built-in + function tools; if the API ever rejects the combo,
  the fix is dropping googleSearch/googleMaps from Vee's config (she rarely
  needs grounding). Could not be verified locally — no `VITE_GOOGLE_API_KEY`
  in the local env — so test item 1 doubles as verification.
- The old regex path is fully removed; there is no fallback capture. If the
  model never calls the tool, no lead is recorded — prompt quality matters.
- One lead per session (`leadSubmittedRef`), reset when the chat is closed.
