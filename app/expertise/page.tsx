import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/icons/Icon';
import { CTABand } from '@/components/CTABand';
import { pillars } from '@/content/expertise';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Expertise',
  description:
    'CodeVyasa delivers across five pillars — Product & SaaS, Data Engineering, DevOps & Cloud, AI and IoT.',
  path: '/expertise',
});

export default function ExpertiseIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Our Expertise"
        title="Engineering across five pillars"
        intro="From product and data to cloud, AI and IoT — deep teams for every layer of your stack."
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Expertise', href: '/expertise' },
        ]}
      />

      <section className="py-section-sm">
        <div className="shell space-y-6">
          {pillars.map((p) => (
            <Reveal key={p.id} variant="fade-up">
              <div className="card-surface p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="mb-3 flex items-center gap-3 text-accent-400">
                      <Icon name={p.icon} size={24} />
                      <h2 className="text-h3 font-semibold text-text-0">{p.name}</h2>
                    </div>
                    <p className="text-body text-text-1">{p.blurb}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.subServices.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/expertise/${s.slug}`}
                      className="rounded-pill border border-[var(--border)] px-3.5 py-1.5 text-[13px] text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
                    >
                      {s.label}
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
