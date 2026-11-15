'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { parseMetric } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* =============================================================================
   RollingNumber — an odometer / slot-machine number reveal.
   Each digit rolls up through a spinning reel and settles on its final value
   when the number scrolls into view. Rightmost digits spin the most (an
   accelerating, "compounding" feel) and settle last, mimicking a live count-up.
   Suffix (+ / %) pops in on the beat the reels land. Respects reduced-motion.

   Notes on the two subtle bits that make it work reliably:
   • travel is a % of the reel strip's OWN height (Framer can't interpolate `em`).
   • in-view is detected ONCE on the small number container, not on the tall
     reel strip (whose height would never satisfy an IntersectionObserver ratio).
   ========================================================================== */

const REEL_EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 1.7;

/** One vertical digit reel: 0…9 repeated `cycles` times, landing on `digit`. */
function Reel({
  digit,
  cycles,
  delay,
  active,
  reduced,
}: {
  digit: number;
  cycles: number;
  delay: number;
  active: boolean;
  reduced: boolean;
}) {
  const stops = cycles * 10 + digit; // land on item[stops] (== digit)
  const items = Array.from({ length: stops + 1 }, (_, n) => n % 10);
  const end = `-${(stops / (stops + 1)) * 100}%`;
  const target = reduced || active ? end : '0%';

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: '1em', lineHeight: '1em' }}
    >
      {/* invisible spacer sets the reel's width to one digit */}
      <span aria-hidden className="invisible">
        0
      </span>
      <motion.span
        className="absolute left-0 top-0 flex w-full flex-col"
        initial={{ y: reduced ? end : '0%' }}
        animate={{ y: target }}
        transition={reduced ? { duration: 0 } : { duration: DURATION, ease: REEL_EASE, delay }}
      >
        {items.map((d, i) => (
          <span key={i} className="text-center" style={{ height: '1em', lineHeight: '1em' }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const active = inView;

  const { prefix, suffix, value: target } = parseMetric(value);
  const digits = Math.round(target).toString().split('').map(Number);

  return (
    <span ref={ref} className={className}>
      <span className="tabular inline-flex items-end leading-none">
        {prefix && (
          <span className="inline-block" style={{ height: '1em', lineHeight: '1em' }}>
            {prefix}
          </span>
        )}
        {digits.map((d, i) => (
          <Reel key={i} digit={d} cycles={1 + i} delay={i * 0.09} active={active} reduced={reduced} />
        ))}
        {suffix && (
          <motion.span
            className="text-gradient inline-block"
            style={{ height: '1em', lineHeight: '1em' }}
            initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.3, y: reduced ? 0 : 8 }}
            animate={
              reduced || active
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.3, y: 8 }
            }
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 14, delay: DURATION - 0.15 }}
          >
            {suffix}
          </motion.span>
        )}
      </span>
    </span>
  );
}
