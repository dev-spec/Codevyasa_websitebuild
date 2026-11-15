'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { parseMetric } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/hooks';

interface StatCounterProps {
  /** e.g. "200+", "90%", "4X", "99.9%" */
  value: string;
  /** count-up duration in ms (Part D §9 → 1.4s). */
  duration?: number;
  className?: string;
}

// ease-out cubic
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Count-up on enter via IntersectionObserver, ease-out, once. Tabular figures. */
export function StatCounter({ value, duration = 1400, className }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = usePrefersReducedMotion();
  const { value: target, prefix, suffix, decimals } = parseMetric(value);
  const [display, setDisplay] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(target * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, reduced]);

  const shown = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <span ref={ref} className={className}>
      <span className="tabular">
        {prefix}
        {shown}
        {suffix}
      </span>
    </span>
  );
}
