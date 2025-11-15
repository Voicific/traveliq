import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// Icons for the UI
const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
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
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);


const VideoGenPage: React.FC = () => {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyError, setApiKeyError] = useState(false);
    const [prompt, setPrompt] = useState('A cinematic, stunning aerial shot of the Santorini coast at sunset, with whitewashed villages and blue-domed churches.');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadingMessages = [
        "Warming up the AI director...", "Scouting virtual locations...", "Setting up the camera angles...",
        "Action! This can take a few minutes...", "Rendering the final cut...", "Polishing the masterpiece...",
    ];

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const keySelected = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(keySelected);
            }
        };
        checkApiKey();
    }, []);
    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
            setApiKeyError(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!prompt && !imageFile) {
            setError("Please enter a prompt or upload an image to generate a video.");
            return;
        }

        setIsLoading(true);
        setGeneratedVideoUrl(null);
        setError(null);
        setLoadingMessage(loadingMessages[0]);

        let messageIndex = 0;
        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 8000);

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
            
            const generationPayload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio as '16:9' | '9:16'
                }
            };
            
            if (imageFile) {
                const base64Image = await fileToBase64(imageFile);
                generationPayload.image = {
                    imageBytes: base64Image,
                    mimeType: imageFile.type,
                };
            }

            let operation = await ai.models.generateVideos(generationPayload);
            
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch video: ${response.statusText}`);
                }
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setGeneratedVideoUrl(videoUrl);
            } else {
                throw new Error("Video generation failed to produce a valid video link.");
            }

        } catch (e: any) {
            console.error(e);
            let errorMessage = "An error occurred during video generation. Please try again.";
            if (e.message && e.message.includes("Requested entity was not found")) {
              errorMessage = "Your API Key is invalid. Please select a valid key and try again.";
              setHasApiKey(false);
              setApiKeyError(true);
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            clearInterval(interval);
        }
    };

    const renderApiKeyPrompt = () => (
        <div className="text-center bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-8 rounded-lg border border-cyan-400/10">
            <KeyIcon className="h-12 w-12 mx-auto text-cyan-400" />
            <h2 className="mt-4 text-2xl font-bold text-white">API Key Required</h2>
            <p className="mt-2 text-gray-300 max-w-md mx-auto">
                To use the AI Video Generator, you need to select an API key. Video generation is a billable feature.
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
                    <label htmlFor="image-upload" className="block text-sm font-medium text-white mb-2">Starting Image (Optional)</label>
                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-cyan-400/30 px-6 py-10 hover:border-brand-cyan transition-colors">
                        <div className="text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto rounded-md" />
                            ) : (
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-300">
                                <label htmlFor="image-upload-input" className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-cyan focus-within:ring-offset-2 focus-within:ring-offset-brand-dark hover:text-brand-magenta">
                                    <span>Upload a file</span>
                                    <input id="image-upload-input" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-300">PNG, JPG, GIF up to 10MB</p>
                             {imageFile && (
                                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="mt-2 text-xs text-red-400 hover:text-red-300">
                                    Remove image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">Video Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        className="w-full p-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/20 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                        placeholder="e.g., A majestic eagle soaring over the Grand Canyon..."
                    />
                </div>
                <div>
                    <h4 className="block text-sm font-medium text-white mb-2">Aspect Ratio</h4>
                    <div className="flex gap-4">
                        {['16:9', '9:16'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 border-2 ${aspectRatio === ratio ? 'bg-brand-cyan border-brand-cyan text-white' : 'bg-brand-bg/50 border-brand-light/20 text-brand-gray hover:border-brand-cyan/50'}`}
                            >
                                {ratio === '16:9' ? 'Landscape' : 'Portrait'} ({ratio})
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleGenerateVideo}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : <VideoIcon className="h-6 w-6" />}
                    {isLoading ? 'Generating...' : 'Generate Video'}
                </button>
            </div>
            <div className="lg:col-span-3 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg p-4 flex items-center justify-center min-h-[300px] lg:min-h-0">
                {isLoading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold text-white">{loadingMessage}</p>
                        <p className="text-sm text-gray-300">Please keep this page open.</p>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-400 font-semibold">{error}</p>
                ) : generatedVideoUrl ? (
                    <div className="w-full">
                         <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-md" />
                         <a 
                           href={generatedVideoUrl} 
                           download={`traveliq-video-${Date.now()}.mp4`}
                           className="mt-4 block w-full text-center bg-brand-light/90 text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 hover:text-white transition-colors duration-300"
                         >
                            Download Video
                         </a>
                    </div>
                ) : (
                    <div className="text-center text-gray-300">
                        <VideoIcon className="h-16 w-16 mx-auto" />
                        <p className="mt-4 font-semibold">Your generated video will appear here.</p>
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

export default VideoGenPage;