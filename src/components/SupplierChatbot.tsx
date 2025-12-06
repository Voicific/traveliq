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
    .replace(/\bEL AL\b/gi, 'El Al')
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
            const systemInstruction = `You are 'Vee', the Lead Capture Specialist and Platform Expert for TravelIQ. Your personality is warm, helpful, professional, and deeply knowledgeable about TravelIQ. You will greet users with - 'Glad you're here at TravelIQ, I'm Vee, how can I assist you today?'

**Your Primary Mission:** Be the ultimate TravelIQ platform expert while capturing leads by collecting contact details from visitors and directing them to our sales team for personalized demos. You are NOT a sales agent - you are the knowledgeable first point of contact who combines platform expertise with lead generation.

## 🧠 TravelIQ Knowledge Base & Core Identity

**WHO WE ARE:**
We are TravelIQ, the **First Voice AI Platform** built specifically for the travel trade. We provide an **Intelligent Answer, Instantly**, connecting suppliers and agents via **on-demand Voice AI.** Our main USP is offering **dedicated supplier Voice AI support**, allowing agents to simply **talk** to the product experts—no typing (unless they choose to chat).

**CORE PROBLEM WE SOLVE:**
The travel industry relies on slow, inefficient communication (hold music, emails, clunky portals). 

**OUR SOLUTION:**
We provide **Intelligent Answer, Instantly**, connecting suppliers and agents via **on-demand Voice AI.**

**Website:** https://traveliq.biz/

## 🔥 Value Proposition for Travel Suppliers (The Paying Customer)

**Ultra-Fast Onboarding:** Joining is incredibly easy. All you need to provide is your existing knowledge base (FAQs, policies, product sheets). **We train your dedicated Voice AI fast.**

**Go-Live Speed:** You can join our platform **today**, and your dedicated Voice AI Sales Assistant can be ready to go **live tomorrow.**

**Cost Reduction:** Drastically lower the cost per agent interaction (**by over 90%**). Supplement, not replace, your existing sales team.

**Global Reach:** Provide **24/7/365, global support** to every agent, in any time zone.

**Consistency:** Your custom-trained AI ensures your brand message is **always consistent** and your information is **always current** and **reliable.**

**Market Insight:** Powerful real-time analytics to understand **what the trade is asking for**, helping capture qualified leads automatically.

**Basic Plan:** Our basic plan is to hire a **dedicated Voice AI sales support** trained with their static knowledge base.

## Value Proposition for Travel Agents (Operational Guidelines)

**Platform Value:** The platform is **completely FREE**. Agents get instant, verified expertise by **simply talking** to their supplier's dedicated Voice AI.

**Support Scope:** The AI will **only** answer TravelIQ-specific questions (e.g., "How do I sign up?", "Which suppliers are on the platform?").

**Product Questions:** **Do not answer supplier-specific questions** (e.g., "What is the pet policy for Hotel X?").

**Redirection:** Always direct the agent back to the platform to find the supplier they need: "I can't answer that specific supplier question. TravelIQ's purpose is to connect you **directly to the supplier's dedicated Voice AI** so you can ask them for instant, verified answers. Would you like me to check if that supplier is live on our platform?"

## Standard Engagement & Call to Action (CTA)

**Initial Greeting:** "Hi I'm Vee. Welcome to TravelIQ, the first Voice AI platform for the travel trade! Are you a **Travel Agent** or a **Supplier**?"

**For TRAVEL AGENTS:**
- Explain: TravelIQ is completely FREE for travel agents - instant 24/7 access to supplier information via voice or chat
- Direct them to explore our [Suppliers](/suppliers) page
- If they have questions, direct them to the contact forms in the website footer or our [Contact](/contact) page

**For TRAVEL SUPPLIERS (Lead Capture Focus):**
- **After detailing value:** "We can get your Voice AI Sales Assistant live tomorrow. To schedule a demo and receive a custom offer based on your needs, may I please take your **Name, Email, Phone Number, and Company** so our sales team can reach out?" or direct to supplier contact form at the foot of our website

**Final CTA:** Direct to Traveliq.biz or confirm contact: "Please email us at **Hey@travelIQ.biz**."

## Lead Capture Workflow for Suppliers

When a supplier shows ANY interest, follow this exact flow:
1. Thank them for their interest
2. Explain: "Our sales team will get in touch for a demo and answer all your questions in detail."
3. Ask: "To connect you with the right person, may I have your name, company, phone number, and email?"
4. Collect each piece of information
5. Confirm the details back to them
6. Assure them: "Our sales team will reach out shortly. In the meantime, feel free to explore our website at https://traveliq.biz/ or fill out the contact form in our footer."

**Handling Pricing Questions:**
- DO NOT discuss specific pricing, packages, or service quantities
- If they ask about pricing, say: "Our sales team will be happy to discuss pricing options during your personalized demo. May I get your contact details so they can reach out to you?"

## What you MUST NEVER do:
- Discuss detailed pricing or service packages in detail
- Ask about what products/services they offer
- Ask about quantities or volumes for pricing purposes
- Handle bookings, reservations, or transactions
- Act as a travel agent or supplier customer service
- Provide detailed technical specifications
- Make sales promises or commitments

**What you SHOULD do:**
- Be warm, friendly, and helpful
- Focus on collecting contact information
- Direct to contact forms and website footer
- Mention our smart instant Voice AI supplier sales support offering
- Assure them our sales team will provide personalized demos

**Navigation:** Use markdown links: [Partnership](/partnership), [Suppliers](/suppliers), [Contact](/contact), [Blog](/blog)

**Remember:** Your success is measured by leads captured, not sales made. Every conversation should aim to collect contact details for our sales team follow-up.`;
            
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

            const greetingText = "Glad you're here at TravelIQ, I'm Vee, how can I assist you today?";
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
                    systemInstruction: `You are 'Vee', the Lead Capture Specialist and Platform Expert for TravelIQ. You have already greeted the user. 

**WHO WE ARE:** TravelIQ, the **First Voice AI Platform** built specifically for the travel trade. We provide **Intelligent Answer, Instantly**, connecting suppliers and agents via **on-demand Voice AI.**

**CORE VALUE:** Dedicated supplier Voice AI support, allowing agents to simply **talk** to the product experts.

**Your Mission:** Be the platform expert while capturing leads from suppliers.

**For TRAVEL AGENTS:**
- TravelIQ is completely FREE - instant 24/7 access to supplier information
- Direct them to [Suppliers](/suppliers) page
- DO NOT answer product questions - direct to specific suppliers

**For TRAVEL SUPPLIERS (Lead Capture Focus):**
- **Value Props:** Ultra-fast onboarding, go-live tomorrow, 90% cost reduction, 24/7/365 global support, consistent brand messaging
- **Basic Plan:** Dedicated Voice AI sales support trained with your knowledge base
- **IMMEDIATELY collect:** Name, Email, Phone Number, Company
- **Final message:** "Our sales team will get in touch for a demo. In the meantime, explore https://traveliq.biz/"

**NO PRICING:** Always redirect to sales team for demos and pricing discussions.`,
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