'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SplitText } from './SplitText';
import { dur, ease } from '@/lib/motion';

interface Crumb {
  name: string;
  href: string;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <header className="relative overflow-hidden pb-14 pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 60% at 20% 0%, rgba(8,145,178,0.12), transparent 60%), radial-gradient(50% 50% at 90% 10%, rgba(45,212,191,0.10), transparent 60%)',
        }}
      />
      <div className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden />

      <div className="shell">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-2">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <span className="text-text-2/50">/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.href} className="transition-colors hover:text-text-0">
                      {c.name}
                    </Link>
                  ) : (
                    <span className="text-text-1">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <motion.p
            className="eyebrow mb-5 text-accent-400"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.md, ease: ease.out }}
          >
            {eyebrow}
          </motion.p>
        )}

        <h1 className="max-w-[18ch] text-h1 font-semibold text-text-0">
          <SplitText text={title} by="word" as="span" animateOnMount staggerKey="tight" />
        </h1>

        {intro && (
          <motion.p
            className="mt-6 max-w-2xl text-body-lg text-text-1"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.md, ease: ease.out, delay: 0.3 }}
          >
            {intro}
          </motion.p>
        )}
      </div>
    </header>
  );
}
