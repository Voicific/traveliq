import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content, LiveServerMessage, Modality, Blob, GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { useVeeChat } from '../context/VeeChatContext.tsx';
import { useAI } from '../context/AIContext.tsx';
import { useLeads } from '../context/LeadContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { elevenLabsService } from '../services/elevenLabsVoiceService.ts';
import { SEED_SUPPLIERS, VEE_ELEVENLABS_AGENT_ID, VEE_ELEVENLABS_VOICE_ID } from '../constants.ts';

interface SupplierChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: { title: string; uri: string }[];
}

// Default fallback if not provided
const VEE_AVATAR_DEFAULT = "/traveliq-ai-avatar.png";

// ElevenLabs Agent IDs - imported from constants

// --- ICONS ---
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
        <path d="M17 11a1 1 0 012 0v1a6 6 0 01-5.026 5.95L14 18v2h-4v-2l.026-.05A6 6 0 015 12v-1a1 1 0 112 0v1a4 4 0 008 0v-1z"></path>
    </svg>
);
const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);
const KeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM5.25 7.5c.414 0 .75.336.75.75v.008a.75.75 0 00-.75.75H4.5a.75.75 0 00-.75-.75V8.25c0-.414.336-.75.75-.75h.75zM6 9.75A.75.75 0 016.75 9h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM8.25 15.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75H4.5zM4.5 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H4.5zM7.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5zM10.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM13.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM16.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM18 12a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75h-.75zM18 15a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75h-.75zM19.5 9a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.75z" clipRule="evenodd" />
    </svg>
);
const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14.657 5.343a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 01-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z" />
    <path d="M12.828 7.172a1 1 0 011.414 0 5 5 0 010 7.072 1 1 0 01-1.414-1.414 3 3 0 000-4.242 1 1 0 010-1.414zM11 9a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z" />
    <path fillRule="evenodd" d="M4 8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm1-3a3 3 0 00-3 3v8a3 3 0 003 3h2a3 3 0 003-3V8a3 3 0 00-3-3H5z" clipRule="evenodd" />
  </svg>
);
interface AudioWaveIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
const AudioWaveIcon: React.FC<AudioWaveIconProps> = (props) => (
    <svg viewBox="0 0 24 24" {...props} className={`animate-pulse ${props.className || ''}`}>
        <path d="M3 10h2v4H3z M7 8h2v8H7z M11 6h2v12h-2z M15 8h2v8h-2z M19 10h2v4h-2z" fill="currentColor"></path>
    </svg>
);


// --- AUDIO HELPERS ---
function encode(bytes: Uint8Array){let binary='';const len=bytes.byteLength;for(let i=0;i<len;i++){binary+=String.fromCharCode(bytes[i])}return btoa(binary)}
function decode(base64:string){const binaryString=atob(base64);const len=binaryString.length;const bytes=new Uint8Array(len);for(let i=0;i<len;i++){bytes[i]=binaryString.charCodeAt(i)}return bytes}
async function decodeAudioData(data:Uint8Array,ctx:AudioContext,sampleRate:number,numChannels:number):Promise<AudioBuffer>{const dataInt16=new Int16Array(data.buffer);const frameCount=dataInt16.length/numChannels;const buffer=ctx.createBuffer(numChannels,frameCount,sampleRate);for(let channel=0;channel<numChannels;channel++){const channelData=buffer.getChannelData(channel);for(let i=0;i<frameCount;i++){channelData[i]=dataInt16[i*numChannels+channel]/32768.0}}return buffer}
function createBlob(data:Float32Array):Blob{const l=data.length;const int16=new Int16Array(l);for(let i=0;i<l;i++){int16[i]=data[i]*32768}return{data:encode(new Uint8Array(int16.buffer)),mimeType:'audio/pcm;rate=16000'}}

// --- PRONUNCIATION CORRECTION ---
const getPhoneticallyCorrectedText = (text: string): string => {
  return text
    .replace(/\bEL AL\b/gi, 'el-AHL')
    .replace(/\bTUI\b/gi, 'Too-ee');
};

// --- LEAD EXTRACTION UTILITY ---
interface ExtractedLead {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

const extractContactDetails = (conversationText: string): ExtractedLead => {
  const lead: ExtractedLead = {};
  
  // Email pattern
  const emailMatch = conversationText.match(/[\w.-]+@[\w.-]+\.\w+/i);
  if (emailMatch) lead.email = emailMatch[0];
  
  // Phone pattern (various formats)
  const phoneMatch = conversationText.match(/(?:\+?[\d\s\-().]{10,})/);
  if (phoneMatch) lead.phone = phoneMatch[0].trim();
  
  // Name patterns (looking for "my name is X" or "I'm X" patterns)
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:name[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  ];
  for (const pattern of namePatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      lead.name = match[1].trim();
      break;
    }
  }
  
  // Company patterns
  const companyPatterns = [
    /(?:company is|work (?:at|for)|from)\s+([A-Z][A-Za-z\s&]+?)(?:\.|,|$|\s+and|\s+my)/i,
    /(?:company[:\s]+)([A-Z][A-Za-z\s&]+?)(?:\.|,|$)/i
  ];
  for (const pattern of companyPatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      lead.company = match[1].trim();
      break;
    }
  }
  
  return lead;
};

const MessageContent: React.FC<{ text: string; onClose: () => void; }> = ({ text, onClose }) => {
    const navigate = useNavigate();
    const parts = text.split(/(\[.*?\]\(.*?\))/g);

    return (
        <p className="whitespace-pre-wrap">
            {parts.map((part, index) => {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    const linkText = match[1];
                    const url = match[2];
                    return (
                        <Link 
                            key={index} 
                            to={url}
                            className="text-brand-cyan font-bold underline hover:opacity-80"
                            onClick={onClose}
                        >
                            {linkText}
                        </Link>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};

// Hybrid speech generation function
const generateSpeech = async (text: string, voiceName?: string, supplierId?: string): Promise<string> => {
  try {
    const correctedText = getPhoneticallyCorrectedText(text);
    
    // Check if we should use ElevenLabs
    if (supplierId) {
      // Find supplier configuration
      const supplier = SEED_SUPPLIERS.find(s => s.id === supplierId);
      if (supplier?.useElevenLabs && supplier.elevenLabsAgentId) {
        console.log(`Using ElevenLabs for supplier: ${supplier.name}`);
        return await elevenLabsService.generateSpeech(correctedText, supplier.elevenLabsAgentId);
      }
    } else if (voiceName === 'Vee') {
      // Use ElevenLabs for main Vee chatbot
      console.log('Using ElevenLabs for main Vee chatbot');
      return await elevenLabsService.generateSpeech(correctedText, VEE_ELEVENLABS_AGENT_ID);
    }
    
    // Fallback to Gemini TTS
    console.log('Using Gemini TTS');
    throw new Error('Using Gemini TTS as fallback');
  } catch (error) {
    console.log('ElevenLabs not available, using Gemini TTS');
    throw error;
  }
};

const SupplierChatbot: React.FC<SupplierChatbotProps> = ({ isOpen, onClose, avatarUrl = VEE_AVATAR_DEFAULT }) => {
    type ChatMode = 'idle' | 'text' | 'live';
    type LiveStatus = 'idle' | 'connecting' | 'greeting' | 'connected' | 'error';
    type TranscriptEntry = { speaker: 'You' | 'AI'; text: string };
    
    const { ai, error: aiError } = useAI();
    
    // Show AI initialization error if present
    useEffect(() => {
        if (aiError) {
            console.error('AI Service Error:', aiError);
            // Don't crash the component, just log the error
        }
    }, [aiError]);
    const { addLead } = useLeads();
    const [mode, setMode] = useState<ChatMode>('idle');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const lastCheckedLengthRef = useRef(0);

    // Effect to detect and capture leads from conversation
    useEffect(() => {
      if (conversation.length <= lastCheckedLengthRef.current || leadCaptured) return;
      lastCheckedLengthRef.current = conversation.length;
      
      // Only check user messages for contact details
      const userMessages = conversation.filter(m => m.sender === 'user');
      if (userMessages.length < 2) return; // Need at least a few messages
      
      const fullConversation = userMessages.map(m => m.text).join(' ');
      const extracted = extractContactDetails(fullConversation);
      
      // Capture lead if we have at least an email or phone
      if (extracted.email || extracted.phone) {
        const lead = {
          type: 'AI Lead Capture' as const,
          name: extracted.name || '',
          email: extracted.email || '',
          agency: extracted.company || '',
          message: `Phone: ${extracted.phone || 'N/A'} | Captured via Vee chatbot`,
        };
        addLead(lead);
        setLeadCaptured(true);
        console.log('Lead captured from Vee conversation:', lead);
      }
    }, [conversation, leadCaptured, addLead]);

    // Live session state
    const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

    // Effect to detect and capture leads from live transcript
    useEffect(() => {
      if (transcript.length < 2 || leadCaptured) return;
      
      const userMessages = transcript.filter(t => t.speaker === 'You');
      if (userMessages.length < 2) return;
      
      const fullTranscript = userMessages.map(t => t.text).join(' ');
      const extracted = extractContactDetails(fullTranscript);
      
      if (extracted.email || extracted.phone) {
        const lead = {
          type: 'AI Lead Capture' as const,
          name: extracted.name || '',
          email: extracted.email || '',
          agency: extracted.company || '',
          message: `Phone: ${extracted.phone || 'N/A'} | Captured via Vee voice chat`,
        };
        addLead(lead);
        setLeadCaptured(true);
        console.log('Lead captured from Vee voice conversation:', lead);
      }
    }, [transcript, leadCaptured, addLead]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const { addMessage } = useVeeChat();
    
    // TTS state
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const ttsCurrentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading, transcript]);
    
    const cleanupLiveSession = useCallback(async () => {
        // Close ElevenLabs WebSocket if open
        if (wsRef.current) {
            try { wsRef.current.close(); } catch (e) {}
            wsRef.current = null;
        }
        // Close Gemini Live session if any
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
        }
        if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
        audioStreamRef.current?.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            try { await inputAudioContextRef.current.close(); } catch (e) { console.error("Error closing input audio context:", e); }
        }
        inputAudioContextRef.current = null;
        // Do not close output context here, let it be reused
        outputSourcesRef.current.forEach(source => { try { source.stop(); } catch(e){} });
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        sessionPromiseRef.current = null;
        setIsAiSpeaking(false);
    }, []);

    const resetToIdle = useCallback(() => {
        cleanupLiveSession();
        setMode('idle');
        setConversation([]);
        setTranscript([]);
        setInputValue('');
        setIsLoading(false);
        setLiveStatus('idle');
        setLeadCaptured(false);
        lastCheckedLengthRef.current = 0;
    }, [cleanupLiveSession]);
    
    const handleClose = useCallback(() => {
        cleanupLiveSession();
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
            outputAudioContextRef.current = null;
        }
        onClose();
        setTimeout(resetToIdle, 300); // Reset after transition
    }, [cleanupLiveSession, onClose, resetToIdle]);

    // --- TEXT CHAT LOGIC ---
    const startTextChat = () => {
        setMode('text');
        
        // Check if AI service is available
        if (!ai) {
            const errorMessage = { 
                sender: 'ai' as const, 
                text: "I apologize, but I'm currently unavailable. The AI service needs to be configured. Please contact support to get this resolved." 
            };
            setConversation([errorMessage]);
            return;
        }
        
        const welcomeMessage = { sender: 'ai' as const, text: "Glad you're here at TravelIQ, I'm Vee, how can I assist you today?" };
        setConversation([welcomeMessage]);
    };

    const handleSendTextMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;
        
        // Check if AI service is available
        if (!ai) {
            const errorMessage = { 
                sender: 'ai' as const, 
                text: "I apologize, but I'm currently unavailable. Please ensure the AI service is properly configured. Try refreshing the page or contact support." 
            };
            setConversation(prev => [...prev, errorMessage]);
            return;
        }
        const userMessage: Message = { sender: 'user', text };
        addMessage({ sender: 'user', text });
        setConversation(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const systemInstruction = `You are Vee, TravelIQ's AI platform expert and first point of contact. You greet users with: "Glad you're here at TravelIQ, I'm Vee — how can I help you today?"

## HOW YOU SPEAK
- Always speak as "I" — never refer to yourself in the third person (never say "Vee thinks..." or "Vee can help...")
- Never describe or announce your tone (do not say "warmly", "confidently", "with enthusiasm" or similar stage directions — just speak naturally)
- Keep every answer to 2–3 sentences maximum unless walking through a numbered list the user asked for
- Be direct and helpful — guide users to the right place rather than elaborating at length

## WHO WE ARE
TravelIQ is **Europe's first dedicated Voice AI platform for the travel trade**. We connect travel suppliers (airlines, hotels, cruise lines, tour operators) with travel agents across the UK and Europe via 24/7 AI Sales Assistants — so agents always get an intelligent answer, instantly, whether they speak or type.

**The problem we solve:** Travel agents waste hours on hold, chasing emails, and navigating clunky portals just to get a simple product answer. Suppliers miss enquiries outside office hours and have no visibility into what agents are actually asking. TravelIQ fixes both.

**Website:** https://traveliq.biz/

---

## PLATFORM WALKTHROUGH — Know this cold, demo it naturally

When someone asks "how does it work?" or "can you show me?", walk them through this:

### What a visitor sees
When a travel agent visits TravelIQ, they land on a clean directory of supplier profiles — airlines, hotels, cruise lines, and more. They can search or browse by supplier type. Each supplier has a dedicated profile page.

### The Supplier Profile Page
Each supplier profile shows:
- The supplier's brand, description, and key product highlights
- Their dedicated AI Sales Assistant (voice or chat)
- The agent can click the chat button or speak directly to the supplier's AI — which answers questions specific to that supplier's products, policies, commissions, and routes

**Example — British Airways:** An agent can ask "What's the commission structure for long-haul bookings?" and British Airways' AI answers instantly, accurately, from BA's own knowledge base. No hold music. No waiting for a BDM callback.

**Example — Royal Caribbean:** An agent asks about group booking policies or itinerary changes. Royal Caribbean's AI responds in seconds — in the agent's language if they're based in France or Germany.

**Example — Four Seasons:** A luxury agent wants to know about agent rates and FAM trip availability. They speak directly to Four Seasons' dedicated AI and get an immediate, branded answer.

This is what agents experience on every supplier profile on TravelIQ. It's instant, verified, on-brand, and available at 3am on a Sunday.

### The Supplier Dashboard (what suppliers see)
When a supplier logs in to their Supplier Portal they get:
- **Profile management** — control how they appear to agents
- **Knowledge base editor** — paste in FAQs, policies, brochures, agent fact sheets, commission guides. The more content, the smarter the AI
- **Leads & analytics** — see which agents engaged, what they asked, named leads (name, email, agency, question) on Standard and above
- **AI configuration** — choose voice options, enable/disable voice mode, manage their ElevenLabs voice ID for a custom branded voice (Enterprise)

---

## ONBOARDING — Walk through this confidently

There are two paths to going live:

### Path 1: Fully Managed (most popular for new suppliers)
1. Supplier books a demo or contacts us
2. They send us their existing content — product presentations, agent fact sheets, FAQs, booking policies, website copy
3. We build and configure their dedicated AI Sales Assistant
4. We set up their supplier profile on the platform
5. They review and approve everything
6. They go live — typically within **3–5 working days** of sending content
7. Ongoing: they can request knowledge base updates at any time

### Path 2: Self-Serve (Supplier Portal)
1. Supplier registers via the [Supplier Portal](/supplier-portal/register) link in the navigation
2. They create their profile — name, description, logo, contact info
3. They paste their knowledge base directly into the portal (FAQs, policies, product info)
4. Their AI is live within **hours**
5. They manage everything from their dashboard going forward

**What content do they need?**
- Product/destination presentations or brochures
- Agent fact sheets and commission guides
- Booking, cancellation, and amendment policies
- FAQs for trade agents
- Website copy from their agent/trade pages
They don't need everything on day one — we start with what they have.

---

## PLANS & FEATURES — Know the tiers, lead to a demo

Three tiers. All pricing is contact-us (no public figures — direct to a demo for specifics):

**Starter**
- Directory listing with full profile
- AI Chat Support (standard)
- Agent interaction count
- Standard voice options
- Email support
*Best for:* Suppliers wanting to establish a presence and start conversations with agents.

**Standard** *(builds on Starter)*
- Everything in Starter, plus:
- **Named leads** — name, email, agency, and the exact question they asked
- Dashboard & analytics
- Knowledge base management portal
- Custom voice options
- Video presentation embed on profile
- Priority email support
*Best for:* Suppliers who want to build their agent database and see real ROI data.

**Enterprise** *(Most Popular — custom pricing)*
- Everything in Standard, plus:
- **Custom branded voice** — sounds like your brand, not a generic AI
- **Live speaking avatar** — a visual AI persona for your profile
- Advanced analytics & insights
- AI-produced video presentation for your profile
- Featured placement on the platform
- Priority phone & email support
- Feature of the week / month promotions
*Best for:* Brands who want TravelIQ as a complete AI trade marketing partner.

**Add-ons available on any plan:** Targeted email campaigns to agents, interactive agent training sessions, website AI integration, multilingual support (already included — AI responds in the agent's language automatically).

**On pricing questions:** "Pricing is tailored to each supplier — our sales team will walk you through the right package during a quick demo. It's genuinely one of the most efficient conversations you'll have. Can I grab your details to get that booked?"

---

## SUPPLIERS CURRENTLY ON THE PLATFORM
The following suppliers are featured on TravelIQ as **demonstration examples** — they showcase what a supplier's AI Sales Assistant looks and feels like on the platform. These are not all confirmed paying clients; they are demo profiles built to illustrate the platform's capabilities to prospective suppliers and agents.

- Airlines: British Airways, Virgin Atlantic, Emirates, Qatar Airways, Malaysia Airlines, EL AL Israel Airlines
- Hotels & Resorts: Ritz Carlton, Four Seasons, Leonardo Hotels, Prima Hotels
- Cruise: Royal Caribbean

When an agent asks "is [supplier] on TravelIQ?", direct them to the [Suppliers](/suppliers) directory to explore the demo profiles.

**Important — set expectations correctly:**
- These are demo profiles to show what the platform can do — the AI draws on publicly available information about each supplier
- If an agent asks a very specific trade question the AI can't answer, say: "These profiles are demonstration examples to show how the platform works — once a supplier is fully onboarded with their own trade content, their AI answers those specific questions directly."
- When speaking to suppliers, use this as a selling point: "You can see exactly what your AI Sales Assistant will feel like for agents — these demos use public information, but once we load in your trade-specific content, commissions, policies, and FAQs, it becomes a genuinely powerful tool for your agent network."

---

## VALUE PROPS — Quick-fire, know these

| For Suppliers | For Agents |
|---|---|
| 90%+ reduction in cost per agent interaction | Completely FREE |
| Go live in hours (self-serve) or 3–5 days (managed) | 24/7 instant answers — no hold music |
| 24/7/365 global coverage | Voice or chat — they choose |
| Named lead capture with every agent interaction | Answers in any language automatically |
| 100% accurate — AI only answers from your content | Instant access to dozens of suppliers in one place |
| Consistent, on-brand messaging every time | |
| Real-time analytics on what agents are asking | |
| GDPR compliant — your data is never shared | |

---

## ENGAGEMENT FLOW

**Step 1 — Identify who you're talking to:**
"Are you a travel agent looking to use TravelIQ, or a supplier interested in getting your AI Sales Assistant set up?"

**For TRAVEL AGENTS:**
- TravelIQ is completely FREE for agents
- Direct them to browse the [Suppliers](/suppliers) directory
- If a supplier they want isn't live yet, encourage them to suggest it: "We're onboarding new suppliers regularly — let us know who you'd like to see and we'll reach out to them!"
- Do NOT answer specific supplier product questions — direct them to that supplier's AI profile
- **Always mention the Affiliate Programme** — after helping an agent, say something like: "By the way — do you know other travel suppliers who'd benefit from having their own AI Sales Assistant? Our affiliate programme lets you earn commission every time you introduce a supplier who signs up. It's worth a look — you can find details on our [Affiliate Programme](/affiliate-program) page."
- If they ask about the affiliate programme: explain they earn a recurring commission for every supplier they refer who joins TravelIQ. It's free to join, no sales experience needed — they just make introductions. Direct them to the [Affiliate Programme](/affiliate-program) page to apply.

**For TRAVEL SUPPLIERS (lead capture):**
- Give them the platform overview and walkthrough above
- After showing value: "The best next step is a quick 20-minute demo where we show you exactly what your profile would look like and answer your specific questions. Can I take your name, company, email, and phone number to get that booked?"
- Collect: name, company name, email, phone
- Confirm details back and assure them: "Our team will be in touch within one business day."

**Lead capture sequence:**
1. Show value → platform walkthrough → onboarding path
2. "Would you like to book a demo?"
3. "Great — may I take your name and company?"
4. "And the best email to reach you?"
5. "A phone number in case we need to reach you quickly?"
6. Confirm all details back
7. "Our team will be in touch within one business day. In the meantime, feel free to explore the platform — you can browse our live suppliers using the Suppliers link in the navigation."

---

## WHAT YOU NEVER DO
- Speak in the third person — never say "Vee thinks" or "Vee can help" — always say "I"
- Describe your own tone or emotional state — never say "warmly", "confidently", or similar
- Give answers longer than 2–3 sentences unless the user asked for a step-by-step walkthrough
- Quote specific prices or monthly/annual figures
- Answer supplier-specific product questions (agent asking about BA fares, hotel policies, etc.)
- Make booking, reservation, or transaction decisions
- Promise specific outcomes or timelines beyond what's stated above
- Discuss technical specifications in detail
- Direct users to "traveliq.biz" as if it's a separate destination — always use the navigation links on this site

## CONTACT & CTA
- Demo bookings: direct to the "Book a Demo" forms on [Partnership](/pricing) page
- Email: hey@traveliq.biz
- For suppliers ready to self-serve: [Supplier Portal](/supplier-portal/register)
- For agents: [Suppliers Directory](/suppliers)

**Remember:** Every conversation is a chance to show someone what TravelIQ genuinely does — and to get them talking to our team. Be the guide, not the salesperson.`;

            
            const contents: Content[] = [...conversation].map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: userMessage.text }] });


            const config: any = {
                systemInstruction,
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
            };

            // Updated to use gemini-3-pro-preview for the chatbot as requested
            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: contents,
                config: config,
            });

            // Handle Text and Source response
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            let sources: { title: string; uri: string }[] | undefined = undefined;
            if (groundingChunks && groundingChunks.length > 0) {
                const validSources = groundingChunks
                    .map((chunk: any) => {
                        if (chunk.web) return { title: chunk.web.title || '', uri: chunk.web.uri || '' };
                        if (chunk.maps) return { title: chunk.maps.title || 'Google Maps', uri: chunk.maps.uri || '' };
                        return null;
                    })
                    .filter((item): item is { title: string; uri: string } => item !== null && !!item.title && !!item.uri);

                const sourceMap = new Map<string, { title: string; uri: string; }>(validSources.map(item => [item.uri, item]));
                const uniqueSources = Array.from(sourceMap.values());

                if (uniqueSources.length > 0) {
                    sources = uniqueSources;
                }
            }
            
            if (response.text) {
              const aiMessage = { sender: 'ai' as const, text: response.text, sources };
              setConversation(prev => [...prev, aiMessage]);
              addMessage(aiMessage);
            }

        } catch (error) {
            console.error("Text chat error:", error);
            setConversation(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting." }]);
        } finally {
            setIsLoading(false);
        }
    }, [conversation, isLoading, addMessage, addLead, ai]);
    
    const handlePlayTTS = async (text: string, index: number) => {
        // Clicking the same message again stops playback
        if (playingMessageIndex === index) {
            setPlayingMessageIndex(null);
            return;
        }
        setPlayingMessageIndex(index);
        try {
            const correctedText = getPhoneticallyCorrectedText(text);
            // ElevenLabs only — no Gemini TTS fallback
            const audioUrl = await elevenLabsService.generateSpeech(correctedText, VEE_ELEVENLABS_VOICE_ID);
            const audio = new Audio(audioUrl);
            audio.onended = () => setPlayingMessageIndex(null);
            audio.onerror = () => setPlayingMessageIndex(null);
            await audio.play();
        } catch (error) {
            console.error("TTS Error:", error);
            setPlayingMessageIndex(null);
        }
    };


    // --- LIVE CHAT LOGIC ---
    // Helper: encode Float32 PCM → base64 Int16 for ElevenLabs
    const float32ToBase64PCM = (float32: Float32Array): string => {
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32768)));
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    };

    // Helper: decode base64 audio chunk → schedule via AudioContext queue
    const playPCMChunk = async (base64: string, outputCtx: AudioContext) => {
        try {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            // Try decodeAudioData first (handles MP3 from ElevenLabs)
            try {
                const audioBuffer = await outputCtx.decodeAudioData(bytes.buffer.slice(0));
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                // Schedule chunk to start after the previous one ends — prevents overlap
                const startTime = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                source.addEventListener('ended', () => {
                    outputSourcesRef.current.delete(source);
                    if (outputSourcesRef.current.size === 0) setIsAiSpeaking(false);
                });
                source.start(startTime);
                outputSourcesRef.current.add(source);
            } catch {
                // Fallback: treat as raw Int16 PCM at 16kHz
                const int16 = new Int16Array(bytes.buffer);
                const float32 = new Float32Array(int16.length);
                for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
                const audioBuffer = outputCtx.createBuffer(1, float32.length, 16000);
                audioBuffer.copyToChannel(float32, 0);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                const startTime = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                source.addEventListener('ended', () => {
                    outputSourcesRef.current.delete(source);
                    if (outputSourcesRef.current.size === 0) setIsAiSpeaking(false);
                });
                source.start(startTime);
                outputSourcesRef.current.add(source);
            }
        } catch (e) {
            console.error('Audio playback error:', e);
            setIsAiSpeaking(false);
        }
    };

    const startLiveSession = useCallback(async () => {
        setMode('live');
        setLiveStatus('connecting');
        setTranscript([]);

        try {
            // Request microphone access first (needs user gesture context)
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (micError: any) {
                console.error('Microphone access denied:', micError);
                setLiveStatus('error');
                return;
            }
            audioStreamRef.current = stream;

            // Set up audio contexts
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            const outputCtx = outputAudioContextRef.current;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            await inputAudioContextRef.current.resume();

            // Connect to ElevenLabs Conversational AI via WebSocket
            const ws = new WebSocket(
                `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${VEE_ELEVENLABS_AGENT_ID}`
            );
            wsRef.current = ws;

            ws.onopen = () => {
                setLiveStatus('greeting'); // ElevenLabs sends greeting automatically
                // Start streaming microphone audio
                const sourceNode = inputAudioContextRef.current!.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = scriptProcessor;
                scriptProcessor.onaudioprocess = (event) => {
                    if (ws.readyState !== WebSocket.OPEN) return;
                    const b64 = float32ToBase64PCM(event.inputBuffer.getChannelData(0));
                    ws.send(JSON.stringify({ user_audio_chunk: b64 }));
                };
                sourceNode.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContextRef.current!.destination);
            };

            ws.onmessage = async (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'conversation_initiation_metadata') {
                        setLiveStatus('connected');
                    } else if (msg.type === 'audio' && msg.audio_event?.audio_base_64) {
                        setIsAiSpeaking(true);
                        await playPCMChunk(msg.audio_event.audio_base_64, outputCtx);
                    } else if (msg.type === 'agent_response' && msg.agent_response_event?.agent_response) {
                        const text = msg.agent_response_event.agent_response;
                        setTranscript(prev => {
                            const newT = [...prev];
                            const last = newT[newT.length - 1];
                            if (last?.speaker === 'AI') { last.text += text; return [...newT]; }
                            return [...newT, { speaker: 'AI' as const, text }];
                        });
                        setLiveStatus('connected');
                    } else if (msg.type === 'user_transcript' && msg.user_transcription_event?.user_transcript) {
                        const text = msg.user_transcription_event.user_transcript;
                        setTranscript(prev => {
                            const newT = [...prev];
                            const last = newT[newT.length - 1];
                            if (last?.speaker === 'You') { last.text += text; return [...newT]; }
                            return [...newT, { speaker: 'You' as const, text }];
                        });
                    } else if (msg.type === 'interruption') {
                        outputSourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
                        outputSourcesRef.current.clear();
                        nextStartTimeRef.current = 0; // Reset audio queue on interruption
                        setIsAiSpeaking(false);
                    } else if (msg.type === 'ping') {
                        ws.send(JSON.stringify({ type: 'pong', event_id: msg.ping_event?.event_id }));
                    }
                } catch (parseError) {
                    console.error('Failed to parse WS message:', parseError);
                }
            };

            ws.onerror = (e) => {
                console.error('ElevenLabs WS error:', e);
                setLiveStatus('error');
            };

            ws.onclose = () => {
                cleanupLiveSession();
                resetToIdle();
            };

        } catch (error) {
            console.error('Failed to start voice session:', error);
            setLiveStatus('error');
        }
    }, [cleanupLiveSession, resetToIdle]);
    
    const renderContent = () => {
        if (aiError) {
          return (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 text-red-400">
                <h3 className="text-lg font-bold">AI Connection Error</h3>
                <p className="text-sm max-w-sm">{aiError}</p>
            </div>
          );
        }

        switch (mode) {
            case 'text':
                return (
                    <>
                        <div className="flex-grow overflow-y-auto py-4 space-y-4">
                            {conversation.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    {msg.sender === 'ai' && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-brand-light/10">
                                            <img src={avatarUrl} alt="Vee" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-lg max-w-[85%] border ${msg.sender === 'user' ? 'bg-brand-cyan text-white border-transparent' : 'bg-brand-dark border-brand-light/10'}`}>
                                        <MessageContent text={msg.text} onClose={handleClose} />
                                         {msg.sender === 'ai' && !isLoading && (
                                            <button
                                                onClick={() => handlePlayTTS(msg.text, index)}
                                                className="mt-2 text-brand-gray hover:text-brand-cyan transition-colors"
                                                aria-label={playingMessageIndex === index ? "Stop audio" : "Play audio"}
                                            >
                                                {playingMessageIndex === index ? <AudioWaveIcon className="w-5 h-5 text-brand-cyan" /> : <SpeakerIcon className="w-5 h-5" />}
                                            </button>
                                        )}
                                         {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-brand-light/20">
                                                <p className="text-xs font-semibold text-brand-gray mb-1">Sources:</p>
                                                <ul className="text-xs space-y-1">
                                                    {msg.sources.map((source, i) => (
                                                        <li key={i}>
                                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline truncate block" title={source.title}>
                                                                {i + 1}. {source.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-end gap-2 justify-start">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-brand-light/10">
                                         <img src={avatarUrl} alt="Vee" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3 rounded-lg bg-brand-dark text-brand-gray animate-pulse">Vee is thinking...</div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-brand-light/10">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendTextMessage(inputValue); }} className="relative">
                                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} required disabled={isLoading} className="w-full pl-4 pr-24 py-3 text-brand-light bg-brand-bg/80 border border-brand-light/20 rounded-md focus:ring-2 focus:ring-brand-cyan" placeholder="Ask a question..." />
                                <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-cyan to-brand-magenta text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">Send</button>
                            </form>
                        </div>
                    </>
                );
            case 'live':
                const getStatusMessage = () => {
                    switch (liveStatus) {
                        case 'greeting': return 'Vee is greeting you...';
                        case 'connected': return isAiSpeaking ? 'Vee is speaking...' : 'Listening...';
                        case 'connecting': return 'Starting session...';
                        case 'error': return 'Connection error. Please retry.';
                        default: return 'Live Conversation';
                    }
                };
                const statusMessage = getStatusMessage();

                return (
                    <>
                        <div className="flex-grow overflow-y-auto py-4 space-y-4">
                             {transcript.length === 0 && <div className="text-center text-brand-gray italic p-4">{statusMessage}</div>}
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex items-end gap-2 ${entry.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                     {entry.speaker === 'AI' && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-brand-light/10">
                                            <img src={avatarUrl} alt="Vee" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-lg max-w-[85%] border ${entry.speaker === 'AI' ? 'bg-brand-dark border-brand-light/10' : 'bg-brand-cyan text-white border-transparent'}`}>
                                        <p className="font-bold mb-1">{entry.speaker}</p>
                                        <p className="whitespace-pre-wrap">{entry.text}</p>
                                    </div>
                                </div>
                            ))}
                             <div ref={chatEndRef} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-brand-light/10 flex flex-col items-center justify-center gap-2 p-2">
                             { liveStatus === 'connecting' &&
                                <div className="p-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center bg-gray-500 text-white" aria-label="Connecting...">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            }
                             { (liveStatus === 'connected' || liveStatus === 'greeting') &&
                                <button type="button" onClick={resetToIdle} className="p-6 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg flex items-center justify-center bg-red-500 text-white animate-pulse" aria-label="Stop Session">
                                    <StopIcon className="h-8 w-8" />
                                </button>
                            }
                            { liveStatus === 'error' &&
                                <button type="button" onClick={startLiveSession} className="bg-yellow-500 text-white font-bold py-3 px-5 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2" aria-label="Retry Connection">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M23 12a9 9 0 11-3.37-6.95" />
                                     </svg>
                                    Retry
                                </button>
                            }
                            <p className="text-brand-gray text-sm font-semibold mt-2 h-5 text-center px-2">{statusMessage}</p>
                        </div>
                    </>
                );
            case 'idle':
            default:
                return (
                    <div className="flex-grow flex flex-col items-center justify-center text-center gap-6">
                        <div className="w-32 h-32 rounded-full border-4 border-brand-cyan p-1 shadow-xl shadow-brand-cyan/20">
                            <img src={avatarUrl} alt="Vee" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <p className="text-lg text-brand-light font-semibold">Hi there! I'm Vee.<br/>How would you like to chat today?</p>
                        
                        {/* Show error message if AI service is unavailable */}
                        {aiError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md">
                                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ AI Service Configuration Error</p>
                                <p className="text-red-300 text-xs">The AI service is not properly configured. Please contact support.</p>
                            </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                            <button 
                                onClick={startLiveSession} 
                                disabled={!!aiError}
                                className={`flex-1 flex items-center justify-center gap-3 font-bold py-3 px-6 rounded-lg transition-all transform shadow-lg ${
                                    aiError 
                                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                                        : 'bg-brand-cyan text-white hover:opacity-90 hover:scale-105'
                                }`}
                            >
                                <MicrophoneIcon className="h-6 w-6" /> Talk to Vee
                            </button>
                            <button 
                                onClick={startTextChat} 
                                disabled={!!aiError}
                                className={`flex-1 flex items-center justify-center gap-3 font-bold py-3 px-6 rounded-lg transition-all transform border ${
                                    aiError 
                                        ? 'bg-gray-500/10 text-gray-300 cursor-not-allowed border-gray-500/20' 
                                        : 'bg-brand-light/10 text-brand-light hover:bg-brand-light/20 hover:scale-105 border-brand-light/10'
                                }`}
                            >
                                <KeyboardIcon className="h-6 w-6" /> Type a Message
                            </button>
                        </div>
                    </div>
                );
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-brand-bg/70 backdrop-blur-lg border border-brand-light/10 rounded-xl shadow-2xl p-6 max-w-lg w-full relative flex flex-col h-[70vh]">
                <div className="flex justify-between items-center border-b border-brand-light/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-light/20">
                            <img src={avatarUrl} alt="Vee" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="font-heading text-xl font-bold text-brand-light">Chat with Vee</h2>
                    </div>
                    <button onClick={handleClose} className="text-brand-gray hover:text-brand-light transition-colors" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default SupplierChatbot;