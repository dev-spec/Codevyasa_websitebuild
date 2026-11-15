'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Magnetic } from './Magnetic';
import { cn } from '@/lib/utils';
import { ease, dur } from '@/lib/motion';

type Variant = 'primary' | 'ghost' | 'outline' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  className?: string;
  children: React.ReactNode;
  iconRight?: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };
type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-tight transition-colors duration-400 ease-out disabled:pointer-events-none disabled:opacity-50 select-none';

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
};

const variants: Record<Variant, string> = {
  primary:
    'gradient-border bg-[var(--bg-2)] text-text-0 hover:text-white [box-shadow:0_8px_40px_-12px_rgba(34,211,238,0.5)]',
  ghost: 'bg-transparent text-text-0 hover:bg-white/5 border border-[var(--border-strong)]',
  outline: 'bg-transparent text-text-0 border border-[var(--border-strong)] hover:border-[var(--accent-400)]',
  link: 'link-underline px-0 h-auto text-text-0 hover:text-accent-400 rounded-none',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', magnetic = true, className, children, iconRight, ...rest },
  ref
) {
  const classes = cn(base, variant !== 'link' && sizes[size], variants[variant], className);
  const isCta = variant === 'primary';

  const inner = (
    <motion.span
      className="relative z-10 inline-flex items-center gap-2"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: dur.xs, ease: ease.out }}
    >
      {children}
      {iconRight}
      {isCta && (
        <span className="absolute inset-0 -z-10 rounded-pill bg-grad-brand opacity-0 blur-md transition-opacity duration-400 group-hover/btn:opacity-40" />
      )}
    </motion.span>
  );

  const content =
    'href' in rest && rest.href !== undefined ? (
      <Link
        ref={ref as any}
        href={rest.href}
        data-cursor={isCta ? 'cta' : 'link'}
        className={cn('group/btn', classes)}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </Link>
    ) : (
      <button
        ref={ref as any}
        data-cursor={isCta ? 'cta' : 'link'}
        className={cn('group/btn', classes)}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    );

  if (magnetic && variant !== 'link') {
    return <Magnetic strength={isCta ? 14 : 8}>{content}</Magnetic>;
  }
  return content;
});
