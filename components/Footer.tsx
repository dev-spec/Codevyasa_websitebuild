'use client';

import Link from 'next/link';
import { Magnetic } from './Magnetic';
import { Icon } from './icons/Icon';
import { footerColumns } from '@/content/nav';
import { site, offices } from '@/content/site';
import { useSmoothScroll } from './providers/SmoothScroll';

export function Footer() {
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--bg-1)]">
      <div className="shell py-section-sm">
        {/* Top: CTA + back to top */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-14">
          <div>
            <p className="eyebrow mb-4 text-accent-400">Let’s build</p>
            <h2 className="max-w-xl text-h3 font-semibold text-text-0">
              Have a product to ship? We bring the engineering muscle.
            </h2>
          </div>
          <Magnetic strength={10}>
            <button
              onClick={() => scrollTo(0)}
              data-cursor="link"
              className="group flex items-center gap-2 rounded-pill border border-[var(--border-strong)] px-5 py-3 text-sm text-text-1 transition-colors hover:text-text-0"
              aria-label="Back to top"
            >
              Back to top
              <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
            </button>
          </Magnetic>
        </div>

        {/* Middle: link columns + offices */}
        <div className="grid gap-10 border-t border-[var(--border)] py-14 md:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-sm font-semibold text-text-0">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-[13.5px] text-text-1 transition-colors hover:text-text-0">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-0">Get in touch</h3>
            <a href={`mailto:${site.email}`} className="link-underline block text-[13.5px] text-text-1 hover:text-text-0">
              {site.email}
            </a>
            <a href={site.phoneHref} className="link-underline mt-2 block font-mono text-[13.5px] text-text-1 hover:text-text-0">
              {site.phoneDisplay}
            </a>
            <div className="mt-5 flex gap-3">
              <SocialLink href={site.social.linkedin} label="LinkedIn">in</SocialLink>
              <SocialLink href={site.social.glassdoor} label="Glassdoor">
                <Icon name="chart" size={16} />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Offices */}
        <div className="grid gap-6 border-t border-[var(--border)] py-12 sm:grid-cols-2 lg:grid-cols-4">
          {offices.map((o) => (
            <div key={`${o.city}-${o.address}`} className="text-[13px] leading-relaxed text-text-2">
              <div className="mb-1.5 flex items-center gap-2 text-text-0">
                <Icon name="globe" size={14} className="text-accent-400" />
                <span className="font-medium">
                  {o.city} — {o.country}
                </span>
                {o.isHQ && <span className="rounded-pill border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-2">HQ</span>}
              </div>
              {o.address}
            </div>
          ))}
        </div>
      </div>

      <div className="shell flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] py-8 text-xs text-text-2 sm:flex-row">
        <p>©{site.copyrightYear} CodeVyasa. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-text-0">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-text-0">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Magnetic strength={8}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        data-cursor="link"
        className="grid h-9 w-9 place-items-center rounded-pill border border-[var(--border-strong)] text-sm font-semibold lowercase text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
      >
        {children}
      </a>
    </Magnetic>
  );
}
