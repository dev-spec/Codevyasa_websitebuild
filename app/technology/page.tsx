import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { CTABand } from '@/components/CTABand';
import { technologyPages, technologyCategories } from '@/content/technologies';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Technologies',
  description:
    'The technology stack CodeVyasa builds with — frontend, backend, mobile and database engineering.',
  path: '/technology',
});

export default function TechnologyIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Our Technologies"
        title="A stack chosen for the problem"
        intro="We stay language- and framework-agnostic — here’s the toolkit we reach for across the stack."
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Technologies', href: '/technology' },
        ]}
      />

      <section className="py-section-sm">
        <div className="shell space-y-12">
          {technologyCategories.map((cat) => (
            <Reveal key={cat} variant="fade-up">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-grad-brand" />
                  <h2 className="text-h3 font-semibold text-text-0">{cat}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {technologyPages
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <Link
                        key={t.slug}
                        href={`/technology/${t.slug}`}
                        className="card-surface group flex items-center justify-between p-5 transition-colors hover:border-[var(--border-strong)]"
                      >
                        <div>
                          <div className="font-medium text-text-0">{t.name}</div>
                          <div className="mt-1 line-clamp-1 text-xs text-text-2">{t.summary}</div>
                        </div>
                        <span className="text-text-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-400">
                          →
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
