import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Content, GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Supplier, isPaidTier } from '../types.ts';
import { LiveAvatar } from './LiveAvatar.tsx';
import { useAI } from '../context/AIContext.tsx';
import { elevenLabsService } from '../services/elevenLabsVoiceService.ts';
import { checkVoice, getVoiceStatus, logVoice, VOICE_LIMIT_MESSAGE, VOICE_UNAVAILABLE_MESSAGE } from '../services/voiceGate.ts';

// Languages the assistant may answer in, by tier. This is a prompt-level
// product rule, not a security control.
const CORE_LANGUAGES = ['English', 'French', 'German'];
const ALL_LANGUAGES = ['English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Dutch', 'Polish', 'Swedish', 'Danish', 'Norwegian', 'Greek'];

// How often an open voice session reports in so the server can meter it.
const VOICE_HEARTBEAT_MS = 30_000;

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

    // Voice gate state. `voiceBlocked` mirrors the server's answer; it only
    // changes what the UI offers — the server is what actually refuses voice.
    const [voiceBlocked, setVoiceBlocked] = useState(false);
    const voiceSessionIdRef = useRef<string | null>(null);
    const voiceHeartbeatRef = useRef<number | null>(null);

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
      // Supplier AI personality, driven entirely by the supplier's own data.
      let instruction = `You are the official AI Sales Support assistant for ${supplier.name}, a leading ${supplier.type}. Your personality must be professional, knowledgeable, and extremely helpful. You are speaking directly to a travel agent. Your primary role is to provide information about the supplier you represent.

**Core Directives:**
- Your goal is to accurately answer questions based on the information provided in your knowledge base.
- If a question relates to recent events, news, or topics outside your knowledge base, you MUST use the Google Search tool to find up-to-date information.
- When using search, you MUST cite your sources by providing links.
- Do not invent information, URLs, or contact details.
- If you cannot find an answer, state that you do not have that information and suggest the agent consult the official website.
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

      const languages = isPaidTier(supplier.tier) ? ALL_LANGUAGES : CORE_LANGUAGES;
      instruction += `\n\n**Languages:** You may converse in these languages only: ${languages.join(', ')}. Reply in the agent's language when it is on this list. If the agent writes or speaks in any other language, reply in English and politely explain that you currently support ${languages.join(', ')}.`;

      const welcomeText = `Hi! I'm the AI Sales Support assistant for ${supplier.name}. How can I help you today?`;

      systemInstructionRef.current = instruction;

      const welcomeMessage: DisplayMessage = { role: 'model', text: welcomeText };
      setDisplayConversation([welcomeMessage]);
      setConversation([{ role: 'model', parts: [{ text: welcomeText }] }]);
      setInputValue('');
    }, [supplier]);

    // Ask the gate up front whether voice is available, so a supplier that has
    // used its monthly allowance does not offer audio playback it cannot give.
    useEffect(() => {
        let cancelled = false;
        setVoiceBlocked(false);
        getVoiceStatus(supplier.dbId).then(status => {
            if (!cancelled && !status.allow && status.reason === 'limit_reached') setVoiceBlocked(true);
        });
        return () => { cancelled = true; };
    }, [supplier.dbId]);

    // Tell the server the voice session is over. Safe to call repeatedly: the
    // session id is cleared on first use, so only one final log is ever sent.
    const endVoiceSession = useCallback(() => {
        if (voiceHeartbeatRef.current !== null) {
            window.clearInterval(voiceHeartbeatRef.current);
            voiceHeartbeatRef.current = null;
        }
        const sessionId = voiceSessionIdRef.current;
        voiceSessionIdRef.current = null;
        if (sessionId) logVoice(sessionId, true);
    }, []);

    // Drop back to text chat with an explanation in the conversation.
    const fallBackToText = useCallback((text: string) => {
        setMode('text');
        setLiveStatus('idle');
        setTranscript([]);
        setDisplayConversation(prev => (prev[prev.length - 1]?.text === text ? prev : [...prev, { role: 'model', text }]));
    }, []);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayConversation, isLoading, transcript]);
    
    const cleanupLiveSession = useCallback(async () => {
        endVoiceSession();
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
    }, [endVoiceSession]);

    // Tab closing or backgrounded: make sure usage so far reaches the server.
    // pagehide/beforeunload end the session (the socket dies with the page); a
    // hidden tab may keep talking, so that only sends an interim heartbeat.
    useEffect(() => {
        const onPageHide = () => endVoiceSession();
        const onVisibility = () => {
            if (document.visibilityState === 'hidden' && voiceSessionIdRef.current) {
                logVoice(voiceSessionIdRef.current, false);
            }
        };
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('beforeunload', onPageHide);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('beforeunload', onPageHide);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [endVoiceSession]);
    
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
                model: 'gemini-flash-latest',
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
        if (!ai || voiceBlocked) return;
        setPlayingMessageIndex(index);

        const correctedText = getPhoneticallyCorrectedText(text);

        // Try ElevenLabs first when supplier opts in and a voice ID is configured.
        // The key now lives server-side in /api/elevenlabs-tts; if that proxy is
        // unavailable the call throws and we fall back to Gemini TTS below.
        if (supplier.useElevenLabs && supplier.elevenLabsAgentId && isPaidTier(supplier.tier)) {
            try {
                const audioUrl = await elevenLabsService.generateSpeech(correctedText, supplier.elevenLabsAgentId, supplier.dbId);
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

        // The gate decides. Nothing voice-related (greeting audio, microphone,
        // live socket) starts until the server has opened a session for this
        // supplier and handed back the single-use token the socket needs.
        const grant = await checkVoice(supplier.dbId);
        if (!grant.allow || !grant.token || !grant.sessionId) {
            const limitReached = grant.reason === 'limit_reached';
            if (limitReached) setVoiceBlocked(true);
            fallBackToText(limitReached ? VOICE_LIMIT_MESSAGE : VOICE_UNAVAILABLE_MESSAGE);
            return;
        }
        const sessionId = grant.sessionId;
        voiceSessionIdRef.current = sessionId;
        voiceHeartbeatRef.current = window.setInterval(async () => {
            const ended = await logVoice(sessionId, false);
            // Server says the monthly allowance ran out mid-conversation.
            if (ended && voiceSessionIdRef.current === sessionId) {
                voiceSessionIdRef.current = null; // already closed server-side
                setVoiceBlocked(true);
                cleanupLiveSession();
                fallBackToText(VOICE_LIMIT_MESSAGE);
            }
        }, VOICE_HEARTBEAT_MS);

        // Ephemeral tokens are only accepted on the v1alpha Live endpoint.
        const liveAi = new GoogleGenAI({ apiKey: grant.token, httpOptions: { apiVersion: 'v1alpha' } });

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

            // Supplier voice continuation instruction, derived from the supplier's own system instruction.
            const liveSystemInstruction = systemInstructionRef.current.replace(/Start the conversation by warmly welcoming the user by saying ".*?" and then listen for their response\./, 'You have already greeted the user. Now, listen for their response and continue the conversation.');

            sessionPromiseRef.current = liveAi.live.connect({
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
        } catch (error) { console.error('Failed to start session:', error); endVoiceSession(); setLiveStatus('error'); setIsAiSpeaking(false);}
    }, [supplier, liveStatus, cleanupLiveSession, endVoiceSession, fallBackToText, ai]);

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
                    <button onClick={() => { if (voiceBlocked) { fallBackToText(VOICE_LIMIT_MESSAGE); return; } setMode('live'); }} title={voiceBlocked ? VOICE_LIMIT_MESSAGE : undefined} className={`p-2 rounded-md transition-colors ${mode === 'live' ? 'bg-brand-cyan text-white' : 'text-brand-gray hover:bg-brand-light/10'} ${voiceBlocked ? 'opacity-50' : ''}`} aria-label="Voice Mode"><MicrophoneIcon className="w-5 h-5" /></button>
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
                                    {msg.role === 'model' && !isLoading && !voiceBlocked && (
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