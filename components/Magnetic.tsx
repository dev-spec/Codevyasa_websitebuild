'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsTouch, usePrefersReducedMotion } from '@/lib/hooks';
import { spring } from '@/lib/motion';
import { clamp } from '@/lib/utils';

interface MagneticProps {
  children: React.ReactNode;
  /** Max pull in px toward the cursor (Part D §4 → 8–14px typical). */
  strength?: number;
  className?: string;
  as?: 'div' | 'span' | 'li';
}

/** Reusable magnetic element — translates toward the cursor, springs back on leave. */
export function Magnetic({ children, strength = 12, className, as = 'div' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const disabled = isTouch || reduced;

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, spring.magnetic);
  const y = useSpring(mvY, spring.magnetic);

  const onMove = (e: React.PointerEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    mvX.set(clamp(relX * 0.4, -strength, strength));
    mvY.set(clamp(relY * 0.4, -strength, strength));
  };

  const onLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  const MotionTag = (as === 'span' ? motion.span : as === 'li' ? motion.li : motion.div) as typeof motion.div;

  return (
    <MotionTag
      ref={ref as any}
      className={className}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </MotionTag>
  );
}
