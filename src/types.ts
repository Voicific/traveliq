export enum SupplierType {
  Airline = 'Airline',
  TouristBoard = 'Tourist Board',
  Cruise = 'Cruise',
  Hotel = 'Hotel',
  DMC = 'Destination Management Company (DMC)',
  TourOperator = 'Tour Operator',
  Agency = 'Agency',
}

// Corrected list of voices supported by the Gemini Live API model.
export type GeminiVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

// A constant array of voices for use in UI elements like dropdowns.
export const GEMINI_VOICES: ReadonlyArray<GeminiVoice> = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  longDescription: string;
  avatarImageUrl: string;
  websiteUrl?: string;
  knowledgeBaseUrl?: string;
  knowledgeBaseText?: string;
  hedra_avatar_id?: string;
  geminiVoiceName?: GeminiVoice;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}
