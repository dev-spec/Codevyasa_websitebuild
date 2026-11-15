import { PageHeader } from '@/components/PageHeader';
import { Reveal, RevealItem } from '@/components/Reveal';
import { Stats } from '@/components/sections/Stats';
import { Founder } from '@/components/sections/Founder';
import { GlobalPresence } from '@/components/sections/GlobalPresence';
import { CTABand } from '@/components/CTABand';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Icon } from '@/components/icons/Icon';
import { about } from '@/content/about';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'About Us',
  description:
    'CodeVyasa is a leading software product engineering firm with a client-centric approach — offering IT consulting, app development and on-demand tech resources.',
  path: '/about',
});

const valueIcons = ['product', 'shield', 'bolt', 'brain', 'globe', 'spark'] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title="A client-centric product engineering partner"
        intro={about.intro[0]}
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />

      {/* Intro / belief */}
      <section className="py-section-sm">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <h2 className="text-h3 font-semibold leading-tight text-text-0">{about.headline}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-4 text-body-lg text-text-1">
              <p>{about.intro[1]}</p>
              <ul className="space-y-3">
                {about.clientCentric.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-body text-text-1">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <Founder />

      <Stats />

      {/* Values */}
      <section className="py-section-sm">
        <div className="shell">
          <Reveal>
            <p className="eyebrow mb-4 text-accent-400">Our Values</p>
            <h2 className="text-h2 font-semibold text-text-0">What we stand for</h2>
          </Reveal>
          <Reveal stagger="base" as="div" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((v, i) => (
              <RevealItem key={v.title}>
                <div className="card-surface h-full p-7">
                  <span className="mb-5 grid h-11 w-11 place-items-center rounded-md border border-[var(--border-strong)] text-accent-400">
                    <Icon name={valueIcons[i % valueIcons.length]} size={22} />
                  </span>
                  <h3 className="text-lg font-semibold text-text-0">{v.title}</h3>
                  <p className="mt-2 text-sm text-text-1">{v.description}</p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <GlobalPresence />

      {/* Perks */}
      <section className="py-section-sm">
        <div className="shell">
          <Reveal>
            <p className="eyebrow mb-4 text-accent-400">Benefits & Perks</p>
            <h2 className="text-h2 font-semibold text-text-0">Life at CodeVyasa</h2>
            <p className="mt-4 max-w-2xl text-body-lg text-text-1">
              Take a look inside — our people, culture and the way we build.
            </p>
          </Reveal>

          <Reveal variant="scale" delay={0.05} className="mt-10">
            <VideoPlayer
              src={about.video.src}
              poster={about.video.poster}
              youtubeId={about.video.youtubeId || undefined}
              title={about.video.title}
              className="mx-auto max-w-4xl"
            />
          </Reveal>

          <Reveal
            stagger="base"
            className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            {about.perks.map((p) => (
              <RevealItem key={p.label} variant="scale">
                <div className="group card-surface flex h-full flex-col items-center gap-4 rounded-lg p-6 text-center transition-all duration-400 hover:-translate-y-1 hover:border-[var(--accent-400)]">
                  <span className="relative grid h-14 w-14 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-1)] text-accent-400 transition-all duration-400 group-hover:border-[var(--accent-400)] group-hover:shadow-[var(--glow)]">
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full bg-grad-brand opacity-0 blur-md transition-opacity duration-400 group-hover:opacity-30"
                      aria-hidden
                    />
                    <Icon name={p.icon} size={26} className="relative" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-text-1 transition-colors duration-400 group-hover:text-text-0">
                    {p.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
