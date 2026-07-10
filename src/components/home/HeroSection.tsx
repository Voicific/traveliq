import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import NetworkCanvas from './NetworkCanvas.tsx';
import StatCounterRow from './StatCounterRow.tsx';
import Reveal from './Reveal.tsx';
import { useUI } from '../../context/UIContext.tsx';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Hero: the living intelligence network, hosted by Vee. The canvas and the
 * Vee figure are both decorative and sit apart from the text column — the
 * page is complete and legible without either.
 */
const HeroSection: React.FC = () => {
  const { openVeeChat } = useUI();
  const reduced = useReducedMotion();
  const veeRef = useRef<HTMLDivElement | null>(null);

  // Gentle scroll parallax on Vee (JS sets a CSS var; disabled under
  // prefers-reduced-motion; the figure is static without JS).
  useEffect(() => {
    const el = veeRef.current;
    if (!el || reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * 0.08, 48);
        el.style.setProperty('--vee-parallax', `${y}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      el.style.removeProperty('--vee-parallax');
    };
  }, [reduced]);

  return (
    <section className="relative overflow-hidden bg-[#0a1628] px-4 pb-16 pt-8 sm:pb-20 sm:pt-12">
      <NetworkCanvas density={55} className="absolute inset-0" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-transparent to-[#0a1628]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-8">
          {/* Text column — holds the left; Vee never overlaps it. */}
          <div className="text-center lg:text-left">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm lg:whitespace-nowrap">
                Europe's first Voice AI for the travel trade
              </p>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="hero-gradient-animated mt-5 font-heading text-5xl font-extrabold leading-[1.04] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Your brand. Instantly available to the trade.
              </h1>
            </Reveal>

            <Reveal delay={280}>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-300 sm:text-xl lg:mx-0">
                TravelIQ gives airlines, hotels, cruise lines, tour operators and DMCs a digital
                sales team that answers travel agents instantly, 24/7 — using only your approved
                information.
              </p>
            </Reveal>

            <Reveal
              delay={440}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start"
            >
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
              {/* Tertiary action: quiet outline button — thinner border, no
                  fill, slightly smaller than the two primary CTAs. */}
              <Link
                to="/suppliers"
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 px-8 py-4 text-sm font-semibold text-cyan-200 transition-all duration-500 hover:border-cyan-400/50 hover:bg-cyan-400/5 hover:text-white"
              >
                Free for Agents <span aria-hidden="true">→</span>
              </Link>
            </Reveal>

            <Reveal delay={600}>
              <p className="mt-6 text-sm text-gray-400">
                <span className="text-cyan-400" aria-hidden="true">
                  ●
                </span>{' '}
                Live in 48 hours · Built for the UK & European trade · GDPR compliant · No
                software to install
              </p>
            </Reveal>
          </div>

          {/* Vee — decorative holographic host. In front of the canvas, in her
              own grid column so she stays clear of the text at every width. */}
          <Reveal delay={500} className="flex justify-center lg:justify-end">
            <div
              ref={veeRef}
              aria-hidden="true"
              className="vee-hero-parallax pointer-events-none relative w-48 select-none sm:w-60 lg:w-full lg:max-w-sm"
            >
              <div className="vee-hero-glow" />
              {/* Sway wrapper: a slow idle drift on the whole figure, on a
                  different period from the img's float so they never lock. */}
              <div className="vee-hero-sway relative w-full">
                <img
                  src="/imgs/vee-hero.png"
                  alt=""
                  draggable={false}
                  decoding="async"
                  className="vee-hero-figure relative w-full"
                />
                {/* Soft pulsing glow over her raised hand/fingertips. */}
                <div className="vee-hero-hand-glow" />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={700}>
          <StatCounterRow />
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
