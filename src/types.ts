export enum SupplierType {
  Airline = 'Airline',
  CruiseLine = 'Cruise Line',
  HotelResort = 'Hotel & Resort',
  TourOperator = 'Tour Operator',
  DMC = 'DMC (Destination Management Company)',
  FerryRiverCruise = 'Ferry & River Cruise Operator',
  RailOperator = 'Rail Operator',
  CarRental = 'Car Rental',
  AirportTransfer = 'Airport Transfer & Ground Transport',
  CoachTour = 'Coach Tour Operator',
  VillaHolidayHome = 'Villa & Holiday Home Specialist',
  SkiWinterSports = 'Ski & Winter Sports Operator',
  LuxurySafariLodge = 'Luxury & Safari Lodge',
  YachtBoatCharter = 'Yacht & Boat Charter',
  ThemeParkAttraction = 'Theme Park & Attraction',
  TravelInsurance = 'Travel Insurance Provider',
  SpaWellness = 'Spa & Wellness Retreat',
  ExpeditionAdventure = 'Expedition & Adventure Specialist',
  WeddingHoneymoon = 'Wedding & Honeymoon Specialist',
  StudentYouth = 'Student & Youth Travel Specialist',
  ReligiousPilgrimage = 'Religious & Pilgrimage Travel',
  TouristBoard = 'Tourist Board',
  TravelMarketingAgency = 'Travel Marketing Agency',
  BusinessTravel = 'Business Travel Management',
  MedicalWellness = 'Medical & Wellness Tourism',
  ConciergeServices = 'Concierge Services',
  OtherTravelSupplier = 'Other Travel Supplier',
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
  // Video presentation embed (YouTube, Vimeo, HeyGen, Synthesia, etc.)
  videoUrl?: string;
  // NEW: ElevenLabs specific properties
  elevenLabsAgentId?: string;
  useElevenLabs?: boolean;
  // Legacy property for backward compatibility
  hedra_avatar_id?: string;
  // When true (default for new profiles), shows "Demo" badge on card.
  // Admin unchecks this when a real supplier signs.
  isDemo?: boolean;
  // Controls public visibility. False = unlisted: excluded from the /suppliers
  // directory (and from the build-time prerender of it) and unreadable by anon
  // under RLS. Reachable only via a /preview/:token link. Defaults to false so a
  // newly created profile is never accidentally public.
  isPublished?: boolean;
  // Unguessable token backing the private /preview/:token link. Set in SQL, not
  // through the admin form — the client never writes this column.
  previewToken?: string;
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