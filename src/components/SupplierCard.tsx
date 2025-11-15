
import React from 'react';
import { Link } from 'react-router-dom';
import { Supplier } from '../types.ts';

interface SupplierCardProps {
  supplier: Supplier;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier }) => {
  return (
    <div className="bg-[#0a1628]/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-2xl hover:shadow-brand-cyan/10">
      {/* The main flex container that organizes the card's content vertically */}
      <div className="p-6 flex flex-col h-full border-t-2 border-transparent group-hover:border-brand-cyan transition-all duration-300">
        
        {/* Content block that grows to push the button to the bottom, ensuring alignment across cards */}
        <div className="flex-grow">
          <div className="flex items-center gap-4">
            <div className="relative bg-brand-light/90 p-1 rounded-full flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-cyan-400 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <img className="relative h-16 w-16 rounded-full object-contain opacity-95 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105" src={supplier.logoUrl} alt={`${supplier.name} logo`} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-white">{supplier.name}</h3>
              <p className="text-sm font-semibold text-cyan-400">{supplier.type}</p>
            </div>
          </div>
          <p className="text-gray-300 mt-4">{supplier.shortDescription}</p>
        </div>
        
        {/* Action button, which is pushed to the bottom by the flex-grow element above */}
        <div className="mt-6">
          <Link
            to={`/supplier/${supplier.id}`}
            className="block w-full text-center bg-brand-light/90 text-brand-secondary font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 hover:text-white transition-colors duration-300"
          >
            Talk to AI Sales Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;