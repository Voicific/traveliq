import { FunctionDeclaration, Type } from '@google/genai';

/**
 * Structured lead capture for Vee (the TravelIQ chatbot).
 *
 * Replaces the old regex transcript-scraping approach. Vee captures a supplier
 * demo request as an explicit tool call with structured fields:
 *  - Text chat (Gemini): declared via `veeLeadFunctionDeclaration` below.
 *  - Voice chat (ElevenLabs Conversational AI): the SAME tool must be
 *    registered as a Client Tool on the agent in the ElevenLabs dashboard —
 *    see VEE-LEAD-CAPTURE.md. The frontend handles the `client_tool_call`
 *    WebSocket event and routes it through `processVeeLeadCall`.
 *
 * Intent gating: the tool carries an explicit `visitorType`. Leads are only
 * accepted when visitorType === 'supplier' — agent-redirect conversations
 * never produce a lead, no matter what contact details appear in the text.
 *
 * Two-step email confirmation: the tool is called twice. The first call
 * (confirmed omitted/false) validates + normalises and returns the email
 * spelled out for Vee to read back to the visitor character by character;
 * nothing is saved. Only the second call (confirmed=true), after the visitor
 * agrees the email is correct, persists the lead. This closes the root problem
 * of garbled-but-syntactically-valid emails saving silently (a spoken
 * "underscore"/"dash", or a brand name containing "dot") without having to
 * enumerate every spoken token in `normalizeEmail`.
 */

export const VEE_LEAD_TOOL_NAME = 'capture_demo_lead';

export interface VeeLeadParams {
  visitorType?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
  /**
   * Set true ONLY after the visitor has heard the email read back and agreed.
   * Accepts boolean (Gemini) or the string "true" (some ElevenLabs configs).
   */
  confirmed?: boolean | string;
}

export interface VeeLeadResult {
  ok: boolean;
  message: string;
  /** True when the details validated but the read-back confirmation is still pending. */
  needsConfirmation?: boolean;
  /** The normalised email, echoed so the caller can track the pending confirmation. */
  normalizedEmail?: string;
  lead?: { name: string; email: string; agency: string; message: string };
}

/**
 * Repair the two most common spoken-email patterns. This is a best-effort
 * first pass only — the two-step read-back (below) is what actually guarantees
 * correctness, so we deliberately do NOT keep bolting on more token rules here.
 */
export const normalizeEmail = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\s+(?:at|@)\s+/g, '@')
    .replace(/\s+(?:dot|\.)\s+/g, '.')
    .replace(/\s+/g, '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const normalizePhone = (raw: string): string => raw.replace(/[^\d+]/g, '');

const isConfirmed = (v: boolean | string | undefined): boolean =>
  v === true || (typeof v === 'string' && v.trim().toLowerCase() === 'true');

/**
 * Render an email as a character-by-character read-back, symbols as words:
 * "john_smith@gmail.com" -> "j-o-h-n underscore s-m-i-t-h at g-m-a-i-l dot c-o-m".
 * Vee reads this to the visitor so they hear exactly what will be saved — the
 * domain included, which is where mis-transcriptions usually hide.
 */
export const spellOutEmail = (email: string): string => {
  const SYMBOLS: Record<string, string> = {
    '@': 'at', '.': 'dot', '_': 'underscore', '-': 'dash', '+': 'plus',
  };
  const out: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length) { out.push(run.join('-')); run = []; }
  };
  for (const ch of email) {
    if (SYMBOLS[ch]) { flush(); out.push(SYMBOLS[ch]); }
    else run.push(ch);
  }
  flush();
  return out.join(' ');
};

export const processVeeLeadCall = (params: VeeLeadParams): VeeLeadResult => {
  // 1. Intent gate. The typeof check makes a non-string value (e.g. JSON
  //    boolean/number) reject cleanly instead of throwing on .trim() — which
  //    would otherwise leave the voice agent waiting for a tool result.
  if (typeof params.visitorType !== 'string' || params.visitorType.trim().toLowerCase() !== 'supplier') {
    return {
      ok: false,
      message:
        'Not captured: demo leads are only recorded for travel suppliers. ' +
        'This visitor is not a confirmed supplier — do not collect their contact details. ' +
        'If they are a travel agent, direct them to the Suppliers directory and the Affiliate Programme instead.',
    };
  }

  // 2. Name.
  const name = (params.name || '').trim();
  if (!name) {
    return {
      ok: false,
      message: 'Missing name: please ask for the visitor\'s name, confirm it, and call the tool again.',
    };
  }

  // 3. Email shape.
  const email = normalizeEmail(params.email || '');
  if (!email || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      message:
        `The email "${params.email || ''}" does not look valid. ` +
        'Please re-confirm the exact spelling with the visitor (letter by letter if needed) and call the tool again.',
    };
  }

  // 4. Two-step confirmation. On the first call (not yet confirmed) we return
  //    the email spelled out and DO NOT save — Vee must read it back and get a
  //    yes before calling again with confirmed=true.
  if (!isConfirmed(params.confirmed)) {
    return {
      ok: false,
      needsConfirmation: true,
      normalizedEmail: email,
      message:
        `Not saved yet — confirm the email first. Read it back to the visitor exactly, character by character: "${spellOutEmail(email)}", then ask "is that right?". ` +
        'If they confirm it is correct, call capture_demo_lead again with the SAME details and confirmed set to true. ' +
        'If any character is wrong, collect the correction and call again (leave confirmed false) to re-check.',
    };
  }

  // 5. Persist (visitor has confirmed the read-back).
  const phone = normalizePhone(params.phone || '');
  const company = (params.company || '').trim();
  const notes = (params.notes || '').trim();

  return {
    ok: true,
    normalizedEmail: email,
    message: 'Lead saved successfully. Confirm to the visitor that our team will be in touch within one business day.',
    lead: {
      name,
      email,
      agency: company,
      message: `Phone: ${phone || 'N/A'}${notes ? ` | ${notes}` : ''}`,
    },
  };
};

/** Gemini function declaration for the text-chat path. */
export const veeLeadFunctionDeclaration: FunctionDeclaration = {
  name: VEE_LEAD_TOOL_NAME,
  description:
    'Save a confirmed demo request from a TRAVEL SUPPLIER, using a TWO-STEP flow. ' +
    'STEP 1 — after a supplier agrees to a demo and gives their details, call this with confirmed=false (or omitted). ' +
    'The tool returns their email spelled out; read it back to the visitor character by character and ask if it is exactly right. ' +
    'STEP 2 — only once the visitor confirms the email is correct, call again with the SAME details and confirmed=true to actually save. ' +
    'Never call this for travel agents or casual enquiries, and never set confirmed=true before the visitor has heard the email read back and agreed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      visitorType: {
        type: Type.STRING,
        enum: ['supplier', 'agent', 'other'],
        description: 'Who the visitor is. Leads are only recorded for "supplier".',
      },
      name: { type: Type.STRING, description: 'Full name, as confirmed by the visitor.' },
      company: { type: Type.STRING, description: 'Company / brand name.' },
      email: {
        type: Type.STRING,
        description:
          'Email address in standard form (john.smith@example.com). If the visitor spelled it out ' +
          'or said "dot"/"at", convert to standard form before calling.',
      },
      phone: { type: Type.STRING, description: 'Phone number, if provided.' },
      notes: { type: Type.STRING, description: 'Optional short context, e.g. supplier type or main interest.' },
      confirmed: {
        type: Type.BOOLEAN,
        description:
          'Leave false/omitted on the first call. Set true ONLY after you have read the returned ' +
          'email back to the visitor character by character and they confirmed it is correct.',
      },
    },
    required: ['visitorType', 'name', 'email'],
  },
};
