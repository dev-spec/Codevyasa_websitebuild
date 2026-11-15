'use client';

import { useEffect, useState } from 'react';
import { Section, SectionHeader } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/Button';
import { VideoModal } from '@/components/VideoModal';
import { TiltCard } from '@/components/TiltCard';
import { Icon } from '@/components/icons/Icon';
import { LogoMark } from '@/components/Logo';
import { founder, leadership, type Leader } from '@/content/leadership';
import { cn, initials } from '@/lib/utils';

/** Portrait frame with photo-or-monogram, glow, gradient border, floating badges. */
function Portrait({ leader }: { leader: Leader }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    const im = new window.Image();
    im.onload = () => live && setOk(true);
    im.onerror = () => live && setOk(false);
    im.src = leader.photo;
    return () => {
      live = false;
    };
  }, [leader.photo]);

  return (
    <TiltCard max={6} className="group mx-auto w-full max-w-sm">
      <div className="relative [transform-style:preserve-3d]">
        {/* ambient glow */}
        <div className="absolute -inset-6 -z-10 rounded-[32px] bg-grad-brand opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30" aria-hidden />

        {/* framed portrait */}
        <div className="gradient-border relative aspect-[4/5] overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-2)] shadow-card [transform:translateZ(40px)]">
          {ok ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={leader.photo} alt={leader.name} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <div className="grid-overlay absolute inset-0 opacity-30" aria-hidden />
              <span className="font-display text-[6rem] font-semibold leading-none text-gradient">{initials(leader.name)}</span>
            </div>
          )}
          {/* readability gradient + name plate */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-5 pt-14">
            <div className="font-display text-xl font-semibold text-white">{leader.name}</div>
            <div className="text-sm text-white/75">{leader.role}</div>
          </div>
        </div>

        {/* mark badge */}
        <div className="absolute -left-3 -top-3 grid h-12 w-12 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-1)] shadow-card [transform:translateZ(60px)]">
          <LogoMark size={26} />
        </div>

        {/* tenure chip */}
        {leader.tenure && (
          <div className="absolute -right-3 top-8 rounded-pill border border-[var(--border-strong)] bg-[var(--bg-1)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-text-1 shadow-card [transform:translateZ(60px)]">
            {leader.tenure}
          </div>
        )}

        {/* highlight stat */}
        {leader.highlight && (
          <div className="absolute -bottom-5 -left-4 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-1)] px-4 py-3 shadow-card [transform:translateZ(60px)]">
            <div className="text-gradient font-display text-2xl font-semibold leading-none">{leader.highlight.value}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-text-2">{leader.highlight.label}</div>
          </div>
        )}
      </div>
    </TiltCard>
  );
}

export function Founder() {
  const [videoOpen, setVideoOpen] = useState(false);
  const hasVideo = Boolean(founder.video?.src || founder.video?.youtubeId);

  return (
    <Section id="leadership" className="overflow-hidden">
      {/* mesh backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(45% 60% at 20% 30%, rgba(8,145,178,0.10), transparent 60%), radial-gradient(40% 50% at 85% 70%, rgba(45,212,191,0.09), transparent 60%)',
        }}
      />

      <SectionHeader
        eyebrow="Leadership"
        title={
          <>
            The <span className="text-gradient">vision</span> behind CodeVyasa
          </>
        }
      />

      <div className="mt-14 grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Reveal variant="scale">
          <Portrait leader={founder} />
        </Reveal>

        <Reveal variant="fade-up" delay={0.1}>
          <p className="eyebrow mb-6 text-accent-400">From the Founder</p>

          <figure>
            <div className="mb-2 font-display text-[3rem] font-bold leading-[0.7] text-[var(--accent-500)]/25" aria-hidden>
              &ldquo;
            </div>
            <blockquote className="max-w-2xl text-[clamp(1.4rem,2.6vw,2.15rem)] font-medium leading-snug text-text-0">
              {founder.message}
            </blockquote>
          </figure>

          <div className="mt-8 space-y-4 text-body-lg text-text-1">
            {founder.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <div>
              <div className="font-display text-lg font-semibold text-text-0">{founder.name}</div>
              <div className="text-sm text-text-2">{founder.role}</div>
            </div>
            {founder.linkedin && (
              <Button
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="sm"
                iconRight={<span aria-hidden>→</span>}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="globe" size={16} /> Connect on LinkedIn
                </span>
              </Button>
            )}

            {hasVideo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVideoOpen(true)}
                aria-haspopup="dialog"
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-accent-400/90 text-[var(--bg-0)]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Watch his story
                </span>
              </Button>
            )}
          </div>
        </Reveal>
      </div>

      {hasVideo && (
        <VideoModal
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
          src={founder.video?.src}
          youtubeId={founder.video?.youtubeId || undefined}
          poster={founder.video?.poster}
          title={founder.video?.title}
        />
      )}

      {/* additional executives (renders only if provided) */}
      {leadership.length > 0 && (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((l) => (
            <ExecCard key={l.name} leader={l} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ExecCard({ leader }: { leader: Leader }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    const im = new window.Image();
    im.onload = () => live && setOk(true);
    im.onerror = () => live && setOk(false);
    im.src = leader.photo;
    return () => {
      live = false;
    };
  }, [leader.photo]);

  return (
    <div className={cn('card-surface group overflow-hidden')}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-2)]">
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={leader.photo} alt={leader.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="font-display text-4xl font-semibold text-gradient">{initials(leader.name)}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="font-medium text-text-0">{leader.name}</div>
        <div className="text-sm text-accent-400">{leader.role}</div>
        {leader.bio[0] && <p className="mt-2 line-clamp-3 text-sm text-text-1">{leader.bio[0]}</p>}
      </div>
    </div>
  );
}
