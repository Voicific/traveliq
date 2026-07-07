import React from 'react';
import { Clock, VolumeX, TrendingUp } from 'lucide-react';
import Reveal from './Reveal.tsx';

const AGENT_POINTS = [
  {
    icon: Clock,
    title: 'Instant answers, 24/7',
    copy: 'Verified supplier info anytime, no office hours, no time zones.',
  },
  {
    icon: VolumeX,
    title: 'Zero hold music',
    copy: 'An expert that already has the answer.',
  },
  {
    icon: TrendingUp,
    title: 'Sharper, faster',
    copy: 'Up to speed on new products and policies in seconds.',
  },
];

const COMPARISON = [
  { label: 'Annual cost', traditional: '£100,000+', traveliq: 'Significant savings' },
  { label: 'Availability', traditional: '40 hrs/week', traveliq: '24/7/365' },
  { label: 'Agent reach', traditional: 'Limited by headcount', traveliq: 'Global, unlimited' },
  { label: 'Named leads', traditional: 'Manual, inconsistent', traveliq: 'Growth+ — name, email, agency' },
  { label: 'Consistency', traditional: 'Varies by rep', traveliq: '100% consistent' },
];

/**
 * "Two sides of the network" — the former Agent Advantage and Supplier
 * Advantage sections merged into one asymmetric editorial split. The
 * comparison keeps a real <table> for semantics but is styled as editorial
 * data rows, with the ROI line as a large pull-quote.
 */
const AdvantageEditorial: React.FC = () => (
  <section className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] px-4 py-24 sm:py-32">
    <div className="mx-auto max-w-6xl">
      <div className="max-w-3xl">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
            Why it works
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-6 font-heading text-4xl font-extrabold text-balance sm:text-6xl">
            <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Faster for agents. Cheaper for you.
            </span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Agent side — narrow editorial list. */}
        <div className="lg:col-span-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">For agents</h3>
          <div className="mt-8 space-y-10">
            {AGENT_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 120} className="border-l border-cyan-400/20 pl-5">
                <point.icon strokeWidth={1.5} className="h-6 w-6 text-cyan-400" />
                <h4 className="mt-3 font-heading text-lg font-bold text-white">{point.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{point.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Supplier side — the comparison as editorial data rows. */}
        <div className="lg:col-span-8 lg:pl-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            For suppliers
          </h3>
          <Reveal delay={120}>
            <table className="mt-8 w-full text-left">
              <thead>
                <tr className="border-b border-cyan-400/20 text-xs uppercase tracking-widest">
                  <th className="w-1/4 py-3 pr-4 font-semibold text-gray-500"></th>
                  <th className="py-3 pr-4 font-semibold text-gray-500">Traditional sales</th>
                  <th className="py-3 font-semibold text-cyan-400">TravelIQ</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-cyan-400/10">
                    <td className="py-5 pr-4 align-top font-medium text-white">{row.label}</td>
                    <td className="py-5 pr-4 align-top text-gray-500">{row.traditional}</td>
                    <td className="py-5 align-top font-semibold text-cyan-300">{row.traveliq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={240}>
            <blockquote className="mt-14">
              <p className="font-heading text-2xl font-bold leading-snug text-white text-balance sm:text-3xl">
                A fraction of the cost of one account manager.{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  No holiday cover. No sick days. No 9-to-5.
                </span>
              </p>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default AdvantageEditorial;
