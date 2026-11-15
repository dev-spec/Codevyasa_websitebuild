'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { Icon } from '@/components/icons/Icon';
import { PillarVisual } from './PillarVisual';
import { pillars } from '@/content/expertise';
import { dur, ease, stagger } from '@/lib/motion';

export function ExpertiseExplorer() {
  const [active, setActive] = useState(0);
  const pillar = pillars[active];

  return (
    <Section id="expertise">
      <SectionHeader
        eyebrow="Our Expertise"
        title={
          <>
            Five pillars, one <span className="text-gradient">engineering partner</span>
          </>
        }
        intro="Explore how we deliver across product, data, cloud, AI and IoT."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Left: selectable list */}
        <div className="flex flex-col gap-1" role="tablist" aria-label="Expertise pillars">
          {pillars.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={isActive}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group relative flex items-center gap-4 rounded-lg px-4 py-4 text-left transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="expertise-indicator"
                    className="absolute inset-0 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)]/70"
                    transition={{ duration: dur.md, ease: ease.out }}
                  />
                )}
                <span
                  className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-md border transition-colors ${
                    isActive ? 'border-[var(--accent-400)] text-accent-400' : 'border-[var(--border)] text-text-2'
                  }`}
                >
                  <Icon name={p.icon} size={20} />
                </span>
                <span className="relative">
                  <span className={`block text-[15px] font-medium ${isActive ? 'text-text-0' : 'text-text-1'}`}>
                    {p.name}
                  </span>
                  <span className="block text-xs text-text-2">{p.subServices.length} services</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: animated panel */}
        <div className="card-surface relative min-h-[420px] overflow-hidden p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: dur.md, ease: ease.out }}
              className="grid h-full gap-8 md:grid-cols-2"
            >
              <div className="flex flex-col">
                <div className="mb-4 flex items-center gap-2 text-accent-400">
                  <Icon name={pillar.icon} size={22} />
                  <span className="eyebrow">{pillar.menuLabel}</span>
                </div>
                <h3 className="text-h3 font-semibold text-text-0">{pillar.name}</h3>
                <p className="mt-4 text-body text-text-1">{pillar.blurb}</p>

                <motion.ul
                  className="mt-6 flex flex-wrap gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: stagger.tight } } }}
                >
                  {pillar.subServices.map((s) => (
                    <motion.li
                      key={s.slug}
                      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <Link
                        href={`/expertise/${s.slug}`}
                        className="inline-flex items-center gap-1 rounded-pill border border-[var(--border)] px-3 py-1.5 text-[13px] text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
                      >
                        {s.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="mt-auto pt-6">
                  <Link
                    href={`/expertise/${pillar.subServices[0].slug}`}
                    className="link-underline inline-flex items-center gap-2 text-sm font-medium text-accent-400"
                  >
                    Explore {pillar.name} <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[220px] rounded-lg border border-[var(--border)] bg-[var(--bg-1)]/50 p-4">
                <PillarVisual id={pillar.id} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
