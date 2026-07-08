import React from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import NetworkCanvas from './NetworkCanvas.tsx';
import StatCounterRow from './StatCounterRow.tsx';
import Reveal from './Reveal.tsx';
import { useUI } from '../../context/UIContext.tsx';

/**
 * Hero: the living intelligence network. The canvas is decorative and sits
 * behind real DOM content; the page is complete without it.
 */
const HeroSection: React.FC = () => {
  const { openVeeChat } = useUI();

  return (
    <section className="relative overflow-hidden bg-[#0a1628] px-4 pb-16 pt-24 text-center sm:pb-24 sm:pt-36">
      <NetworkCanvas density={55} className="absolute inset-0" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-transparent to-[#0a1628]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
            Europe's first Voice AI sales support for the travel trade
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="hero-gradient-animated mx-auto mt-8 max-w-5xl font-heading text-5xl font-extrabold leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-8xl">
            Your brand. Instantly available to the trade.
          </h1>
        </Reveal>

        <Reveal delay={280}>
          <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            TravelIQ gives airlines, hotels, cruise lines, tour operators and DMCs a digital sales
            team that answers travel agents instantly, 24/7 — using only your approved
            information.
          </p>
        </Reveal>

        <Reveal delay={440} className="mt-12 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            to="/pricing"
            className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 font-bold text-white shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,212,255,0.7)]"
          >
            <span className="relative z-10">List Your Brand</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          </Link>
          <button
            onClick={openVeeChat}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-cyan-400/40 bg-white/10 px-10 py-5 font-bold text-white shadow-[0_0_20px_rgba(0,212,255,0.2)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-cyan-400 hover:bg-cyan-400/20 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]"
          >
            <Mic strokeWidth={1.5} className="h-5 w-5 text-cyan-400" />
            See the Live Demo
          </button>
        </Reveal>

        <Reveal delay={600}>
          <p className="mt-8 text-sm text-gray-400">
            <span className="text-cyan-400" aria-hidden="true">
              ●
            </span>{' '}
            Live in 48 hours · Built for the UK & European trade · GDPR compliant · No software to
            install
          </p>
        </Reveal>

        <Reveal delay={760}>
          <StatCounterRow />
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
