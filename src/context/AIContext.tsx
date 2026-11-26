import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AIContextType {
  ai: GoogleGenAI | null;
  error: string | null;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAI = () => {
      try {
        // The Google AI key is NOT shipped to the browser. Instead we point the
        // SDK at our own same-origin reverse proxy (functions/api/gemini), which
        // injects the real key server-side. The apiKey below is a throwaway
        // placeholder — the proxy strips it and never forwards it upstream.
        // If the server key is unconfigured the proxy returns 503 and the error
        // surfaces per-request where each chat already handles it.
        const genAI = new GoogleGenAI({
          apiKey: 'proxied-server-side',
          httpOptions: { baseUrl: `${window.location.origin}/api/gemini` },
        });
        setAi(genAI);
      } catch (e: any) {
        console.error("Failed to initialize GoogleGenAI:", e);
        setError(e.message || "An unknown error occurred during AI initialization.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initAI();
  }, []);

  return (
    <AIContext.Provider value={{ ai, error, isLoading }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
