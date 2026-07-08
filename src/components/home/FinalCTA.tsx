import React from 'react';
import NewsletterForm from '../NewsletterForm.tsx';
import Reveal from './Reveal.tsx';
import { TierIcon, type TierIconName } from '../icons/TravelIQIcons.tsx';

const BADGES: { icon: TierIconName; title: string; sub: string }[] = [
  { icon: 'insurance', title: 'GDPR compliant', sub: 'across all operating markets' },
  { icon: 'attribution', title: 'Your content stays confidential', sub: 'never shared, sold or reused' },
  { icon: 'global', title: 'Built for the UK & European trade', sub: '' },
];

/**
 * The close: an invitation to become part of the network, not a pitch. The
 * demo form and its GDPR/newsletter copy are kept verbatim (NewsletterForm).
 */
const FinalCTA: React.FC = () => (
  <section className="border-t border-cyan-400/20 bg-gradient-to-br from-[#0a1628] via-[#0d2d3d] to-[#0a1628] px-4 py-24 sm:py-32">
    <div className="mx-auto max-w-4xl text-center">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
          Become part of the network
        </p>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="mt-6 font-heading text-4xl font-extrabold text-balance sm:text-5xl">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
            Your brand, answered by AI — live in 48 hours.
          </span>
        </h2>
      </Reveal>
      <Reveal delay={240}>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-300 sm:text-xl">
          Book a 15-minute demo and watch your own brand answer an agent, capture their details,
          and build your database.
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col flex-wrap items-stretch justify-center gap-4 text-left sm:flex-row">
        {BADGES.map((badge, i) => (
          <Reveal
            key={badge.title}
            delay={i * 120}
            className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-white/5 px-5 py-4 backdrop-blur-md"
          >
            <TierIcon name={badge.icon} size="md" />
            <div>
              <p className="text-sm font-semibold leading-tight text-white">{badge.title}</p>
              {badge.sub && <p className="mt-0.5 text-xs text-gray-400">{badge.sub}</p>}
            </div>
          </Reveal>
        ))}
      </div>

      <NewsletterForm />
    </div>
  </section>
);

export default FinalCTA;
