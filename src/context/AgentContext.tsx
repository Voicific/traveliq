import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GOOGLE_SCRIPT_URL } from '../config.ts';

interface AgentDetails {
  firstName: string;
  lastName: string;
  email: string;
  agency: string;
}

// --- Google Sheets Integration ---
const saveAgentToSheet = async (agent: AgentDetails) => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
    console.warn('Google Sheets integration is not configured. Skipping agent save.');
    return;
  }
  try {
    // The script should handle upsert logic based on email.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'saveAgent', payload: { agent } }),
    });
  } catch (error) {
    console.error('Failed to save agent to Google Sheet:', error);
  }
};

const getAgentFromSheet = async (email: string): Promise<AgentDetails | null> => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
        console.warn('Google Sheets integration is not configured. Cannot fetch agent.');
        return null;
    }
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAgent&email=${encodeURIComponent(email)}`, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success || !result.data) return null; // Agent not found is not an error, just no data
        return result.data as AgentDetails;
    } catch (error) {
        console.error('Failed to fetch agent from Google Sheet:', error);
        return null;
    }
};
// --- End Google Sheets Integration ---

interface AgentContextType {
  agentDetails: AgentDetails | null;
  setAgentDetails: (details: AgentDetails) => void;
  fetchAgentDetails: (email: string) => Promise<AgentDetails | null>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agentDetails, setAgentDetailsState] = useState<AgentDetails | null>(null);

  useEffect(() => {
    // On initial load, check local storage for existing agent details.
    try {
      const storedDetails = localStorage.getItem('agentDetails');
      if (storedDetails) {
        setAgentDetailsState(JSON.parse(storedDetails));
      }
    } catch (error) {
      console.error("Failed to parse agent details from local storage", error);
      localStorage.removeItem('agentDetails');
    }
  }, []);

  const setAgentDetails = (details: AgentDetails) => {
    setAgentDetailsState(details);
    // Persist details to local storage to remember the user across sessions.
    localStorage.setItem('agentDetails', JSON.stringify(details));
    // Asynchronously save to Google Sheet. The script should handle upsert.
    saveAgentToSheet(details);
  };
  
  const fetchAgentDetails = async (email: string): Promise<AgentDetails | null> => {
    const agent = await getAgentFromSheet(email);
    if (agent) {
      // If we found an agent in the sheet, update our state and local storage
      // to ensure the user is "logged in" for this session.
      setAgentDetailsState(agent);
      localStorage.setItem('agentDetails', JSON.stringify(agent));
    }
    return agent;
  };

  return (
    <AgentContext.Provider value={{ agentDetails, setAgentDetails, fetchAgentDetails }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
