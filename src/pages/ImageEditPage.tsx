import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useAI } from '../context/AIContext.tsx';

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
const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 1 .879 16.5a3 3 0 0 1 4.242-4.242 3 3 0 0 0 4.242 0 3 3 0 0 0 0-4.242 3 3 0 0 1-4.242-4.242 3 3 0 0 1 4.242 0 3 3 0 0 1 0 4.242 3 3 0 0 0 4.242 4.242 3 3 0 0 0 5.78-1.128 2.25 2.25 0 0 1 2.475-2.118 2.25 2.25 0 0 1 .273 4.495 2.25 2.25 0 0 1-2.475 2.118 3 3 0 0 0-5.78-1.128Z" />
  </svg>
);
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);
const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ImageEditPage: React.FC = () => {
    const { ai, error: aiError } = useAI();
    const [prompt, setPrompt] = useState('Add a dramatic, cinematic lighting effect.');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setEditedImageUrl(null); // Clear previous result
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImage = async () => {
        if (!prompt) {
            setError("Please enter a prompt to edit the image.");
            return;
        }
        if (!imageFile || !ai) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setEditedImageUrl(null);
        setError(null);

        try {
            const base64Image = await fileToBase64(imageFile);

            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image,
                },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part && part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                setEditedImageUrl(imageUrl);
            } else {
                 throw new Error("Editing failed. The model did not return an image.");
            }

        } catch (e: any) {
            console.error(e);
            let errorMessage = "An error occurred during image editing. Please try again.";
            if (e.message && e.message.includes("API key not valid")) {
              errorMessage = "Your API Key is invalid. Please ensure it is configured correctly.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderGenerator = () => (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Column */}
            <div className="space-y-6">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-white mb-2">1. Upload Image</label>
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
                            </div>
                            <p className="text-xs leading-5 text-gray-300">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">2. Describe Your Edit</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        className="w-full p-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/20 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                        placeholder="e.g., Change the background to a tropical beach..."
                    />
                </div>
                <button
                    onClick={handleEditImage}
                    disabled={isLoading || !imageFile}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : <WandIcon className="h-6 w-6" />}
                    {isLoading ? 'Editing...' : 'Edit Image'}
                </button>
            </div>
            {/* Output Column */}
            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                 {isLoading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold text-white">Applying your edits...</p>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-400 font-semibold">{error}</p>
                ) : editedImageUrl ? (
                    <div className="w-full">
                         <img src={editedImageUrl} alt={prompt} className="w-full h-auto object-contain rounded-md" />
                         <a 
                           href={editedImageUrl} 
                           download={`traveliq-edited-${Date.now()}.png`}
                           className="mt-4 block w-full text-center bg-brand-light/90 text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 hover:text-white transition-colors duration-300"
                         >
                            Download Edited Image
                         </a>
                    </div>
                ) : (
                    <div className="text-center text-gray-300">
                        <WandIcon className="h-16 w-16 mx-auto" />
                        <p className="mt-4 font-semibold">Your edited image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">
             <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {aiError ? (
                    <div className="text-center bg-red-900/50 p-8 rounded-lg border border-red-500/30">
                         <h2 className="mt-4 text-2xl font-bold text-red-300">AI Initialization Error</h2>
                         <p className="mt-2 text-red-400 max-w-md mx-auto">{aiError}</p>
                    </div>
                ) : renderGenerator() }
            </div>
        </div>
    );
};

export default ImageEditPage;