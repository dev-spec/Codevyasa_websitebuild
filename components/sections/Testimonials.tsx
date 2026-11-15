'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { LogoMark } from '@/components/Logo';
import { testimonials } from '@/content/testimonials';
import type { Testimonial } from '@/content/types';
import { dur, ease, spring } from '@/lib/motion';
import { usePrefersReducedMotion, useMediaQuery } from '@/lib/hooks';
import { cn, slugify, initials } from '@/lib/utils';

const N = testimonials.length;
const HIGHLIGHT = 180; // active node locks to the left (toward the quote)

/**
 * Person avatar. Shows the real headshot from /public/assets/team/<slug>.jpg
 * when present; otherwise a polished gradient monogram. The image is preloaded
 * so a missing file never flashes a broken-image icon.
 * Drop headshots (400×400, square) named by slug — e.g. "sandesh-gs.jpg".
 */
function Avatar({ name, className }: { name: string; className?: string }) {
  const [ok, setOk] = useState(false);
  const src = `/assets/team/${slugify(name)}.jpg`;
  useEffect(() => {
    let live = true;
    const im = new window.Image();
    im.onload = () => live && setOk(true);
    im.onerror = () => live && setOk(false);
    im.src = src;
    return () => {
      live = false;
    };
  }, [src]);

  return (
    <span className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full', className)}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="grid h-full w-full place-items-center bg-grad-brand font-display text-sm font-semibold text-[#04121a]">
          {initials(name)}
        </span>
      )}
    </span>
  );
}

function OrbitNode({
  i,
  item,
  rotation,
  radius,
  isActive,
  onSelect,
}: {
  i: number;
  item: Testimonial;
  rotation: MotionValue<number>;
  radius: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const base = (i / N) * 360;
  const x = useTransform(rotation, (r) => radius * Math.cos(((base + r) * Math.PI) / 180));
  const y = useTransform(rotation, (r) => radius * Math.sin(((base + r) * Math.PI) / 180));

  return (
    <motion.div className="absolute left-1/2 top-1/2 z-10" style={{ x, y }}>
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.button
          type="button"
          onClick={onSelect}
          aria-label={`Show testimonial from ${item.name}${item.company ? `, ${item.company}` : ''}`}
          aria-pressed={isActive}
          animate={{ scale: isActive ? 1.32 : 1 }}
          transition={spring.soft}
          className="relative grid h-[54px] w-[54px] place-items-center rounded-full"
        >
          {item.logo ? (
            <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.logo}
                alt=""
                draggable={false}
                className={cn('h-7 w-7 object-contain transition duration-500', isActive ? 'grayscale-0' : 'grayscale')}
              />
            </span>
          ) : (
            <span
              className={cn(
                'grid h-full w-full place-items-center rounded-full border font-display text-sm font-semibold transition-colors',
                isActive
                  ? 'border-[var(--accent-400)] bg-[var(--bg-2)] text-accent-400'
                  : 'border-[var(--border-strong)] bg-[var(--surface)] text-text-2'
              )}
            >
              {initials(item.name)}
            </span>
          )}
          {isActive && (
            <>
              <span className="pointer-events-none absolute -inset-1.5 rounded-full ring-2 ring-[var(--accent-400)]" style={{ boxShadow: '0 0 24px rgba(34,211,238,0.5)' }} />
              <span className="pointer-events-none absolute -inset-1.5 animate-pulse-ring rounded-full ring-1 ring-[var(--accent-400)]" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const isLg = useMediaQuery('(min-width: 1024px)');
  const size = isLg ? 440 : 340;
  const radius = Math.round(size * 0.38);

  const rotation = useSpring(HIGHLIGHT, { stiffness: 55, damping: 16, mass: 1 });
  const rotRef = useRef(HIGHLIGHT);

  // Rotate the ring so the active node lands on the highlight angle (shortest path).
  useEffect(() => {
    const desired = HIGHLIGHT - (active / N) * 360;
    let delta = (((desired - rotRef.current) % 360) + 540) % 360 - 180;
    rotRef.current += delta;
    if (reduced) rotation.jump(rotRef.current);
    else rotation.set(rotRef.current);
  }, [active, reduced, rotation]);

  const go = (next: number) => {
    const n = (next + N) % N;
    setDir(n === (active + 1) % N ? 1 : -1);
    setActive(n);
  };

  useEffect(() => {
    if (paused || userPaused || reduced) return;
    const id = setInterval(() => {
      setDir(1);
      setActive((a) => (a + 1) % N);
    }, 5200);
    return () => clearInterval(id);
  }, [paused, userPaused, reduced]);

  const t = testimonials[active];

  return (
    <Section id="testimonials" className="overflow-hidden">
      <SectionHeader
        eyebrow="Client Tales"
        title={
          <>
            Partners in <span className="text-gradient">our orbit</span>
          </>
        }
      />

      <div
        className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Quote */}
        <div className="relative order-2 lg:order-1">
          <div
            aria-hidden
            className="mb-2 select-none font-display text-[3.5rem] font-bold leading-[0.7] text-[var(--accent-500)]/25 md:text-[4.5rem]"
          >
            &ldquo;
          </div>
          <div className="relative min-h-[260px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.blockquote
                key={active}
                custom={dir}
                initial={{ opacity: 0, y: reduced ? 0 : 24, filter: reduced ? 'blur(0px)' : 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: reduced ? 0 : -24, filter: reduced ? 'blur(0px)' : 'blur(6px)' }}
                transition={{ duration: dur.md, ease: ease.out }}
              >
                <p className="max-w-2xl text-[clamp(1.2rem,2.3vw,1.9rem)] font-medium leading-snug text-text-0">
                  {t.quote}
                </p>
                <footer className="mt-8 flex items-center gap-4">
                  <Avatar name={t.name} className="h-12 w-12 border border-[var(--border-strong)]" />
                  <span>
                    <span className="block font-medium text-text-0">{t.name}</span>
                    <span className="block text-sm text-text-2">
                      {t.title}
                      {t.company ? ` · ${t.company}` : ''}
                    </span>
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* controls */}
          <div className="mt-8 flex items-center gap-5">
            <div className="flex gap-2">
              <ControlBtn label="Previous" onClick={() => go(active - 1)} left />
              {!reduced && (
                <button
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'Play testimonials' : 'Pause testimonials'}
                  aria-pressed={userPaused}
                  className="grid h-11 w-11 place-items-center rounded-pill border border-[var(--border-strong)] text-text-0 transition-colors hover:border-[var(--accent-400)] hover:text-accent-400"
                >
                  {userPaused ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  )}
                </button>
              )}
              <ControlBtn label="Next" onClick={() => go(active + 1)} />
            </div>
            <div className="flex gap-2">
              {testimonials.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === active}
                  className={cn(
                    'h-2 rounded-pill transition-all duration-400',
                    i === active ? 'w-8 bg-grad-brand' : 'w-2 bg-[var(--border-strong)] hover:bg-text-2'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orbit */}
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative aspect-square" style={{ width: size, height: size }}>
            {/* rings */}
            <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} className="absolute inset-0 h-full w-full" aria-hidden>
              <circle r={radius} fill="none" stroke="var(--border)" />
              <circle r={radius * 0.66} fill="none" stroke="var(--border)" />
              <circle r={radius * 0.33} fill="none" stroke="var(--border)" />
              <g className={reduced ? undefined : 'origin-center animate-spin [animation-duration:44s]'} style={{ transformBox: 'fill-box' }}>
                <circle r={radius} fill="none" stroke="var(--accent-500)" strokeOpacity={0.35} strokeDasharray="3 12" strokeLinecap="round" />
              </g>
            </svg>

            {/* beam center → active (left) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-px -translate-y-1/2" style={{ width: radius, transform: `translate(-100%, -50%)` }}>
              <div className="h-full w-full animate-pulse" style={{ background: 'linear-gradient(90deg, var(--accent-400), transparent)' }} />
            </div>

            {/* center hub */}
            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="relative grid h-16 w-16 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-1)]">
                <LogoMark size={34} />
                <span className="pointer-events-none absolute inset-0 animate-pulse-ring rounded-full ring-1 ring-[var(--accent-400)]" />
              </div>
            </div>

            {/* nodes */}
            {testimonials.map((item, i) => (
              <OrbitNode
                key={item.name}
                i={i}
                item={item}
                rotation={rotation}
                radius={radius}
                isActive={i === active}
                onSelect={() => go(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function ControlBtn({ onClick, label, left }: { onClick: () => void; label: string; left?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-pill border border-[var(--border-strong)] text-text-0 transition-colors hover:border-[var(--accent-400)] hover:text-accent-400"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={left ? 'rotate-180' : ''}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
