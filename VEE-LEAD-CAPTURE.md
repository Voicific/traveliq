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
- **Wait for response:** enabled (Vee must hear the read-back / validation result)
- **Description:**
  > Save a confirmed demo request from a TRAVEL SUPPLIER, using a TWO-STEP flow.
  > STEP 1: after the supplier agrees to a demo and gives their details, call
  > with confirmed=false — the tool returns their email spelled out; read it
  > back to the visitor character by character and ask if it is exactly right.
  > STEP 2: only once they confirm, call again with the same details and
  > confirmed=true to save. Never call for travel agents or casual enquiries,
  > and never set confirmed=true before the visitor has heard the email read
  > back and agreed.
- **Parameters:**
  | Name | Type | Required | Description |
  |---|---|---|---|
  | `visitorType` | string | yes | `supplier`, `agent`, or `other`. Leads only recorded for `supplier`. |
  | `name` | string | yes | Full name as confirmed by the visitor. |
  | `email` | string | yes | Standard form (`john.smith@example.com`). Convert spoken "dot"/"at" before calling. |
  | `company` | string | no | Company / brand name. |
  | `phone` | string | no | Phone number if provided. |
  | `notes` | string | no | Short context (supplier type, main interest). |
  | `confirmed` | boolean | no | Leave false on the first call. Set true ONLY after the email read-back is confirmed. If the ElevenLabs UI only allows string params, use `"true"`/`"false"` — the frontend accepts either. |

### 2. Update the agent's system prompt

Add (aligned with the text-chat prompt in `SupplierChatbot.tsx`):

> **Lead capture (SUPPLIERS ONLY):** When a travel supplier agrees to book a
> demo, collect their name, company, email, and phone. Then call
> `capture_demo_lead` with `visitorType` "supplier" and `confirmed` false — the
> tool returns the email spelled out character by character. Read that exact
> spelling back to the visitor and ask "is that right?". If any character is
> wrong, take the correction and call again with confirmed false. Only once they
> confirm the email is correct, call `capture_demo_lead` again with the same
> details and `confirmed` true to save. After it saves, tell them our team will
> be in touch within one business day. NEVER call this tool for travel agents —
> direct agents to the Suppliers directory and the Affiliate Programme instead.

## Testing checklist (before merge)

1. **Text — supplier two-step:** identify as a supplier, ask for a demo, give
   details → expect Vee to read the email back character by character and ask to
   confirm (NO row yet). Say "yes" → expect a new `AI Lead Capture` row with
   `(structured tool)` in the message; notification email.
2. **Text — agent path:** identify as a travel agent, volunteer an email
   address mid-conversation → expect NO lead row (this was the old bug).
3. **Text — wrong on read-back:** give an email, and when Vee reads it back say
   "no, it's actually …" → expect the corrected email read back again, then a
   correct row after you confirm.
4. **Text — no premature save:** confirm the model does not save on the first
   (confirmed=false) call — the row appears only after the second call.
5. **Voice — end-to-end (requires dashboard config above):** real spoken
   conversation as a supplier, let Vee read the email back and confirm → expect
   a lead with a correctly-formed email; and as an agent → no lead.
6. **Duplicate guard:** try to book twice in one session → one row only.

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
- **Two-step enforcement is belt-and-braces:** `processVeeLeadCall` gates on
  `confirmed`, and `submitVeeLead` additionally refuses to save a confirmed
  email that wasn't just returned for read-back (`pendingConfirmEmailRef`). The
  code still cannot know the human actually said "yes" — that part relies on the
  prompt — but it does guarantee no save happens without a read-back round for
  that exact address.
- Non-string `visitorType` now rejects cleanly (no `.trim()` throw), so the
  voice agent always receives a `client_tool_result`.
