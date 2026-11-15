'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsTouch, usePrefersReducedMotion, useMounted } from '@/lib/hooks';
import { spring } from '@/lib/motion';

type CursorState = 'default' | 'link' | 'cta' | 'view' | 'drag' | 'text';

/**
 * Custom cursor = finite state machine (Part D §3).
 *   default → 6px dot + 34px ring
 *   link    → ring grows to 56, mix-blend-difference
 *   cta     → filled dot, subtle grow
 *   view    → ring becomes a filled pill "View →" (case cards)
 *   drag    → ring becomes "⇄ Drag" (carousels)
 *   text    → thin I-beam (inputs)
 * Hidden on touch devices and under reduced motion.
 */
export function Cursor() {
  const mounted = useMounted();
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);
  const enabled = mounted && !isTouch && !reduced;

  // Dot follows the pointer instantly; the ring lags on a spring.
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, spring.ring);
  const ringY = useSpring(dotY, spring.ring);

  const stateRef = useRef<CursorState>('default');

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }
    document.documentElement.classList.add('has-custom-cursor');

    const move = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!visible) setVisible(true);

      const el = (e.target as HTMLElement)?.closest?.(
        '[data-cursor], a, button, input, textarea, select, [role="button"]'
      ) as HTMLElement | null;

      let next: CursorState = 'default';
      if (el) {
        const explicit = el.getAttribute('data-cursor') as CursorState | null;
        if (explicit) next = explicit;
        else if (el.matches('input, textarea, select')) next = 'text';
        else if (el.matches('a, button, [role="button"]')) next = 'link';
      }
      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
      }
    };

    const leave = () => setVisible(false);
    const down = () => document.documentElement.classList.add('cursor-down');
    const up = () => document.documentElement.classList.remove('cursor-down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.classList.remove('has-custom-cursor');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, visible]);

  if (!enabled) return null;

  const isPill = state === 'view' || state === 'drag';
  const label = state === 'view' ? 'View →' : state === 'drag' ? '⇄ Drag' : '';

  const ringSize = state === 'link' ? 56 : state === 'cta' ? 46 : state === 'text' ? 4 : 34;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden style={{ opacity: visible ? 1 : 0 }}>
      {/* Ring / pill — outer carries the spring position, inner is centered + animates size */}
      <motion.div className="fixed left-0 top-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill font-mono text-[11px] font-medium uppercase tracking-widest"
          animate={{
            width: isPill ? 92 : state === 'text' ? 2 : ringSize,
            height: isPill ? 40 : state === 'text' ? 26 : ringSize,
            backgroundColor: isPill
              ? 'rgba(34,211,238,0.95)'
              : state === 'cta'
                ? 'rgba(34,211,238,0.12)'
                : 'rgba(34,211,238,0)',
            borderColor: state === 'text' ? 'rgba(244,247,251,0.9)' : 'rgba(174,186,203,0.6)',
            color: '#04121a',
          }}
          transition={spring.ring}
          style={{ border: '1.5px solid', mixBlendMode: state === 'link' ? 'difference' : 'normal' }}
        >
          {isPill ? label : null}
        </motion.div>
      </motion.div>

      {/* Dot — outer carries instant position, inner is centered */}
      <motion.div className="fixed left-0 top-0" style={{ x: dotX, y: dotY }}>
        <div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 6,
            height: 6,
            background: '#22D3EE',
            opacity: isPill || state === 'text' ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        />
      </motion.div>
    </div>
  );
}
