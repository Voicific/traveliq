import React, { useState, useEffect } from 'react';
import { useSuppliers } from '../context/SupplierContext.tsx';
import { Supplier, SupplierType, GEMINI_VOICES } from '../types.ts';
import { useLeads, Lead } from '../context/LeadContext.tsx';
import { useAI } from '../context/AIContext.tsx';

// --- SUB-COMPONENTS (Moved outside AdminPage to fix state preservation bug) ---

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 hidden group-hover:block bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white text-sm rounded-md p-2 shadow-lg z-10 border border-cyan-400/20 break-words">
            {text}
        </div>
    </div>
);

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const SupplierForm: React.FC<{ supplier?: Supplier; onSave: (supplier: any) => Promise<void>; onCancel: () => void; }> = ({ supplier, onSave, onCancel }) => {
  const { ai, error: aiError } = useAI();
  const [formData, setFormData] = useState({
    name: '',
    type: SupplierType.Airline,
    logoUrl: '',
    bannerUrl: '',
    shortDescription: '',
    longDescription: '',
    avatarImageUrl: '',
    websiteUrl: '',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    hedra_avatar_id: '',
    geminiVoiceName: 'Zephyr',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingShort, setIsGeneratingShort] = useState(false);
  const [isGeneratingLong, setIsGeneratingLong] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Array<{ name: string; status: 'processing' | 'success' | 'error'; message?: string }>>([]);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        type: supplier.type || SupplierType.Airline,
        logoUrl: supplier.logoUrl || '',
        bannerUrl: supplier.bannerUrl || '',
        shortDescription: supplier.shortDescription || '',
        longDescription: supplier.longDescription || '',
        avatarImageUrl: supplier.avatarImageUrl || '',
        websiteUrl: supplier.websiteUrl || '',
        knowledgeBaseUrl: supplier.knowledgeBaseUrl || '',
        knowledgeBaseText: supplier.knowledgeBaseText || '',
        hedra_avatar_id: supplier.hedra_avatar_id || '',
        geminiVoiceName: supplier.geminiVoiceName || 'Zephyr',
      });
    } else {
      // Reset form for "Add New"
      setFormData({
        name: '',
        type: SupplierType.Airline,
        logoUrl: '',
        bannerUrl: '',
        shortDescription: '',
        longDescription: '',
        avatarImageUrl: '',
        websiteUrl: '',
        knowledgeBaseUrl: '',
        knowledgeBaseText: '',
        hedra_avatar_id: '',
        geminiVoiceName: 'Zephyr',
      });
    }
     setProcessingFiles([]); // Reset file status on supplier change
  }, [supplier]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (type: 'short' | 'long') => {
    if (!ai) {
        alert("AI Service is not available. Please check the API key configuration.");
        return;
    }
    if (!formData.name || !formData.type) {
        alert('Please enter a name and select a type first.');
        return;
    }

    if (type === 'short') setIsGeneratingShort(true);
    else setIsGeneratingLong(true);

    try {
        const model = type === 'short' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
        const prompt = type === 'short'
            ? `Write a compelling, one-sentence tagline for a travel supplier. Keep it under 150 characters. Name: "${formData.name}", Type: "${formData.type}".`
            : `You are an expert travel trade copywriter. Write a detailed, professional description for a travel supplier, aimed at travel agents. The description should be around 3-4 paragraphs. Highlight key selling points, services offered, and any information particularly useful for travel agents (e.g., loyalty programs, booking portals, special amenities). Do not use markdown. Supplier Name: "${formData.name}", Type: "${formData.type}".`;
        
        const response = await ai.models.generateContent({ model, contents: prompt });
        
        if (type === 'short') setFormData(prev => ({ ...prev, shortDescription: response.text.trim() }));
        else setFormData(prev => ({ ...prev, longDescription: response.text.trim() }));
    } catch (error) {
        console.error("AI Generation Error:", error);
        alert("Failed to generate content. Please check the console for details.");
    } finally {
        if (type === 'short') setIsGeneratingShort(false);
        else setIsGeneratingLong(false);
    }
  };

  const handleScrapeURLs = async () => {
    const urls = formData.knowledgeBaseUrl.split('\n').map(url => url.trim()).filter(Boolean);
    if (urls.length === 0) {
      alert('Please enter at least one URL to scrape.');
      return;
    }
    if (!ai) {
        alert("AI Service is not available. Cannot scrape URLs.");
        return;
    }
    setIsScraping(true);
    try {
      let allSummaries = [];
      for (const url of urls) {
        try {
          const prompt = `Using your search tool, analyze the content of the following URL and create a comprehensive summary for a travel agent's knowledge base. Extract all key information, including products, services, contact details, booking policies, and any special programs mentioned. URL: ${url}`;
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] }});
          allSummaries.push(`--- CONTENT FROM ${url} ---\n${response.text}\n`);
        } catch (e) {
          console.error(`Failed to scrape URL ${url}:`, e);
          allSummaries.push(`--- FAILED TO SCRAPE CONTENT FROM ${url} ---\n`);
        }
      }
      
      const combinedText = allSummaries.join('\n');
      setFormData(prev => ({ ...prev, knowledgeBaseText: `${prev.knowledgeBaseText ? prev.knowledgeBaseText + '\n\n' : ''}${combinedText}`.trim() }));
    } catch (error) {
      console.error("URL Scraping Error:", error);
      alert("An error occurred while scraping the URLs. Please check the console for details.");
    } finally {
      setIsScraping(false);
    }
  };
  
  const handleEnhanceContent = async () => {
    if (!ai) {
        alert("AI Service is not available.");
        return;
    }
    if (!formData.knowledgeBaseText.trim()) {
        alert('There is no content in the knowledge base to enhance.');
        return;
    }
    setIsEnhancing(true);
    try {
        const prompt = `You are an AI knowledge base optimization expert. Your task is to analyze the following text provided by a travel supplier and rewrite it to be a perfect knowledge base for another AI assistant. Structure the information with clear headings, use bullet points for lists, ensure all key facts (like policies, amenities, locations) are unambiguous, and remove any conversational fluff. The goal is maximum clarity and data density for AI consumption. Here is the text:\n\n---\n\n${formData.knowledgeBaseText}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        setFormData(prev => ({ ...prev, knowledgeBaseText: response.text.trim() }));

    } catch (error) {
        console.error("AI Enhance Error:", error);
        alert("Failed to enhance content. Please check the console for details.");
    } finally {
        setIsEnhancing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !ai) {
        if (!ai) alert("AI Service is not available. Cannot process files.");
        return;
    }

    const newFiles = Array.from(files).map(file => ({ name: file.name, status: 'processing' as const, message: 'Uploading...' }));
    setProcessingFiles(prev => [...prev, ...newFiles]);

    for (const file of Array.from(files)) {
        try {
            if (file.size > 20 * 1024 * 1024) { // Gemini has file size limits
                throw new Error("File size exceeds 20MB limit.");
            }
            const base64Data = await fileToBase64(file);
            const filePart = { inlineData: { mimeType: file.type, data: base64Data }};

            setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, message: 'Processing with AI...' } : f));
            
            const prompt = `You are an AI knowledge base optimization expert. Analyze the content of the attached document (${file.name}). Extract and summarize all key information relevant to a travel agent. This includes, but is not limited to, product details, services, booking policies, contact information, special programs, amenities, and FAQs. Structure the output for maximum clarity and data density for AI consumption. Use clear headings and bullet points.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', // Using pro for better document understanding
                contents: [{ parts: [filePart, { text: prompt }] }],
            });

            const extractedText = response.text;
            setFormData(prev => ({
                ...prev,
                knowledgeBaseText: `${prev.knowledgeBaseText ? prev.knowledgeBaseText + '\n\n' : ''}--- CONTENT FROM ${file.name} ---\n${extractedText}`.trim()
            }));
            
            setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'success' } : f));

        } catch (error: any) {
            console.error(`Failed to process file ${file.name}:`, error);
            setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error', message: error.message } : f));
        }
    }
    e.target.value = '';
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.logoUrl) {
        alert('Please provide a logo.');
        return;
    }
    setIsSaving(true);
    const dataToSave = supplier ? { ...formData, id: supplier.id } : formData;
    await onSave(dataToSave);
    setIsSaving(false);
  };
  
  const inputClass = "mt-1 block w-full bg-brand-light border-brand-light/20 rounded-md shadow-sm py-2 px-3 text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan";
  const labelClass = "block text-sm font-medium text-brand-gray";
  const labelContainerClass = "flex items-center gap-2";
  const aiButtonClass = "flex items-center justify-center text-xs bg-brand-cyan/80 hover:bg-brand-cyan text-white font-bold py-1 px-3 rounded-md disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold font-heading text-white">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
      {aiError && <p className="text-red-400 text-sm">Warning: AI content generation is disabled due to an API key error.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <div className={labelContainerClass}>
            <label htmlFor="name" className={labelClass}>Name</label>
            <Tooltip text="The official name of the supplier. This will be displayed publicly in the directory." />
          </div>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass}/>
        </div>
        <div>
          <div className={labelContainerClass}>
            <label htmlFor="type" className={labelClass}>Type</label>
            <Tooltip text="Select the category that best describes the supplier (e.g., Airline, Hotel)." />
          </div>
          <select name="type" id="type" value={formData.type} onChange={handleChange} className={inputClass}>
            {Object.values(SupplierType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className={labelContainerClass}>
            <label htmlFor="logoUrl" className={labelClass}>Logo URL</label>
            <Tooltip text="A direct link to the supplier's logo. Use a service like Clearbit (e.g., https://logo.clearbit.com/ba.com) for best results, or upload an image file." />
        </div>
        <div className="flex items-center gap-2 mt-1">
            <input type="text" name="logoUrl" id="logoUrl" value={formData.logoUrl} onChange={handleChange} required className={inputClass + ' flex-grow'}/>
            <label htmlFor="logoUpload" className="cursor-pointer bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20 whitespace-nowrap">
                Upload Logo
            </label>
            <input type="file" id="logoUpload" name="logoUpload" onChange={handleFileChange} accept="image/*" className="hidden"/>
        </div>
      </div>
      <div>
        <div className={labelContainerClass}>
            <label htmlFor="bannerUrl" className={labelClass}>Banner URL</label>
            <Tooltip text="A link to a high-quality, wide-format image for the supplier's profile page. Unsplash is a good source." />
        </div>
        <input type="text" name="bannerUrl" id="bannerUrl" value={formData.bannerUrl} onChange={handleChange} required className={inputClass}/>
      </div>
      <div>
         <div className={labelContainerClass}>
            <label htmlFor="websiteUrl" className={labelClass}>Website URL</label>
            <Tooltip text="The official website for the supplier. This will be linked on their profile page." />
        </div>
        <input type="url" name="websiteUrl" id="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://example.com" className={inputClass}/>
      </div>
       <div>
         <div className={labelContainerClass}>
            <label htmlFor="avatarImageUrl" className={labelClass}>Fallback Avatar Image URL</label>
            <Tooltip text="A link to a square image for the AI avatar. This is used if a live avatar (Hedra) is not configured." />
        </div>
        <input type="text" name="avatarImageUrl" id="avatarImageUrl" value={formData.avatarImageUrl} onChange={handleChange} required className={inputClass}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className={labelContainerClass}>
            <label htmlFor="hedra_avatar_id" className={labelClass}>Hedra Avatar ID</label>
            <Tooltip text="(Optional) The unique ID for a Hedra live avatar. If provided, this will be used instead of the fallback image." />
          </div>
          <input type="text" name="hedra_avatar_id" id="hedra_avatar_id" value={formData.hedra_avatar_id} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <div className={labelContainerClass}>
            <label htmlFor="geminiVoiceName" className={labelClass}>Gemini Voice</label>
            <Tooltip text="Select the pre-built voice for the AI Sales Support. Listen to samples to choose the best fit for the brand." />
          </div>
          <select name="geminiVoiceName" id="geminiVoiceName" value={formData.geminiVoiceName} onChange={handleChange} className={inputClass}>
            {GEMINI_VOICES.map(voice => <option key={voice} value={voice}>{voice}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center">
            <div className={labelContainerClass}>
                <label htmlFor="shortDescription" className={labelClass}>Short Description</label>
                <Tooltip text="A brief, one-sentence tagline for the supplier card in the directory." />
            </div>
            <button type="button" onClick={() => handleGenerate('short')} disabled={isGeneratingShort || !ai} className={aiButtonClass}>
                {isGeneratingShort && <LoadingSpinner className="h-4 w-4 mr-1" />} Generate
            </button>
        </div>
        <textarea name="shortDescription" id="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} required className={inputClass}></textarea>
      </div>
      <div>
         <div className="flex justify-between items-center">
            <div className={labelContainerClass}>
                <label htmlFor="longDescription" className={labelClass}>Long Description (General Knowledge)</label>
                <Tooltip text="The primary knowledge base for the AI. All information is kept confidential and secure. Include detailed information about the company, its services, key selling points, and common agent questions." />
            </div>
            <button type="button" onClick={() => handleGenerate('long')} disabled={isGeneratingLong || !ai} className={aiButtonClass}>
                 {isGeneratingLong && <LoadingSpinner className="h-4 w-4 mr-1" />} Generate
            </button>
        </div>
        <textarea name="longDescription" id="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} required className={inputClass}></textarea>
      </div>
       <div>
        <div className="flex justify-between items-center">
            <div className={labelContainerClass}>
                <label htmlFor="knowledgeBaseUrl" className={labelClass}>Knowledge Base URLs</label>
                <Tooltip text="(Optional) A list of external resources (like agent portals or FAQs) that the AI can reference. Enter one URL per line." />
            </div>
             <button type="button" onClick={handleScrapeURLs} disabled={isScraping || !ai} className={aiButtonClass}>
                {isScraping && <LoadingSpinner className="h-4 w-4 mr-1" />} Scrape URLs & Add to Knowledge Base
            </button>
        </div>
          <textarea name="knowledgeBaseUrl" id="knowledgeBaseUrl" value={formData.knowledgeBaseUrl} onChange={handleChange} rows={4} placeholder="https://supplier.com/kb1&#10;https://supplier.com/kb2" className={inputClass}></textarea>
        </div>
         <div>
            <div className={labelContainerClass}>
                <label htmlFor="knowledgeBaseFiles" className={labelClass}>Upload Knowledge Base Documents (PDF, PPT)</label>
                <Tooltip text="Upload PDF or PowerPoint files. The AI will read them, extract key information, and add it to the text-based knowledge base below. Max file size: 20MB." />
            </div>
            <input
                type="file"
                id="knowledgeBaseFiles"
                name="knowledgeBaseFiles"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,application/pdf,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.ppt,application/vnd.ms-powerpoint"
                className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-light/10 file:text-white hover:file:bg-brand-light/20 disabled:opacity-50"
                disabled={isSaving || !ai}
            />
            {processingFiles.length > 0 && (
                <div className="mt-2 space-y-1 text-sm p-2 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/30 rounded-md border border-cyan-400/10">
                    {processingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                            <span className="truncate pr-2 text-white">{file.name}</span>
                            {file.status === 'processing' && <span className="text-cyan-400 flex items-center gap-1 text-xs flex-shrink-0"><LoadingSpinner className="h-4 w-4" /> {file.message}</span>}
                            {file.status === 'success' && <span className="text-green-400 text-xs flex-shrink-0">✓ Added</span>}
                            {file.status === 'error' && <span className="text-red-400 text-xs flex-shrink-0" title={file.message}>✗ Error</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <div className={labelContainerClass}>
                <label htmlFor="knowledgeBaseText" className={labelClass}>Knowledge Base Documents/Text (Priority Knowledge)</label>
                <Tooltip text="(Optional) Paste raw text from documents here. This data is highly secured, kept confidential, and is only used to train your specific AI assistant. The AI will prioritize this information when answering questions." />
            </div>
            <button type="button" onClick={handleEnhanceContent} disabled={isEnhancing || !ai} className={aiButtonClass}>
                {isEnhancing && <LoadingSpinner className="h-4 w-4 mr-1" />} Analyze & Enhance
            </button>
          </div>
          <textarea name="knowledgeBaseText" id="knowledgeBaseText" value={formData.knowledgeBaseText} onChange={handleChange} rows={6} placeholder="Paste document text, FAQs, or content scraped from URLs here..." className={inputClass}></textarea>
        </div>
      <div className="flex justify-end gap-4 pt-4 border-t border-cyan-400/10">
        <button type="button" onClick={onCancel} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
        <button type="submit" disabled={isSaving} className="bg-cyan-400 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-magenta flex items-center disabled:opacity-50">
           {isSaving && <LoadingSpinner className="mr-2 h-4 w-4" />}
           {isSaving ? 'Saving...' : (supplier ? 'Save Changes' : 'Add Supplier')}
        </button>
      </div>
    </form>
  );
};

// --- MAIN PAGE COMPONENT ---

const AdminPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, resetToSeedData, isLoading: isSuppliersLoading, loadStatus } = useSuppliers();
  const { leads } = useLeads();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const isReadOnly = loadStatus === 'error';

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleAddNew = () => {
    if (isReadOnly) return;
    setEditingSupplier(undefined);
    setIsFormVisible(true);
  };

  const handleEdit = (supplier: Supplier) => {
    if (isReadOnly) return;
    setEditingSupplier(supplier);
    setIsFormVisible(true);
  };
  
  const handleSave = async (supplierData: any) => {
    try {
      if (editingSupplier) {
        await updateSupplier(supplierData as Supplier);
        showNotification('success', 'Supplier updated successfully!');
      } else {
        await addSupplier(supplierData);
        showNotification('success', 'Supplier added successfully!');
      }
      setIsFormVisible(false);
      setEditingSupplier(undefined);
    } catch (error: any) {
      console.error('Save failed:', error);
      showNotification('error', `Failed to save supplier: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingSupplier(undefined);
  };
  
  const handleDeleteClick = (supplier: Supplier) => {
    if (isReadOnly) return;
    setSupplierToDelete(supplier);
  }

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteSupplier(supplierToDelete.id);
      showNotification('success', `Supplier "${supplierToDelete.name}" deleted successfully.`);
    } catch (error: any) {
      console.error('Delete failed:', error);
      showNotification('error', `Failed to delete supplier: ${error.message}`);
    } finally {
      setSupplierToDelete(null);
    }
  };
  
  const handleResetClick = () => {
    if (isReadOnly) return;
    setIsResetting(true);
  }

  const handleConfirmReset = async () => {
    try {
      await resetToSeedData();
      showNotification('success', 'Suppliers have been reset to the original demo data.');
    } catch (error: any) {
      console.error('Reset failed:', error);
      showNotification('error', `Failed to reset suppliers: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Timestamp', 'Type', 'FirstName', 'LastName', 'FullName', 'Email', 'Agency', 'Plan', 'Message'];
    const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
    const rows = leads.map(lead => [lead.timestamp, lead.type, lead.firstName, lead.lastName, lead.name, lead.email, lead.agency, lead.plan, lead.message].map(escapeCSV).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "traveliq_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {supplierToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0d2d3d] p-8 rounded-lg shadow-xl border border-cyan-400/10 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                  <p className="text-gray-300 mt-2">Are you sure you want to delete <strong className="text-white">{supplierToDelete.name}</strong>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-4 mt-6">
                      <button onClick={() => setSupplierToDelete(null)} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
                      <button onClick={handleConfirmDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Delete</button>
                  </div>
              </div>
          </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0d2d3d] p-8 rounded-lg shadow-xl border border-cyan-400/10 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white">Confirm Reset</h3>
                  <p className="text-gray-300 mt-2">Are you sure you want to replace all current suppliers with the original demo data? <strong className="text-red-400">This will delete all existing suppliers.</strong></p>
                  <div className="flex justify-end gap-4 mt-6">
                      <button onClick={() => setIsResetting(false)} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
                      <button onClick={handleConfirmReset} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Confirm Reset</button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold font-heading text-white mb-8">Admin Dashboard</h1>
        
        {isReadOnly && (
            <div className="p-4 mb-8 bg-red-900/50 border border-red-500/30 text-red-300 rounded-lg shadow-lg">
                <p className="font-bold text-lg">Connection Error - Read-Only Mode</p>
                <p>Could not load the latest supplier data. To prevent data loss, editing is disabled. Please refresh the page.</p>
            </div>
        )}

        {/* Supplier Management */}
        <section className="mb-12">
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h2 className="text-3xl font-bold font-heading text-white">Suppliers</h2>
                 <div className="flex gap-4">
                    <button onClick={handleResetClick} disabled={isReadOnly} className="bg-yellow-600/80 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-yellow-600/100 disabled:opacity-50 disabled:cursor-not-allowed">
                        Reset to Demo Data
                    </button>
                    {!isFormVisible && (
                        <button onClick={handleAddNew} disabled={isReadOnly} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                        + Add New Supplier
                        </button>
                    )}
                 </div>
            </div>

            <div className="mt-6 mb-8 p-4 bg-[#0a1628]/30 border border-brand-cyan/20 rounded-lg shadow-md flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="font-bold text-white">Data Security & GDPR Compliance</h3>
                <p className="text-sm text-gray-300 mt-1">
                  All supplier information, especially the content provided for the Knowledge Base, is treated as highly confidential and is protected with robust security measures. Our platform is fully GDPR compliant. Your proprietary data will never be shared or used for any purpose other than powering your dedicated AI Sales Support assistant.
                </p>
              </div>
            </div>

            {isFormVisible && (
              <div className="mb-8 animate-fade-in">
                <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={handleCancel} />
              </div>
            )}

            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-light/10">
                  <thead className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 divide-y divide-brand-light/10">
                    {isSuppliersLoading ? (
                      <tr><td colSpan={3} className="text-center py-10 text-gray-300"><LoadingSpinner /> Loading suppliers...</td></tr>
                    ) : suppliers.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-10 text-gray-300">No suppliers found. Add one to get started.</td></tr>
                    ) : (
                      suppliers.map(supplier => (
                        <tr key={supplier.id} className="hover:bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/50">
                          <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{supplier.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">{supplier.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleEdit(supplier)} disabled={isReadOnly} className="text-cyan-400 hover:text-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                            <button onClick={() => handleDeleteClick(supplier)} disabled={isReadOnly} className="ml-4 text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </section>

         {/* Lead Management */}
        <section>
          {/* ... Lead Management JSX remains the same ... */}
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-heading text-white">Collected Leads ({leads.length})</h2>
                {leads.length > 0 && (
                    <button onClick={downloadCSV} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">
                    Download as CSV
                    </button>
                )}
            </div>
             <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-light/10">
                  <thead className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Agency</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 divide-y divide-brand-light/10">
                    {leads.map((lead, index) => (
                      <tr key={index} className="hover:bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">{new Date(lead.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lead.type === 'Newsletter' ? 'bg-green-100 text-green-800' :
                            lead.type === 'Demo Request' ? 'bg-yellow-100 text-yellow-800' :
                            lead.type === 'Contact Inquiry' ? 'bg-purple-100 text-purple-800' :
                            lead.type === 'AI Lead Capture' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-blue-100 text-blue-800' // Fallback for 'Agent Chat'
                          }`}>{lead.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{lead.name || `${lead.firstName} ${lead.lastName}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{lead.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{lead.agency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm max-w-xs truncate" title={lead.message}>{lead.message}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-300">No leads collected yet.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;