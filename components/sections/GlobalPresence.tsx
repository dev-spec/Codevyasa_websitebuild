'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { StatCounter } from '@/components/StatCounter';
import { GlobeCanvas } from '@/components/three/Lazy';
import { presenceNodes, homeNode, presenceStats } from '@/content/presence';
import type { PresenceNode } from '@/content/types';
import { dur, ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

const statusColor: Record<PresenceNode['status'], string> = {
  'Home base': 'text-accent-400 border-[var(--accent-400)]',
  Office: 'text-violet-500 border-violet-500',
  'Delivery & sales': 'text-text-1 border-[var(--border-strong)]',
  Expanding: 'text-[#f59e0b] border-[#f59e0b]',
};

export function GlobalPresence() {
  const [hovered, setHovered] = useState<PresenceNode | null>(null);
  const active = hovered ?? homeNode;

  return (
    <Section id="global-presence" className="overflow-hidden">
      <SectionHeader
        eyebrow="Global Presence"
        title={
          <>
            One home base. <span className="text-gradient">Worldwide</span> reach.
          </>
        }
        intro="Headquartered in India, delivering across three continents — and expanding into the Gulf/GCC."
      />

      <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
        {/* Globe */}
        <div className="relative order-2 aspect-square w-full lg:order-1">
          <GlobeCanvas onHover={setHovered} />
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-2/70">
            Drag to rotate · hover a marker
          </div>
        </div>

        {/* Side panel */}
        <div className="order-1 lg:order-2">
          {/* counters */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {presenceStats.map((s) => (
              <div key={s.label} className="card-surface p-4">
                <div className="font-display text-3xl font-semibold text-text-0">
                  <StatCounter value={s.value} />
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-text-2">{s.label}</div>
              </div>
            ))}
          </div>

          {/* active region card */}
          <div className="card-surface relative min-h-[190px] overflow-hidden p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: dur.sm, ease: ease.out }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-text-0">{active.country}</h3>
                  <span className={cn('rounded-pill border px-3 py-1 text-[11px] uppercase tracking-wide', statusColor[active.status])}>
                    {active.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-accent-400">{active.cities.join(' · ')}</p>
                <p className="mt-3 text-body text-text-1">{active.focus}</p>
                <p className="mt-2 text-sm text-text-2">{active.role}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* region chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {presenceNodes.map((n) => (
              <button
                key={n.id}
                onMouseEnter={() => setHovered(n)}
                onFocus={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'rounded-pill border px-3 py-1.5 text-[13px] transition-colors',
                  active.id === n.id
                    ? 'border-[var(--accent-400)] text-text-0'
                    : 'border-[var(--border)] text-text-1 hover:text-text-0'
                )}
              >
                {n.country}
                {n.status === 'Expanding' && <span className="ml-1.5 text-[#f59e0b]">•</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
