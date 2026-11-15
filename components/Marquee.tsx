'use client';

import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}

/**
 * Infinite marquee — content is duplicated and translated -50% via CSS keyframes
 * (see tailwind.config animation). Pure CSS, so it is cheap and pauses under
 * reduced motion (globals.css zeroes animation duration). Pauses on hover.
 */
export function Marquee({ children, duration = 40, reverse = false, className, pauseOnHover = true }: MarqueeProps) {
  return (
    <div className={cn('marquee-mask group relative flex overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max shrink-0 items-center',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{ ['--marquee-duration' as any]: `${duration}s` }}
      >
        {/* two identical halves → -50% translate loops seamlessly */}
        <div className="flex shrink-0 items-center gap-12 pr-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
