'use client';

import { Marquee } from '@/components/Marquee';
import { Reveal } from '@/components/Reveal';
import { clientLogos, trust, segments, type ClientLogo } from '@/content/site';
import { initials } from '@/lib/utils';

/** One tile: the company's real logo mark (forced white) — or a monogram mark
 *  until a real logo is supplied — followed by the company name. */
function LogoTile({ item }: { item: ClientLogo }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-3 opacity-95 transition-opacity duration-400 hover:opacity-100">
      {item.file ? (
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-2 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.file} alt="" draggable={false} className="h-full w-full object-contain" />
        </span>
      ) : (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/10 font-display text-sm font-semibold text-white">
          {initials(item.name)}
        </span>
      )}
      <span className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-white">
        {item.name}
      </span>
    </div>
  );
}

export function TrustWall() {
  const mid = Math.ceil(clientLogos.length / 2);
  const rowA = clientLogos.slice(0, mid);
  const rowB = clientLogos.slice(mid);

  return (
    <section id="trust" className="relative border-y border-[var(--border)] py-section-sm">
      <div className="shell">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4 text-center text-accent-400">Trusted partners</p>
          <h2 className="mx-auto max-w-3xl text-center text-h3 font-semibold text-text-0">{trust.line}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-body text-text-2">{trust.sub}</p>
        </Reveal>
      </div>

      {/* Full-bleed teal logo band (white logos), like a real client wall */}
      <div
        className="relative mt-12 overflow-hidden py-11"
        style={{ background: 'linear-gradient(160deg,#0b3a48 0%,#0e4e5e 55%,#0c3644 100%)' }}
      >
        <div className="grid-overlay pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
        <div className="relative space-y-8">
          <Marquee duration={44}>
            {rowA.map((c) => (
              <LogoTile key={c.name} item={c} />
            ))}
          </Marquee>
          <Marquee duration={52} reverse>
            {rowB.map((c) => (
              <LogoTile key={c.name} item={c} />
            ))}
          </Marquee>
        </div>
      </div>

      <div className="shell mt-12">
        <Reveal variant="fade-up">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {segments.map((s) => (
              <span
                key={s}
                className="rounded-pill border border-[var(--border-strong)] bg-[var(--bg-1)]/60 px-4 py-2 text-sm text-text-1 transition-colors hover:border-[var(--accent-400)] hover:text-text-0"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
