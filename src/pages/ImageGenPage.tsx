import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// Icons for the UI
const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);
const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
  </svg>
);
const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ImageGenPage: React.FC = () => {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyError, setApiKeyError] = useState(false);
    const [prompt, setPrompt] = useState('A majestic lion with a golden mane, standing on a rocky outcrop overlooking a vast savanna at sunset. The style should be hyper-realistic, like a National Geographic photograph.');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const keySelected = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(keySelected);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
            setApiKeyError(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!prompt) {
            setError("Please enter a prompt to generate an image.");
            return;
        }

        setIsLoading(true);
        setGeneratedImageUrl(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
                },
            });

            const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
            if (base64ImageBytes) {
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImageUrl(imageUrl);
            } else {
                throw new Error("Image generation failed to produce an image.");
            }

        } catch (e: any) {
            console.error(e);
            let errorMessage = "An error occurred during image generation. Please try again.";
             if (e.message && e.message.includes("Requested entity was not found")) {
              errorMessage = "Your API Key is invalid. Please select a valid key and try again.";
              setHasApiKey(false);
              setApiKeyError(true);
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderApiKeyPrompt = () => (
        <div className="text-center bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-8 rounded-lg border border-cyan-400/10">
            <KeyIcon className="h-12 w-12 mx-auto text-cyan-400" />
            <h2 className="mt-4 text-2xl font-bold text-white">API Key Required</h2>
            <p className="mt-2 text-gray-300 max-w-md mx-auto">
                To use the AI Image Generator, you need to select an API key. Image generation is a billable feature.
                Please refer to the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-brand-magenta">billing documentation</a> for details.
            </p>
            {apiKeyError && <p className="mt-4 text-red-400 font-semibold">{error}</p>}
            <button
                onClick={handleSelectKey}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105"
            >
                <KeyIcon className="h-6 w-6" />
                Select API Key
            </button>
        </div>
    );

    const renderGenerator = () => (
        <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">Image Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        className="w-full p-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/20 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                        placeholder="e.g., A photorealistic image of a futuristic city..."
                    />
                </div>
                <div>
                    <h4 className="block text-sm font-medium text-white mb-2">Aspect Ratio</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`py-2 px-2 rounded-md font-semibold transition-all duration-200 border-2 text-sm ${aspectRatio === ratio ? 'bg-brand-cyan border-brand-cyan text-white' : 'bg-brand-bg/50 border-brand-light/20 text-brand-gray hover:border-brand-cyan/50'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleGenerateImage}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : <ImageIcon className="h-6 w-6" />}
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
            </div>
            <div className="lg:col-span-3 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg p-4 flex items-center justify-center min-h-[300px] lg:min-h-0">
                {isLoading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold text-white">Creating your image...</p>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-400 font-semibold">{error}</p>
                ) : generatedImageUrl ? (
                    <div className="w-full">
                         <img src={generatedImageUrl} alt={prompt} className="w-full h-auto object-contain rounded-md" />
                         <a 
                           href={generatedImageUrl} 
                           download={`traveliq-image-${Date.now()}.jpg`}
                           className="mt-4 block w-full text-center bg-brand-light/90 text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 hover:text-white transition-colors duration-300"
                         >
                            Download Image
                         </a>
                    </div>
                ) : (
                    <div className="text-center text-gray-300">
                        <ImageIcon className="h-16 w-16 mx-auto" />
                        <p className="mt-4 font-semibold">Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">
             <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {hasApiKey ? renderGenerator() : renderApiKeyPrompt()}
            </div>
        </div>
    );
};

export default ImageGenPage;