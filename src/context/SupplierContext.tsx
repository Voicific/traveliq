import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Supplier, SupplierType } from '../types.ts';
import { SEED_SUPPLIERS } from '../constants.ts';
import { supabase } from '../lib/supabase.ts';

type LoadStatus = 'pending' | 'success' | 'error';

interface SupplierContextType {
  suppliers: Supplier[];
  isLoading: boolean;
  loadStatus: LoadStatus;
  getSupplierById: (id: string) => Supplier | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  resetToSeedData: () => Promise<void>;
}

const mapRowToSupplier = (row: Record<string, unknown>): Supplier => ({
  id: row.id as string,
  name: (row.name as string) || '',
  type: (row.type as SupplierType) || SupplierType.OtherTravelSupplier,
  logoUrl: (row.logo_url as string) || '',
  bannerUrl: (row.banner_url as string) || '',
  shortDescription: (row.short_description as string) || '',
  longDescription: (row.long_description as string) || '',
  avatarImageUrl: (row.avatar_image_url as string) || '',
  websiteUrl: (row.website_url as string) || '',
  knowledgeBaseUrl: (row.knowledge_base_url as string) || '',
  knowledgeBaseText: (row.knowledge_base_text as string) || '',
  geminiVoiceName: (row.gemini_voice_name as string) || 'Zephyr',
  videoUrl: (row.video_url as string) || undefined,
  elevenLabsAgentId: (row.eleven_labs_agent_id as string) || undefined,
  useElevenLabs: (row.use_eleven_labs as boolean) || false,
  hedra_avatar_id: (row.hedra_avatar_id as string) || undefined,
  isDemo: row.is_demo !== false,
});

const mapSupplierToRow = (s: Omit<Supplier, 'id'>) => ({
  name: s.name,
  type: s.type,
  logo_url: s.logoUrl || null,
  banner_url: s.bannerUrl || null,
  short_description: s.shortDescription || null,
  long_description: s.longDescription || null,
  avatar_image_url: s.avatarImageUrl || null,
  website_url: s.websiteUrl || null,
  knowledge_base_url: s.knowledgeBaseUrl || null,
  knowledge_base_text: s.knowledgeBaseText || null,
  gemini_voice_name: s.geminiVoiceName || 'Zephyr',
  video_url: s.videoUrl || null,
  eleven_labs_agent_id: s.elevenLabsAgentId || null,
  use_eleven_labs: s.useElevenLabs || false,
  hedra_avatar_id: s.hedra_avatar_id || null,
  is_demo: s.isDemo !== false,
  is_published: true,
});

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('pending');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadStatus('pending');
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const loaded = (data || []).map(mapRowToSupplier);

        const loadedNames = new Set(loaded.map(s => s.name));
        const missingSeedSuppliers = SEED_SUPPLIERS.filter(s => !loadedNames.has(s.name));

        if (missingSeedSuppliers.length > 0) {
          // Seed any missing demo suppliers (handles first load and cases where DB had non-seed data)
          const rows = missingSeedSuppliers.map(s => ({ ...mapSupplierToRow(s), is_demo: true }));
          const { data: inserted, error: insertError } = await supabase
            .from('suppliers')
            .insert(rows)
            .select();
          if (insertError) throw insertError;
          const seeded = (inserted || []).map(mapRowToSupplier);
          setSuppliers([...seeded, ...loaded]);
        } else {
          setSuppliers(loaded);
        }
        setLoadStatus('success');
      } catch (err) {
        console.error('Failed to load suppliers from Supabase:', err);
        setLoadStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getSupplierById = (id: string) => suppliers.find(s => s.id === id);

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    const row = mapSupplierToRow(supplierData);
    const { data, error } = await supabase.from('suppliers').insert(row).select().single();
    if (error) throw error;
    setSuppliers(prev => [mapRowToSupplier(data), ...prev]);
  };

  const updateSupplier = async (updated: Supplier) => {
    const { id, ...rest } = updated;
    const row = mapSupplierToRow(rest);
    const { data, error } = await supabase.from('suppliers').update(row).eq('id', id).select().single();
    if (error) throw error;
    setSuppliers(prev => prev.map(s => s.id === id ? mapRowToSupplier(data) : s));
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const resetToSeedData = async () => {
    setIsLoading(true);
    try {
      // Delete all existing suppliers then re-insert seed data
      await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const rows = SEED_SUPPLIERS.map(s => ({ ...mapSupplierToRow(s), is_demo: true }));
      const { data, error } = await supabase.from('suppliers').insert(rows).select();
      if (error) throw error;
      setSuppliers((data || []).map(mapRowToSupplier));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SupplierContext.Provider value={{ suppliers, isLoading, loadStatus, getSupplierById, addSupplier, updateSupplier, deleteSupplier, resetToSeedData }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) throw new Error('useSuppliers must be used within a SupplierProvider');
  return context;
};
