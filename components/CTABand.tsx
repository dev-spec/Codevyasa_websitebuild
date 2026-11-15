'use client';

import { Reveal } from './Reveal';
import { Button } from './Button';
import { site } from '@/content/site';

export function CTABand({
  title = 'Expert Hands, Real Results Crafting Your Vision',
  subtitle = 'Tell us what you’re building — we’ll bring the engineering muscle.',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden py-section">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 80% at 50% 50%, rgba(34,211,238,0.10), transparent 65%)',
        }}
      />
      <div className="shell">
        <div className="card-surface noise-overlay relative overflow-hidden px-8 py-16 text-center sm:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-accent-400">Book a meeting</p>
            <h2 className="mx-auto max-w-3xl text-h2 font-semibold text-text-0">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-body-lg text-text-1">{subtitle}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" size="lg" iconRight={<span aria-hidden>→</span>}>
                Get in touch
              </Button>
              <a href={site.phoneHref} className="link-underline text-sm font-medium text-text-1">
                {site.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
