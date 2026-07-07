import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Fire once and stop observing (one-shot reveals). */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * IntersectionObserver visibility hook. Attach `ref` to the element; `inView`
 * flips when it enters the viewport. Falls back to `true` where the API is
 * unavailable so content is never gated on it.
 */
export function useInView<T extends HTMLElement>({
  once = false,
  threshold = 0.15,
  rootMargin,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, inView };
}
