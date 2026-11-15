'use client';

import { motion } from 'framer-motion';
import { dur, ease, inView, stagger } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  text: string;
  /** Split by word (default) or character. */
  by?: 'word' | 'char';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** Play immediately (hero on preloader exit) vs. on scroll into view. */
  animateOnMount?: boolean;
  delay?: number;
  staggerKey?: keyof typeof stagger;
}

/**
 * Headline reveal — each word/char masked and translated up (Part D §5).
 * Falls back to plain text under reduced motion.
 */
export function SplitText({
  text,
  by = 'word',
  className,
  as = 'span',
  animateOnMount = false,
  delay = 0,
  staggerKey = 'base',
}: SplitTextProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = as as any;

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const tokens = by === 'word' ? text.split(' ') : Array.from(text);
  const MotionTag = motion[as] as typeof motion.span;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger[staggerKey], delayChildren: delay } },
  };
  const item = {
    hidden: { y: '110%' },
    visible: { y: '0%', transition: { duration: dur.md, ease: ease.out } },
  };

  const animProps = animateOnMount
    ? { initial: 'hidden' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: inView };

  return (
    <MotionTag className={cn('inline', className)} variants={container} {...animProps} aria-label={text}>
      {tokens.map((tok, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <motion.span className="inline-block will-change-transform" variants={item}>
            {tok === ' ' ? ' ' : tok}
          </motion.span>
          {by === 'word' && i < tokens.length - 1 ? ' ' : null}
        </span>
      ))}
    </MotionTag>
  );
}
