import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { StatCounter } from '@/components/StatCounter';
import { CTABand } from '@/components/CTABand';
import { PageHeader } from '@/components/PageHeader';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/JsonLd';
import { caseStudies, caseStudyBySlug, caseStudySlugs } from '@/content/caseStudies';
import { CaseMotif } from '@/components/sections/CaseVisual';
import { caseTheme } from '@/content/caseThemes';
import { Icon } from '@/components/icons/Icon';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/content/site';

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const cs = caseStudyBySlug[params.slug];
  if (!cs) return {};
  return buildMetadata({
    title: cs.title,
    description: cs.outcome,
    path: `/case-study/${cs.slug}`,
  });
}

const BLOCKS: { key: 'challenge' | 'approach' | 'solution' | 'results'; label: string }[] = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'approach', label: 'Approach' },
  { key: 'solution', label: 'Solution' },
  { key: 'results', label: 'Results' },
];

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const cs = caseStudyBySlug[params.slug];
  if (!cs) notFound();

  const idx = caseStudySlugs.indexOf(cs.slug);
  const theme = caseTheme(idx);
  const prev = caseStudies[(idx - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Work', href: '/work' },
          { name: cs.title, href: `/case-study/${cs.slug}` },
        ]}
      />
      <ArticleJsonLd headline={cs.title} description={cs.outcome} url={`${site.url}/case-study/${cs.slug}`} />

      <PageHeader
        eyebrow={`${cs.industry} · ${cs.service}`}
        title={cs.title}
        intro={cs.outcome}
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Work', href: '/work' },
          { name: cs.client, href: `/case-study/${cs.slug}` },
        ]}
      />

      <div className="shell">
        {/* hero showcase */}
        <Reveal variant="scale">
          <div
            className="relative overflow-hidden rounded-xl border border-[var(--border-strong)] shadow-card"
            style={{ background: theme.grad }}
          >
            <div className="grid-overlay absolute inset-0 opacity-20" aria-hidden />
            <div
              className="pointer-events-none absolute -right-24 top-1/2 h-[70%] w-[55%] -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: theme.accent, opacity: 0.16 }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-12 right-2 select-none font-display text-[13rem] font-semibold leading-none text-white/[0.05]"
              aria-hidden
            >
              {String(idx + 1).padStart(2, '0')}
            </span>

            <div className="relative grid items-center gap-8 p-8 md:grid-cols-[0.9fr_1.1fr] md:gap-10 md:p-12">
              {/* left: the story */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 backdrop-blur" style={{ color: theme.accent }}>
                    <Icon name={theme.icon} size={20} />
                  </span>
                  <span className="rounded-pill bg-black/25 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/85 backdrop-blur">
                    {cs.industry} · {cs.service}
                  </span>
                </div>
                <h2 className="mt-6 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight text-white">
                  {cs.client}
                </h2>
                <p className="mt-3 max-w-md text-body-lg text-white/75">{cs.outcome}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {cs.tags.map((t) => (
                    <span key={t} className="rounded-pill border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wide text-white/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* right: illustrated product visual */}
              <div className="relative">
                <div
                  className="pointer-events-none absolute inset-6 -z-10 rounded-2xl blur-2xl"
                  style={{ background: theme.accent, opacity: 0.12 }}
                  aria-hidden
                />
                <CaseMotif index={idx} className="aspect-[16/10] w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]" />
              </div>
            </div>
          </div>
        </Reveal>

        {/* metric callouts */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {cs.metrics.map((m) => (
            <Reveal key={m.label} variant="fade-up">
              <div className="card-surface flex items-baseline gap-4 p-8">
                <div className="font-display text-[clamp(3rem,7vw,5rem)] font-semibold leading-none text-gradient">
                  <StatCounter value={m.value} />
                </div>
                <div className="text-body text-text-1">{m.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* body blocks */}
        <div className="mx-auto mt-16 max-w-3xl space-y-14 pb-8">
          {BLOCKS.map(({ key, label }, i) => (
            <Reveal key={key} variant="fade-up">
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-sm text-accent-400">0{i + 1}</span>
                  <span className="h-px w-8 bg-grad-brand" />
                  <h2 className="text-h3 font-semibold text-text-0">{label}</h2>
                </div>
                <div className="space-y-3 text-body-lg text-text-1">
                  {cs[key].map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}

          {/* tech stack */}
          <Reveal variant="fade-up">
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-wide text-text-2">Tech stack</h2>
              <div className="flex flex-wrap gap-2">
                {cs.techStack.map((t) => (
                  <span key={t} className="rounded-pill border border-[var(--border-strong)] px-3 py-1.5 font-mono text-[13px] text-text-1">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        {/* prev / next */}
        <div className="grid gap-4 border-t border-[var(--border)] py-12 sm:grid-cols-2">
          <Link href={`/case-study/${prev.slug}`} className="group rounded-lg border border-[var(--border)] p-6 transition-colors hover:border-[var(--border-strong)]">
            <span className="text-xs uppercase tracking-wide text-text-2">← Previous</span>
            <p className="mt-2 font-medium text-text-0 group-hover:text-accent-400">{prev.title}</p>
          </Link>
          <Link href={`/case-study/${next.slug}`} className="group rounded-lg border border-[var(--border)] p-6 text-right transition-colors hover:border-[var(--border-strong)]">
            <span className="text-xs uppercase tracking-wide text-text-2">Next →</span>
            <p className="mt-2 font-medium text-text-0 group-hover:text-accent-400">{next.title}</p>
          </Link>
        </div>
      </div>

      <CTABand />
    </>
  );
}
