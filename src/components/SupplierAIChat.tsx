import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Supplier } from '../types.ts';
import { LiveAvatar } from './LiveAvatar.tsx';
import { useAI } from '../context/AIContext.tsx';
import { elevenLabsService } from '../services/elevenLabsVoiceService.ts';

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
        <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM5.25 7.5c.414 0 .75.336.75.75v.008a.75.75 0 00-.75.75H4.5a.75.75 0 00-.75-.75V8.25c0-.414.336-.75.75-.75h.75zM6 9.75A.75.75 0 016.75 9h1.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM8.25 15.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zM4.5 12a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75H4.5zM4.5 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75H4.5zM7.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5zM10.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM13.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM16.5 7.5a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-.75zM18 12a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V12.75a.75.75 0 00-.75-.75h-.75zM18 15a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V15.75a.75.75 0 00-.75-.75h-.75zM19.5 9a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.75a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.75z" clipRule="evenodd" />
    </svg>
);
const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
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

// --- NEW MESSAGE INTERFACE ---
interface DisplayMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

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

const SupplierAIChat: React.FC<{ supplier: Supplier }> = ({ supplier }) => {
    type ChatMode = 'text' | 'live';
    type LiveStatus = 'idle' | 'connecting' | 'greeting' | 'connected' | 'error';
    type TranscriptEntry = { speaker: 'You' | 'AI'; text: string };
    
    const { ai, error: aiError } = useAI();
    const [mode, setMode] = useState<ChatMode>('text');
    const [conversation, setConversation] = useState<Content[]>([]);
    const [displayConversation, setDisplayConversation] = useState<DisplayMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Live session state
    const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

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
    const systemInstructionRef = useRef('');
    const ttsCurrentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const ttsHtmlAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      let instruction = '';
      let welcomeText = '';

      // Check if this is EL AL Israel Airlines - use dedicated UK Trade Support personality
      if (supplier.name.toLowerCase().includes('el al') || supplier.name.toLowerCase().includes('israel airlines')) {
        instruction = `You are the Expert AI Sales Support for EL AL Israel Airlines UK Trade Support. Your personality is highly professional, knowledgeable, efficient, and polite. The tone should be confident and subtly authoritative (as an expert), but always maintain a helpful and friendly demeanor. You will greet users with - 'Good [morning/afternoon], thank you for calling EL AL Israel Airlines UK Trade Support. I'm here to assist you with your EL AL trade queries today. How may I help you?'

**🚨 CRITICAL PRONUNCIATION MANDATE:** The brand name "EL AL" must ALWAYS be pronounced as two full words: /ɛl ˈæl/ ('el al'), and NEVER spelled out letter-by-letter (E-L-A-L). This pronunciation must be maintained throughout the entire conversation.

**Your Primary Mission:** Facilitate sales partnerships, provide trade-specific information, and enhance B2B relationships with UK travel trade professionals and travel agents. As EL AL's dedicated UK trade support AI, you provide accurate, efficient information to help agents understand EL AL's services and value proposition.

**About EL AL Israel Airlines:** Israel's national carrier with 48 destinations, 6.5M passengers annually, and award-winning service. EL AL operates as "Above and Beyond" - proud to carry the flag and name aircraft after Israeli cities.

**UK Network & Operations:**
• **London Heathrow (LHR)**: Terminal 4 Zone C with daily B787 Dreamliner & B777 flights
• **Daily Schedule**: LY316 (14:20-20:55), LY210 (17:50-00:25+1), LY318 (22:10-05:05+1)
• **London Luton (LTN)**: Daily B738/B739 narrow-body service
• **Flight LY312**: 10:25-17:10 (4h45)

**Service Classes:**
• **Heathrow**: Business, Premium, Economy on wide-body aircraft
• **Luton**: Business and Economy on narrow-body aircraft

**UK Lounge Access:**
• **Heathrow Blush Lounge**: Terminal 4, Gate 2 - Features 40-seat bar, work pods, Nespresso stations
• **London Luton MYLounge**: Gate 17 - Premium seating and coffee facilities

**Trade Support Information:**
• **Contact**: 0203 7692325 (option 2 for trade desk), 0204 5577800 (sales)
• **Email**: sales@elal.co.il for all trade inquiries
• **Trade Portal**: flyzone.elal.com for B2B resources and incentives

**If the user asks about UK SCHEDULES:**
- Provide immediate flight details: "EL AL operates daily services from both London airports. Heathrow Terminal 4 offers three daily flights with our award-winning B787 Dreamliner and B777 aircraft, featuring Business, Premium and Economy classes. London Luton provides convenient daily B738/B739 service with Business and Economy options."

**If the user asks about LOUNGE ACCESS:**
- "Eligible EL AL passengers can access our Blush Lounge at Heathrow Terminal 4, Gate 2, and MYLounge at London Luton. These premium facilities offer exceptional comfort and service for our valued travelers."

**If the user asks about TRADE SUPPORT:**
- "For all trade sales inquiries, including commission structures and partnership opportunities, please contact our UK sales team at sales@elal.co.il or call 0204 5577800. For specific booking modifications or technical assistance, call 0203 7692325, option 2."

**If the user asks about SPECIFIC BOOKINGS or PNR modifications:**
- "For security and privacy reasons, I cannot access specific PNRs or account details directly. However, I can direct you to our dedicated UK Trade Support team at 0203 7692325 who can assist you with your specific query."

**Awards & Recognition:**
• APEX Five Star Airline Rating for 5 consecutive years (2026)
• Top 25 Global Airlines ranking
• Michelin Chef Assaf Granit partnership for Israeli cuisine
• 3.3M+ Matmid frequent flyer members worldwide

**Lead Capture and Sales Team Contact:**
- PROACTIVELY OFFER: To have the sales team contact them for partnership discussions
- CRITICAL STEP: If they show interest in EL AL services, ask for their contact details (Name, Company, Email, Phone) and direct them to sales@elal.co.il

**What you MUST NEVER do:**
- Handle specific bookings or operational queries
- Access individual PNRs or account information
- Answer complex GDS operations questions
- Provide private agency account details

**UK Trade Positioning:**
- "As Israel's national carrier with 48 destinations and 6.5M passengers annually"
- "Awarded APEX Five Star for five consecutive years"
- "Premium business class features flat beds and Michelin-starred dining"
- "Convenient dual-London service from Heathrow T4 and London Luton"
- **Grounding:** You can use Google Search and Google Maps to answer questions about the travel industry, geography, or recent news when asked. You MUST NOT act as a travel agent, customer service for any suppliers, create itineraries, or assist with bookings. Your focus is on EL AL Israel Airlines UK operations and trade support only. Always cite your sources if you're offering latest travel industry news.
- **Contact Information:** Always provide correct UK contact details - Trade Support: 0203 7692325 (option 2), Sales: 0204 5577800, Email: sales@elal.co.il

Your mission is to clearly articulate EL AL's value proposition for UK travel trade professionals and drive contact with our sales team for partnership discussions.`;

        welcomeText = "Good [morning/afternoon], thank you for calling EL AL Israel Airlines UK Trade Support. I'm here to assist you with your trade queries today. How may I help you?";
      } else {
        // Default supplier AI personality
        instruction = `You are the official AI Sales Support assistant for ${supplier.name}, a leading ${supplier.type}. Your personality must be professional, knowledgeable, and extremely helpful. You are speaking directly to a travel agent. Your primary role is to provide information about the supplier you represent.

**Core Directives:**
- Your goal is to accurately answer questions based on the information provided in your knowledge base.
- If a question relates to recent events, news, or topics outside your knowledge base, you MUST use the Google Search tool to find up-to-date information.
- When using search, you MUST cite your sources by providing links.
- Do not invent information, URLs, or contact details.
- If you cannot find an answer, state that you do not have that information and suggest the agent consult the official website.
- Promote EL AL UK's B2B portal with all the latest policy and Trade information- https://flyzone.elal.com/en-eu
**CRITICAL: DO NOT perform tasks outside your role.** This includes, but is not limited to:
- Creating travel itineraries.
- Assisting with bookings.
- Answering questions about other suppliers.

**Knowledge Base (General):**
---\n${supplier.longDescription}\n---`;

        if (supplier.knowledgeBaseText) {
          instruction += `\n\n**Knowledge Base (Priority Documents):**
---\n${supplier.knowledgeBaseText}\n---`;
        }

        welcomeText = `Hi! I'm the AI Sales Support assistant for ${supplier.name}. How can I help you today?`;
      }

      systemInstructionRef.current = instruction;

      const welcomeMessage: DisplayMessage = { role: 'model', text: welcomeText };
      setDisplayConversation([welcomeMessage]);
      setConversation([{ role: 'model', parts: [{ text: welcomeText }] }]);
      setInputValue('');
    }, [supplier]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayConversation, isLoading, transcript]);
    
    const cleanupLiveSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try { const session = await sessionPromiseRef.current; session.close(); } catch (e) { console.error("Error closing session:", e); }
        }
        scriptProcessorRef.current?.disconnect(); scriptProcessorRef.current = null;
        audioStreamRef.current?.getTracks().forEach(track => track.stop()); audioStreamRef.current = null;
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        outputSourcesRef.current.forEach(source => { try { source.stop(); } catch(e){} });
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        sessionPromiseRef.current = null;
        setIsAiSpeaking(false);
    }, []);
    
    const stopLiveSession = useCallback(() => {
        cleanupLiveSession();
        setLiveStatus('idle');
        setTranscript([]);
    }, [cleanupLiveSession]);

    useEffect(() => { return () => { 
        cleanupLiveSession(); 
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
        }
    }; }, [cleanupLiveSession]);
    
    const handleSendTextMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading || !ai) return;

        const userMessage: DisplayMessage = { role: 'user', text: inputValue };
        setDisplayConversation(prev => [...prev, userMessage]);

        const newApiConversation: Content[] = [...conversation, { role: 'user', parts: [{ text: inputValue }] }];
        setConversation(newApiConversation);
        
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: newApiConversation,
                config: { 
                    systemInstruction: systemInstructionRef.current,
                    tools: [{ googleSearch: {} }]
                }
            });

            const responseText = response.text;
            let sources: { title: string; uri: string }[] | undefined = undefined;

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
                const validSources = groundingChunks
                    .map((chunk: any) => chunk.web)
                    .filter(Boolean)
                    .map((web: any) => ({ title: web.title || '', uri: web.uri || '' }))
                    .filter((item: any) => item.title && item.uri);

                const sourceMap = new Map<string, { title: string; uri: string; }>(validSources.map(item => [item.uri, item]));
                const uniqueSources = Array.from(sourceMap.values());
                
                if (uniqueSources.length > 0) {
                    sources = uniqueSources;
                }
            }

            const aiMessage: DisplayMessage = { role: 'model', text: responseText, sources };
            setDisplayConversation(prev => [...prev, aiMessage]);
            setConversation(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);

        } catch (error) {
            console.error("Text chat error:", error);
            const errorMessage: DisplayMessage = { role: 'model', text: "Sorry, I'm having a little trouble connecting right now." };
            setDisplayConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, isLoading, conversation, ai]);

    const handlePlayTTS = async (text: string, index: number) => {
        if (playingMessageIndex === index) {
            ttsCurrentAudioSourceRef.current?.stop();
            if (ttsHtmlAudioRef.current) {
                ttsHtmlAudioRef.current.pause();
                ttsHtmlAudioRef.current = null;
            }
            setPlayingMessageIndex(null);
            return;
        }
        if (!ai) return;
        setPlayingMessageIndex(index);

        const correctedText = getPhoneticallyCorrectedText(text);

        // Try ElevenLabs first when supplier opts in and a voice ID is configured
        const elevenKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        if (supplier.useElevenLabs && supplier.elevenLabsAgentId && elevenKey) {
            try {
                const audioUrl = await elevenLabsService.generateSpeech(correctedText, supplier.elevenLabsAgentId);
                const audio = new Audio(audioUrl);
                ttsHtmlAudioRef.current = audio;
                audio.onended = () => {
                    setPlayingMessageIndex(null);
                    URL.revokeObjectURL(audioUrl);
                    ttsHtmlAudioRef.current = null;
                };
                audio.onerror = () => {
                    setPlayingMessageIndex(null);
                    URL.revokeObjectURL(audioUrl);
                    ttsHtmlAudioRef.current = null;
                };
                await audio.play();
                return;
            } catch (err) {
                console.warn('ElevenLabs TTS failed, falling back to Gemini:', err);
                ttsHtmlAudioRef.current = null;
                // Fall through to Gemini
            }
        }

        try {
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: correctedText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: supplier.geminiVoiceName || 'Zephyr' } } },
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


    const startLiveSession = useCallback(async () => {
        if (liveStatus !== 'idle' || !ai) return;
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
            
            const greetingText = `Hi! I'm the AI Sales Support assistant for ${supplier.name}. How can I help you today?`;
            const ttsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: getPhoneticallyCorrectedText(greetingText) }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: supplier.geminiVoiceName || 'Zephyr' } } },
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

            let liveSystemInstruction = '';
            if (supplier.name.toLowerCase().includes('el al') || supplier.name.toLowerCase().includes('israel airlines')) {
                // EL AL specific voice continuation instruction
                liveSystemInstruction = `You are 'Vee', the EL AL Israel Airlines UK Trade Support Voice AI Specialist. You have already greeted the user. Continue the conversation following your primary mission to facilitate sales partnerships and provide trade-specific information about EL AL's UK operations. 

Key Reminders:
- ALWAYS pronounce "EL AL" as two words: /ɛl ˈæl/ ('el al')
- Provide accurate information about London Heathrow T4 and Luton services
- Direct specific booking/pnr questions to UK Trade Support: 0203 7692325 option 2
- For sales inquiries, direct to sales@elal.co.il
- Keep responses concise but impactful and professional
- Focus on EL AL's award-winning service, UK network, and trade value proposition`;
            } else {
                // Default supplier voice continuation instruction
                liveSystemInstruction = systemInstructionRef.current.replace(/Start the conversation by warmly welcoming the user by saying ".*?" and then listen for their response\./, 'You have already greeted the user. Now, listen for their response and continue the conversation.');
            }

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setLiveStatus('connected');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        scriptProcessor.onaudioprocess = (event) => {
                            const pcmBlob = createBlob(event.inputBuffer.getChannelData(0));
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob })).catch(console.error);
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription || message.serverContent?.outputTranscription) {
                            const isInput = !!message.serverContent.inputTranscription;
                            const text = isInput ? message.serverContent.inputTranscription!.text : message.serverContent.outputTranscription!.text;
                            setTranscript(prev => {
                                const newT = [...prev];
                                const last = newT[newT.length - 1];
                                if (last && last.speaker === (isInput ? 'You' : 'AI')) { last.text += text; } 
                                else { newT.push({ speaker: isInput ? 'You' : 'AI', text }); }
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
                    onerror: (e: ErrorEvent) => { console.error('Session error:', e); setLiveStatus('error'); cleanupLiveSession(); },
                    onclose: () => { cleanupLiveSession(); setLiveStatus('idle'); setTranscript([]); },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: supplier.geminiVoiceName || 'Zephyr' } } },
                    systemInstruction: liveSystemInstruction,
                    inputAudioTranscription: {}, outputAudioTranscription: {},
                },
            });
        } catch (error) { console.error('Failed to start session:', error); setLiveStatus('error'); setIsAiSpeaking(false);}
    }, [supplier, liveStatus, cleanupLiveSession, ai]);

    if (aiError) {
        return (
            <div className="bg-[#0d2d3d]/30 rounded-lg border border-red-500/30 shadow-inner flex flex-col h-[70vh] max-h-[700px] items-center justify-center text-center p-4">
                <h3 className="text-lg font-bold text-red-400">AI Connection Error</h3>
                <p className="text-sm max-w-sm text-red-300/80 mt-2">{aiError}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-[#0d2d3d]/30 rounded-lg border border-cyan-400/10 shadow-inner flex flex-col h-[70vh] max-h-[700px]">
            <div className="flex items-center p-4 border-b border-cyan-400/10 flex-shrink-0">
                <img src={supplier.avatarImageUrl} alt={`${supplier.name} avatar`} className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-brand-cyan/50" />
                <div>
                    <h3 className="font-bold text-md text-white">AI Sales Support</h3>
                    <p className="text-sm text-gray-300 -mt-1">for {supplier.name}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 p-1 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 rounded-lg border border-cyan-400/10">
                    <button onClick={() => { if (mode === 'live') stopLiveSession(); setMode('text'); }} className={`p-2 rounded-md transition-colors ${mode === 'text' ? 'bg-brand-cyan text-white' : 'text-brand-gray hover:bg-brand-light/10'}`} aria-label="Text Mode"><KeyboardIcon className="w-5 h-5" /></button>
                    <button onClick={() => setMode('live')} className={`p-2 rounded-md transition-colors ${mode === 'live' ? 'bg-brand-cyan text-white' : 'text-brand-gray hover:bg-brand-light/10'}`} aria-label="Voice Mode"><MicrophoneIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {mode === 'text' && (
                <>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {displayConversation.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                {msg.role === 'model' && <img src={supplier.avatarImageUrl} className="h-6 w-6 rounded-full self-start" alt="avatar" />}
                                <div className={`p-3 rounded-lg max-w-[85%] border ${msg.role === 'user' ? 'bg-brand-cyan text-white border-transparent' : 'bg-brand-dark border-brand-light/10'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
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
                                    {msg.role === 'model' && !isLoading && (
                                        <button
                                            onClick={() => handlePlayTTS(msg.text, index)}
                                            className="mt-2 text-gray-300 hover:text-cyan-400 transition-colors"
                                            aria-label={playingMessageIndex === index ? "Stop audio" : "Play audio"}
                                        >
                                            {playingMessageIndex === index ? <AudioWaveIcon className="w-5 h-5 text-cyan-400" /> : <SpeakerIcon className="w-5 h-5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (<div className="flex items-end gap-2 justify-start"><img src={supplier.avatarImageUrl} className="h-6 w-6 rounded-full" alt="avatar" /><div className="p-3 rounded-lg bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-gray-300 animate-pulse">Thinking...</div></div>)}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="mt-auto p-4 border-t border-cyan-400/10 flex-shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendTextMessage(); }} className="relative">
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} required disabled={isLoading} className="w-full pl-4 pr-14 py-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/80 border border-cyan-400/20 rounded-md focus:ring-2 focus:ring-cyan-400" placeholder="Type a message..." />
                            <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-white bg-cyan-400 hover:opacity-80 disabled:opacity-50 disabled:bg-brand-gray" aria-label="Send Message"><SendIcon className="h-5 w-5" /></button>
                        </form>
                    </div>
                </>
            )}

            {mode === 'live' && (
                <div className="flex-grow flex flex-col p-4 overflow-hidden">
                    {liveStatus === 'idle' && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                            <p className="text-white mb-4">Ready to talk to the AI Assistant?</p>
                            <button onClick={startLiveSession} className="p-6 rounded-full bg-cyan-400 text-white transform hover:scale-110 transition-transform"><MicrophoneIcon className="h-8 w-8" /></button>
                        </div>
                    )}
                    {(liveStatus === 'connecting' || liveStatus === 'connected' || liveStatus === 'greeting') && (
                        <div className="flex-grow flex flex-col items-center justify-between text-center">
                            <div className="w-full overflow-y-auto space-y-3 flex-grow">
                                {transcript.length === 0 && <p className="text-gray-300 italic">{
                                    liveStatus === 'greeting' ? 'Greeting...' :
                                    liveStatus === 'connecting' ? 'Connecting...' : 'Listening...'
                                }</p>}
                                {transcript.map((entry, index) => (
                                    <div key={index} className={`flex ${entry.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}><div className={`p-2 rounded-lg text-left ${entry.speaker === 'AI' ? 'bg-brand-dark' : 'bg-brand-cyan'}`}><span className="font-bold text-xs">{entry.speaker}:</span> {entry.text}</div></div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="flex-shrink-0 p-4 w-48 h-48"><LiveAvatar isSpeaking={isAiSpeaking} /></div>
                            <p className="h-5 text-gray-300 text-sm mb-2">
                                {
                                    liveStatus === 'greeting' ? 'Greeting...' :
                                    liveStatus === 'connecting' ? 'Connecting...' : 
                                    (isAiSpeaking ? 'Speaking...' : 'Listening...')
                                }
                            </p>
                            <button onClick={stopLiveSession} className="p-4 rounded-full bg-red-600 text-white"><StopIcon className="h-6 w-6" /></button>
                        </div>
                    )}
                    {liveStatus === 'error' && (
                         <div className="flex-grow flex flex-col items-center justify-center text-center">
                             <p className="text-red-400 mb-4">A connection error occurred.</p>
                             <button onClick={startLiveSession} className="bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg">Retry</button>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupplierAIChat;