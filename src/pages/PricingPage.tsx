import React, { useState } from 'react';
import DemoRequestModal from '../components/DemoRequestModal.tsx';
import { useLeads } from '../context/LeadContext.tsx';
import { usePageMeta } from '../hooks/usePageMeta';

const PricingPage: React.FC = () => {
  usePageMeta({
    title: 'Pricing & Plans | TravelIQ',
    description: 'TravelIQ plans for airlines, cruise lines, hotel groups and tour operators. Starter from £399/month. Live in 48 hours.',
    canonical: '/pricing'
  });
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
    setSubmissionMessage(`Thank you, ${details.name}! We've received your request and will be in touch soon.`);
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

      {/* Hero */}
      <section className="relative text-center pt-12 pb-8 sm:pt-16 sm:pb-10 px-4 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d2d3d] to-[#0a1628]">
        {/* Dark-theme brand panel — cyan glow on navy, no stock photo */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Built for travel suppliers across the UK and Europe
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
            Pricing &amp; Plans
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed drop-shadow-md">
            Deploy a dedicated AI Sales Assistant that engages travel agents across the UK and Europe — 24/7, in any language. Fully managed by us, or self-serve through your own dashboard. You choose. Live within 48 hours of receiving your content.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pb-24 lg:px-8">

        {/* Trust */}
        <section className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold font-heading text-white">Trust & Security at Our Core</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-6 text-left">
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-6 rounded-lg border border-cyan-400/10">
                <h3 className="text-xl font-bold text-cyan-400">GDPR Compliant</h3>
                <p className="mt-2 text-gray-300">Fully compliant with GDPR across all operating markets. Your data is handled to the highest standards of privacy and protection.</p>
              </div>
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-6 rounded-lg border border-cyan-400/10">
                <h3 className="text-xl font-bold text-cyan-400">Confidentiality Assured</h3>
                <p className="mt-2 text-gray-300">Your supplier knowledge base is treated as strictly confidential. It is never shared, sold, or used for any purpose beyond powering your dedicated AI assistant.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sales pitch */}
        <section className="mt-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold font-heading text-white">Your Digital Brand Ambassador, 24/7</h2>
            <p className="mt-4 text-lg text-gray-300">
              TravelIQ isn't just a directory listing — it's a dedicated AI Sales Assistant that engages the travel trade on your behalf, in any language, anytime. And you stay in full control of everything it knows and says.
            </p>
            <div className="mt-6 grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-6 rounded-lg border border-cyan-400/10">
                <h3 className="text-xl font-bold text-cyan-400">Trained on your content for accurate, on-brand answers</h3>
                <p className="mt-2 text-gray-300 text-sm">Your AI learns from the content you provide, so answers stay on-brand and grounded in your own material rather than improvised.</p>
              </div>
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-6 rounded-lg border border-cyan-400/10">
                <h3 className="text-xl font-bold text-cyan-400">Multilingual by Design</h3>
                <p className="mt-2 text-gray-300 text-sm">Responds automatically in the agent's language — English, French, Spanish, German, and more. Reach agents across Europe without language barriers.</p>
              </div>
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-6 rounded-lg border border-cyan-400/10">
                <h3 className="text-xl font-bold text-cyan-400">Flexible by Design</h3>
                <p className="mt-2 text-gray-300 text-sm">Choose fully managed — we handle setup and onboarding — or take the self-serve route through your own Supplier Portal. Both get you the same powerful AI. The difference is who does the work.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services showcase */}
        <section className="mt-24 bg-[#0d2d3d] py-20 sm:py-28 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Partnership meeting" className="rounded-lg shadow-2xl object-cover w-full h-full" />
            </div>
            <div className="md:col-span-3">
              <h2 className="text-3xl font-extrabold font-heading text-white">More Than a Directory. A Complete Trade Marketing Partner.</h2>
              <p className="mt-4 text-lg text-gray-300">From core AI functionality to bespoke marketing solutions, we offer a complete suite of services to connect you with agents across the UK and Europe.</p>
              <div className="mt-8">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-cyan-400 mb-4">Core Features</h3>
                    <ul className="space-y-3 text-gray-300 text-sm">
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">AI Sales Support:</strong> 24/7 answers trained on your brand's knowledge.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Multilingual Voice AI:</strong> Responds in the agent's own language automatically.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Agent Database:</strong> Interaction counts on Starter; named leads (name, email, agency) on Growth+.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Dashboard & Analytics:</strong> Insights into agent queries and engagement patterns.</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-cyan-400 mb-4">Premium Features</h3>
                    <ul className="space-y-3 text-gray-300 text-sm">
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Custom Branded Voice:</strong> A unique voice that matches your brand identity.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Live Speaking Avatar:</strong> A realistic AI avatar for your profile page.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Video Presentation:</strong> AI-produced or staff video hosted on your profile.</span></li>
                      <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Featured Placement:</strong> Priority visibility across the platform.</span></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-10 border-t border-cyan-400/10 pt-8">
                  <h3 className="text-xl font-bold font-heading text-cyan-400 text-left mb-6">Custom Add-On Services</h3>
                  <ul className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-gray-300 text-sm">
                    <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Interactive AI Training & Presentations</strong></span></li>
                    <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Targeted Email Marketing to Agents</strong></span></li>
                    <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Promotion Amplification</strong></span></li>
                    <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-1" /><span><strong className="text-white">Website AI & Call Centre Solutions</strong></span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing tiers */}
        <div className="text-center mt-24">
          <h2 className="text-3xl font-extrabold font-heading text-white">Simple, Transparent Pricing</h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">Choose the plan that's right for your brand.</p>
        </div>

        <div className="mt-16 max-w-6xl mx-auto grid gap-8 md:grid-cols-3 items-start">

          {/* Starter */}
          <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-lg border border-cyan-400/10 rounded-xl p-8 shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-brand-cyan/10 hover:-translate-y-1">
            <h3 className="text-2xl font-bold font-heading text-white">Starter</h3>
            <p className="mt-2 text-gray-400 text-sm">List your brand and start conversations with agents.</p>
            <div className="mt-6">
              <span className="text-3xl font-extrabold text-white">From £399<span className="text-lg font-medium text-gray-400">/month</span></span>
            </div>
            <ul className="mt-8 space-y-3 text-gray-300 text-sm flex-grow">
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Live in 48 hours</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Directory listing with full profile</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> AI Chat Support (standard)</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Agent interaction count</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Standard voice options</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Email support</li>
            </ul>
            <button
              onClick={() => handleOpenModal('Starter')}
              className="mt-8 block w-full text-center bg-brand-light/10 border border-cyan-400/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light/20 transition-colors"
            >
              Book a Demo
            </button>
          </div>

          {/* Growth */}
          <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-lg border border-cyan-400/20 rounded-xl p-8 shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-brand-cyan/10 hover:-translate-y-1">
            <h3 className="text-2xl font-bold font-heading text-white">Growth</h3>
            <p className="mt-2 text-gray-400 text-sm">Build your agent database with named leads and full analytics.</p>
            <div className="mt-6">
              <a href="mailto:hello@beeancy.com" className="text-3xl font-extrabold text-white hover:text-cyan-400 transition-colors">Tailored</a>
              <p className="text-sm font-medium text-gray-400 mt-1">book a consultation</p>
            </div>
            <ul className="mt-8 space-y-3 text-gray-300 text-sm flex-grow">
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /><span><strong className="text-white">Everything in Starter, plus:</strong></span></li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /><span><strong className="text-white">Named leads</strong> — name, email, agency, question</span></li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Dashboard & analytics</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Knowledge base management</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Custom voice options</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Video presentation embed</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5" /> Priority email support</li>
            </ul>
            <button
              onClick={() => handleOpenModal('Growth')}
              className="mt-8 block w-full text-center bg-brand-light/10 border border-cyan-400/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-light/20 transition-colors"
            >
              Book a Demo
            </button>
          </div>

          {/* Enterprise */}
          <div className="relative bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-lg border border-cyan-500/40 rounded-xl p-8 shadow-2xl flex flex-col transition-all duration-300 hover:shadow-brand-magenta/20 hover:-translate-y-1">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold tracking-wide rounded-full">
                Most Popular
              </div>
            </div>
            <h3 className="text-2xl font-bold font-heading text-white">Enterprise</h3>
            <p className="mt-2 text-gray-400 text-sm">Your complete AI trade marketing partner, fully branded.</p>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
            <ul className="mt-8 space-y-3 text-gray-300 text-sm flex-grow">
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /><span><strong className="text-white">Everything in Growth, plus:</strong></span></li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Custom branded voice</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Live speaking avatar</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Advanced analytics & insights</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> AI-produced video presentation</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Featured placement on platform</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Dedicated onboarding & SLA</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Priority phone & email support</li>
              <li className="flex items-start gap-3"><CheckIcon className="flex-shrink-0 mt-0.5 h-5 w-5 text-cyan-400" /> Feature of the week / month</li>
            </ul>
            <button
              onClick={() => handleOpenModal('Enterprise')}
              className="mt-8 block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Book a Demo
            </button>
          </div>
        </div>

        {/* Add-ons note */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            All plans include multilingual Voice AI and the choice of fully managed or self-serve setup. Vertical Playbooks for airlines, cruise lines, hotel groups and tour operators are included on Growth and above. Custom add-ons — targeted agent email campaigns, interactive training sessions, website AI integration — are available on any plan.{' '}
            <a href="mailto:hello@beeancy.com" className="text-cyan-400 hover:underline">Get in touch</a> to discuss your needs.
          </p>
        </div>

        {/* Supplier FAQ */}
        <div className="mt-24">
          <h2 className="text-3xl font-extrabold font-heading text-white text-center">Supplier Questions</h2>
          <p className="mt-4 text-gray-300 text-center max-w-xl mx-auto">Everything you need to know before getting started.</p>
          <div className="mt-10 max-w-3xl mx-auto space-y-0 divide-y divide-cyan-400/10">
            {[
              {
                q: "How do we get set up on TravelIQ?",
                a: "There are two ways. The most popular for new suppliers is our fully managed onboarding — you send us your content and we handle the build, knowledge base configuration, and profile setup on your behalf. Alternatively, if you prefer to move fast and stay hands-on, our Supplier Portal lets you sign up, paste your knowledge base, and go live yourself. Both paths get you the same AI capability. Just ask us which is right for you."
              },
              {
                q: "What content do we need to provide?",
                a: "The more you share, the better your AI performs. Most suppliers start with: product presentations or brochures, agent fact sheets, website copy (especially trade/agent pages), booking and cancellation policies, and an agent FAQ document if you have one. You don't need everything on day one — we can start with what you have and add more over time."
              },
              {
                q: "How quickly can we go live?",
                a: "On the self-serve route, you can have your profile live within 48 hours of signing up. For fully managed onboarding, we turn around a complete profile within 48 hours of receiving your content. Either way, you'll review and approve everything before it goes live."
              }
            ].map(({ q, a }) => (
              <SupplierFAQItem key={q} question={q} answer={a} />
            ))}
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

const SupplierFAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left group">
        <span className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">{question}</span>
        <span className={`ml-4 flex-shrink-0 transform transition-transform duration-300 ${open ? 'rotate-180 text-cyan-400' : 'text-gray-400'}`}>▼</span>
      </button>
      {open && <p className="mt-4 text-gray-300 leading-relaxed">{answer}</p>}
    </div>
  );
};

export default PricingPage;
