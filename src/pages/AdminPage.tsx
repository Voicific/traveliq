import React, { useState, useEffect, useCallback } from 'react';
import { useSuppliers } from '../context/SupplierContext.tsx';
import { Supplier, SupplierType, GEMINI_VOICES } from '../types.ts';
import { useLeads, Lead } from '../context/LeadContext.tsx';
import { useAI } from '../context/AIContext.tsx';
import { supabase } from '../lib/supabase.ts';
import {
  getAllBlogPostsFromSheet,
  saveBlogPostToSheet,
  deleteBlogPostFromSheet,
} from '../services/sheetsService.ts';
import type { ManagedBlogPost } from '../services/sheetsService.ts';

interface SupplierAccount {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  is_approved: boolean | null;
  created_at: string;
}

interface AffiliateApplication {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country: string;
  role: string;
  company: string | null;
  linkedin: string | null;
  experience: string;
  supplier_types: string[];
  network_size: string | null;
  methods: string[];
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const inputClass = 'mt-1 block w-full bg-brand-light border-brand-light/20 rounded-md shadow-sm py-2 px-3 text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan';
const labelClass = 'block text-sm font-medium text-brand-gray';

// ─── Supplier Form ─────────────────────────────────────────────────────────────

const SupplierForm: React.FC<{ supplier?: Supplier; onSave: (s: any) => Promise<void>; onCancel: () => void }> = ({ supplier, onSave, onCancel }) => {
  const { ai, error: aiError } = useAI();
  const [formData, setFormData] = useState({ name: '', type: SupplierType.Airline, logoUrl: '', bannerUrl: '', videoUrl: '', shortDescription: '', longDescription: '', avatarImageUrl: '', websiteUrl: '', knowledgeBaseUrl: '', knowledgeBaseText: '', hedra_avatar_id: '', geminiVoiceName: 'Zephyr', useElevenLabs: false, elevenLabsAgentId: '', isDemo: true });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingShort, setIsGeneratingShort] = useState(false);
  const [isGeneratingLong, setIsGeneratingLong] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Array<{ name: string; status: 'processing' | 'success' | 'error'; message?: string }>>([]);

  useEffect(() => {
    if (supplier) {
      setFormData({ name: supplier.name || '', type: supplier.type || SupplierType.Airline, logoUrl: supplier.logoUrl || '', bannerUrl: supplier.bannerUrl || '', videoUrl: supplier.videoUrl || '', shortDescription: supplier.shortDescription || '', longDescription: supplier.longDescription || '', avatarImageUrl: supplier.avatarImageUrl || '', websiteUrl: supplier.websiteUrl || '', knowledgeBaseUrl: supplier.knowledgeBaseUrl || '', knowledgeBaseText: supplier.knowledgeBaseText || '', hedra_avatar_id: supplier.hedra_avatar_id || '', geminiVoiceName: supplier.geminiVoiceName || 'Zephyr', useElevenLabs: !!supplier.useElevenLabs, elevenLabsAgentId: supplier.elevenLabsAgentId || '', isDemo: supplier.isDemo ?? true });
    } else {
      setFormData({ name: '', type: SupplierType.Airline, logoUrl: '', bannerUrl: '', videoUrl: '', shortDescription: '', longDescription: '', avatarImageUrl: '', websiteUrl: '', knowledgeBaseUrl: '', knowledgeBaseText: '', hedra_avatar_id: '', geminiVoiceName: 'Zephyr', useElevenLabs: false, elevenLabsAgentId: '', isDemo: true });
    }
    setProcessingFiles([]);
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const doUpload = () =>
        supabase.storage.from('supplier-logos').upload(path, file, { upsert: true, contentType: file.type });

      let { error: uploadError } = await doUpload();

      // If bucket doesn't exist yet, create it (public) and retry once
      if (uploadError && (uploadError.message?.toLowerCase().includes('bucket') || (uploadError as any).statusCode === 404 || (uploadError as any).statusCode === '404')) {
        await supabase.storage.createBucket('supplier-logos', { public: true });
        const retry = await doUpload();
        uploadError = retry.error;
      }

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('supplier-logos').getPublicUrl(path);
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (err: any) {
      alert(`Logo upload failed: ${err.message ?? 'Unknown error'}. You can paste a direct image URL into the Logo URL field instead.`);
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async (type: 'short' | 'long') => {
    if (!ai) { alert('AI Service is not available.'); return; }
    if (!formData.name || !formData.type) { alert('Please enter a name and select a type first.'); return; }
    if (type === 'short') setIsGeneratingShort(true); else setIsGeneratingLong(true);
    try {
      const model = type === 'short' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
      const prompt = type === 'short'
        ? `Write a compelling, one-sentence tagline for a travel supplier. Keep it under 150 characters. Name: "${formData.name}", Type: "${formData.type}".`
        : `You are an expert travel trade copywriter. Write a detailed, professional description for a travel supplier, aimed at travel agents. Around 3-4 paragraphs. Highlight key selling points and services. Do not use markdown. Supplier Name: "${formData.name}", Type: "${formData.type}".`;
      const response = await ai.models.generateContent({ model, contents: prompt });
      if (type === 'short') setFormData(prev => ({ ...prev, shortDescription: response.text.trim() }));
      else setFormData(prev => ({ ...prev, longDescription: response.text.trim() }));
    } catch { alert('Failed to generate content.'); }
    finally { if (type === 'short') setIsGeneratingShort(false); else setIsGeneratingLong(false); }
  };

  const handleScrapeURLs = async () => {
    const urls = formData.knowledgeBaseUrl.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0 || !ai) { alert('Please enter at least one URL.'); return; }
    setIsScraping(true);
    try {
      const summaries = [];
      for (const url of urls) {
        try {
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Analyze the content of ${url} and create a comprehensive summary for a travel agent's knowledge base.`, config: { tools: [{ googleSearch: {} }] } });
          summaries.push(`--- CONTENT FROM ${url} ---\n${response.text}\n`);
        } catch { summaries.push(`--- FAILED TO SCRAPE ${url} ---\n`); }
      }
      setFormData(prev => ({ ...prev, knowledgeBaseText: `${prev.knowledgeBaseText ? prev.knowledgeBaseText + '\n\n' : ''}${summaries.join('\n')}`.trim() }));
    } catch { alert('An error occurred while scraping.'); }
    finally { setIsScraping(false); }
  };

  const handleEnhanceContent = async () => {
    if (!ai || !formData.knowledgeBaseText.trim()) { alert('No content to enhance.'); return; }
    setIsEnhancing(true);
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Rewrite this as a perfect AI knowledge base with clear headings and bullet points:\n\n${formData.knowledgeBaseText}` });
      setFormData(prev => ({ ...prev, knowledgeBaseText: response.text.trim() }));
    } catch { alert('Failed to enhance content.'); }
    finally { setIsEnhancing(false); }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => resolve((r.result as string).split(',')[1]); r.onerror = reject; });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !ai) { if (!ai) alert('AI Service is not available.'); return; }
    setProcessingFiles(prev => [...prev, ...Array.from(files).map(f => ({ name: f.name, status: 'processing' as const, message: 'Uploading...' }))]);
    for (const file of Array.from(files)) {
      try {
        if (file.size > 20 * 1024 * 1024) throw new Error('File exceeds 20MB limit.');
        const base64Data = await fileToBase64(file);
        setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, message: 'Processing with AI...' } : f));
        const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: [{ parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: `Extract and summarize all key travel agent information from this document (${file.name}). Use clear headings and bullet points.` }] }] });
        setFormData(prev => ({ ...prev, knowledgeBaseText: `${prev.knowledgeBaseText ? prev.knowledgeBaseText + '\n\n' : ''}--- CONTENT FROM ${file.name} ---\n${response.text}`.trim() }));
        setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'success' } : f));
      } catch (error: any) {
        setProcessingFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error', message: error.message } : f));
      }
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.logoUrl) { alert('Please provide a logo.'); return; }
    setIsSaving(true);
    await onSave(supplier ? { ...formData, id: supplier.id } : formData);
    setIsSaving(false);
  };

  const labelContainerClass = 'flex items-center gap-2';
  const aiButtonClass = 'flex items-center justify-center text-xs bg-brand-cyan/80 hover:bg-brand-cyan text-white font-bold py-1 px-3 rounded-md disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-lg border border-cyan-400/10 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold font-heading text-white">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
      {aiError && <p className="text-red-400 text-sm">Warning: AI content generation disabled due to API key error.</p>}
      {/* Demo status — uncheck once supplier has signed */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isDemo" name="isDemo" checked={formData.isDemo} onChange={handleChange} className="w-4 h-4 accent-amber-400" />
          <label htmlFor="isDemo" className="text-sm font-semibold text-amber-200">Demo profile (shows "Demo" badge on card)</label>
        </div>
        <span className="text-xs text-amber-400/70">Uncheck when supplier has signed</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><div className={labelContainerClass}><label className={labelClass}>Name</label><Tooltip text="The official name of the supplier." /></div><input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} /></div>
        <div><div className={labelContainerClass}><label className={labelClass}>Type</label><Tooltip text="Category of the supplier." /></div><select name="type" value={formData.type} onChange={handleChange} className={inputClass}>{Object.values(SupplierType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
      </div>
      <div>
        <div className={labelContainerClass}><label className={labelClass}>Logo URL</label><Tooltip text="Paste a GitHub Public-Imgs URL, or upload a file to Supabase Storage." /></div>
        <div className="flex items-center gap-2 mt-1">
          <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} required placeholder="https://raw.githubusercontent.com/…" className={inputClass + ' flex-grow'} />
          <label htmlFor="logoUpload" className={`cursor-pointer font-bold py-2 px-4 rounded-md whitespace-nowrap text-sm transition-colors ${logoUploading ? 'bg-brand-light/5 text-gray-500 cursor-not-allowed' : 'bg-brand-light/10 text-cyan-400 hover:bg-brand-light/20'}`}>
            {logoUploading ? 'Uploading…' : 'Upload file'}
          </label>
          <input type="file" id="logoUpload" onChange={handleFileChange} accept="image/*" className="hidden" disabled={logoUploading} />
        </div>
        {formData.logoUrl && (
          <img src={formData.logoUrl} alt="Logo preview" className="mt-2 h-10 w-10 rounded-full object-cover border border-cyan-400/20" onError={e => (e.currentTarget.style.display = 'none')} />
        )}
      </div>
      <div><div className={labelContainerClass}><label className={labelClass}>Banner URL</label><Tooltip text="Wide-format image for the profile page." /></div><input type="text" name="bannerUrl" value={formData.bannerUrl} onChange={handleChange} required className={inputClass} /></div>
      <div><div className={labelContainerClass}><label className={labelClass}>Video Presentation URL</label><Tooltip text="Optional: YouTube, Vimeo, HeyGen, or Synthesia embed link. Displayed on the supplier profile page." /></div><input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=... or Vimeo / HeyGen URL" className={inputClass} /></div>
      <div><div className={labelContainerClass}><label className={labelClass}>Website URL</label><Tooltip text="The supplier's official website." /></div><input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://example.com" className={inputClass} /></div>
      <div><div className={labelContainerClass}><label className={labelClass}>Fallback Avatar Image URL</label><Tooltip text="Square image for the AI avatar if Hedra is not configured." /></div><input type="text" name="avatarImageUrl" value={formData.avatarImageUrl} onChange={handleChange} required className={inputClass} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><div className={labelContainerClass}><label className={labelClass}>Hedra Avatar ID</label><Tooltip text="Optional: Unique ID for a Hedra live avatar." /></div><input type="text" name="hedra_avatar_id" value={formData.hedra_avatar_id} onChange={handleChange} className={inputClass} /></div>
        <div><div className={labelContainerClass}><label className={labelClass}>Gemini Voice</label><Tooltip text="Pre-built voice used when ElevenLabs is not configured." /></div><select name="geminiVoiceName" value={formData.geminiVoiceName} onChange={handleChange} className={inputClass}>{GEMINI_VOICES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
      </div>
      <div className="border border-cyan-400/20 rounded-lg p-4 bg-[#0a1628]/40">
        <div className="flex items-center gap-3 mb-3">
          <input type="checkbox" id="useElevenLabs" name="useElevenLabs" checked={formData.useElevenLabs} onChange={handleChange} className="w-4 h-4 accent-cyan-400" />
          <label htmlFor="useElevenLabs" className="text-sm font-semibold text-white">Use ElevenLabs voice (premium)</label>
          <Tooltip text="When enabled, the supplier chatbot uses ElevenLabs for high-quality, branded voice playback. Falls back to Gemini if ElevenLabs fails." />
        </div>
        <div><div className={labelContainerClass}><label className={labelClass}>ElevenLabs Voice ID</label><Tooltip text="Paste the voice ID from your ElevenLabs voice library (e.g. 21m00Tcm4TlvDq8ikWAM)." /></div><input type="text" name="elevenLabsAgentId" value={formData.elevenLabsAgentId} onChange={handleChange} disabled={!formData.useElevenLabs} placeholder="ElevenLabs voice ID" className={inputClass + (formData.useElevenLabs ? '' : ' opacity-50')} /></div>
      </div>
      <div><div className="flex justify-between items-center"><div className={labelContainerClass}><label className={labelClass}>Short Description</label><Tooltip text="One-sentence tagline for the directory card." /></div><button type="button" onClick={() => handleGenerate('short')} disabled={isGeneratingShort || !ai} className={aiButtonClass}>{isGeneratingShort && <LoadingSpinner className="h-4 w-4 mr-1" />} Generate</button></div><textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} required className={inputClass} /></div>
      <div><div className="flex justify-between items-center"><div className={labelContainerClass}><label className={labelClass}>Long Description</label><Tooltip text="Primary knowledge base for the AI. Confidential." /></div><button type="button" onClick={() => handleGenerate('long')} disabled={isGeneratingLong || !ai} className={aiButtonClass}>{isGeneratingLong && <LoadingSpinner className="h-4 w-4 mr-1" />} Generate</button></div><textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} required className={inputClass} /></div>
      <div><div className="flex justify-between items-center"><div className={labelContainerClass}><label className={labelClass}>Knowledge Base URLs</label><Tooltip text="One URL per line. AI will scrape and summarise." /></div><button type="button" onClick={handleScrapeURLs} disabled={isScraping || !ai} className={aiButtonClass}>{isScraping && <LoadingSpinner className="h-4 w-4 mr-1" />} Scrape URLs</button></div><textarea name="knowledgeBaseUrl" value={formData.knowledgeBaseUrl} onChange={handleChange} rows={3} placeholder="https://supplier.com/agents" className={inputClass} /></div>
      <div><div className={labelContainerClass}><label className={labelClass}>Upload Documents (PDF, PPT)</label><Tooltip text="Max 20MB. AI reads and extracts key information." /></div><input type="file" multiple onChange={handleFileUpload} accept=".pdf,.pptx,.ppt" className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-light/10 file:text-white hover:file:bg-brand-light/20" disabled={isSaving || !ai} />
        {processingFiles.length > 0 && (
          <div className="mt-2 space-y-1 text-sm p-2 bg-[#0a1628]/30 rounded-md border border-cyan-400/10">
            {processingFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="truncate text-white">{f.name}</span>
                {f.status === 'processing' && <span className="text-cyan-400 flex items-center gap-1 text-xs"><LoadingSpinner className="h-4 w-4" />{f.message}</span>}
                {f.status === 'success' && <span className="text-green-400 text-xs">✓ Added</span>}
                {f.status === 'error' && <span className="text-red-400 text-xs" title={f.message}>✗ Error</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <div><div className="flex justify-between items-center"><div className={labelContainerClass}><label className={labelClass}>Knowledge Base Text</label><Tooltip text="Paste raw text here. This is confidential and used only for your AI." /></div><button type="button" onClick={handleEnhanceContent} disabled={isEnhancing || !ai} className={aiButtonClass}>{isEnhancing && <LoadingSpinner className="h-4 w-4 mr-1" />} Enhance</button></div><textarea name="knowledgeBaseText" value={formData.knowledgeBaseText} onChange={handleChange} rows={6} placeholder="Paste document text, FAQs, or scraped content here..." className={inputClass} /></div>
      <div className="flex justify-end gap-4 pt-4 border-t border-cyan-400/10">
        <button type="button" onClick={onCancel} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
        <button type="submit" disabled={isSaving} className="bg-cyan-400 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-magenta flex items-center disabled:opacity-50">{isSaving && <LoadingSpinner className="mr-2 h-4 w-4" />}{isSaving ? 'Saving...' : (supplier ? 'Save Changes' : 'Add Supplier')}</button>
      </div>
    </form>
  );
};

// ─── Blog Post Form ────────────────────────────────────────────────────────────

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const todayFormatted = () => {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const emptyPost = (): Omit<ManagedBlogPost, 'createdAt'> => ({
  id: '',
  title: '',
  date: todayFormatted(),
  imageUrl: '',
  summary: '',
  author: 'TravelIQ Team',
  content: '',
  published: false,
});

const BlogPostForm: React.FC<{
  post?: ManagedBlogPost;
  onSave: (post: ManagedBlogPost) => Promise<void>;
  onCancel: () => void;
}> = ({ post, onSave, onCancel }) => {
  const [form, setForm] = useState<Omit<ManagedBlogPost, 'createdAt'>>(post ? {
    id: post.id, title: post.title, date: post.date, imageUrl: post.imageUrl,
    summary: post.summary, author: post.author, content: post.content, published: post.published,
  } : emptyPost());
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => {
      const updated = { ...prev, [name]: checked !== undefined ? checked : value };
      if (name === 'title' && !post) updated.id = generateSlug(value);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.title || !form.content) { alert('Please fill in title, slug, and content.'); return; }
    setIsSaving(true);
    await onSave({ ...form, createdAt: post?.createdAt || new Date().toISOString() });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-lg border border-cyan-400/10 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-white">{post ? 'Edit Blog Post' : 'New Blog Post'}</h2>
        <button type="button" onClick={() => setShowPreview(v => !v)} className="text-sm text-cyan-400 hover:text-white transition-colors">
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {showPreview && form.content && (
        <div className="p-4 bg-[#0a1628]/60 border border-cyan-400/10 rounded-lg">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Content Preview</p>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            {form.content.split(/\n\n+/).map((block, i) => {
              if (block.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{block.slice(3)}</h2>;
              if (block.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-white mt-3 mb-2">{block.slice(4)}</h3>;
              return <p key={i} className="mb-3">{block}</p>;
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Your post title" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug (URL) *</label>
          <input name="id" value={form.id} onChange={handleChange} required placeholder="my-post-title" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input name="date" value={form.date} onChange={handleChange} placeholder="May 5, 2026" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Author</label>
          <input name="author" value={form.author} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Cover Image URL *</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required placeholder="https://images.unsplash.com/..." className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Summary (shown on blog card)</label>
        <textarea name="summary" value={form.summary} onChange={handleChange} rows={2} placeholder="A brief description of what this post covers..." className={inputClass} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Content *</label>
          <span className="text-xs text-gray-400">Use ## for headings, **bold**, *italic*, - for bullet lists</span>
        </div>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={16}
          placeholder={`Start writing your post here...\n\n## First Heading\n\nYour paragraph text here. Use **bold** and *italic* for emphasis.\n\n## Another Section\n\n- Bullet point one\n- Bullet point two\n- Bullet point three`}
          className={inputClass + ' font-mono text-sm'}
        />
      </div>

      <div className="flex items-center gap-3 py-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="published" checked={form.published === true} onChange={handleChange} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
        <span className="text-sm text-gray-300">{form.published ? 'Published — visible on the blog' : 'Draft — not visible on the blog'}</span>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-cyan-400/10">
        <button type="button" onClick={onCancel} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
        <button type="submit" disabled={isSaving} className="bg-cyan-400 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-magenta flex items-center disabled:opacity-50">
          {isSaving && <LoadingSpinner className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : (post ? 'Save Changes' : 'Create Post')}
        </button>
      </div>
    </form>
  );
};

// ─── Apps Script Setup Instructions ──────────────────────────────────────────

const APPS_SCRIPT_CODE = `// ═══════════════════════════════════════════════════════════════
// TravelIQ — Complete Google Apps Script
// Paste this entire file into your Apps Script editor, replacing
// all existing content, then deploy as a Web App (Execute as Me,
// access: Anyone). Copy the deployment URL into src/config.ts.
// ═══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    if (action === 'addLead') return respond(addLead(payload));
    if (action === 'saveBlogPost') return respond(saveBlogPost(payload));
    if (action === 'deleteBlogPost') return respond(deleteBlogPost(payload));
    if (action === 'addNewsletterSubscriber') return respond(addNewsletterSubscriber(payload));
    return respond({ success: false, message: 'Unknown action: ' + action });
  } catch(err) {
    return respond({ success: false, message: err.toString() });
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'getLeads') return respond(getLeads());
    if (action === 'getBlogPosts') return respond(getBlogPosts());
    return respond({ success: false, message: 'Unknown action: ' + action });
  } catch(err) {
    return respond({ success: false, message: err.toString() });
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── LEADS ──────────────────────────────────────────────────────

function addLead(payload) {
  try {
    var lead = payload.lead;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads');
    if (!sheet) {
      sheet = ss.insertSheet('Leads');
      sheet.appendRow(['timestamp','type','firstName','lastName','name','email','agency','supplierType','plan','message','wantsDemo']);
    }
    sheet.appendRow([
      lead.timestamp || new Date().toISOString(),
      lead.type || '',
      lead.firstName || '',
      lead.lastName || '',
      lead.name || '',
      lead.email || '',
      lead.agency || '',
      lead.supplierType || '',
      lead.plan || '',
      lead.message || '',
      lead.wantsDemo ? 'true' : 'false'
    ]);
    sendLeadNotification(lead);
    return { success: true };
  } catch(err) { return { success: false, message: err.toString() }; }
}

function getLeads() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads');
    if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var leads = data.slice(1).map(function(row) {
      var lead = {};
      headers.forEach(function(h, i) { lead[h] = row[i]; });
      return lead;
    });
    return { success: true, data: leads };
  } catch(err) { return { success: false, message: err.toString() }; }
}

function sendLeadNotification(lead) {
  try {
    var name = lead.name || ((lead.firstName || '') + ' ' + (lead.lastName || '')).trim() || 'Unknown';
    GmailApp.sendEmail(
      'hello@beeancy.com',
      '\\uD83D\\uDD14 New TravelIQ Lead: ' + lead.type,
      'New lead on TravelIQ:\\n\\n' +
      '\\u2022 Type: ' + lead.type + '\\n' +
      '\\u2022 Name: ' + name + '\\n' +
      '\\u2022 Email: ' + lead.email + '\\n' +
      '\\u2022 Agency: ' + (lead.agency || 'N/A') + '\\n' +
      '\\u2022 Time: ' + new Date(lead.timestamp).toLocaleString('en-GB') + '\\n' +
      (lead.message ? '\\n\\u2022 Message: ' + lead.message + '\\n' : '') +
      '\\nLog in to admin to view all leads: https://traveliq.biz/#/login'
    );
  } catch(err) { Logger.log('Email failed: ' + err); }
}

// ── NEWSLETTER ─────────────────────────────────────────────────

function addNewsletterSubscriber(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Newsletter');
    if (!sheet) {
      sheet = ss.insertSheet('Newsletter');
      sheet.appendRow(['timestamp','email','source']);
    }
    sheet.appendRow([new Date().toISOString(), payload.email || '', payload.source || 'website']);
    return { success: true };
  } catch(err) { return { success: false, message: err.toString() }; }
}

// ── BLOG ───────────────────────────────────────────────────────

function getBlogPosts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('BlogPosts');
    if (!sheet) {
      sheet = ss.insertSheet('BlogPosts');
      sheet.appendRow(['id','title','date','imageUrl','summary','author','content','published','createdAt']);
      return { success: true, data: [] };
    }
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };
    var headers = data[0];
    var posts = data.slice(1).map(function(row) {
      var post = {};
      headers.forEach(function(h, i) { post[h] = row[i]; });
      return post;
    });
    return { success: true, data: posts };
  } catch(err) { return { success: false, message: err.toString() }; }
}

function saveBlogPost(payload) {
  try {
    var post = payload.post;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('BlogPosts') || ss.insertSheet('BlogPosts');
    if (sheet.getLastRow() === 0) sheet.appendRow(['id','title','date','imageUrl','summary','author','content','published','createdAt']);
    var data = sheet.getDataRange().getValues();
    var idCol = data[0].indexOf('id');
    var existingRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(post.id)) { existingRow = i + 1; break; }
    }
    var row = [post.id, post.title, post.date, post.imageUrl, post.summary, post.author, post.content, post.published, post.createdAt || new Date().toISOString()];
    if (existingRow > 0) sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    return { success: true };
  } catch(err) { return { success: false, message: err.toString() }; }
}

function deleteBlogPost(payload) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('BlogPosts');
    if (!sheet) return { success: true };
    var data = sheet.getDataRange().getValues();
    var idCol = data[0].indexOf('id');
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][idCol]) === String(payload.id)) { sheet.deleteRow(i + 1); break; }
    }
    return { success: true };
  } catch(err) { return { success: false, message: err.toString() }; }
}`;

const SetupInstructions: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mb-6 p-5 bg-amber-900/20 border border-amber-500/30 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-amber-300 text-lg">One-time setup required for Blog + Email Notifications</h3>
          <p className="text-sm text-amber-200/80 mt-1">
            Add the code below to your Google Apps Script to enable blog management and get an email whenever a new lead comes in.
          </p>
        </div>
        <button onClick={onDismiss} className="text-amber-400 hover:text-white text-xs flex-shrink-0 mt-1">Dismiss</button>
      </div>
      <ol className="mt-3 text-sm text-amber-200/90 space-y-1 list-decimal list-inside">
        <li>Open your Google Apps Script → click the script URL deployment → "Manage deployments"</li>
        <li>Open the Apps Script editor (script.google.com)</li>
        <li>Copy the code below and follow the inline comments to add it</li>
        <li>Click "Deploy" → "New deployment" and copy the new URL into <code className="text-xs bg-amber-900/40 px-1 rounded">src/config.ts</code></li>
      </ol>
      <div className="mt-3 relative">
        <pre className="bg-[#0a0f1a] border border-cyan-400/10 rounded p-3 text-xs text-gray-300 overflow-auto max-h-48 font-mono">
          {APPS_SCRIPT_CODE}
        </pre>
        <button
          onClick={copy}
          className="absolute top-2 right-2 bg-cyan-500/80 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Admin Page ───────────────────────────────────────────────────────────

type Tab = 'suppliers' | 'leads' | 'blog' | 'affiliates' | 'supplier-accounts';

const AdminPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, resetToSeedData, isLoading: isSuppliersLoading, loadStatus } = useSuppliers();
  const { leads, pendingCount, isSyncing, flushPending, refreshLeads } = useLeads();
  const [activeTab, setActiveTab] = useState<Tab>('suppliers');

  // Supplier state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<ManagedBlogPost[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<ManagedBlogPost | undefined>(undefined);
  const [isBlogFormVisible, setIsBlogFormVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<ManagedBlogPost | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [blogSheetConnected, setBlogSheetConnected] = useState<boolean | null>(null);

  // Affiliate state
  const [affiliates, setAffiliates] = useState<AffiliateApplication[]>([]);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateLoaded, setAffiliateLoaded] = useState(false);

  // Supplier accounts state
  const [supplierAccounts, setSupplierAccounts] = useState<SupplierAccount[]>([]);
  const [supplierAccountsLoading, setSupplierAccountsLoading] = useState(false);
  const [supplierAccountsLoaded, setSupplierAccountsLoaded] = useState(false);

  // Shared notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Lead filter
  const [leadFilter, setLeadFilter] = useState<string>('all');

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => setNotification({ type, message });

  const loadBlogPosts = useCallback(async () => {
    setIsBlogLoading(true);
    try {
      const posts = await getAllBlogPostsFromSheet();
      if (posts !== null) {
        setBlogPosts(posts);
        setBlogSheetConnected(true);
      } else {
        setBlogSheetConnected(false);
      }
    } finally {
      setIsBlogLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'blog' && blogSheetConnected === null) {
      loadBlogPosts();
    }
  }, [activeTab, blogSheetConnected, loadBlogPosts]);

  const isReadOnly = loadStatus === 'error';

  // ── Supplier handlers ──
  const handleSaveSupplier = async (supplierData: any) => {
    try {
      if (editingSupplier) { await updateSupplier(supplierData as Supplier); showNotification('success', 'Supplier updated.'); }
      else { await addSupplier(supplierData); showNotification('success', 'Supplier added.'); }
      setIsFormVisible(false);
      setEditingSupplier(undefined);
    } catch (error: any) { showNotification('error', `Failed: ${error.message}`); }
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    try { await deleteSupplier(supplierToDelete.id); showNotification('success', `"${supplierToDelete.name}" deleted.`); }
    catch (error: any) { showNotification('error', `Failed: ${error.message}`); }
    finally { setSupplierToDelete(null); }
  };

  const handleConfirmReset = async () => {
    try { await resetToSeedData(); showNotification('success', 'Reset to demo data.'); }
    catch (error: any) { showNotification('error', `Failed: ${error.message}`); }
    finally { setIsResetting(false); }
  };

  // ── Blog handlers ──
  const handleSaveBlogPost = async (post: ManagedBlogPost) => {
    const ok = await saveBlogPostToSheet(post);
    if (ok) {
      showNotification('success', post.published ? 'Post published!' : 'Draft saved.');
      await loadBlogPosts();
      setIsBlogFormVisible(false);
      setEditingBlogPost(undefined);
    } else {
      showNotification('error', 'Failed to save post. Check Apps Script setup.');
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    const ok = await deleteBlogPostFromSheet(postToDelete.id);
    if (ok) { showNotification('success', 'Post deleted.'); await loadBlogPosts(); }
    else { showNotification('error', 'Failed to delete post.'); }
    setPostToDelete(null);
  };

  // ── Affiliate handlers ──
  const loadAffiliates = useCallback(async () => {
    setAffiliateLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAffiliates((data ?? []) as AffiliateApplication[]);
      setAffiliateLoaded(true);
    } catch (err: any) {
      showNotification('error', `Failed to load affiliates: ${err.message}`);
    } finally {
      setAffiliateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'affiliates' && !affiliateLoaded) {
      loadAffiliates();
    }
  }, [activeTab, affiliateLoaded, loadAffiliates]);

  const loadSupplierAccounts = useCallback(async () => {
    setSupplierAccountsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name, is_approved, created_at')
        .eq('role', 'supplier')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSupplierAccounts((data ?? []) as SupplierAccount[]);
      setSupplierAccountsLoaded(true);
    } catch (err: any) {
      showNotification('error', `Failed to load supplier accounts: ${err.message}`);
    } finally {
      setSupplierAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'supplier-accounts' && !supplierAccountsLoaded) {
      loadSupplierAccounts();
    }
  }, [activeTab, supplierAccountsLoaded, loadSupplierAccounts]);

  const handleSupplierApproval = async (id: string, is_approved: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved })
      .eq('id', id);
    if (error) { showNotification('error', `Failed: ${error.message}`); return; }
    setSupplierAccounts(prev => prev.map(a => a.id === id ? { ...a, is_approved } : a));
    showNotification('success', is_approved ? 'Supplier approved — they can now access the dashboard.' : 'Access revoked.');
  };

  const handleAffiliateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('affiliate_applications')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showNotification('error', `Failed: ${error.message}`); return; }
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showNotification('success', `Application ${status}.`);
  };

  // ── CSV export ──
  const downloadCSV = () => {
    const headers = ['Timestamp', 'Type', 'FirstName', 'LastName', 'FullName', 'Email', 'Agency', 'Plan', 'Message'];
    const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
    const rows = leads.map(l => [l.timestamp, l.type, l.firstName, l.lastName, l.name, l.email, l.agency, l.plan, l.message].map(v => esc(String(v ?? ''))).join(','));
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `traveliq_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filteredLeads = leadFilter === 'all' ? leads : leads.filter(l => l.type === leadFilter);
  const leadTypes = Array.from(new Set(leads.map(l => l.type)));

  const tabClass = (tab: Tab) =>
    `px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">

      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-24 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-fade-in max-w-sm ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      {/* Confirm delete supplier */}
      {supplierToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d2d3d] p-8 rounded-lg shadow-xl border border-cyan-400/10 max-w-md w-full">
            <h3 className="text-xl font-bold text-white">Delete Supplier?</h3>
            <p className="text-gray-300 mt-2">This will permanently delete <strong className="text-white">{supplierToDelete.name}</strong>.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setSupplierToDelete(null)} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
              <button onClick={handleConfirmDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm reset */}
      {isResetting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d2d3d] p-8 rounded-lg shadow-xl border border-cyan-400/10 max-w-md w-full">
            <h3 className="text-xl font-bold text-white">Reset to Demo Data?</h3>
            <p className="text-gray-300 mt-2"><strong className="text-red-400">This will delete all existing suppliers.</strong></p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsResetting(false)} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
              <button onClick={handleConfirmReset} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete blog post */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d2d3d] p-8 rounded-lg shadow-xl border border-cyan-400/10 max-w-md w-full">
            <h3 className="text-xl font-bold text-white">Delete Post?</h3>
            <p className="text-gray-300 mt-2">This will permanently delete <strong className="text-white">{postToDelete.title}</strong>.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setPostToDelete(null)} className="bg-brand-light/10 text-white font-bold py-2 px-4 rounded-md hover:bg-brand-light/20">Cancel</button>
              <button onClick={handleConfirmDeletePost} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold font-heading text-white">Admin Dashboard</h1>
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 bg-amber-900/30 border border-amber-500/30 px-4 py-2 rounded-lg">
              <span className="text-amber-300 text-sm font-medium">{pendingCount} lead{pendingCount > 1 ? 's' : ''} not yet synced to Sheets</span>
              <button onClick={() => flushPending()} disabled={isSyncing} className="text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1 rounded disabled:opacity-50">
                {isSyncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>
          )}
        </div>

        {isReadOnly && (
          <div className="p-4 mb-8 bg-red-900/50 border border-red-500/30 text-red-300 rounded-lg">
            <p className="font-bold">Connection Error — Read-Only Mode</p>
            <p className="text-sm mt-1">Could not load latest data. Editing is disabled. Please refresh.</p>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit">
          <button className={tabClass('suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</button>
          <button className={tabClass('leads')} onClick={() => setActiveTab('leads')}>
            Leads {leads.length > 0 && <span className="ml-1.5 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>}
          </button>
          <button className={tabClass('blog')} onClick={() => setActiveTab('blog')}>Blog</button>
          <button className={tabClass('affiliates')} onClick={() => setActiveTab('affiliates')}>
            Affiliates {affiliates.filter(a => a.status === 'pending').length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{affiliates.filter(a => a.status === 'pending').length}</span>}
          </button>
          <button className={tabClass('supplier-accounts')} onClick={() => setActiveTab('supplier-accounts')}>
            Supplier Accounts {supplierAccounts.filter(a => a.is_approved === false || a.is_approved === null).length > 0 && <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{supplierAccounts.filter(a => a.is_approved === false || a.is_approved === null).length}</span>}
          </button>
        </div>

        {/* ── SUPPLIERS TAB ── */}
        {activeTab === 'suppliers' && (
          <section>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <h2 className="text-3xl font-bold font-heading text-white">Suppliers</h2>
              <div className="flex gap-4">
                <button onClick={() => setIsResetting(true)} disabled={isReadOnly} className="bg-yellow-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50">Reset to Demo</button>
                {!isFormVisible && <button onClick={() => { setEditingSupplier(undefined); setIsFormVisible(true); }} disabled={isReadOnly} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50">+ Add Supplier</button>}
              </div>
            </div>

            <div className="mb-8 p-4 bg-[#0a1628]/30 border border-brand-cyan/20 rounded-lg flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <div><h3 className="font-bold text-white">Data Security & GDPR</h3><p className="text-sm text-gray-300 mt-1">All supplier knowledge base content is confidential and used only for your dedicated AI. GDPR compliant — never shared with third parties.</p></div>
            </div>

            {isFormVisible && <div className="mb-8 animate-fade-in"><SupplierForm supplier={editingSupplier} onSave={handleSaveSupplier} onCancel={() => { setIsFormVisible(false); setEditingSupplier(undefined); }} /></div>}

            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-brand-light/10">
                <thead className="bg-[#0a1628]/50"><tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-brand-light/10">
                  {isSuppliersLoading ? (
                    <tr><td colSpan={3} className="text-center py-10 text-gray-300"><LoadingSpinner /></td></tr>
                  ) : suppliers.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-10 text-gray-300">No suppliers yet.</td></tr>
                  ) : suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-gray-300">{s.type}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button onClick={() => { setEditingSupplier(s); setIsFormVisible(true); }} disabled={isReadOnly} className="text-cyan-400 hover:opacity-70 disabled:opacity-30">Edit</button>
                        <button onClick={() => setSupplierToDelete(s)} disabled={isReadOnly} className="ml-4 text-red-500 hover:text-red-400 disabled:opacity-30">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── LEADS TAB ── */}
        {activeTab === 'leads' && (
          <section>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-3xl font-bold font-heading text-white">
                Leads
                <span className="ml-3 text-lg text-gray-400 font-normal">{filteredLeads.length} {leadFilter !== 'all' ? leadFilter : 'total'}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => refreshLeads()} disabled={isSyncing} className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1">
                  {isSyncing ? <LoadingSpinner className="h-4 w-4" /> : '↻'} Refresh
                </button>
                {leads.length > 0 && <button onClick={downloadCSV} className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg">↓ CSV</button>}
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <p className="text-amber-300 text-sm">⚠ {pendingCount} lead{pendingCount > 1 ? 's are' : ' is'} queued locally — not yet saved to Google Sheets</p>
                <button onClick={() => flushPending()} disabled={isSyncing} className="text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1 rounded ml-3 disabled:opacity-50 whitespace-nowrap">
                  {isSyncing ? 'Syncing…' : 'Retry Sync'}
                </button>
              </div>
            )}

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', ...leadTypes].map(t => (
                <button key={t} onClick={() => setLeadFilter(t)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${leadFilter === t ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-light/10">
                  <thead className="bg-[#0a1628]/50"><tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Agency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                  </tr></thead>
                  <tbody className="divide-y divide-brand-light/10">
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400">No leads yet.</td></tr>
                    ) : filteredLeads.map((lead, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(lead.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${lead.type === 'Newsletter' ? 'bg-green-900/50 text-green-300' : lead.type === 'Demo Request' ? 'bg-yellow-900/50 text-yellow-300' : lead.type === 'Contact Inquiry' ? 'bg-purple-900/50 text-purple-300' : lead.type === 'AI Lead Capture' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-blue-900/50 text-blue-300'}`}>
                            {lead.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '—'}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{lead.email}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{lead.agency || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate" title={lead.message}>{lead.message || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── BLOG TAB ── */}
        {activeTab === 'blog' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold font-heading text-white">Blog Posts</h2>
              {!isBlogFormVisible && (
                <button
                  onClick={() => { setEditingBlogPost(undefined); setIsBlogFormVisible(true); }}
                  disabled={blogSheetConnected === false}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={blogSheetConnected === false ? 'Complete setup first' : ''}
                >
                  + New Post
                </button>
              )}
            </div>

            {showSetupInstructions && <SetupInstructions onDismiss={() => setShowSetupInstructions(false)} />}

            {blogSheetConnected === false && !showSetupInstructions && (
              <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <p className="text-amber-300 text-sm">Apps Script not yet updated — blog posts cannot be saved to Sheets.</p>
                <button onClick={() => setShowSetupInstructions(true)} className="text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1 rounded ml-3">Show Setup</button>
              </div>
            )}

            {isBlogFormVisible && (
              <div className="mb-8 animate-fade-in">
                <BlogPostForm
                  post={editingBlogPost}
                  onSave={handleSaveBlogPost}
                  onCancel={() => { setIsBlogFormVisible(false); setEditingBlogPost(undefined); }}
                />
              </div>
            )}

            {isBlogLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner className="h-8 w-8 text-cyan-400" /></div>
            ) : blogPosts.length === 0 && blogSheetConnected ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg mb-2">No managed posts yet.</p>
                <p className="text-sm">Click "+ New Post" to create your first post from the admin.</p>
                <p className="text-xs mt-4 text-gray-500">Your 15 hardcoded posts are still live on the blog — they just can't be edited here.</p>
              </div>
            ) : blogPosts.length > 0 ? (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-brand-light/10">
                  <thead className="bg-[#0a1628]/50"><tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-brand-light/10">
                    {blogPosts.map(post => (
                      <tr key={post.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-white font-medium">{post.title}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{post.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${(post.published === true || post.published === 'TRUE' || post.published === 'true') ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                            {(post.published === true || post.published === 'TRUE' || post.published === 'true') ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <button onClick={() => { setEditingBlogPost(post); setIsBlogFormVisible(true); }} className="text-cyan-400 hover:opacity-70">Edit</button>
                          <button onClick={() => setPostToDelete(post)} className="ml-4 text-red-500 hover:text-red-400">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        )}

        {/* ── SUPPLIER ACCOUNTS TAB ── */}
        {activeTab === 'supplier-accounts' && (
          <section>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div>
                <h2 className="text-3xl font-bold font-heading text-white">
                  Supplier Accounts
                  {!supplierAccountsLoading && (
                    <span className="ml-3 text-lg text-gray-400 font-normal">
                      {supplierAccounts.filter(a => a.is_approved === false || a.is_approved === null).length} pending
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Approve accounts to grant dashboard access. Suppliers see a "Pending Approval" screen until approved.</p>
              </div>
              <button onClick={() => { setSupplierAccountsLoaded(false); loadSupplierAccounts(); }} disabled={supplierAccountsLoading} className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1">
                {supplierAccountsLoading ? <LoadingSpinner className="h-4 w-4" /> : '↻'} Refresh
              </button>
            </div>

            {supplierAccountsLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner className="h-8 w-8 text-cyan-400" /></div>
            ) : supplierAccounts.length === 0 ? (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg p-16 text-center text-gray-400">
                No supplier accounts yet. They'll appear here when suppliers register via the portal.
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-light/10">
                    <thead className="bg-[#0a1628]/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registered</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-light/10">
                      {supplierAccounts.map(a => {
                        const isPending = a.is_approved === false || a.is_approved === null;
                        return (
                          <tr key={a.id} className={`hover:bg-white/5 ${isPending ? 'bg-amber-900/5' : ''}`}>
                            <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(a.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                              {a.full_name || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                              {a.company_name || '—'}
                            </td>
                            <td className="px-4 py-3 text-cyan-400 text-sm">
                              <a href={`mailto:${a.email}`} className="hover:underline">{a.email}</a>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                                a.is_approved === true ? 'bg-green-900/50 text-green-300' : 'bg-amber-900/50 text-amber-300'
                              }`}>
                                {a.is_approved === true ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                              {isPending ? (
                                <button
                                  onClick={() => handleSupplierApproval(a.id, true)}
                                  className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSupplierApproval(a.id, false)}
                                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  Revoke access
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── AFFILIATES TAB ── */}
        {activeTab === 'affiliates' && (
          <section>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <h2 className="text-3xl font-bold font-heading text-white">
                Affiliate Applications
                {!affiliateLoading && (
                  <span className="ml-3 text-lg text-gray-400 font-normal">
                    {affiliates.filter(a => a.status === 'pending').length} pending
                  </span>
                )}
              </h2>
              <button onClick={() => loadAffiliates()} disabled={affiliateLoading} className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1">
                {affiliateLoading ? <LoadingSpinner className="h-4 w-4" /> : '↻'} Refresh
              </button>
            </div>

            {affiliateLoading ? (
              <div className="flex justify-center py-16"><LoadingSpinner className="h-8 w-8 text-cyan-400" /></div>
            ) : affiliates.length === 0 ? (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-lg p-16 text-center text-gray-400">
                No applications yet. They'll appear here when affiliates submit the form.
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-light/10">
                    <thead className="bg-[#0a1628]/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Network</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-light/10">
                      {affiliates.map(a => (
                        <tr key={a.id} className={`hover:bg-white/5 ${a.status === 'pending' ? 'bg-amber-900/5' : ''}`}>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(a.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                            {a.first_name} {a.last_name}
                            {a.company && <p className="text-xs text-gray-400 font-normal">{a.company}</p>}
                          </td>
                          <td className="px-4 py-3 text-cyan-400 text-sm">
                            <a href={`mailto:${a.email}`} className="hover:underline">{a.email}</a>
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{a.country}</td>
                          <td className="px-4 py-3 text-gray-300 text-sm max-w-xs">
                            <span className="line-clamp-1" title={a.role}>{a.role}</span>
                            <span className="text-xs text-gray-500">{a.experience}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{a.network_size || '—'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                              a.status === 'approved' ? 'bg-green-900/50 text-green-300' :
                              a.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                              'bg-amber-900/50 text-amber-300'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                            {a.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAffiliateStatus(a.id, 'approved')}
                                  className="bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAffiliateStatus(a.id, 'rejected')}
                                  className="bg-red-800/70 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAffiliateStatus(a.id, 'pending')}
                                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                Reset to pending
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
