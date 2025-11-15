

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSuppliers } from '../context/SupplierContext.tsx';
import { useAgent } from '../context/AgentContext.tsx';
import { useLeads } from '../context/LeadContext.tsx';
import { Supplier } from '../types.ts';
import SupplierAIChat from '../components/SupplierAIChat.tsx';

const disposableEmailDomains = new Set([
  'mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
  'tempmail.com', 'dispostable.com', 'yopmail.com', 'throwawaymail.com'
]);

// --- LEAD CAPTURE MODAL ---
const LeadCaptureModal: React.FC<{ supplierName: string, onSubmit: (details: {firstName: string, lastName: string, email: string, agency: string}) => void }> = ({ supplierName, onSubmit }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [agency, setAgency] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const { fetchAgentDetails } = useAgent();

    const handleEmailBlur = async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;

        const emailDomain = email.split('@')[1];
        if (disposableEmailDomains.has(emailDomain)) {
            setValidationError('Temporary email addresses are not permitted. Please use a valid company email.');
            return;
        }
        setValidationError('');

        setIsCheckingEmail(true);
        try {
            const existingAgent = await fetchAgentDetails(email);
            if (existingAgent) {
                setFirstName(existingAgent.firstName);
                setLastName(existingAgent.lastName);
                setAgency(existingAgent.agency);
            }
        } catch (error) {
            console.error("Error fetching agent details:", error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        
        const emailDomain = email.split('@')[1];
        if (disposableEmailDomains.has(emailDomain)) {
            setValidationError('Temporary email addresses are not permitted. Please use a valid company email.');
            return;
        }

        if (firstName && lastName && email && agency) {
            onSubmit({ firstName, lastName, email, agency });
        }
    };
    
    const inputClass = "w-full mt-2 px-4 py-3 text-brand-light bg-brand-primary/80 border border-brand-light/20 rounded-md shadow-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all";

    return (
        <div className="fixed inset-0 bg-[#0d2d3d]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0a1628]/70 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-2xl p-8 max-w-md w-full relative">
                <Link to="/" className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>
                <h2 className="font-heading text-2xl font-bold text-white">Connect with AI Sales Support</h2>
                <p className="text-gray-300 mt-2">Enter your details to begin your session with the AI Sales Support for <span className="font-semibold text-cyan-400">{supplierName}</span>.</p>
                <p className="text-gray-300 mt-2 text-sm">Join our database of over 2,000 agents to get exclusive updates. Your details will be remembered for future visits.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="text-sm font-medium text-white">First Name</label>
                            <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="text-sm font-medium text-white">Last Name</label>
                            <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="email" className="text-sm font-medium text-white">Email Address</label>
                             {isCheckingEmail && <span className="text-xs text-cyan-400 animate-pulse">Checking...</span>}
                        </div>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={handleEmailBlur} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="agency" className="text-sm font-medium text-white">Agency</label>
                        <input id="agency" type="text" value={agency} onChange={e => setAgency(e.target.value)} required className={inputClass} />
                    </div>
                    {validationError && <p className="text-red-400 text-sm mt-2">{validationError}</p>}
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90">
                        Start Session
                    </button>
                </form>
            </div>
        </div>
    );
};

const SupplierProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getSupplierById } = useSuppliers();
    const { agentDetails, setAgentDetails } = useAgent();
    const { addLead } = useLeads();
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        if (id) {
            const currentSupplier = getSupplierById(id);
            setSupplier(currentSupplier || null);
        }
    }, [id, getSupplierById]);

    const handleLeadSubmit = (details: { firstName: string; lastName: string; email: string; agency: string; }) => {
        setAgentDetails(details);
        if (supplier) {
            addLead({
                type: 'Agent Chat',
                ...details,
                message: `Session started with ${supplier.name}`
            });
        }
    };

    if (!supplier) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-white text-xl">Supplier not found.</p>
            </div>
        );
    }

    if (!agentDetails) {
        return <LeadCaptureModal supplierName={supplier.name} onSubmit={handleLeadSubmit} />;
    }
    
    return (
        <div>
            <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${supplier.bannerUrl})` }}
            ></div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12">
                 <div className="bg-[#0a1628]/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-lg p-6">
                    <div className="flex items-start gap-4">
                        <img src={supplier.logoUrl} alt={`${supplier.name} logo`} className="h-20 w-20 rounded-full border-4 border-brand-secondary object-contain bg-white p-1" />
                        <div>
                            <h1 className="text-3xl font-bold font-heading text-white">{supplier.name}</h1>
                            <p className="text-cyan-400 font-semibold">{supplier.type}</p>
                        </div>
                    </div>
                    <p className="text-gray-300 mt-4">{supplier.longDescription}</p>
                    
                    <div className="mt-8 border-t border-cyan-400/10 pt-6">
                        <h2 className="text-2xl font-bold font-heading text-white">AI Sales Support Chat</h2>
                        <p className="text-gray-300 mt-2">Speak or type your question below to get an instant response from the AI sales assistant for {supplier.name}.</p>
                        <div className="mt-4">
                           <SupplierAIChat supplier={supplier} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierProfilePage;