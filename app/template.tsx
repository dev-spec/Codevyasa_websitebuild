'use client';

import { motion } from 'framer-motion';
import { ease, dur } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Route transition (Part D §7). app/template.tsx remounts on every navigation,
 * so each route begins under a full-screen brand-gradient panel that wipes up to
 * reveal the page — no white flash — while the content fades up beneath it.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9998] origin-top bg-grad-brand"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: dur.md, ease: ease.inOut }}
      />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.md, ease: ease.out, delay: 0.12 }}
      >
        {children}
      </motion.div>
    </>
  );
}
