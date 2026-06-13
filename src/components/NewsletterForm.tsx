
import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext.tsx';

const SUPPLIER_TYPES = ['Airline', 'Cruise Line', 'Hotel & Resort', 'Tour Operator or DMC', 'Other'];

const NewsletterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [supplierType, setSupplierType] = useState('');
  const [message, setMessage] = useState('');
  const { addLead } = useLeads();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name && agency && supplierType) {
      addLead({ type: 'Newsletter', name, email, agency, supplierType });
      setMessage(`Thank you, ${name}! We'll be in touch to book your 15-minute demo.`);
      setName('');
      setEmail('');
      setAgency('');
      setSupplierType('');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const inputClass = "w-full px-4 py-3 text-brand-light bg-brand-primary border border-brand-light/20 rounded-md shadow-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all";

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-1">
             <label htmlFor="name" className="sr-only">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className={inputClass}
            />
        </div>
        <div className="md:col-span-1">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              required
              className={inputClass}
            />
        </div>
         <div className="md:col-span-1">
            <label htmlFor="agency" className="sr-only">Agency</label>
            <input
              id="agency"
              type="text"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Your Agency"
              required
              className={inputClass}
            />
        </div>
        <div className="md:col-span-3">
            <label htmlFor="supplierType" className="sr-only">Supplier type</label>
            <select
              id="supplierType"
              value={supplierType}
              onChange={(e) => setSupplierType(e.target.value)}
              required
              className={`${inputClass} ${supplierType ? '' : 'text-gray-400'}`}
            >
              <option value="" disabled>Supplier type…</option>
              {SUPPLIER_TYPES.map(type => (
                <option key={type} value={type} className="text-brand-primary">{type}</option>
              ))}
            </select>
        </div>
         <div className="md:col-span-3">
             <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-6 py-3 rounded-md shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Join our Newsletter
            </button>
        </div>
      </form>
      <p className="mt-4 text-xs text-gray-300 text-center max-w-lg mx-auto">
        By signing up, you agree to receive supplier updates and industry news from TravelIQ. You can unsubscribe at any time. We comply with GDPR regulations and your data will never be shared without consent.
      </p>
      {message && <p className="mt-4 text-center text-cyan-400 font-semibold">{message}</p>}
    </div>
  );
};

export default NewsletterForm;