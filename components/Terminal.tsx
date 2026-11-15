'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Mono "terminal" easter egg — self-typing lines (Appendix 3).
 * Static (all lines shown) under reduced motion.
 */
export function Terminal({ lines, className }: { lines: string[]; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState<string[]>(reduced ? lines : []);
  const [current, setCurrent] = useState('');
  const idx = useRef(0);
  const char = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      const line = lines[idx.current % lines.length];
      if (char.current <= line.length) {
        setCurrent(line.slice(0, char.current));
        char.current += 1;
        timeout = setTimeout(tick, 34 + Math.random() * 40);
      } else {
        setShown((prev) => [...prev.slice(-4), line]);
        setCurrent('');
        char.current = 0;
        idx.current += 1;
        timeout = setTimeout(tick, 700);
      }
    };
    timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-text-2">codevyasa — ~/ai</span>
      </div>
      <div className="min-h-[132px] space-y-1 p-3 font-mono text-[12.5px] leading-relaxed">
        {shown.map((l, i) => (
          <div key={i} className="text-text-1">
            <span className="text-accent-400">➜</span> {l}
          </div>
        ))}
        {!reduced && (
          <div className="text-text-0">
            <span className="text-accent-400">➜</span> {current}
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent-400" />
          </div>
        )}
      </div>
    </div>
  );
}
