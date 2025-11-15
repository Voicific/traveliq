import React, { useState } from 'react';

interface DemoRequestModalProps {
  planName: string;
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; agency: string; plan: string; }) => void;
}

const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ planName, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && agency) {
      onSubmit({ name, email, agency, plan: planName });
    }
  };

  const inputClass = "w-full mt-2 px-4 py-3 text-brand-light bg-brand-bg/80 border border-brand-light/20 rounded-md shadow-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all";

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/70 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="font-heading text-2xl font-bold text-white">Book a Demo</h2>
        <p className="text-gray-300 mt-2">Request a demo for the <span className="font-semibold text-cyan-400">{planName} Plan</span>. We'll get in touch shortly.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="demo-name" className="text-sm font-medium text-white">Full Name</label>
            <input id="demo-name" type="text" value={name} onChange={e => setName(e.target.value)} required className={inputClass} placeholder="Your Name" />
          </div>
          <div>
            <label htmlFor="demo-email" className="text-sm font-medium text-white">Email Address</label>
            <input id="demo-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="your.email@company.com" />
          </div>
          <div>
            <label htmlFor="demo-agency" className="text-sm font-medium text-white">Company / Agency</label>
            <input id="demo-agency" type="text" value={agency} onChange={e => setAgency(e.target.value)} required className={inputClass} placeholder="Your Agency Name" />
          </div>
           <p className="pt-2 text-xs text-gray-300 text-center">
              By signing up, you agree to receive supplier updates and industry news from TravelIQ. You can unsubscribe at any time. We comply with GDPR regulations and your data will never be shared without consent.
          </p>
          <button type="submit" className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default DemoRequestModal;