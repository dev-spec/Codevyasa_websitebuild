import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Reveal, RevealItem } from '@/components/Reveal';
import { Icon } from '@/components/icons/Icon';
import { CTABand } from '@/components/CTABand';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { expertiseBySlug, expertiseSlugs, pillars, pillarById } from '@/content/expertise';
import { technologyBySlug } from '@/content/technologies';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return expertiseSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = expertiseBySlug[params.slug];
  if (!p) return {};
  return buildMetadata({ title: p.title, description: p.summary, path: `/expertise/${p.slug}` });
}

export default function ExpertisePage({ params }: { params: { slug: string } }) {
  const page = expertiseBySlug[params.slug];
  if (!page) notFound();

  const pillar = pillarById[page.pillarId];
  const siblings = pillar.subServices.filter((s) => s.slug !== page.slug);
  const related = page.relatedTech.map((s) => technologyBySlug[s]).filter(Boolean);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Expertise', href: '/expertise' },
          { name: page.title, href: `/expertise/${page.slug}` },
        ]}
      />

      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.summary}
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Expertise', href: '/expertise' },
          { name: page.title, href: `/expertise/${page.slug}` },
        ]}
      />

      <div className="shell grid gap-12 pb-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Overview */}
        <div>
          <Reveal>
            <div className="mb-5 flex items-center gap-2 text-accent-400">
              <Icon name={page.icon} size={22} />
              <span className="eyebrow">Overview</span>
            </div>
            <div className="space-y-4 text-body-lg text-text-1">
              {page.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          {/* Capabilities */}
          <Reveal stagger="base" as="div" className="mt-12 grid gap-4 sm:grid-cols-2">
            {page.capabilities.map((c) => (
              <RevealItem key={c.title}>
                <div className="card-surface h-full p-6">
                  <h3 className="text-base font-semibold text-text-0">{c.title}</h3>
                  <p className="mt-2 text-sm text-text-1">{c.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <Reveal>
            <div className="card-surface p-6">
              <h3 className="mb-4 text-sm uppercase tracking-wide text-text-2">Outcomes</h3>
              <ul className="space-y-3">
                {page.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-sm text-text-1">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal>
              <div className="card-surface p-6">
                <h3 className="mb-4 text-sm uppercase tracking-wide text-text-2">Technologies we use</h3>
                <div className="flex flex-wrap gap-2">
                  {related.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/technology/${t.slug}`}
                      className="rounded-pill border border-[var(--border)] px-3 py-1.5 text-[13px] text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="card-surface p-6">
              <h3 className="mb-4 text-sm uppercase tracking-wide text-text-2">More in {pillar.name}</h3>
              <ul className="space-y-2">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/expertise/${s.slug}`} className="link-underline text-sm text-text-1 hover:text-text-0">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </aside>
      </div>

      <CTABand />
    </>
  );
}
