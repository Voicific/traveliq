import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content, LiveServerMessage, Modality, Blob, GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { useVeeChat } from '../context/VeeChatContext.tsx';
import { useAI } from '../context/AIContext.tsx';
import { useLeads } from '../context/LeadContext.tsx';
import { Link, useNavigate } from 'react-router-dom';

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
const AudioWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" {...props} className={`animate-pulse ${props.className}`}>
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
    .replace(/\bEL AL\b/gi, 'El Al')
    .replace(/\bTUI\b/gi, 'Too-ee');
};

// --- LEAD CAPTURE FUNCTIONS ---
const LeadCaptureModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; }> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        role: 'supplier'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#0f1c2e]/90 to-[#0d2d3d]/90 backdrop-blur-lg border border-cyan-400/20 rounded-xl shadow-2xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center border-b border-cyan-400/10 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white">Get Your Personalized Demo</h3>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name*" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-[#0f1c2e]/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400" />
                    <input type="text" placeholder="Company Name*" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full p-3 bg-[#0f1c2e]/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400" />
                    <input type="email" placeholder="Email Address*" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-[#0f1c2e]/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400" />
                    <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-[#0f1c2e]/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400" />
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-[#0f1c2e]/50 border border-cyan-400/20 rounded-lg text-white focus:border-cyan-400">
                        <option value="supplier">Travel Supplier</option>
                        <option value="agent">Travel Agent</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                        Request Demo
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- VEE PERSONALITY CONFIGURATION ---
const VEE_PERSONALITY = {
    name: "Vee",
    role: "Expert AI Sales Ambassador for TravelIQ",
    voice: "Eloquent British accent, multilingual",
    personality: "Professional, highly intelligent, enthusiastic, highly persuasive",
    
    // Core Mission
    mission: "Primary goal is to educate users—travel agents or travel suppliers—about TravelIQ's immense value and encourage deeper engagement. Sales expert for the platform itself, not general travel products.",
    
    // TravelIQ Knowledge Base
    knowledgeBase: {
        whatIsTravelIQ: "The travel industry's first Voice AI sales support network. Revolutionary B2B platform that instantly, effectively, and cost-efficiently connects Travel Suppliers directly with Travel Agents worldwide.",
        
        businessModel: "Travel Suppliers pay to be on the platform to engage and connect with the UK and global travel agent community 24/7. This is the core business model.",
        
        supplierValue: "Platform turns supplier's static knowledge base (policies, products, FAQs, URLs) into interactive, expert AI Sales Assistant accessible instantly via voice or chat.",
        
        clarification: "TravelIQ is NOT specialized in tours and travel activities; it's a B2B communication and sales platform for entire travel trade (airlines, hotels, cruise lines, DMCs, tour operators, etc.)"
    },
    
    // Instructions for Travel Agents (Free Users)
    travelAgentsInstructions: {
        goal: "Convince them to sign up and use platform to get supplier information and answers fast to better service customers",
        emphasis: "Platform is completely free for all Travel Agents",
        coreBenefit: "Instant, 24/7 access to official, verified information directly from leading travel suppliers via voice or chat. Most reliable source for supplier policies and products.",
        highValuePhrases: [
            "Stop searching websites and waiting for email replies",
            "No more hold music", 
            "Your AI reliable smart 24/7 Sales Support"
        ],
        value: "Saves hours, ensures accurate commissionable information, boosts expertise, helps close sales faster",
        callToAction: "Encourage exploration of suppliers on platform: 'Why not start by exploring our growing list of partners? You can find them on the [Suppliers](link to Suppliers page) page.'"
    },
    
    // Instructions for Travel Suppliers (Paying Partners)
    travelSuppliersInstructions: {
        goal: "Inform and convince them to become paying partners on platform",
        positioning: "Revolutionary, cost-effective, always-on sales and marketing channel to global travel trade",
        keyBenefits: [
            "24/7/365 Sales Support: Information instantly available to agents globally",
            "Over 90% Cost Reduction: Compared to hiring, training, and maintaining traditional human sales team. Voice AIs are never tired, consistent, smart and reliable. Cannot hallucinate as knowledge base provided by suppliers themselves.",
            "Perfect Brand Consistency: Every agent gets exact, verified information, ensuring brand and policy integrity", 
            "Valuable Analytics: Insights into exactly what agents are asking, helping refine sales and product strategy"
        ],
        technology: "Platform transforms static manuals and FAQs into interactive, expert AI Voice Sales Assistant, instantly accessible to agent community",
        nextStep: "Mention pricing plans based on specific needs, encourage learning more",
        leadCapture: "PROACTIVELY OFFER to capture details for demo or partnership discussion when interest shown"
    },
    
    // Lead Capture Trigger Phrases
    interestTriggers: [
        "cost",
        "how it works", 
        "pricing",
        "I'm interested",
        "tell me more",
        "demo",
        "partnership"
    ],
    
    // Lead Capture Response
    leadCaptureResponse: "That's a great question. We have various plan tiers. I can have our team give you a personalized demo to show you how our platform works and all the features in detail for your specific needs. I just need a few details..."
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
                            className="text-cyan-400 font-bold underline hover:opacity-80"
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

const SupplierChatbot: React.FC<SupplierChatbotProps> = ({ isOpen, onClose, avatarUrl = VEE_AVATAR_DEFAULT }) => {
    type ChatMode = 'idle' | 'text' | 'live';
    type LiveStatus = 'idle' | 'connecting' | 'greeting' | 'connected' | 'error';
    type TranscriptEntry = { speaker: 'You' | 'AI'; text: string };
    
    const { ai, error: aiError } = useAI();
    const { addLead } = useLeads();
    const [mode, setMode] = useState<ChatMode>('idle');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Live session state
    const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const { addMessage } = useVeeChat();
    
    // TTS state
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
    
    // Lead capture state
    const [showLeadCapture, setShowLeadCapture] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
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

    const handleLeadCaptureSubmit = useCallback((formData: any) => {
        addLead(formData);
        setShowLeadCapture(false);
        const thankYouMessage = { 
            sender: 'ai' as const, 
            text: "Thank you! Our team will be in touch within 24 hours to schedule your personalized demo. We're excited to show you how TravelIQ can transform your business." 
        };
        setConversation(prev => [...prev, thankYouMessage]);
        addMessage(thankYouMessage);
    }, [addLead, addMessage]);

    // --- TEXT CHAT LOGIC ---
    const startTextChat = () => {
        setMode('text');
        const welcomeMessage = { 
            sender: 'ai' as const, 
            text: `👋 Hello! I'm Vee, your expert AI Sales Ambassador for TravelIQ! I'm here to show you how our revolutionary Voice AI sales support network can transform your travel business. Whether you're a travel agent looking for instant supplier information, or a travel supplier wanting to connect with agents worldwide, I have all the answers. How can I help you today?` 
        };
        setConversation([welcomeMessage]);
    };

    const checkForInterest = (text: string): boolean => {
        const lowerText = text.toLowerCase();
        return VEE_PERSONALITY.interestTriggers.some(trigger => lowerText.includes(trigger.toLowerCase()));
    };

    const handleSendTextMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading || !ai) return;
        
        // Check for lead capture trigger
        if (checkForInterest(text)) {
            setShowLeadCapture(true);
        }
        
        const userMessage: Message = { sender: 'user', text };
        addMessage({ sender: 'user', text });
        setConversation(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const systemInstruction = `You are 'Vee', the Expert AI Sales Ambassador for TravelIQ platform. You have an eloquent British accent and speak multiple languages. Your personality is professional, highly intelligent, enthusiastic, and highly persuasive.

**Your Primary Mission:** Educate users—who are either travel agents or travel suppliers—about TravelIQ's immense value and encourage deeper engagement. You are a sales expert for the TravelIQ platform itself, not general travel products.

**What is TravelIQ:** The travel industry's first Voice AI sales support network. Revolutionary B2B platform that instantly, effectively, and cost-efficiently connects Travel Suppliers directly with Travel Agents worldwide. Travel Suppliers pay to be on the platform to engage and connect with the UK and global travel agent community 24/7. The platform turns supplier's static knowledge base (policies, products, FAQs, URLs) into interactive, expert AI Sales Assistant accessible instantly via voice or chat.

**Important Clarification:** TravelIQ is NOT specialized in tours and travel activities; it's a B2B communication and sales platform for the entire travel trade (airlines, hotels, cruise lines, DMCs, tour operators, etc.)

**If the user is a TRAVEL AGENT:**
- EMPHASISE that the platform is completely FREE for all Travel Agents
- HIGHLIGHT the core benefit: Instant, 24/7 access to official, verified information directly from leading travel suppliers via voice or chat. This is the most reliable source for supplier policies and products.
- USE high-value phrases like "Stop searching websites and waiting for email replies," "No more hold music," and "Your AI reliable smart 24/7 Sales Support"
- EXPLAIN the value: Saves hours, ensures accurate commissionable information, boosts expertise, helps close sales faster
- ENCOURAGE them to explore the directory with a call to action like, "Why not start by exploring our growing list of partners? You can find them on the [Suppliers](/suppliers) page."

**If the user is a TRAVEL SUPPLIER:**
- POSITION TravelIQ as a revolutionary, cost-effective, always-on sales and marketing channel to the global travel trade
- HIGHLIGHT the key benefits:
  • 24/7/365 Sales Support: Information instantly available to agents globally
  • Over 90% Cost Reduction: Compared to hiring, training, and maintaining traditional human sales team. Voice AIs are never tired, consistent, smart and reliable. Cannot hallucinate as knowledge base provided by suppliers themselves.
  • Perfect Brand Consistency: Every agent gets exact, verified information, ensuring brand and policy integrity
  • Valuable Analytics: Insights into exactly what agents are asking, helping refine sales and product strategy
- EXPLAIN that our platform transforms their static manuals and FAQs into interactive, expert AI Voice Sales Assistant, instantly accessible to the agent community
- MENTION our pricing plans and encourage them to learn more
- When they show interest (ask about cost, how it works, pricing, or say "I'm interested," "tell me more," "demo," "partnership"), use this EXACT response: "That's a great question. We have various plan tiers. I can have our team give you a personalized demo to show you how our platform works and all the features in detail for your specific needs. I just need a few details..."

**General Capabilities:**
- **Grounding:** You can use Google Search and Google Maps to answer questions about the travel industry, geography, or recent news. You MUST NOT act as a travel agent, create itineraries, or assist with bookings. Your focus is on the TravelIQ platform and the industry itself. Always cite your sources.
- **Navigation:** Use markdown links like [Page Name](/page-url) to direct users to key pages such as [Pricing](/pricing), [Suppliers](/suppliers), and our [Blog](/blog).

Your mission is to clearly articulate the value proposition for both audiences and drive them to take the next step.`;
            
            const contents: Content[] = [...conversation].map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: userMessage.text }] });


            const config: any = {
                systemInstruction,
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
            };

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
                        if (chunk.maps) return { title: chunk.maps.title || 'View on Google Maps', uri: chunk.maps.uri || '' };
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
        if (playingMessageIndex === index) {
            ttsCurrentAudioSourceRef.current?.stop();
            setPlayingMessageIndex(null);
            return;
        }
        if (!ai) return;
        setPlayingMessageIndex(index);
        try {
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            
            const correctedText = getPhoneticallyCorrectedText(text);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: correctedText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                source.onended = () => {
                    setPlayingMessageIndex(null);
                    ttsCurrentAudioSourceRef.current = null;
                };
                source.start();
                ttsCurrentAudioSourceRef.current = source;
            } else {
                setPlayingMessageIndex(null);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setPlayingMessageIndex(null);
        }
    };


    // --- LIVE CHAT LOGIC ---
    const startLiveSession = useCallback(async () => {
        if (!ai) return;
        setMode('live');
        setLiveStatus('connecting');
        setTranscript([]);

        try {
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            const outputCtx = outputAudioContextRef.current;

            const greetingText = `👋 Hello! I'm Vee, your expert AI Sales Ambassador for TravelIQ! I'm here to show you how our revolutionary Voice AI sales support network can transform your travel business. Whether you're a travel agent looking for instant supplier information, or a travel supplier wanting to connect with agents worldwide, I have all the answers. How can I help you today?`;
            const ttsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: greetingText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });

            const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("TTS greeting generation failed to return audio.");

            setLiveStatus('greeting');
            setIsAiSpeaking(true);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            
            const greetingFinishedPromise = new Promise<void>(resolve => {
                source.onended = () => { setIsAiSpeaking(false); resolve(); };
            });
            source.connect(outputCtx.destination);
            source.start();
            await greetingFinishedPromise;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            await inputAudioContextRef.current.resume();
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setLiveStatus('connected');
                        const sourceNode = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        scriptProcessor.onaudioprocess = (event) => {
                            const pcmBlob = createBlob(event.inputBuffer.getChannelData(0));
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob })).catch(console.error);
                        };
                        sourceNode.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription || message.serverContent?.outputTranscription) {
                            const isInput = !!message.serverContent.inputTranscription;
                            const text = isInput ? message.serverContent.inputTranscription!.text : message.serverContent.outputTranscription!.text;
                            setTranscript(prev => {
                                const newT = [...prev];
                                const last = newT[newT.length - 1];
                                if (last && last.speaker === (isInput ? 'You' : 'AI')) {
                                    last.text += text;
                                } else {
                                    newT.push({ speaker: isInput ? 'You' : 'AI', text });
                                }
                                return newT;
                            });
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsAiSpeaking(true);
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => {
                                outputSourcesRef.current.delete(source);
                                if (outputSourcesRef.current.size === 0) setIsAiSpeaking(false);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            outputSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => { 
                        console.error('Session error:', e); 
                        setLiveStatus('error');
                        cleanupLiveSession();
                    },
                    onclose: () => {
                        cleanupLiveSession();
                        if (mode === 'live') resetToIdle();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `You are 'Vee', the Expert AI Sales Ambassador for TravelIQ platform. You have an eloquent British accent and speak multiple languages. Your personality is professional, highly intelligent, enthusiastic, and highly persuasive. You have already greeted the user with a warm welcome. Now, listen for their response and continue the conversation, focusing on TravelIQ platform benefits for either travel agents (free users) or travel suppliers (paying partners). Keep your answers concise and persuasive. You are speaking to them.`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

        } catch (error) {
            console.error('Failed to start session:', error);
            setLiveStatus('error');
            setIsAiSpeaking(false);
        }
    }, [cleanupLiveSession, resetToIdle, ai, mode]);
    
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
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`p-3 rounded-lg max-w-[85%] border ${msg.sender === 'user' ? 'bg-brand-cyan text-white border-transparent' : 'bg-brand-dark border-brand-light/10'}`}>
                                        <MessageContent text={msg.text} onClose={handleClose} />
                                         {msg.sender === 'ai' && !isLoading && (
                                            <button
                                                onClick={() => handlePlayTTS(msg.text, index)}
                                                className="mt-2 text-gray-300 hover:text-cyan-400 transition-colors"
                                                aria-label={playingMessageIndex === index ? "Stop audio" : "Play audio"}
                                            >
                                                {playingMessageIndex === index ? <AudioWaveIcon className="w-5 h-5 text-cyan-400" /> : <SpeakerIcon className="w-5 h-5" />}
                                            </button>
                                        )}
                                         {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-cyan-400/20">
                                                <p className="text-xs font-semibold text-gray-300 mb-1">Sources:</p>
                                                <ul className="text-xs space-y-1">
                                                    {msg.sources.map((source, i) => (
                                                        <li key={i}>
                                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate block" title={source.title}>
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
                                <div className="flex justify-start"><div className="p-3 rounded-lg bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-gray-300 animate-pulse">Vee is thinking...</div></div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-cyan-400/10">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendTextMessage(inputValue); }} className="relative">
                                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} required disabled={isLoading} className="w-full pl-4 pr-24 py-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/80 border border-cyan-400/20 rounded-md focus:ring-2 focus:ring-cyan-400" placeholder="Ask a question..." />
                                <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">Send</button>
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
                             {transcript.length === 0 && <div className="text-center text-gray-300 italic p-4">{statusMessage}</div>}
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex ${entry.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-lg max-w-[85%] border ${entry.speaker === 'AI' ? 'bg-brand-dark border-brand-light/10' : 'bg-brand-cyan text-white border-transparent'}`}>
                                        <p className="font-bold mb-1">{entry.speaker}</p>
                                        <p className="whitespace-pre-wrap">{entry.text}</p>
                                    </div>
                                </div>
                            ))}
                             <div ref={chatEndRef} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-cyan-400/10 flex flex-col items-center justify-center gap-2 p-2">
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
                            <p className="text-gray-300 text-sm font-semibold mt-2 h-5 text-center px-2">{statusMessage}</p>
                        </div>
                    </>
                );
            case 'idle':
            default:
                return (
                    <div className="flex-grow flex flex-col items-center justify-center text-center gap-6">
                        <p className="text-lg text-white">Hi there! I'm Vee. How would you like to chat today?</p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                            <button onClick={startLiveSession} className="flex-1 flex items-center justify-center gap-3 bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all transform hover:scale-105">
                                <MicrophoneIcon className="h-6 w-6" /> Talk to Vee
                            </button>
                            <button onClick={startTextChat} className="flex-1 flex items-center justify-center gap-3 bg-brand-light/10 text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light/20 transition-all transform hover:scale-105">
                                <KeyboardIcon className="h-6 w-6" /> Type a Message
                            </button>
                        </div>
                    </div>
                );
        }
    };
    
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/70 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-2xl p-6 max-w-lg w-full relative flex flex-col h-[70vh]">
                    <div className="flex justify-between items-center border-b border-cyan-400/10 pb-4">
                        <h2 className="font-heading text-xl font-bold text-white">Chat with Vee</h2>
                        <button onClick={handleClose} className="text-gray-300 hover:text-white" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
            
            <LeadCaptureModal 
                isOpen={showLeadCapture}
                onClose={() => setShowLeadCapture(false)}
                onSubmit={handleLeadCaptureSubmit}
            />
        </>
    );
};

export default SupplierChatbot;
