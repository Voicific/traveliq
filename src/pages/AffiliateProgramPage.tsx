import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads } from '../context/LeadContext.tsx';

const AffiliateProgramPage: React.FC = () => {
  const { addLead } = useLeads();
  const [form, setForm] = useState({ name: '', email: '', agency: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({ type: 'Affiliate Inquiry', ...form });
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500";

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">

      {/* Hero */}
      <section className="relative text-center py-24 sm:py-32 px-4 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Earn While You Refer
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white leading-tight drop-shadow-lg">
            TravelIQ Affiliate Programme
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed">
            Know a travel supplier who should be on TravelIQ? Refer them, and earn a commission for every successful partnership you introduce.
          </p>
          <a
            href="#apply"
            className="mt-10 inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg"
          >
            Apply to Join
          </a>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* How it works */}
        <section className="text-center">
          <h2 className="text-3xl font-extrabold font-heading text-white">How It Works</h2>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">Three simple steps to start earning.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Join the Programme',
                description: "Fill in the application form below. We'll review your details and get you set up with a unique referral link.",
              },
              {
                step: '02',
                title: 'Refer Suppliers',
                description: 'Share your referral link or introduce suppliers directly. Think airlines, cruise lines, hotels, tour operators, and DMCs.',
              },
              {
                step: '03',
                title: 'Earn Commission',
                description: 'When a referred supplier becomes a paying TravelIQ partner, you earn a commission — for as long as they remain a customer.',
              },
            ].map(item => (
              <div key={item.step} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 text-left relative overflow-hidden">
                <span className="absolute top-4 right-6 text-6xl font-extrabold text-cyan-400/10 font-heading select-none">{item.step}</span>
                <h3 className="text-xl font-bold font-heading text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who can join */}
        <section className="mt-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold font-heading text-white">Who Can Join?</h2>
              <p className="mt-4 text-gray-300">Our affiliate programme is open to anyone with connections in the travel industry.</p>
              <ul className="mt-8 space-y-4">
                {[
                  { title: 'Travel Agents & Agencies', desc: 'You know suppliers personally — and they trust your recommendation.' },
                  { title: 'Travel Industry Consultants', desc: 'Help your clients discover the competitive edge of AI-powered sales support.' },
                  { title: 'Trade Associations & Networks', desc: 'Bring TravelIQ to your members as an exclusive benefit.' },
                  { title: 'Content Creators & Influencers', desc: 'If your audience includes travel suppliers, your referrals count.' },
                  { title: 'Technology & Marketing Partners', desc: 'Resell or recommend TravelIQ as part of your service offering.' },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
                      <svg className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold font-heading text-white mb-6">What You'll Earn</h3>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                  <p className="text-cyan-400 font-bold text-lg">Recurring Commission</p>
                  <p className="text-gray-300 text-sm mt-1">Earn a percentage of the subscription value for every month your referred supplier remains an active partner.</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                  <p className="text-cyan-400 font-bold text-lg">Tiered Rewards</p>
                  <p className="text-gray-300 text-sm mt-1">The more suppliers you refer, the higher your commission tier. Our top affiliates unlock exclusive bonuses and benefits.</p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                  <p className="text-cyan-400 font-bold text-lg">No Cap on Earnings</p>
                  <p className="text-gray-300 text-sm mt-1">There's no limit to how many suppliers you can refer or how much you can earn. The programme scales with your network.</p>
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-500">Specific commission rates and tier details are shared upon successful application. Terms and conditions apply.</p>
            </div>
          </div>
        </section>

        {/* Application form */}
        <section id="apply" className="mt-24 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold font-heading text-white">Apply to Join</h2>
            <p className="mt-4 text-gray-300">Fill in your details and we'll be in touch within 2 business days.</p>
          </div>

          {submitted ? (
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-10 text-center animate-fade-in">
              <svg className="h-12 w-12 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-bold text-white">Application Received!</h3>
              <p className="mt-2 text-gray-300">Thank you, {form.name}. We'll review your application and get back to you at {form.email} shortly.</p>
              <Link to="/" className="mt-6 inline-block text-cyan-400 hover:text-white transition-colors font-semibold">← Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@yourcompany.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Company / Agency Name</label>
                <input name="agency" value={form.agency} onChange={handleChange} required placeholder="Your agency or company" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Tell us about your network</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Describe your connections in the travel industry and how you plan to refer suppliers to TravelIQ..." className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity text-lg">
                Submit Application
              </button>
              <p className="text-xs text-gray-500 text-center">By submitting this form you agree to our <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.</p>
            </form>
          )}
        </section>

      </div>
    </div>
  );
};

export default AffiliateProgramPage;
