import React, { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const STATS = [
  { value: '48 hrs', label: 'content to live' },
  { value: '24/7', label: 'always-on support' },
  { value: '10+', label: 'languages' },
  { value: 'UK & EU', label: 'trade coverage' },
  { value: 'Free', label: 'for agents' },
];

/**
 * Renders the final value in the DOM unconditionally (prerender-safe); when
 * motion is allowed, counts up from 0 once the row enters the viewport.
 */
const CountUp: React.FC<{ value: string; start: boolean }> = ({ value, start }) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = /^(\d+)(.*)$/.exec(value);
    if (!match || !start) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(`${Math.round(target * eased)}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, start]);

  return <>{display}</>;
};

/** The 5-stat bar as a quiet, animated counter row (replaces the boxed grid). */
const StatCounterRow: React.FC = () => {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.4 });
  const start = inView && !reduced;

  return (
    <div
      ref={ref}
      className="mt-10 flex flex-wrap items-start justify-center gap-x-10 gap-y-6 border-t border-cyan-400/10 pt-8 sm:gap-x-14"
    >
      {STATS.map((item) => (
        <div key={item.label} className="text-center">
          <p className="font-heading text-2xl font-bold text-white sm:text-3xl">
            <CountUp value={item.value} start={start} />
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCounterRow;
