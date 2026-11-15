'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { StatCounter } from '@/components/StatCounter';
import { caseStudies, caseStudyIndustries, caseStudyServices } from '@/content/caseStudies';
import { CaseVisual } from './CaseVisual';
import { dur, ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

type FilterType = 'industry' | 'service';

export function WorkGrid() {
  const [type, setType] = useState<FilterType>('industry');
  const [value, setValue] = useState<string>('All');

  const options = type === 'industry' ? caseStudyIndustries : caseStudyServices;

  const filtered = useMemo(() => {
    if (value === 'All') return caseStudies;
    return caseStudies.filter((c) => (type === 'industry' ? c.industry === value : c.service === value));
  }, [type, value]);

  return (
    <section className="py-section-sm">
      <div className="shell">
        {/* Filter controls */}
        <div className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-8">
          <div className="flex items-center gap-2">
            {(['industry', 'service'] as FilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setValue('All');
                }}
                className={cn(
                  'rounded-pill px-4 py-1.5 text-sm capitalize transition-colors',
                  type === t ? 'bg-[var(--surface)] text-text-0' : 'text-text-2 hover:text-text-0'
                )}
              >
                Filter by {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...options].map((opt) => (
              <button
                key={opt}
                onClick={() => setValue(opt)}
                className={cn(
                  'rounded-pill border px-4 py-2 text-[13px] transition-colors',
                  value === opt
                    ? 'border-[var(--accent-400)] text-text-0'
                    : 'border-[var(--border)] text-text-1 hover:border-[var(--border-strong)] hover:text-text-0'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => {
              const i = caseStudies.indexOf(c);
              return (
                <motion.article
                  key={c.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: dur.md, ease: ease.out }}
                  className="group"
                  data-cursor="view"
                >
                  <Link href={`/case-study/${c.slug}`} className="block">
                    <div className="card-surface overflow-hidden">
                      <CaseVisual index={i} card={c} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
                      <div className="p-6">
                        <h3 className="min-h-[3.2rem] text-lg font-semibold leading-snug text-text-0">{c.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-text-1">{c.outcome}</p>
                        <div className="mt-5 flex gap-6 border-t border-[var(--border)] pt-4">
                          {c.metrics.map((m) => (
                            <div key={m.label}>
                              <div className="font-display text-xl font-semibold text-text-0">
                                <StatCounter value={m.value} />
                              </div>
                              <div className="text-[10px] uppercase tracking-wide text-text-2">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
