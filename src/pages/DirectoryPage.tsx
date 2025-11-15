

import React, { useState, useMemo } from 'react';
import { useSuppliers } from '../context/SupplierContext.tsx';
import { SupplierType } from '../types.ts';
import SupplierCard from '../components/SupplierCard.tsx';

const DirectoryPage: React.FC = () => {
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<SupplierType | 'All'>('All');

  const supplierTypes = ['All', ...Object.values(SupplierType)];

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || supplier.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [suppliers, searchTerm, selectedType]);

  const inputClass = "w-full px-4 py-3 text-white bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/20 rounded-md shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">Supplier Directory</h1>
          <p className="mt-2 text-lg text-gray-300">Find and connect with our roster of 24/7 AI sales support.</p>
        </div>

        {/* Filters */}
        <div className="sticky top-20 bg-gradient-to-br from-[#0d2d3d]/80 to-[#0f1c2e]/80 backdrop-blur-lg p-4 z-40 rounded-xl border border-cyan-400/20 shadow-lg mb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as SupplierType | 'All')}
                className={inputClass}
              >
                {supplierTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Supplier Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(supplier => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))
          ) : (
            <p className="text-center text-gray-300 col-span-full">No suppliers found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;