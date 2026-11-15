'use client';

import { motion, type Variants } from 'framer-motion';
import { dur, ease, inView, stagger } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

type RevealVariant = 'fade-up' | 'fade' | 'mask-up' | 'scale';

const variantMap: Record<RevealVariant, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: dur.md, ease: ease.out } },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur.md, ease: ease.out } },
  },
  'mask-up': {
    hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)', y: 16 },
    visible: {
      opacity: 1,
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      transition: { duration: dur.lg, ease: ease.out },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: dur.md, ease: ease.out } },
  },
};

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span' | 'h2' | 'p';
  /** Stagger children — wrap each child in <RevealItem>. */
  stagger?: keyof typeof stagger;
}

export function Reveal({ children, variant = 'fade-up', delay = 0, className, as = 'div', stagger: st }: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduced) {
    const Plain = as as any;
    return <Plain className={className}>{children}</Plain>;
  }

  if (st) {
    return (
      <Tag
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger[st], delayChildren: delay } },
        }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      variants={variantMap[variant]}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

/** A child inside a staggering <Reveal stagger>. */
export function RevealItem({
  children,
  variant = 'fade-up',
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  className?: string;
  as?: 'div' | 'li' | 'span' | 'p';
}) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  if (reduced) {
    const Plain = as as any;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag className={className} variants={variantMap[variant]}>
      {children}
    </Tag>
  );
}
