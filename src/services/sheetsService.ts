import { GOOGLE_SCRIPT_URL } from '../config.ts';
import { supabase } from '../lib/supabase.ts';

export interface PendingLead {
  type: 'Newsletter' | 'Demo Request' | 'Agent Chat' | 'Contact Inquiry' | 'AI Lead Capture' | 'Affiliate Inquiry';
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  agency?: string;
  supplierType?: string;
  plan?: string;
  message?: string;
  wantsDemo?: boolean;
  timestamp: string;
}

export interface ManagedBlogPost {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  summary: string;
  author: string;
  content: string;
  published: boolean | string;
  createdAt: string;
}

const PENDING_LEADS_KEY = 'traveliq_pending_leads';
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function postWithRetry(body: object, attempts = 3): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      if (i > 0) await sleep(i * 1500);
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch {
      if (i === attempts - 1) return false;
    }
  }
  return false;
}

export async function postToSheet(action: string, payload: object): Promise<boolean> {
  if (!GOOGLE_SCRIPT_URL) return false;
  return postWithRetry({ action, payload });
}

/**
 * PUBLIC, unauthenticated read. Anything fetched this way is readable by anyone
 * on the internet, so it is restricted to actions that return public content.
 * Never add an action here that returns personal data (leads, agents, chat
 * history): those go through an admin-checked /api/admin-* function instead.
 */
const PUBLIC_READ_ACTIONS = ['getBlogPosts'] as const;

export async function getFromSheet(action: (typeof PUBLIC_READ_ACTIONS)[number]): Promise<any> {
  if (!GOOGLE_SCRIPT_URL || !PUBLIC_READ_ACTIONS.includes(action)) return null;
  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=${action}&t=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// --- Admin-only calls (via Cloudflare functions that verify a Supabase admin) ---

async function adminHeaders(): Promise<Record<string, string> | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

/**
 * All leads, for the admin dashboard. Returns null for anyone who is not a
 * signed-in admin (the server decides), or if the endpoint is unavailable
 * (e.g. plain `vite dev`, where Pages Functions do not run).
 */
export async function getLeadsForAdmin(): Promise<PendingLead[] | null> {
  try {
    const headers = await adminHeaders();
    if (!headers) return null;
    const res = await fetch('/api/admin-leads', { headers });
    if (!res.ok) return null;
    const result = await res.json();
    return result.success && Array.isArray(result.data) ? result.data : null;
  } catch {
    return null;
  }
}

async function adminBlogWrite(body: object): Promise<boolean> {
  try {
    const headers = await adminHeaders();
    if (!headers) return false;
    const res = await fetch('/api/admin-blog', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return false;
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  }
}

// --- Pending leads queue (for when Sheets write fails) ---

export function getPendingLeads(): PendingLead[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_LEADS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addPendingLead(lead: PendingLead): void {
  const pending = getPendingLeads();
  if (!pending.find(p => p.timestamp === lead.timestamp)) {
    pending.push(lead);
    localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(pending));
  }
}

export function getPendingCount(): number {
  return getPendingLeads().length;
}

export async function flushPendingLeads(): Promise<number> {
  const pending = getPendingLeads();
  if (pending.length === 0) return 0;
  const failed: PendingLead[] = [];
  for (const lead of pending) {
    const ok = await postToSheet('addLead', { lead });
    if (!ok) failed.push(lead);
  }
  localStorage.setItem(PENDING_LEADS_KEY, JSON.stringify(failed));
  return pending.length - failed.length;
}

// --- Blog post helpers ---

export async function getBlogPostsFromSheet(): Promise<ManagedBlogPost[] | null> {
  const data = await getFromSheet('getBlogPosts');
  if (!data) return null;
  return (data as ManagedBlogPost[]).filter(
    p => p.published === true || p.published === 'TRUE' || p.published === 'true'
  );
}

export async function saveBlogPostToSheet(post: ManagedBlogPost): Promise<boolean> {
  return adminBlogWrite({ action: 'saveBlogPost', post });
}

export async function deleteBlogPostFromSheet(id: string): Promise<boolean> {
  return adminBlogWrite({ action: 'deleteBlogPost', id });
}

export async function getAllBlogPostsFromSheet(): Promise<ManagedBlogPost[] | null> {
  return getFromSheet('getBlogPosts');
}
