import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GOOGLE_SCRIPT_URL as SCRIPT_URL } from '../config.ts';

// --- Google Sheets Integration ---

const addLeadToSheet = async (lead: Lead) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
    console.warn('Google Sheets integration is not configured. Skipping lead save.');
    return;
  }
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addLead', payload: { lead } }),
    });
  } catch (error) {
    console.error('Failed to add lead to Google Sheet:', error);
  }
};

const getLeadsFromSheet = async (): Promise<Lead[] | null> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
        console.warn('Google Sheets integration is not configured. Cannot fetch leads.');
        return null;
    }
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getLeads&t=${new Date().getTime()}`, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to get leads from sheet.');
        return result.data as Lead[];
    } catch (error) {
        console.error('Failed to fetch leads from Google Sheet:', error);
        return null;
    }
};
// --- End Google Sheets Integration ---

export interface Lead {
  type: 'Newsletter' | 'Demo Request' | 'Agent Chat' | 'Contact Inquiry' | 'AI Lead Capture';
  firstName?: string;
  lastName?: string;
  name?: string; // for forms with single name field
  email: string;
  agency?: string;
  plan?: string;
  message?: string;
  timestamp: string;
}

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'timestamp'>) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);
const LEADS_STORAGE_KEY = 'collectedLeads';

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Effect for initial load from storage and/or Google Sheet
  useEffect(() => {
    const loadLeads = async () => {
        let localLeads: Lead[] = [];
        try {
            const storedLeads = localStorage.getItem(LEADS_STORAGE_KEY);
            if (storedLeads) {
                localLeads = JSON.parse(storedLeads);
            }
        } catch (error) {
            console.error("Failed to parse leads from local storage", error);
        }

        const sheetLeads = await getLeadsFromSheet();

        if (sheetLeads) {
            const combinedLeads = new Map<string, Lead>();
            localLeads.forEach(lead => combinedLeads.set(lead.timestamp, lead));
            sheetLeads.forEach(lead => combinedLeads.set(lead.timestamp, lead));
            
            const allLeads = Array.from(combinedLeads.values()).sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            setLeads(allLeads);
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(allLeads));
        } else {
            setLeads(localLeads);
        }
    };
    loadLeads();
  }, []);

  const addLead = (newLeadData: Omit<Lead, 'timestamp'>) => {
    const leadWithTimestamp: Lead = {
      ...newLeadData,
      timestamp: new Date().toISOString(),
    };
    
    const updatedLeads = [...leads, leadWithTimestamp];
    setLeads(updatedLeads);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updatedLeads));
    
    addLeadToSheet(leadWithTimestamp);
  };

  return (
    <LeadContext.Provider value={{ leads, addLead }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
