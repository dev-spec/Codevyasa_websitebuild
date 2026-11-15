'use client';

import { Marquee } from '@/components/Marquee';
import { awards } from '@/content/awards';

/** Recognition marquee — renders only when real awards are supplied. */
export function Awards() {
  if (!awards.length) return null;
  const items = [...awards, ...awards];
  return (
    <section className="border-y border-[var(--border)] py-10">
      <div className="shell mb-6">
        <p className="eyebrow text-center text-accent-400">Recognition</p>
      </div>
      <Marquee duration={40}>
        {items.map((a, i) => (
          <div key={`${a.name}-${i}`} className="flex shrink-0 items-center gap-3 text-text-1">
            <span className="font-display text-lg font-medium">{a.name}</span>
            {a.year && <span className="font-mono text-xs text-text-2">{a.year}</span>}
          </div>
        ))}
      </Marquee>
    </section>
  );
}
