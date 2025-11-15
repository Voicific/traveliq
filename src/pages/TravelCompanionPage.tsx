import React, { useState, useEffect } from 'react';
import { useAI } from '../context/AIContext.tsx';
import { GoogleGenAI } from '@google/genai';

// Icons
const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 5.023-1.633M12 21a8.949 8.949 0 0 1-5.023-1.633m10.046 0A8.952 8.952 0 0 0 12 3a8.952 8.952 0 0 0-5.023 1.633m10.046 0L12 12m-5.023-1.633L12 12" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ParsedContent: React.FC<{ text: string }> = ({ text }) => {
    // A simple markdown-to-JSX parser
    const renderText = (txt: string) => {
        const parts = txt.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-white">{part.slice(2, -2)}</strong>;
            }
            const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                return <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{linkMatch[1]}</a>;
            }
            return part;
        });
    };

    return (
        <>
            {text.split('\n').map((line, index) => {
                if (line.trim().startsWith('* ')) {
                    return <li key={index} className="ml-5">{renderText(line.trim().substring(2))}</li>;
                }
                 if (line.trim().match(/^#+\s/)) {
                    const level = line.match(/^#+/)![0].length;
                    const content = line.replace(/^#+\s/, '');
                    if (level === 1) return <h1 key={index} className="text-3xl font-bold mt-6 mb-3 text-white">{renderText(content)}</h1>;
                    if (level === 2) return <h2 key={index} className="text-2xl font-bold mt-5 mb-2 text-cyan-400">{renderText(content)}</h2>;
                    return <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-white">{renderText(content)}</h3>;
                }
                return <p key={index} className="mb-4">{renderText(line)}</p>;
            })}
        </>
    );
};


const TravelCompanionPage: React.FC = () => {
    const { ai, error: aiError } = useAI();
    const [destination, setDestination] = useState('Paris, France');
    const [interests, setInterests] = useState('history, art museums, culinary experiences, and romantic walks');
    const [duration, setDuration] = useState('5');
    const [itinerary, setItinerary] = useState<string | null>(null);
    const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                console.warn("Could not get user location:", err.message);
            }
        );
    }, []);

    const handleGenerateItinerary = async () => {
        if (!destination || !interests || !duration) {
            setError("Please fill in all fields.");
            return;
        }
        if (!ai) {
            setError("AI service is not available. Please check your API key configuration.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setItinerary(null);
        setSources([]);

        try {
            const prompt = `You are an expert travel planner. Create a detailed, personalized ${duration}-day travel itinerary for a trip to ${destination}. The traveler is interested in: ${interests}. 
            
            Your response must be well-structured and engaging. For each day, provide:
            - A theme for the day (e.g., "Historical Heart & Artistic Soul").
            - A morning, afternoon, and evening plan with specific places, landmarks, or activities.
            - Suggestions for breakfast, lunch, and dinner, including restaurant names and a price range (e.g., $, $$, $$$).
            - Practical tips for transportation or booking tickets.
            
            Use your search and mapping tools to find up-to-date, relevant, and highly-rated suggestions. Provide links to official websites for booking tickets or checking hours where possible. Format the output using markdown for clear headings, lists, and bold text.`;

            const config: any = {
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
            };

            if (userLocation) {
                config.toolConfig = {
                    retrievalConfig: {
                        latLng: userLocation,
                    }
                };
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config,
            });

            setItinerary(response.text);

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
                 const validSources = groundingChunks
                    .map((chunk: any) => {
                        if (chunk.web) return { title: chunk.web.title || '', uri: chunk.web.uri || '' };
                        if (chunk.maps) return { title: chunk.maps.title || 'View on Google Maps', uri: chunk.maps.uri || '' };
                        return null;
                    })
                    .filter((item): item is { title: string; uri: string } => item !== null && !!item.title && !!item.uri);

                const sourceMap = new Map<string, { title: string; uri: string; }>(validSources.map(item => [item.uri, item]));
                setSources(Array.from(sourceMap.values()));
            }

        } catch (e: any) {
            console.error("Itinerary Generation Error:", e);
            setError(e.message || "An unexpected error occurred while generating the itinerary.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 text-brand-light bg-brand-primary border border-brand-light/20 rounded-md shadow-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all";

    return (
        <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold font-heading text-white">AI Travel Companion</h1>
                    <p className="mt-2 text-lg text-gray-300">Plan your next adventure with a personalized itinerary powered by AI.</p>
                </div>

                <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 rounded-xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-white mb-1">Destination</label>
                            <input id="destination" type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Rome, Italy" className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-white mb-1">Trip Duration (Days)</label>
                            <input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1" max="14" className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="interests" className="block text-sm font-medium text-white mb-1">Interests & Preferences</label>
                            <textarea id="interests" value={interests} onChange={e => setInterests(e.target.value)} rows={3} placeholder="e.g., ancient history, street food, photography, relaxing on the beach" className={inputClass}></textarea>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateItinerary}
                        disabled={isLoading || !!aiError}
                        className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : <CompassIcon className="h-6 w-6" />}
                        {isLoading ? 'Generating Plan...' : 'Generate Itinerary'}
                    </button>
                    {aiError && <p className="mt-4 text-center text-red-400 font-semibold">{aiError}</p>}
                </div>

                { (isLoading || error || itinerary) && (
                    <div className="mt-12 max-w-4xl mx-auto">
                        {isLoading && (
                            <div className="text-center p-8 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 rounded-lg">
                                <LoadingSpinner />
                                <p className="mt-4 font-semibold text-white">Crafting your personalized adventure...</p>
                                <p className="text-sm text-gray-300">This may take a moment.</p>
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-900/50 border border-red-500/30 text-red-300 rounded-lg shadow-lg">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        {itinerary && (
                            <div className="p-8 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-lg animate-fade-in">
                                <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                                    <ParsedContent text={itinerary} />
                                </div>
                                {sources.length > 0 && (
                                     <div className="mt-8 pt-6 border-t border-cyan-400/20">
                                        <h3 className="text-xl font-bold font-heading text-cyan-400 mb-3">Sources & Further Reading</h3>
                                        <ul className="list-disc list-inside space-y-2">
                                            {sources.map((source, i) => (
                                                <li key={i}>
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-white hover:underline" title={source.title}>
                                                        {source.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelCompanionPage;
