import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GOOGLE_SCRIPT_URL as SCRIPT_URL } from '../config.ts';

// --- Google Sheets Integration ---

const addVeeChatMessageToSheet = async (message: ChatMessage) => {
  // FIX: Removed stray semicolon after the if condition. This was causing an empty statement body,
  // making the following block unconditional and the rest of the function unreachable.
  // This likely caused the other reported compilation errors.
  if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
    console.warn('Google Sheets integration is not configured. Skipping chat message save.');
    return;
  }
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addVeeChatMessage', payload: { message } }),
    });
  } catch (error) {
    console.error('Failed to add chat message to Google Sheet:', error);
  }
};

const getVeeChatHistoryFromSheet = async (): Promise<ChatMessage[] | null> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
        console.warn('Google Sheets integration is not configured. Cannot fetch chat history.');
        return null;
    }
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getVeeChatHistory&t=${new Date().getTime()}`, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to get chat history from sheet.');
        return result.data as ChatMessage[];
    } catch (error) {
        console.error('Failed to fetch chat history from Google Sheet:', error);
        return null;
    }
};
// --- End Google Sheets Integration ---

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  sources?: { title: string; uri: string }[];
  timestamp: string;
}

interface VeeChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
}

const VeeChatContext = createContext<VeeChatContextType | undefined>(undefined);
const CHAT_HISTORY_STORAGE_KEY = 'veeChatHistory';

export const VeeChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
        let localMessages: ChatMessage[] = [];
        try {
            const storedMessages = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
            if (storedMessages) {
                localMessages = JSON.parse(storedMessages);
            }
        } catch (error) {
            console.error("Failed to parse chat history from local storage", error);
        }

        const sheetMessages = await getVeeChatHistoryFromSheet();

        if (sheetMessages) {
            const combinedMessages = new Map<string, ChatMessage>();
            localMessages.forEach(msg => combinedMessages.set(msg.timestamp, msg));
            sheetMessages.forEach(msg => combinedMessages.set(msg.timestamp, msg));

            const allMessages = Array.from(combinedMessages.values()).sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            setMessages(allMessages);
            localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(allMessages));
        } else {
            setMessages(localMessages);
        }
    };
    loadMessages();
  }, []);

  const addMessage = (newMessageData: Omit<ChatMessage, 'timestamp'>) => {
    const messageWithTimestamp: ChatMessage = {
      ...newMessageData,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, messageWithTimestamp];
    setMessages(updatedMessages);
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(updatedMessages));
    
    addVeeChatMessageToSheet(messageWithTimestamp);
  };

  return (
    <VeeChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </VeeChatContext.Provider>
  );
};

export const useVeeChat = () => {
  const context = useContext(VeeChatContext);
  if (context === undefined) {
    throw new Error('useVeeChat must be used within a VeeChatProvider');
  }
  return context;
};
