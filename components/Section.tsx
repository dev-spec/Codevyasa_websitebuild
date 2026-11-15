'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dur, ease, inView } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

interface SectionHeaderProps {
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  id?: string;
}

/** Section eyebrow + a thin gradient rule that "draws" left→right on enter (Part D §6). */
export function SectionHeader({ eyebrow, title, intro, align = 'left', className }: SectionHeaderProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <div className={cn('mb-5 flex items-center gap-3', align === 'center' && 'justify-center')}>
          <motion.span
            className="block h-px w-10 origin-left bg-grad-brand"
            initial={reduced ? undefined : { scaleX: 0 }}
            whileInView={reduced ? undefined : { scaleX: 1 }}
            viewport={inView}
            transition={{ duration: dur.md, ease: ease.out }}
          />
          <span className="eyebrow text-accent-400">{eyebrow}</span>
        </div>
      )}
      {title && (
        <motion.h2
          className="text-h2 font-semibold text-text-0"
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: dur.md, ease: ease.out }}
        >
          {title}
        </motion.h2>
      )}
      {intro && <p className="mt-5 text-body-lg text-text-1">{intro}</p>}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  container?: boolean;
}

/** Standard section shell with vertical rhythm + optional centered container. */
export function Section({ children, id, className, container = true }: SectionProps) {
  return (
    <section id={id} className={cn('relative py-section', className)}>
      {container ? <div className="shell">{children}</div> : children}
    </section>
  );
}
