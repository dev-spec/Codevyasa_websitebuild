'use client';

import { motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { Reveal, RevealItem } from '@/components/Reveal';
import { Icon } from '@/components/icons/Icon';
import { engagementModels } from '@/content/engagement';
import { dur, ease, inView } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

export function Engagement() {
  const reduced = usePrefersReducedMotion();
  return (
    <Section id="how-we-work">
      <SectionHeader
        eyebrow="How We Work"
        title={
          <>
            Engagement models that <span className="text-gradient">flex to you</span>
          </>
        }
        intro="Two clear ways to work with us — pick what fits your scope and stage."
      />

      <Reveal stagger="base" className="mt-14 grid gap-6 md:grid-cols-2" as="div">
        {engagementModels.map((m) => (
          <RevealItem key={m.id}>
            <div className="card-surface group relative h-full overflow-hidden p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-md border border-[var(--border-strong)] text-accent-400">
                  <Icon name={m.icon} size={24} />
                </span>
                <div>
                  <h3 className="text-h3 font-semibold text-text-0">{m.title}</h3>
                  <p className="text-sm text-accent-400">{m.tagline}</p>
                </div>
              </div>
              <p className="text-body text-text-1">{m.description}</p>

              <ul className="mt-6 space-y-3">
                {m.points.map((p, i) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-text-1">
                    {/* line-draw check on scroll */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-accent-400">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
                      <motion.path
                        d="M8 12.5l2.5 2.5L16 9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={reduced ? undefined : { pathLength: 0 }}
                        whileInView={reduced ? undefined : { pathLength: 1 }}
                        viewport={inView}
                        transition={{ duration: dur.md, ease: ease.out, delay: 0.1 + i * 0.08 }}
                      />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>

              <span className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-grad-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
