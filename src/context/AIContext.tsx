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
        if (!import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY === 'demo_key_replace_with_real') {
          throw new Error("A Google AI API key is required to use the AI features. Please configure VITE_GOOGLE_API_KEY in your .env file.");
        }
        const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
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
