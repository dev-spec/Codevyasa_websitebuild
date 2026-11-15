'use client';

import { Reveal } from '@/components/Reveal';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/icons/Icon';
import { contact } from '@/content/contact';
import { site, offices } from '@/content/site';

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-section">
      {/* subtle mesh-gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(50% 50% at 15% 20%, rgba(8,145,178,0.10), transparent 60%), radial-gradient(45% 45% at 85% 75%, rgba(45,212,191,0.10), transparent 60%)',
        }}
      />
      <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Reveal>
            <p className="eyebrow mb-5 text-accent-400">Let’s talk</p>
            <h2 className="text-h2 font-semibold text-text-0">{contact.headline}</h2>
            <p className="mt-5 text-body-lg text-text-1">{contact.sub}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 space-y-5">
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

          <Reveal delay={0.2} className="mt-10 grid grid-cols-2 gap-4">
            {offices.map((o) => (
              <div key={`${o.city}-${o.address}`} className="text-[13px] leading-relaxed text-text-2">
                <div className="mb-1 font-medium text-text-1">
                  {o.city} — {o.country}
                </div>
                {o.address}
              </div>
            ))}
          </Reveal>
        </div>

        <div>
          <ContactForm source="homepage" />
        </div>
      </div>
    </section>
  );
}
