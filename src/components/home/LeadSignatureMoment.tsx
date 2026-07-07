import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BellRing, Target, Mic } from 'lucide-react';
import NetworkCanvas from './NetworkCanvas.tsx';
import Reveal from './Reveal.tsx';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const LEADS = [
  {
    name: 'Sarah Mitchell',
    agency: 'Midlands Travel Group',
    q: 'What are your agent commission rates?',
    badge: 'Airline',
  },
  {
    name: 'James Okafor',
    agency: 'Elite Escapes Ltd',
    q: 'Do you offer group booking support?',
    badge: 'Tour Operator',
  },
  {
    name: 'Luisa Fernández',
    agency: 'Viajes Barcelona',
    q: '¿Tienen tarifas de temporada baja?',
    badge: 'Hotel Group',
  },
  {
    name: 'Tom Brennan',
    agency: 'Dublin Travel Experts',
    q: 'What training resources do you offer?',
    badge: 'Cruise Line',
  },
];

const SUPPORT_LINES = [
  {
    icon: Users,
    title: 'Named contacts',
    copy: "A living database of agents who've already engaged your brand.",
  },
  {
    icon: BellRing,
    title: 'Instant alerts',
    copy: 'Your team follows up while the conversation is still warm.',
  },
  {
    icon: Target,
    title: 'Known intent',
    copy: 'You already know what they asked, so every follow-up lands.',
  },
];

/**
 * The signature moment: one illustrative conversation crossing the network
 * and resolving into a named lead. The full dashboard is always rendered in
 * the DOM; the choreography (query pulse → travelling dot → cards staggering
 * in) is a class-based enhancement that never carries content.
 */
const LeadSignatureMoment: React.FC = () => {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.3 });
  const run = inView && !reduced;

  return (
    <section className="relative overflow-hidden border-y border-cyan-400/10 bg-gradient-to-br from-[#0a1628] via-[#0d2d3d] to-[#0a1628] px-4 py-24 sm:py-32">
      <NetworkCanvas density={28} intensity={0.5} className="absolute inset-0 opacity-60" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
              See real intelligence
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Every conversation becomes a named lead.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
              Not anonymous clicks — real names, emails, agencies, and the exact question each
              agent asked.{' '}
              <span className="font-semibold text-cyan-300">Available on Growth and above.</span>
            </p>
          </Reveal>
          <div className="mt-10 space-y-6">
            {SUPPORT_LINES.map((line, i) => (
              <Reveal key={line.title} delay={320 + i * 100} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                  <line.icon strokeWidth={1.5} className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{line.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{line.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={650}>
            <Link
              to="/pricing"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-opacity hover:opacity-90"
            >
              See the full feature set <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        {/* The lead-flow scene. */}
        <div ref={ref} className={run ? 'lead-flow-run' : ''}>
          {/* Voice query entering the network. */}
          <div className="lead-flow-query mx-auto flex max-w-md items-center gap-3 rounded-full border border-cyan-400/30 bg-[#0f1c2e]/90 px-5 py-3 backdrop-blur-md">
            <Mic strokeWidth={1.5} className="h-4 w-4 flex-shrink-0 text-cyan-400" />
            <p className="truncate text-sm italic text-cyan-200">
              "What are your agent commission rates?"
            </p>
            <span className="voice-wave flex-shrink-0" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>

          {/* The connection: query travelling into the dashboard. */}
          <div className="lead-flow-path mx-auto h-10 w-px bg-gradient-to-b from-cyan-400/60 to-cyan-400/10" aria-hidden="true">
            <span className="lead-flow-dot" />
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0f1c2e]/95 to-[#0d2d3d]/95 p-6 shadow-[0_0_40px_rgba(0,212,255,0.1)] sm:p-8">
            <h3 className="mb-6 text-lg font-bold text-white">Your Lead Dashboard</h3>
            <div className="space-y-3">
              {LEADS.map((lead, i) => (
                <div
                  key={lead.name}
                  className={`lead-card flex items-start gap-4 rounded-lg border bg-white/5 p-4 transition-colors ${
                    i === 0 ? 'lead-card-first border-cyan-400/30' : 'border-cyan-400/10 hover:border-cyan-400/30'
                  }`}
                  style={{ '--lead-delay': `${1000 + i * 350}ms` } as React.CSSProperties}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                    {lead.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{lead.name}</p>
                      <span className="rounded-full border border-blue-400/20 bg-blue-900/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-200">
                        {lead.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{lead.agency}</p>
                    <p className="mt-1 truncate text-xs italic text-cyan-300">"{lead.q}"</p>
                  </div>
                  <span className="ml-auto flex-shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-400">
                    New
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-cyan-400/10 pt-4 text-center text-sm text-gray-400">
              Illustrative example. Your dashboard shows real agent leads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadSignatureMoment;
