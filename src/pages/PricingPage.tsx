import React, { useState } from 'react';
import DemoRequestModal from '../components/DemoRequestModal.tsx';
import { useLeads } from '../context/LeadContext.tsx';

const PricingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const { addLead } = useLeads();

  const handleOpenModal = (plan: string) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan('');
  };

  const handleSubmitDemoRequest = (details: { name: string; email: string; agency: string; plan: string; }) => {
    addLead({ type: 'Demo Request', ...details });
    setSubmissionMessage(`Thank you, ${details.name}! We've received your demo request and will be in touch soon.`);
    handleCloseModal();
    setTimeout(() => setSubmissionMessage(''), 5000);
  };

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      {submissionMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <p className="p-4 bg-cyan-400/20 text-cyan-400 font-semibold rounded-lg text-center animate-fade-in">{submissionMessage}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-28 px-4 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white leading-tight drop-shadow-lg">
            Partnerships
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed drop-shadow-md">
            Dramatically reduce costs while increasing your reach and engagement with the travel trade. Deploy a dedicated AI Sales Assistant that works for you 24/7.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-24 lg:px-8">
        
        {/* Trust & Security Section */}
        <section className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold font-heading text-white">Trust & Security at Our Core</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-6 text-left">
                <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-6 rounded-lg border border-cyan-400/10">
                    <h3 className="text-xl font-bold text-cyan-400">GDPR Compliant</h3>
                    <p className="mt-2 text-gray-300">We are fully compliant with GDPR regulations, ensuring your data is handled with the highest standards of privacy and protection.</p>
                </div>
                <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-6 rounded-lg border border-cyan-400/10">
                    <h3 className="text-xl font-bold text-cyan-400">Confidentiality Assured</h3>
                    <p className="mt-2 text-gray-300">Your supplier knowledge base is treated as highly confidential. It is never shared, sold, or used for any purpose other than powering your dedicated AI assistant.</p>
                </div>
            </div>
          </div>
        </section>
        
        {/* Sales Pitch Section */}
        <section className="mt-24 text-center">
           <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold font-heading text-white">Your Digital Brand Ambassador, 24/7</h2>
            <p className="mt-4 text-lg text-gray-300">
                Joining TravelIQ isn't just about listing your brand; it's about deploying a highly intelligent, perfectly on-brand AI Sales Assistant dedicated to engaging the travel trade on your behalf, anytime, anywhere.
            </p>
            <div className="mt-6 grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-6 rounded-lg border border-cyan-400/10">
                    <h3 className="text-xl font-bold text-cyan-400">100% Correct Answers, Guaranteed</h3>
                    <p className="mt-2 text-gray-300 text-sm">Our Voice AI learns exclusively from the knowledge base you provide. This guarantees every answer is accurate, verified, and perfectly aligned with your brand's messaging.</p>
                </div>
                <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 p-6 rounded-lg border border-cyan-400/10">
                    <h3 className="text-xl font-bold text-cyan-400">A Voice That's Uniquely Yours</h3>
                    <p className="mt-2 text-gray-300 text-sm">Your brand has a unique personality, and your AI should too. We can customize your AI's voice and tone, and even bring it to life with a realistic, speaking avatar.</p>
                </div>
            </div>
           </div>
        </section>

        {/* Services Showcase Section */}
        <section className="mt-24 bg-[#0d2d3d] py-20 sm:py-28 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Marketing partnership meeting" className="rounded-lg shadow-2xl object-cover w-full h-full" />
            </div>
            <div className="md:col-span-3">
              <h2 className="text-3xl font-extrabold font-heading text-white">More Than a Directory. A Complete Trade Marketing Partner.</h2>
              <p className="mt-4 text-lg text-gray-300">
                  From core AI functionality to bespoke marketing solutions, we offer a complete suite of services to connect you with the trade.
              </p>
              <div className="mt-8">
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                      <div>
                          <h3 className="text-xl font-bold font-heading text-cyan-400 mb-4">Standard Plan Features</h3>
                          <ul className="space-y-3 text-gray-300 text-sm">
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">AI Sales Support:</strong> 24/7 answers, trained on your brand's knowledge.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Standard Voice Options:</strong> Choose from high-quality, pre-built voices.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Dashboard & Analytics:</strong> Gain insights into agent queries and track engagement.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Email Support:</strong> Dedicated email support from our team.</span></li>
                          </ul>
                      </div>
                       <div>
                          <h3 className="text-xl font-bold font-heading text-cyan-400 mb-4">Enterprise Plan Features</h3>
                          <ul className="space-y-3 text-gray-300 text-sm">
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Everything in Standard, plus:</strong></span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Custom Branded Voice:</strong> A unique voice that matches your brand's identity.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Advanced Analytics & Insights:</strong> Deeper reporting and market intelligence.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Optional Live Avatar Upgrade:</strong> A realistic, speaking digital avatar.</span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Priority Phone & Email Support.</strong></span></li>
                              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Feature of the Week/Month.</strong></span></li>
                          </ul>
                      </div>
                  </div>

                  <div className="mt-10 border-t border-cyan-400/10 pt-8">
                      <h3 className="text-xl font-bold font-heading text-cyan-400 text-left mb-6">Custom Add-On Services</h3>
                       <ul className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-gray-300 text-sm">
                          <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Interactive AI Training & Presentations</strong></span></li>
                          <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Targeted Email Marketing</strong></span></li>
                          <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Promotion Amplification</strong></span></li>
                          <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Website AI & Call Center Solutions</strong></span></li>
                      </ul>
                  </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className="text-center mt-24">
          <h2 className="text-3xl font-extrabold font-heading text-white">Simple, Powerful Pricing</h2>
           <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
            Choose the plan that's right for your brand.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid gap-10 md:grid-cols-2 items-start">
          {/* Standard Plan */}
          <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl p-8 shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-brand-cyan/10 hover:-translate-y-2">
            <h3 className="text-2xl font-bold font-heading text-white">Standard</h3>
            <p className="mt-2 text-gray-300">Ideal for individual suppliers getting started with AI.</p>
            <div className="mt-6">
              <a href="mailto:sales@voicific.com" className="text-4xl font-extrabold text-white hover:text-cyan-400 transition-colors">Contact Us</a>
              <p className="text-lg font-medium text-gray-300 mt-2">for pricing details</p>
            </div>
            <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
              <li className="flex items-center gap-3"><CheckIcon /> AI Sales Support</li>
              <li className="flex items-center gap-3"><CheckIcon /> Standard Voice Options</li>
              <li className="flex items-center gap-3"><CheckIcon /> Dashboard & Analytics</li>
              <li className="flex items-center gap-3"><CheckIcon /> Email Support</li>
            </ul>
            <button
              onClick={() => handleOpenModal('Standard')}
              className="mt-8 block w-full text-center bg-brand-light/10 border border-cyan-400/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light/20 transition-colors"
            >
              Book a Demo
            </button>
          </div>

          {/* Enterprise Plan */}
           <div className="relative bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl p-8 shadow-2xl flex flex-col transition-all duration-300 hover:shadow-brand-magenta/20 hover:-translate-y-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold tracking-wide rounded-full">
                    Most Popular
                </div>
            </div>
            <h3 className="text-2xl font-bold font-heading text-white">Enterprise</h3>
            <p className="mt-2 text-gray-300">For suppliers wanting a fully branded, custom experience.</p>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-white">Custom</span>
            </div>
            <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Everything in Standard, plus:</li>
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Custom Branded Voice</li>
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Advanced Analytics & Insights</li>
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Optional Live Avatar Upgrade</li>
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Priority Phone & Email Support</li>
              <li className="flex items-center gap-3"><CheckIcon className="text-cyan-400" /> Feature of the Week/Month</li>
            </ul>
            <button
              onClick={() => handleOpenModal('Enterprise')}
              className="mt-8 block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Book a Demo
            </button>
          </div>
        </div>

      </div>
      {isModalOpen && (
        <DemoRequestModal
          planName={selectedPlan}
          onClose={handleCloseModal}
          onSubmit={handleSubmitDemoRequest}
        />
      )}
    </div>
  );
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`h-6 w-6 ${className || 'text-brand-cyan'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default PricingPage;