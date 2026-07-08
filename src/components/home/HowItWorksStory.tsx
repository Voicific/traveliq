import React, { useEffect, useRef } from 'react';
import Reveal from './Reveal.tsx';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Step {
  title: string;
  copy: string;
}

const AGENT_STEPS: Step[] = [
  {
    title: 'Ask by voice or chat',
    copy: "Connect directly to any brand's AI Sales Assistant.",
  },
  {
    title: 'Get verified answers, 24/7',
    copy: 'Straight from the source, no hold music, no waiting on email.',
  },
  {
    title: 'Raise your IQ, free',
    copy: 'The whole network, no cost, no catch.',
  },
];

const SUPPLIER_STEPS: Step[] = [
  {
    title: 'You control the AI',
    copy: 'Your presentations, policies and FAQs decide exactly what it says. Update it live, anytime. GDPR compliant.',
  },
  {
    title: 'Engage agents 24/7',
    copy: "Every query answered in the agent's language, with your latest offers, day and night.",
  },
  {
    title: 'Convert and analyse',
    copy: 'Every interaction logged; on Growth and above, every agent becomes a named lead.',
  },
];

const StepBlock: React.FC<{ step: Step; index: number }> = ({ step, index }) => (
  <Reveal delay={index * 100} className="flex gap-5">
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 font-heading text-lg font-bold text-cyan-300 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
      {index + 1}
    </div>
    <div>
      <h4 className="font-heading text-xl font-bold text-white">{step.title}</h4>
      <p className="mt-2 leading-relaxed text-gray-300">{step.copy}</p>
    </div>
  </Reveal>
);

/**
 * The two former 3-step sections merged into one sticky split-scroll story:
 * pinned visual (the repurposed promo video — "watch voice AI work") on the
 * left, agent-side then supplier-side steps advancing on the right. On mobile
 * everything reads as a plain sequence; content never depends on the pinning.
 */
const HowItWorksStory: React.FC = () => {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { ref: videoInViewRef, inView: videoInView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  // Track which step group currently crosses the viewport's centre band.
  const bandMargin = '-45% 0px -45% 0px';
  const { ref: agentRef } = useInView<HTMLDivElement>({ threshold: 0, rootMargin: bandMargin });
  const { ref: supplierRef, inView: supplierInView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: bandMargin,
  });

  const activeSide: 'agents' | 'suppliers' = supplierInView ? 'suppliers' : 'agents';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoInView && !reduced) {
      video.play().catch(() => {
        /* autoplay blocked — controls remain available */
      });
    } else {
      video.pause();
    }
  }, [videoInView, reduced]);

  const sideLabel = (side: 'agents' | 'suppliers', label: string) => (
    <span
      className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-all duration-500 ${
        activeSide === side
          ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
          : 'border-cyan-400/10 text-gray-500'
      }`}
    >
      {label}
    </span>
  );

  return (
    <section className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
              How it works
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-6 font-heading text-4xl font-extrabold text-white text-balance sm:text-6xl">
              One network.{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Both sides win.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-[5fr_6fr] lg:gap-20">
          {/* Pinned visual: watch voice AI work. */}
          <div ref={videoInViewRef} className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <div className="overflow-hidden rounded-2xl border border-cyan-400/20 shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                <video
                  ref={videoRef}
                  src="/videos/hero-loop.mp4"
                  poster="/videos/hero-loop-poster.jpg"
                  muted
                  loop
                  playsInline
                  controls={reduced}
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              </div>
              <p className="mt-4 text-center text-sm text-gray-400">
                Watch voice AI work — an agent question, answered in seconds.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {sideLabel('agents', 'For agents')}
                {sideLabel('suppliers', 'For suppliers')}
              </div>
            </Reveal>
          </div>

          {/* Steps advance on scroll. */}
          <div className="space-y-16">
            <div ref={agentRef}>
              <h3 className="font-heading text-2xl font-bold text-white">For agents</h3>
              <div className="mt-8 space-y-10">
                {AGENT_STEPS.map((step, i) => (
                  <StepBlock key={step.title} step={step} index={i} />
                ))}
              </div>
            </div>

            <div ref={supplierRef} className="border-t border-cyan-400/10 pt-14">
              <h3 className="font-heading text-2xl font-bold text-white">For suppliers</h3>
              <p className="mt-2 text-sm text-gray-400">
                TravelIQ handles setup and onboarding — you control the content.
              </p>
              <div className="mt-8 space-y-10">
                {SUPPLIER_STEPS.map((step, i) => (
                  <StepBlock key={step.title} step={step} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksStory;
