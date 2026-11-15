import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Reveal, RevealItem } from '@/components/Reveal';
import { Icon } from '@/components/icons/Icon';
import { CTABand } from '@/components/CTABand';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { technologyBySlug, technologySlugs, technologyPages } from '@/content/technologies';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return technologySlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const t = technologyBySlug[params.slug];
  if (!t) return {};
  return buildMetadata({ title: t.name, description: t.summary, path: `/technology/${t.slug}` });
}

export default function TechnologyPage({ params }: { params: { slug: string } }) {
  const tech = technologyBySlug[params.slug];
  if (!tech) notFound();

  const siblings = technologyPages.filter((t) => t.category === tech.category && t.slug !== tech.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Technologies', href: '/technology' },
          { name: tech.name, href: `/technology/${tech.slug}` },
        ]}
      />

      <PageHeader
        eyebrow={tech.category}
        title={tech.name}
        intro={tech.summary}
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Technologies', href: '/technology' },
          { name: tech.name, href: `/technology/${tech.slug}` },
        ]}
      />

      <div className="shell grid gap-12 pb-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Reveal>
            <div className="mb-5 flex items-center gap-2 text-accent-400">
              <Icon name={tech.icon} size={22} />
              <span className="eyebrow">Overview</span>
            </div>
            <div className="space-y-4 text-body-lg text-text-1">
              {tech.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>

          <Reveal stagger="base" as="div" className="mt-12 grid gap-4 sm:grid-cols-3">
            {tech.strengths.map((s) => (
              <RevealItem key={s.title}>
                <div className="card-surface h-full p-6">
                  <h3 className="text-base font-semibold text-text-0">{s.title}</h3>
                  <p className="mt-2 text-sm text-text-1">{s.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>

        <aside className="space-y-8">
          <Reveal>
            <div className="card-surface p-6">
              <h3 className="mb-4 text-sm uppercase tracking-wide text-text-2">Where we use it</h3>
              <ul className="space-y-3">
                {tech.useCases.map((u) => (
                  <li key={u} className="flex items-start gap-3 text-sm text-text-1">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <div className="card-surface p-6">
              <h3 className="mb-4 text-sm uppercase tracking-wide text-text-2">More {tech.category} tech</h3>
              <div className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/technology/${s.slug}`}
                    className="rounded-pill border border-[var(--border)] px-3 py-1.5 text-[13px] text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </aside>
      </div>

      <CTABand />
    </>
  );
}
