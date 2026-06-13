import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import {
  postToSheet,
  getFromSheet,
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
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'timestamp'>) => Promise<void>;
  pendingCount: number;
  isSyncing: boolean;
  flushPending: () => Promise<void>;
  refreshLeads: () => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);
const LEADS_STORAGE_KEY = 'collectedLeads';

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(getPendingCount);
  const [isSyncing, setIsSyncing] = useState(false);

  const mergeAndStore = useCallback((local: Lead[], remote: Lead[]) => {
    const map = new Map<string, Lead>();
    local.forEach(l => map.set(l.timestamp, l));
    remote.forEach(l => map.set(l.timestamp, l));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setLeads(merged);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }, []);

  const loadLeads = useCallback(async () => {
    let local: Lead[] = [];
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      if (stored) local = JSON.parse(stored);
    } catch {}
    setLeads(local);

    const remote = (await getFromSheet('getLeads')) as Lead[] | null;
    if (remote) mergeAndStore(local, remote);
  }, [mergeAndStore]);

  useEffect(() => {
    loadLeads();
    flushPendingLeads().then(flushed => {
      if (flushed > 0) setPendingCount(getPendingCount());
    });
  }, [loadLeads]);

  const addLead = useCallback(async (data: Omit<Lead, 'timestamp'>) => {
    const lead: Lead = { ...data, timestamp: new Date().toISOString() };

    setLeads(prev => {
      const updated = [lead, ...prev];
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    const ok = await postToSheet('addLead', { lead });
    if (!ok) {
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
