/**
 * lib/motion.ts — the single source of truth for motion in the CodeVyasa site.
 * Every duration, easing curve and stagger used anywhere on the site comes from
 * here so the motion language stays consistent (Anti-AI law #7).
 *
 * Values are LITERAL to the build brief (Part D):
 *   ease.out   = [0.16, 1, 0.30, 1]
 *   ease.inOut = [0.83, 0, 0.17, 1]
 *   ease.soft  = [0.22, 0.61, 0.36, 1]
 *   dur.xs=0.2 sm=0.4 md=0.6 lg=0.9 xl=1.2   (seconds)
 *   stagger.tight=0.04 base=0.07 loose=0.12
 */
import type { Variants, SpringOptions } from 'framer-motion';

// Cubic-bezier control points (framer-motion array form)
export const ease = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.83, 0, 0.17, 1] as [number, number, number, number],
  soft: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
};

// CSS `cubic-bezier(...)` string form — for Tailwind arbitrary values / GSAP.
export const easeCss = {
  out: 'cubic-bezier(0.16,1,0.30,1)',
  inOut: 'cubic-bezier(0.83,0,0.17,1)',
  soft: 'cubic-bezier(0.22,0.61,0.36,1)',
};

// GSAP CustomEase-compatible strings (falls back to power curves if CustomEase absent).
export const gsapEase = {
  out: 'power3.out',
  inOut: 'power4.inOut',
  soft: 'power2.out',
};

export const dur = {
  xs: 0.2,
  sm: 0.4,
  md: 0.6,
  lg: 0.9,
  xl: 1.2,
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
} as const;

// Spring presets used by the cursor ring, magnetic elements and tilt cards.
// Typed as SpringOptions so they work with both useSpring() and `transition`
// (framer infers a spring from the presence of `stiffness`).
export const spring = {
  ring: { stiffness: 400, damping: 40, mass: 0.6 } as SpringOptions,
  magnetic: { stiffness: 260, damping: 18, mass: 0.5 } as SpringOptions,
  tilt: { stiffness: 220, damping: 22 } as SpringOptions,
  soft: { stiffness: 120, damping: 20 } as SpringOptions,
};

/* ---------------------------------------------------------------------------
 * Reusable framer-motion variants
 * ------------------------------------------------------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.md, ease: ease.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.md, ease: ease.out } },
};

export const maskUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)', y: 12 },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    y: 0,
    transition: { duration: dur.lg, ease: ease.out },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: dur.md, ease: ease.out } },
};

// Container that staggers its children (use with `staggerChildren`).
export const staggerContainer = (amount: number = stagger.base, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: amount, delayChildren: delay },
  },
});

// A single word/char in a split-text reveal.
export const wordReveal: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: dur.md, ease: ease.out } },
};

// Standard viewport config for whileInView reveals — trigger at ~80% viewport, once.
export const inView = {
  once: true,
  amount: 0.35,
  margin: '0px 0px -12% 0px',
} as const;
