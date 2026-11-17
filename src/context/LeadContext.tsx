import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import {
  postToSheet,
  getLeadsForAdmin,
  addPendingLead,
  flushPendingLeads,
  getPendingCount,
} from '../services/sheetsService.ts';

export interface Lead {
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

interface LeadContextType {
  /** Populated only for a signed-in admin, after refreshLeads(). */
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'timestamp'>) => Promise<void>;
  pendingCount: number;
  isSyncing: boolean;
  flushPending: () => Promise<void>;
  refreshLeads: () => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

// Earlier versions fetched EVERY lead for every visitor and cached the list in
// localStorage under this key. Leads are personal data and must never reach a
// visitor's browser, so the fetch is gone and any cached copy is deleted the
// next time the site loads. Do not start writing to this key again.
const LEGACY_LEADS_STORAGE_KEY = 'collectedLeads';

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(getPendingCount);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_LEADS_STORAGE_KEY);
    } catch {
      // Storage blocked (private mode): nothing was cached, nothing to clear.
    }
    // Retry any of this visitor's own submissions that failed to send earlier.
    flushPendingLeads().then(flushed => {
      if (flushed > 0) setPendingCount(getPendingCount());
    });
  }, []);

  // Admin only. The server checks the caller is a signed-in admin; for anyone
  // else it returns nothing and the list simply stays empty.
  const loadLeads = useCallback(async () => {
    const remote = await getLeadsForAdmin();
    if (!remote) return;
    const sorted = [...(remote as Lead[])].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setLeads(sorted);
  }, []);

  const addLead = useCallback(async (data: Omit<Lead, 'timestamp'>) => {
    const lead: Lead = { ...data, timestamp: new Date().toISOString() };

    const ok = await postToSheet('addLead', { lead });
    if (!ok) {
      // Kept in this visitor's own browser (it is their own submission) and
      // retried on their next visit.
      addPendingLead(lead);
      setPendingCount(getPendingCount());
    }
  }, []);

  const flushPending = useCallback(async () => {
    setIsSyncing(true);
    try {
      await flushPendingLeads();
      setPendingCount(getPendingCount());
      await loadLeads();
    } finally {
      setIsSyncing(false);
    }
  }, [loadLeads]);

  const refreshLeads = useCallback(async () => {
    setIsSyncing(true);
    try {
      await loadLeads();
    } finally {
      setIsSyncing(false);
    }
  }, [loadLeads]);

  return (
    <LeadContext.Provider value={{ leads, addLead, pendingCount, isSyncing, flushPending, refreshLeads }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useLeads must be used within a LeadProvider');
  return context;
};
