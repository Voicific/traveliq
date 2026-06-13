import React from 'react';
import { Link } from 'react-router-dom';
import { TierIcon } from '../components/icons/TravelIQIcons';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2000&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
              About TravelIQ
            </h1>
            <p className="mt-4 text-xl text-cyan-300 font-medium">Built for the trade. Powered by AI.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

        {/* Mission */}
        <div className="bg-[#0f2d3d]/80 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-2xl mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-200 leading-relaxed mb-6">
              TravelIQ gives travel brands the sales presence they deserve — without the headcount that makes it impossible to scale.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We're building the UK and Europe's dedicated AI support network for the travel trade: intelligent, always-on, and trained exclusively on your brand. Not a generic chatbot. Not a call centre. A smarter way to support every agent and convert every enquiry.
            </p>
          </div>
        </div>

        {/* Why We Built It */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-6">Why We Built TravelIQ</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              The travel industry has a distribution problem. Airlines, tour operators, DMCs, cruise lines and hotel groups pour enormous effort into creating exceptional products — then struggle to answer the trade consistently across every market, language and enquiry.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Meanwhile, the agents who sell those products expect instant, knowledgeable answers. In a competitive market, a 24-hour delay on a trade enquiry isn't neutral — it's a lost booking. TravelIQ closes that gap: AI voice and chat agents that know your product inside out, respond in seconds, and sound exactly like your brand — in 10+ languages, around the clock.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl border border-cyan-400/20">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
              alt="Team working together"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>

        {/* Who We Serve */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-12 text-center">Who We Serve</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group flex flex-col bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/20 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]">
              <TierIcon name="airline" size="lg" />
              <h3 className="mt-5 text-xl font-bold font-heading text-white">Travel Brands &amp; Suppliers</h3>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Airlines, tour operators, DMCs, cruise lines and hotel groups. We deploy AI agents trained on your exact product knowledge and brand voice, so every agent enquiry gets a fast, accurate, on-brand answer — and every conversation becomes a named lead.
              </p>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Think of it as a sales rep who never sleeps, never goes off-script, and scales without headcount.
              </p>
            </div>
            <div className="group flex flex-col bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/20 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]">
              <TierIcon name="partnership" size="lg" />
              <h3 className="mt-5 text-xl font-bold font-heading text-white">Agencies &amp; Distribution Partners</h3>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Travel agencies, OTAs and distribution networks who want to offer AI-powered support to their supplier base. White-label the platform, add new revenue streams, and give your partners an edge.
              </p>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Our partnership model flexes from pilot programmes to full network rollouts.
              </p>
            </div>
          </div>
        </div>

        {/* How We Work */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-12 text-center">How We Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group flex flex-col bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/20 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]">
              <TierIcon name="target" size="lg" />
              <h3 className="mt-5 text-xl font-bold font-heading text-white">Travel-Specific</h3>
              <p className="mt-3 text-gray-400 leading-relaxed">
                We don't build generic AI. Every assistant is trained on travel terminology, supplier content and trade workflows. We speak your language because we know the industry.
              </p>
            </div>
            <div className="group flex flex-col bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/20 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]">
              <TierIcon name="lock" size="lg" />
              <h3 className="mt-5 text-xl font-bold font-heading text-white">Always On-Brand</h3>
              <p className="mt-3 text-gray-400 leading-relaxed">
                Your AI is trained exclusively on the content you provide. No hallucinations, no off-script answers — every response stays within your verified knowledge base.
              </p>
            </div>
            <div className="group flex flex-col bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-400/20 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]">
              <TierIcon name="growth" size="lg" />
              <h3 className="mt-5 text-xl font-bold font-heading text-white">Results First</h3>
              <p className="mt-3 text-gray-400 leading-relaxed">
                We measure success in booked demos, captured leads and converted enquiries, not vanity metrics. Partners see meaningful ROI from the first weeks of deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Built by the trade, for the trade */}
        <div className="bg-[#0f2d3d]/80 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-2xl mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-6">Built by the Trade, for the Trade</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              TravelIQ was founded by a senior airline commercial leader with two decades managing trade sales, marketing and call-centre performance across UK and European markets — the tool we always wished our trade partners had.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold font-heading text-white mb-4">Ready to See It in Action?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a demo and we'll show you exactly how TravelIQ works for your brand — trained on your content, in your voice, live in days.
          </p>
          <Link
            to="/pricing"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 py-4 rounded-md shadow-lg hover:opacity-90 transition-opacity text-lg"
          >
            Book a Demo
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;
