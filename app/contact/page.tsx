import { PageHeader } from '@/components/PageHeader';
import { Reveal } from '@/components/Reveal';
import { ContactForm } from '@/components/ContactForm';
import { ContactLamp } from '@/components/contact/ContactLamp'; // REVERT: remove this + <ContactLamp /> below
import { Icon } from '@/components/icons/Icon';
import { site, offices } from '@/content/site';
import { contact } from '@/content/contact';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch with CodeVyasa. Book a meeting, email sales@codevyasa.com or call +1 (904) 339-8674.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      {/* REVERT: remove this line + its import to disable the interactive lamp */}
      <ContactLamp />

      <PageHeader
        eyebrow="Get in touch"
        title={contact.headline}
        intro={contact.sub}
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />

      <section className="pb-section">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-10">
            <Reveal className="space-y-5">
              <a href={`mailto:${site.email}`} className="group flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-md border border-[var(--border-strong)] text-accent-400">
                  <Icon name="spark" size={20} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-text-2">Email</span>
                  <span className="text-text-0 group-hover:text-accent-400">{site.email}</span>
                </span>
              </a>
              <a href={site.phoneHref} className="group flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-md border border-[var(--border-strong)] text-accent-400">
                  <Icon name="bolt" size={20} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-text-2">Phone</span>
                  <span className="font-mono text-text-0 group-hover:text-accent-400">{site.phoneDisplay}</span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mb-5 text-sm uppercase tracking-wide text-text-2">Our offices</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {offices.map((o) => (
                  <div key={`${o.city}-${o.address}`} className="card-surface p-5 text-[13px] leading-relaxed text-text-2">
                    <div className="mb-1.5 flex items-center gap-2 text-text-0">
                      <Icon name="globe" size={14} className="text-accent-400" />
                      <span className="font-medium">
                        {o.city} — {o.country}
                      </span>
                    </div>
                    {o.address}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex gap-3">
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-pill border border-[var(--border-strong)] px-4 py-2 text-sm text-text-1 transition-colors hover:text-text-0"
                >
                  LinkedIn
                </a>
                <a
                  href={site.social.glassdoor}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-pill border border-[var(--border-strong)] px-4 py-2 text-sm text-text-1 transition-colors hover:text-text-0"
                >
                  Glassdoor
                </a>
              </div>
            </Reveal>
          </div>

          <div>
            <ContactForm source="contact-page" />
          </div>
        </div>
      </section>
    </>
  );
}
