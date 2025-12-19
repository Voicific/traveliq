export enum SupplierType {
  Airline = 'airline',
  Hotel = 'hotel',
  Cruise = 'cruise',
}

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  longDescription: string;
  avatarImageUrl: string;
  websiteUrl: string;
  knowledgeBaseUrl: string;
  knowledgeBaseText: string;
  geminiVoiceName: string;
  // NEW: ElevenLabs specific properties
  elevenLabsVoiceId?: string;
  useElevenLabs?: boolean;
  // Legacy property for backward compatibility
  hedra_avatar_id?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, supplierId?: string) => Promise<void>;
  clearMessages: () => void;
  generateSpeech: (text: string, voiceName?: string) => Promise<string>;
}

export interface AIContextType {
  isLoading: boolean;
  error: string | null;
  generateResponse: (message: string, supplierId?: string) => Promise<string>;
  generateSpeech: (text: string, voiceName?: string) => Promise<string>;
  // Add missing models property
  models: string[];
}

export interface Lead {
  id: string;
  timestamp: Date;
  visitorInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  chatHistory: Message[];
  supplier: Supplier;
  source: string;
  converted: boolean;
  conversionDate?: Date;
}

export interface LeadContextType {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  saveLead: (lead: Omit<Lead, 'id' | 'timestamp'>) => Promise<void>;
  getLeads: () => Promise<Lead[]>;
  markAsConverted: (leadId: string) => Promise<void>;
}

export interface UIContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Export missing GEMINI_VOICES
export const GEMINI_VOICES = [
  'Zephyr',
  'Charon', 
  'Puck',
  'Kore',
  'Fenrir'
] as const;