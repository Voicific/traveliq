import { FunctionDeclaration, Type } from '@google/genai';

/**
 * Structured lead capture for Vee (the TravelIQ chatbot).
 *
 * Replaces the old regex transcript-scraping approach. Vee now captures a
 * supplier demo request as an explicit tool call with structured fields:
 *  - Text chat (Gemini): declared via `veeLeadFunctionDeclaration` below.
 *  - Voice chat (ElevenLabs Conversational AI): the SAME tool must be
 *    registered as a Client Tool on the agent in the ElevenLabs dashboard —
 *    see VEE-LEAD-CAPTURE.md. The frontend handles the `client_tool_call`
 *    WebSocket event and routes it through `processVeeLeadCall`.
 *
 * Intent gating: the tool carries an explicit `visitorType`. Leads are only
 * accepted when visitorType === 'supplier' — agent-redirect conversations
 * never produce a lead, no matter what contact details appear in the text.
 */

export const VEE_LEAD_TOOL_NAME = 'capture_demo_lead';

export interface VeeLeadParams {
  visitorType?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface VeeLeadResult {
  ok: boolean;
  /** Fed back to the model as the tool result so Vee can react verbally. */
  message: string;
  lead?: {
    name: string;
    email: string;
    agency: string;
    message: string;
  };
}

/**
 * Voice transcripts often render spoken emails as "john dot smith at gmail
 * dot com". The model is prompted to normalise before calling the tool, but
 * we repair the common patterns here as a second line of defence.
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

export const processVeeLeadCall = (params: VeeLeadParams): VeeLeadResult => {
  const visitorType = (params.visitorType || '').trim().toLowerCase();

  if (visitorType !== 'supplier') {
    return {
      ok: false,
      message:
        'Not captured: demo leads are only recorded for travel suppliers. ' +
        'This visitor is not a supplier — do not collect their contact details. ' +
        'If they are a travel agent, direct them to the Suppliers directory and the Affiliate Programme instead.',
    };
  }

  const name = (params.name || '').trim();
  if (!name) {
    return {
      ok: false,
      message: 'Missing name: please ask for the visitor\'s name, confirm it, and call the tool again.',
    };
  }

  const email = normalizeEmail(params.email || '');
  if (!email || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      message:
        `The email "${params.email || ''}" does not look valid. ` +
        'Please re-confirm the exact spelling with the visitor (letter by letter if needed) and call the tool again.',
    };
  }

  const phone = normalizePhone(params.phone || '');
  const company = (params.company || '').trim();
  const notes = (params.notes || '').trim();

  return {
    ok: true,
    message:
      'Lead saved successfully. Confirm to the visitor that our team will be in touch within one business day.',
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
    'Save a confirmed demo request from a TRAVEL SUPPLIER. Call this ONLY after ' +
    '(1) the visitor has identified as a travel supplier (not a travel agent), ' +
    '(2) they have agreed to book a demo, and ' +
    '(3) you have collected AND repeated back their details for confirmation. ' +
    'Never call this for travel agents or casual enquiries.',
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
    },
    required: ['visitorType', 'name', 'email'],
  },
};
