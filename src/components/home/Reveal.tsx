import React from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface RevealProps {
  className?: string;
  /** Extra transition delay in ms, for staggering siblings. */
  delay?: number;
  children: React.ReactNode;
}

/**
 * Progressive-enhancement reveal. Content renders fully visible by default
 * (prerender / no-JS / reduced-motion safe); only when JS runs and the user
 * allows motion does the element start hidden and transition in on viewport
 * entry. Styles live in index.css (.reveal-wait / .reveal-in).
 */
const Reveal: React.FC<RevealProps> = ({ className = '', delay = 0, children }) => {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, rootMargin: '0px 0px -8% 0px' });
  const motionClass = reduced ? '' : inView ? 'reveal-in' : 'reveal-wait';

  return (
    <div
      ref={ref}
      className={`${className} ${motionClass}`.trim()}
      style={delay && !reduced ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export default Reveal;
