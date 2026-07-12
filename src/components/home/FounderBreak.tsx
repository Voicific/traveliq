import React from 'react';
import Reveal from './Reveal.tsx';

/**
 * Quiet full-width editorial break. Faceless by design — no name, no photo,
 * no personal identity (brief §1). Whitespace is the point.
 */
const FounderBreak: React.FC = () => (
  <section className="bg-[#0a1628] px-4 py-20 sm:py-28">
    <div className="mx-auto max-w-4xl text-center">
      <Reveal>
        <h2 className="font-heading text-4xl font-extrabold text-balance leading-tight sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
            Built by the trade, for the trade.
          </span>
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <p className="mx-auto mt-10 max-w-3xl text-xl leading-relaxed text-gray-300 sm:text-2xl sm:leading-relaxed">
          We spent two decades running trade sales, marketing and call-centre performance across
          UK and European markets. So we built the tool we always wished our suppliers had:
          instant, accurate, multilingual answers for every agent — without adding headcount.
        </p>
      </Reveal>
    </div>
  </section>
);

export default FounderBreak;
