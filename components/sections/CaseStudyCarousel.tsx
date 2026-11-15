'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { StatCounter } from '@/components/StatCounter';
import { Magnetic } from '@/components/Magnetic';
import { caseStudies } from '@/content/caseStudies';
import { CaseVisual } from './CaseVisual';
import { ease } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const N = caseStudies.length;
const ROT = 7; // degrees per step
const DROP = 30; // px per step
const SCALE = 0.085;

/** Shortest signed distance from active on a ring of N (wrap-around). */
function signedOffset(i: number, active: number) {
  let d = i - active;
  d = ((d % N) + N) % N;
  if (d > N / 2) d -= N;
  return d;
}

export function CaseStudyCarousel() {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const [dim, setDim] = useState({ w: 380, gap: 300 });

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const w = Math.min(384, vw * 0.84);
      setDim({ w, gap: w * (vw < 640 ? 0.62 : 0.8) });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const step = useCallback((dir: number) => setActive((a) => (a + dir + N) % N), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <Section id="work-preview" container={false}>
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Success Stories"
            title={
              <>
                Outcomes we’re <span className="text-gradient">proud of</span>
              </>
            }
            intro="Drag, tap a card, or use the arrows — every story links to the full case study."
          />
          <div className="flex items-center gap-3">
            <CarouselArrow dir="left" onClick={() => step(-1)} />
            <CarouselArrow dir="right" onClick={() => step(1)} />
          </div>
        </div>
      </div>

      {/* Arc stage */}
      <div className="marquee-mask relative mt-6 overflow-hidden">
        <motion.div
          className="relative mx-auto h-[600px] w-full max-w-shell cursor-grab active:cursor-grabbing sm:h-[640px]"
          data-cursor="drag"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) step(1);
            else if (info.offset.x > 60) step(-1);
          }}
          style={{ perspective: 1600 }}
        >
          {caseStudies.map((c, i) => {
            const o = signedOffset(i, active);
            const abs = Math.abs(o);
            const isActive = o === 0;
            const visible = abs <= 3;
            const opacity = abs <= 1 ? 1 : abs === 2 ? 0.7 : abs === 3 ? 0.25 : 0;

            return (
              <motion.article
                key={c.slug}
                className="absolute left-1/2 top-6"
                style={{
                  width: dim.w,
                  marginLeft: -dim.w / 2,
                  transformOrigin: '50% 135%',
                  zIndex: 100 - abs,
                  pointerEvents: abs > 2 ? 'none' : 'auto',
                }}
                initial={false}
                animate={
                  reduced
                    ? { opacity: abs <= 2 ? 1 : 0 }
                    : {
                        x: o * dim.gap,
                        y: abs * DROP,
                        rotate: o * ROT,
                        scale: 1 - abs * SCALE,
                        opacity,
                        filter: abs > 1 ? `blur(${(abs - 1) * 1.6}px)` : 'blur(0px)',
                      }
                }
                transition={{ type: 'spring', stiffness: 130, damping: 20, mass: 0.6 }}
                data-cursor={isActive ? 'view' : undefined}
              >
                <Link
                  href={`/case-study/${c.slug}`}
                  aria-hidden={!visible}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    if (!isActive) {
                      e.preventDefault();
                      setActive(i);
                    }
                  }}
                  className="group block select-none"
                  draggable={false}
                >
                  <div
                    className={cn(
                      'card-surface overflow-hidden transition-shadow duration-500',
                      isActive && 'shadow-[0_40px_120px_-30px_rgba(6,182,212,0.35)] ring-1 ring-[var(--accent-500)]/30'
                    )}
                  >
                    {/* cover */}
                    <div className="relative">
                      <CaseVisual index={i} card={c} className="aspect-[16/10]" />
                      {isActive && (
                        <span className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-pill bg-accent-400 px-4 py-1.5 text-[12px] font-medium text-[#04121a] opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                          View case →
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-1 text-xs uppercase tracking-wide text-text-2">{c.client}</div>
                      <h3 className="min-h-[3.4rem] text-lg font-semibold leading-snug text-text-0">{c.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-text-1">{c.outcome}</p>

                      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
                        {c.metrics.map((m) => (
                          <div key={m.label}>
                            <div className="font-display text-2xl font-semibold text-text-0">
                              {isActive ? <StatCounter value={m.value} /> : m.value}
                            </div>
                            <div className="mt-1 text-[11px] uppercase tracking-wide text-text-2">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* dots */}
      <div className="mt-6 flex justify-center gap-2">
        {caseStudies.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => setActive(i)}
            aria-label={`Go to case study ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-2 rounded-pill transition-all duration-400',
              i === active ? 'w-8 bg-grad-brand' : 'w-2 bg-[var(--border-strong)] hover:bg-text-2'
            )}
          />
        ))}
      </div>
    </Section>
  );
}

function CarouselArrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <Magnetic strength={8}>
      <button
        onClick={onClick}
        aria-label={dir === 'left' ? 'Previous' : 'Next'}
        className="grid h-12 w-12 place-items-center rounded-pill border border-[var(--border-strong)] text-text-0 transition-all hover:border-[var(--accent-400)] hover:text-accent-400"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={dir === 'left' ? 'rotate-180' : ''}
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </Magnetic>
  );
}
