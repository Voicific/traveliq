import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Supplier } from '../types.ts';
import { SEED_SUPPLIERS } from '../constants.ts';
import { GOOGLE_SCRIPT_URL as SCRIPT_URL } from '../config.ts';

// --- Google Sheets Integration ---

const saveSuppliersToSheet = async (suppliers: Supplier[]) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
    throw new Error('Google Sheets URL is not configured.');
  }
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'saveSuppliers', payload: { suppliers } }),
    });
     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to save suppliers to sheet.');
    }
  } catch (error) {
    console.error('Failed to save suppliers to Google Sheet:', error);
    throw error;
  }
};

const getSuppliersFromSheet = async (): Promise<Supplier[]> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('1WQQcx1LIFhJ0gcZd7MuswG8BENcfRgmEb3PB0Od-9Au6BftpXejf7xjP')) {
        console.warn('Google Sheets integration is not configured. Returning empty array.');
        return [];
    }
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getSuppliers&t=${new Date().getTime()}`, {
            method: 'GET',
            mode: 'cors'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Failed to get suppliers from sheet.');
        return (result.data as Supplier[]) || [];
    } catch (error) {
        console.error('Failed to fetch suppliers from Google Sheet:', error);
        throw error;
    }
};
// --- End Google Sheets Integration ---

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
        const sheetSuppliers = await getSuppliersFromSheet();
        
        if (sheetSuppliers.length === 0) {
          console.log("Supplier list is empty, safely restoring seed data...");
          await saveSuppliersToSheet(SEED_SUPPLIERS);
          setSuppliers(SEED_SUPPLIERS);
        } else {
          setSuppliers(sheetSuppliers);
        }
        setLoadStatus('success');
      } catch (error) {
        console.error("Critical error loading suppliers from Google Sheet:", error);
        setLoadStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const checkLoadStatus = () => {
    if (loadStatus !== 'success') {
      throw new Error("Cannot save: data is out of sync due to a load error. Please refresh the page.");
    }
  };

  const getSupplierById = (id: string) => {
    return suppliers.find(s => s.id === id);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    checkLoadStatus();
    const newSupplier: Supplier = {
      ...supplierData,
      id: `${supplierData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    };
    const updatedSuppliers = [...suppliers, newSupplier];
    await saveSuppliersToSheet(updatedSuppliers); // This might be better as updateSingleSupplier too
    setSuppliers(updatedSuppliers);
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    checkLoadStatus();
    const updatedSuppliers = suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s);
    // The backend script expects the entire list, so we use the saveSuppliers action
    // which is the established pattern in this file for adding/deleting.
    await saveSuppliersToSheet(updatedSuppliers);
    setSuppliers(updatedSuppliers);
  };

  const deleteSupplier = async (id: string) => {
    checkLoadStatus();
    const updatedSuppliers = suppliers.filter(s => s.id !== id);
    await saveSuppliersToSheet(updatedSuppliers);
    setSuppliers(updatedSuppliers);
  };

  const resetToSeedData = async () => {
    checkLoadStatus();
    setIsLoading(true);
    try {
      await saveSuppliersToSheet(SEED_SUPPLIERS);
      setSuppliers(SEED_SUPPLIERS);
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
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};