import React from 'react';
import { Link } from 'react-router-dom';
import { TierIcon, type TierIconName } from '../icons/TravelIQIcons.tsx';
import Reveal from './Reveal.tsx';

interface CategoryNode {
  icon: TierIconName;
  name: string;
  quote: string;
  copy: string;
  cta: string;
  to: string;
  /** Constellation offset so the grid doesn't read as a card row. */
  offset: string;
}

const CATEGORIES: CategoryNode[] = [
  {
    icon: 'airline',
    name: 'Airlines',
    quote: 'Group booking process and long-haul commission?',
    copy: 'Fare families, baggage, trade programmes.',
    cta: 'For Airlines',
    to: '/airlines',
    offset: 'lg:mt-0',
  },
  {
    icon: 'cruise',
    name: 'Cruise Lines',
    quote: "What's in the drinks package on Med sailings?",
    copy: 'Cabins, itineraries, inclusions.',
    cta: 'For Cruise Lines',
    to: '/cruise',
    offset: 'lg:mt-16',
  },
  {
    icon: 'hotel',
    name: 'Hotel Groups',
    quote: 'Family rooms with half board in July?',
    copy: 'Room types, rate plans, child policies.',
    cta: 'For Hotel Groups',
    to: '/hotels',
    offset: 'lg:mt-4',
  },
  {
    icon: 'tour-operator',
    name: 'Tour Operators & DMCs',
    quote: 'Is the Day 4 hike suitable for limited mobility?',
    copy: 'Itineraries, departures, terms.',
    cta: 'For Tour Operators',
    to: '/tour-operators',
    offset: 'lg:mt-20',
  },
];

/** Animated voice-wave bars; run on node hover, styles in index.css. */
const VoiceWave: React.FC = () => (
  <span className="voice-wave" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
    <i />
  </span>
);

/**
 * The four supplier categories as nodes in the network's visual language —
 * connected by decorative constellation lines, each node still a real link.
 */
const NetworkConstellation: React.FC = () => (
  <section className="relative overflow-hidden border-y border-cyan-400/10 bg-gradient-to-b from-[#0d2d3d]/50 to-[#0a1628]/50 px-4 py-20 sm:py-28">
    <div className="relative mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
            The trade has changed
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-6 font-heading text-4xl font-extrabold text-white text-balance sm:text-6xl">
            Agents wait. <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Sales slip away.</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
            Hold music, out-of-office replies, answers that vary by rep. Your AI Sales Assistant
            knows your brand inside out and answers like your sharpest account manager — in
            seconds, 24/7/365.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-20">
        {/* Decorative constellation lines behind the nodes (desktop only). */}
        <svg
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="12.5" y1="50" x2="37.5" y2="55" className="constellation-line" />
          <line x1="37.5" y1="55" x2="62.5" y2="48" className="constellation-line" />
          <line x1="62.5" y1="48" x2="87.5" y2="58" className="constellation-line" />
          <line x1="12.5" y1="50" x2="62.5" y2="48" className="constellation-line constellation-line-faint" />
          <line x1="37.5" y1="55" x2="87.5" y2="58" className="constellation-line constellation-line-faint" />
        </svg>

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((node, i) => (
            <Reveal key={node.name} delay={i * 120} className={node.offset}>
              <Link
                to={node.to}
                className="group flex h-full flex-col rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0f1c2e]/90 to-[#0d2d3d]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <TierIcon name={node.icon} size="lg" />
                  <span className="node-dot" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-white">{node.name}</h3>
                <p className="mt-3 flex items-start gap-2 text-sm italic leading-relaxed text-cyan-300">
                  <VoiceWave />
                  <span>"{node.quote}"</span>
                </p>
                <p className="mt-3 flex-grow text-sm leading-relaxed text-gray-400">{node.copy}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 transition-all group-hover:gap-2">
                  {node.cta} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={200}>
        <p className="mt-14 text-center text-gray-400">
          Founding suppliers now onboarding across all four categories.{' '}
          <Link to="/pricing" className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300">
            Join the Founding Supplier Programme →
          </Link>
        </p>
      </Reveal>
    </div>
  </section>
);

export default NetworkConstellation;
