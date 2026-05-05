import { GOOGLE_SCRIPT_URL } from '../config.ts';

export interface PendingLead {
  type: 'Newsletter' | 'Demo Request' | 'Agent Chat' | 'Contact Inquiry' | 'AI Lead Capture';
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  agency?: string;
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

export async function getFromSheet(action: string): Promise<any> {
  if (!GOOGLE_SCRIPT_URL) return null;
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
  return postToSheet('saveBlogPost', { post });
}

export async function deleteBlogPostFromSheet(id: string): Promise<boolean> {
  return postToSheet('deleteBlogPost', { id });
}

export async function getAllBlogPostsFromSheet(): Promise<ManagedBlogPost[] | null> {
  return getFromSheet('getBlogPosts');
}
