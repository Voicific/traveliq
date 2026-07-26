import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Supplier } from '../types.ts';
import { SEED_SUPPLIERS } from '../constants.ts';
import { supabase } from '../lib/supabase.ts';
import { mapRowToSupplier, mapSupplierToRow } from '../lib/supplierMapping.ts';
import { useSupabaseAuth } from './SupabaseAuthContext.tsx';

// Slug IDs used in constants.ts (e.g. 'british-airways') keyed by supplier name.
// These never change at runtime since SEED_SUPPLIERS is a constant.
const SEED_SLUG_BY_NAME = Object.fromEntries(SEED_SUPPLIERS.map(s => [s.name, s.id]));

type LoadStatus = 'pending' | 'success' | 'error';

interface SupplierContextType {
  suppliers: Supplier[];
  isLoading: boolean;
  loadStatus: LoadStatus;
  getSupplierById: (id: string) => Supplier | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  /** Additive-only: inserts seed profiles missing by name. Never deletes. */
  restoreMissingSeedSuppliers: () => Promise<number>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('pending');
  const { profile } = useSupabaseAuth();
  const isAdmin = profile?.role === 'admin';
  // Maps the slug id used in local state (e.g. 'british-airways') → actual DB UUID.
  // Needed because seed suppliers are remapped to slug IDs so carousel links work,
  // but writes (UPDATE/DELETE) must use the real UUID or PostgreSQL rejects the cast.
  const dbIdBySlug = useRef<Record<string, string>>({});

  // Applies the slug-id remapping used by carousel/directory links and records
  // slug → UUID so writes can address the real row.
  const toStateSupplier = useCallback((row: Record<string, unknown>): Supplier => {
    const s = mapRowToSupplier(row);
    const slugId = SEED_SLUG_BY_NAME[s.name];
    if (slugId && slugId !== s.id) dbIdBySlug.current[slugId] = s.id;
    return slugId ? { ...s, id: slugId } : s;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadStatus('pending');
      try {
        let query = supabase.from('suppliers').select('*');

        // Belt-and-braces alongside RLS: never pull unpublished profiles into the
        // list that feeds /suppliers. This matters most at build time — the
        // prerender bakes the rendered directory into dist/suppliers/index.html,
        // so anything visible here becomes crawler-readable static HTML.
        // Admins keep the full list so they can find and edit unlisted profiles.
        if (!isAdmin) query = query.eq('is_published', true);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        // Deliberately no auto-seeding here. This used to insert any missing
        // SEED_SUPPLIERS on load, which meant an admin visiting the site would
        // silently resurrect demo profiles that had been deliberately deleted.
        // Seeding is now an explicit admin action (restoreMissingSeedSuppliers).
        setSuppliers((data || []).map(row => toStateSupplier(row as Record<string, unknown>)));
        setLoadStatus('success');
      } catch (err) {
        console.error('Failed to load suppliers from Supabase:', err);
        setLoadStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // Reloads once the profile resolves, so an admin gets the unfiltered list.
  }, [isAdmin, toStateSupplier]);

  const getSupplierById = (id: string) => suppliers.find(s => s.id === id);

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    const row = mapSupplierToRow(supplierData);
    const { data, error } = await supabase.from('suppliers').insert(row).select().single();
    if (error) throw error;
    setSuppliers(prev => [mapRowToSupplier(data), ...prev]);
  };

  const updateSupplier = async (updated: Supplier) => {
    const { id, ...rest } = updated;
    // id may be a slug ('british-airways') for seed suppliers — translate to real DB UUID.
    const dbId = dbIdBySlug.current[id] ?? id;
    const row = mapSupplierToRow(rest);
    const { data, error } = await supabase.from('suppliers').update(row).eq('id', dbId).select().single();
    if (error) throw error;
    // Preserve the slug id in state so carousel links keep working.
    setSuppliers(prev => prev.map(s => s.id === id ? { ...mapRowToSupplier(data), id } : s));
  };

  const deleteSupplier = async (id: string) => {
    const dbId = dbIdBySlug.current[id] ?? id;
    const { error } = await supabase.from('suppliers').delete().eq('id', dbId);
    if (error) throw error;
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Additive-only restore. The previous implementation deleted every supplier
  // row before re-seeding, which with real supplier data in the table (profiles,
  // knowledge bases, preview tokens) was one click away from irreversible data
  // loss. This version only inserts seed profiles that are missing by name and
  // never issues a DELETE. Returns how many were restored.
  const restoreMissingSeedSuppliers = async (): Promise<number> => {
    setIsLoading(true);
    try {
      const existingNames = new Set(suppliers.map(s => s.name));
      const missing = SEED_SUPPLIERS.filter(s => !existingNames.has(s.name));
      if (missing.length === 0) return 0;

      const rows = missing.map(s => ({
        ...mapSupplierToRow(s),
        is_demo: true,
        is_published: true, // demo profiles belong in the public directory
      }));
      const { data, error } = await supabase.from('suppliers').insert(rows).select();
      if (error) throw error;

      const restored = (data || []).map(row => toStateSupplier(row as Record<string, unknown>));
      setSuppliers(prev => [...restored, ...prev]);
      return restored.length;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SupplierContext.Provider value={{ suppliers, isLoading, loadStatus, getSupplierById, addSupplier, updateSupplier, deleteSupplier, restoreMissingSeedSuppliers }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) throw new Error('useSuppliers must be used within a SupplierProvider');
  return context;
};
