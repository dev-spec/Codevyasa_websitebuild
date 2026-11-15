'use client';

import { useRef } from 'react';
import { motion, useAnimationFrame, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Section, SectionHeader } from '@/components/Section';
import { Reveal, RevealItem } from '@/components/Reveal';
import { RollingNumber } from '@/components/RollingNumber';
import { Icon } from '@/components/icons/Icon';
import type { IconKey } from '@/content/types';
import { stats } from '@/content/site';

/** A fitting icon per metric (adds meaning + a designer accent chip). */
const STAT_ICON: Record<string, IconKey> = {
  'Projects Undertaken': 'product',
  Technocrats: 'brain',
  CAGR: 'chart',
  'Client Retention Rate': 'refresh',
  Clients: 'support',
  Industries: 'globe',
};

/* =============================================================================
   REVERT: set USE_3D_SCENE = false to restore the flat responsive grid.
   The revolving 3D carousel lives below the flag; nothing else changes.
   ========================================================================== */
const USE_3D_SCENE = true;

/** A compounding growth curve that draws itself, then keeps a pulsing tip alive. */
function CompoundSparkline({ delay = 0, reduced }: { delay?: number; reduced: boolean }) {
  const line = 'M0 34 C 18 33 30 31 44 25 S 76 9 100 3';
  const area = `${line} L100 40 L0 40 Z`;
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full" aria-hidden>
      <defs>
        <linearGradient id="cvSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-400)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--accent-400)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cvSparkLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#cvSparkFill)"
        initial={{ opacity: reduced ? 0.85 : 0 }}
        whileInView={{ opacity: 0.85 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, delay: delay + 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="url(#cvSparkLine)"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay }}
      />
      <motion.circle
        cx="100" cy="3" r="2" fill="#2dd4bf" vectorEffect="non-scaling-stroke"
        initial={{ opacity: reduced ? 1 : 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, delay: delay + 1.4 }}
        style={{ filter: 'drop-shadow(0 0 3px rgba(45,212,191,0.9))' }}
      />
      {!reduced && (
        <motion.circle
          cx="100" cy="3" r="2" fill="none" stroke="#2dd4bf" strokeWidth="1" vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0.55, 0, 0.55], scale: [1, 3.2, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: delay + 1.6 }}
          style={{ transformOrigin: '100px 3px' }}
        />
      )}
    </svg>
  );
}

/** A single diagonal light-sheen sweep across a card as it reveals. */
function Sheen({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.10) 50%, transparent 65%)', mixBlendMode: 'screen' }}
      initial={{ x: '-120%' }}
      whileInView={{ x: '120%' }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.1, ease: 'easeInOut', delay: delay + 0.35 }}
    />
  );
}

/** Shared premium metric card (used by both the grid and the 3D carousel). */
function StatCardInner({ value, label, index, reduced }: { value: string; label: string; index: number; reduced: boolean }) {
  const icon = STAT_ICON[label] ?? 'spark';
  return (
    <div className="group/card relative h-full [--ring:linear-gradient(150deg,rgba(34,211,238,0.6),rgba(148,163,184,0.14)_44%,rgba(45,212,191,0.55))]">
      {/* gradient border ring + soft colored float-shadow */}
      <div
        className="relative h-full overflow-hidden rounded-[22px] p-[1.5px] shadow-[0_24px_50px_-26px_rgba(8,110,135,0.55)] transition-transform duration-500 will-change-transform group-hover/card:-translate-y-1"
        style={{ background: 'var(--ring)' }}
      >
        <div className="relative flex h-full min-h-[172px] flex-col overflow-hidden rounded-[20px] bg-[var(--surface)] p-6">
          {/* glass gloss */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
          {/* brand-glow corner */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-grad-brand opacity-20 blur-2xl transition-opacity duration-500 group-hover/card:opacity-40"
          />
          {/* faint grid texture */}
          <span aria-hidden className="grid-overlay pointer-events-none absolute inset-0 opacity-[0.12]" />
          {/* growth chart footer */}
          <CompoundSparkline delay={0.15 + index * 0.08} reduced={reduced} />
          <Sheen delay={index * 0.06} />

          {/* metric icon chip */}
          <span className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-1)] text-accent-400 shadow-[0_2px_12px_rgba(8,110,135,0.18)]">
            <Icon name={icon} size={19} />
          </span>

          {/* number + label */}
          <div className="relative z-10 pr-12">
            <div className="font-display font-semibold leading-none text-text-0 [font-size:clamp(2.1rem,3.2vw,3rem)]">
              <RollingNumber value={value} />
            </div>
            <div className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-text-2">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Flat grid layout ------------------------------ */
function GridScene({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start end', 'end start'] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y = reduced ? 0 : yRaw;

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div ref={wrapRef} className="mt-14 [perspective:1500px]">
      <motion.div onMouseMove={reduced ? undefined : onMove} className="group/grid relative" style={reduced ? undefined : { y }}>
        <Reveal stagger="base" className="grid grid-cols-2 gap-4 md:grid-cols-4" as="div">
          {stats.map((s, i) => (
            <RevealItem key={s.label} variant="scale" className={i === 0 ? 'md:col-span-2' : ''}>
              <StatCardInner value={s.value} label={s.label} index={i} reduced={reduced} />
            </RevealItem>
          ))}
        </Reveal>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover/grid:opacity-100"
          style={{
            background: 'radial-gradient(340px circle at var(--mx, -200px) var(--my, -200px), rgba(34,211,238,0.22), rgba(45,212,191,0.08) 42%, transparent 64%)',
            mixBlendMode: 'screen',
          }}
        />
      </motion.div>
    </div>
  );
}

/* ------------------------- Revolving 3D carousel ---------------------------- */
// Cards sit evenly around a tilted ellipse and continuously revolve around the
// centre. Front cards ride lower + larger, back cards higher + smaller. Each
// card stays upright (billboarded) so its number stays readable. Drag to spin.
const N = stats.length;
const R = 340; // horizontal radius
const RY = 96; // vertical radius (the plane tilt)
const MIN_S = 0.72;
const MAX_S = 1.14;
const SPEED = 15; // degrees per second

function pose(i: number, angleDeg: number) {
  const th = ((angleDeg + i * (360 / N)) * Math.PI) / 180;
  const x = Math.sin(th) * R;
  const depth = Math.cos(th); // 1 = front/near, -1 = back/far
  const y = depth * RY;
  const scale = MIN_S + ((depth + 1) / 2) * (MAX_S - MIN_S);
  return {
    transform: `translate(-50%,-50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
    zIndex: Math.round((depth + 1) * 1000),
    opacity: 0.55 + ((depth + 1) / 2) * 0.45,
  };
}

function RevolveScene({ reduced }: { reduced: boolean }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(0);
  const lastT = useRef(0);
  const drag = useRef({ active: false, startX: 0, startAngle: 0 });

  useAnimationFrame((t) => {
    const dt = lastT.current ? Math.min((t - lastT.current) / 1000, 0.05) : 0;
    lastT.current = t;
    if (!reduced && !drag.current.active) angleRef.current += SPEED * dt;
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const p = pose(i, angleRef.current);
      el.style.transform = p.transform;
      el.style.zIndex = String(p.zIndex);
      el.style.opacity = String(p.opacity);
    }
  });

  const onDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startAngle: angleRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    angleRef.current = drag.current.startAngle + (e.clientX - drag.current.startX) * 0.35;
  };
  const onUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).style.cursor = 'grab';
  };

  return (
    <div className="mt-4 hidden lg:block [perspective:1400px]">
      <div
        className="relative mx-auto touch-none select-none"
        style={{ width: 1000, height: 480, maxWidth: '100%', cursor: reduced ? 'default' : 'grab' }}
        onPointerDown={reduced ? undefined : onDown}
        onPointerMove={reduced ? undefined : onMove}
        onPointerUp={reduced ? undefined : onUp}
        onPointerCancel={reduced ? undefined : onUp}
      >
        {stats.map((s, i) => {
          const p = pose(i, 0);
          return (
            <div
              key={s.label}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 w-[236px]"
              style={{ transform: p.transform, zIndex: p.zIndex, opacity: p.opacity, willChange: 'transform' }}
            >
              <StatCardInner value={s.value} label={s.label} index={i} reduced={reduced} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Stats() {
  const reduced = useReducedMotion() ?? false;

  return (
    <Section id="stats" container={false} className="overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(45% 55% at 18% 25%, rgba(8,145,178,0.14), transparent 60%), radial-gradient(40% 50% at 85% 70%, rgba(45,212,191,0.12), transparent 60%)',
        }}
        animate={reduced ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="shell">
        <SectionHeader
          eyebrow="Quantifying Excellence"
          title={
            <>
              Numbers that <span className="text-gradient">compound</span>
            </>
          }
          intro="A track record built on retention, growth and depth — not vanity metrics."
        />

        {USE_3D_SCENE ? (
          <>
            {/* mobile / tablet → flat grid; large screens → revolving carousel */}
            <div className="lg:hidden">
              <GridScene reduced={reduced} />
            </div>
            <RevolveScene reduced={reduced} />
          </>
        ) : (
          <GridScene reduced={reduced} />
        )}
      </div>
    </Section>
  );
}
