'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const TEAL = '#18BAB5';
/** The real brand logo file (drop-in at public/assets/brand/logo-mark.png). */
const MARK_SRC = '/assets/brand/logo-mark.png';

/**
 * CodeVyasa brand mark — the official 3D teal terminal-prompt hexagon.
 * Renders the real logo image; if that file is ever missing it falls back to a
 * drawn vector version so the mark never breaks. REVERT: to force the drawn
 * version, initialise `failed` to true.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={MARK_SRC}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn('shrink-0 object-contain', className)}
        style={{ height: size, width: size }}
        draggable={false}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M43 24 33.5 40.45 14.5 40.45 5 24 14.5 7.55 33.5 7.55Z" transform="translate(1.4 1.9)" stroke="#05100f" strokeWidth="3.4" strokeLinejoin="round" opacity="0.8" />
      <path d="M43 24 33.5 40.45 14.5 40.45 5 24 14.5 7.55 33.5 7.55Z" stroke={TEAL} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M14 17 22 24 14 31M25 31H34" stroke={TEAL} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = 30,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold uppercase leading-none tracking-tight text-text-0">
          Code<span className="text-gradient">Vyasa</span>
        </span>
      )}
    </span>
  );
}
