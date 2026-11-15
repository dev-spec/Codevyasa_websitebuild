'use client';

import { motion } from 'framer-motion';
import { Terminal } from '@/components/Terminal';
import { usePrefersReducedMotion } from '@/lib/hooks';

/** Bespoke animated motif per expertise pillar (Part E §4). */
export function PillarVisual({ id }: { id: string }) {
  const reduced = usePrefersReducedMotion();
  const anim = (extra: any): any => (reduced ? undefined : extra);

  if (id === 'ai') {
    return (
      <div className="grid h-full gap-3">
        <div className="card-surface overflow-hidden rounded-lg">
          <Terminal
            lines={[
              'load model codevyasa/genai-assistant',
              'index knowledge_base --chunks 12480',
              'agent.run("summarise Q3 ops")  ✓',
              'eval: grounded=0.98  hallucination=0.01',
              'deploy --guardrails on  → live',
            ]}
          />
        </div>
      </div>
    );
  }

  if (id === 'data') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[40, 110, 180].map((y, r) => (
          <g key={r}>
            {[40, 160, 280].map((x, c) => (
              <motion.circle
                key={c}
                cx={x}
                cy={y}
                r={9}
                fill="none"
                stroke="url(#pv-grad)"
                strokeWidth={1.5}
                initial={anim({ opacity: 0.3 })}
                animate={anim({ opacity: [0.3, 1, 0.3] })}
                transition={{ duration: 2.4, repeat: Infinity, delay: (r + c) * 0.2 }}
              />
            ))}
          </g>
        ))}
        {[40, 110, 180].map((y) =>
          [
            [49, 151],
            [169, 271],
          ].map(([x1, x2], i) => (
            <line key={`${y}-${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke="var(--border-strong)" strokeWidth={1} />
          ))
        )}
        <motion.circle
          cx={40}
          cy={40}
          r={4}
          fill="#22d3ee"
          initial={anim({ cx: 40 })}
          animate={anim({ cx: [40, 280], cy: [40, 180] })}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0891B2" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (id === 'devops') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x={30 + i * 72}
            y={90}
            width={54}
            height={40}
            rx={6}
            fill="none"
            stroke="url(#pv-grad2)"
            strokeWidth={1.5}
            initial={anim({ y: 90, opacity: 0.4 })}
            animate={anim({ y: [90, 82, 90], opacity: [0.4, 1, 0.4] })}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        <motion.path
          d="M30 70 H290"
          stroke="#22d3ee"
          strokeWidth={1.5}
          strokeDasharray="6 8"
          initial={anim({ strokeDashoffset: 0 })}
          animate={anim({ strokeDashoffset: [0, -28] })}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        <text x="30" y="60" className="fill-[color:var(--text-2)]" style={{ font: '11px var(--font-mono)' }}>
          build → test → deploy → monitor
        </text>
        <defs>
          <linearGradient id="pv-grad2" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#0891B2" />
            <stop offset="1" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (id === 'iot') {
    return (
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <circle cx="160" cy="110" r="14" fill="none" stroke="#22d3ee" strokeWidth={1.6} />
        <circle cx="160" cy="110" r="4" fill="#22d3ee" />
        {[
          [60, 50],
          [260, 50],
          [60, 170],
          [260, 170],
          [160, 30],
          [160, 190],
        ].map(([x, y], i) => (
          <g key={i}>
            <line x1="160" y1="110" x2={x} y2={y} stroke="var(--border-strong)" strokeWidth={1} />
            <motion.circle
              cx={x}
              cy={y}
              r={7}
              fill="none"
              stroke="url(#pv-grad)"
              strokeWidth={1.5}
              initial={anim({ scale: 1 })}
              animate={anim({ opacity: [0.4, 1, 0.4] })}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            />
          </g>
        ))}
        <defs>
          <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0891B2" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // product (default) — a live "product dashboard building itself"
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full">
      <defs>
        <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0891B2" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="pv-area" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#22D3EE" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* window frame */}
      <rect x="18" y="18" width="284" height="184" rx="16" fill="rgba(255,255,255,0.02)" stroke="var(--border-strong)" />
      <circle cx="34" cy="34" r="3" fill="#3a4a5a" />
      <circle cx="46" cy="34" r="3" fill="#3a4a5a" />
      <circle cx="58" cy="34" r="3" fill="#3a4a5a" />
      <line x1="18" y1="48" x2="302" y2="48" stroke="var(--border)" />

      {/* chart card: line draws + area fades + dot travels */}
      <rect x="32" y="60" width="150" height="86" rx="10" fill="rgba(255,255,255,0.02)" stroke="var(--border)" />
      {[80, 102, 124].map((y) => (
        <line key={y} x1="40" y1={y} x2="174" y2={y} stroke="var(--border)" strokeOpacity="0.5" />
      ))}
      <motion.path
        d="M40 130 L66 112 L94 120 L122 96 L150 104 L174 88 L174 140 L40 140 Z"
        fill="url(#pv-area)"
        initial={anim({ opacity: 0 })}
        animate={anim({ opacity: [0, 0.9, 0.9, 0] })}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.35, 0.85, 1] }}
      />
      <motion.path
        d="M40 130 L66 112 L94 120 L122 96 L150 104 L174 88"
        fill="none"
        stroke="url(#pv-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={anim({ pathLength: 0 })}
        animate={anim({ pathLength: [0, 1, 1] })}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.35, 1], ease: 'easeInOut' }}
      />
      <motion.circle
        cx="174"
        cy="88"
        r="4"
        fill="#22d3ee"
        initial={anim({ cx: 40, cy: 130 })}
        animate={anim({ cx: [40, 66, 94, 122, 150, 174], cy: [130, 112, 120, 96, 104, 88] })}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.07, 0.14, 0.21, 0.28, 0.35], ease: 'easeInOut' }}
      />

      {/* KPI tile (blinks) */}
      <motion.rect
        x="196"
        y="60"
        width="90"
        height="38"
        rx="8"
        fill="rgba(255,255,255,0.02)"
        stroke="var(--border)"
        initial={anim({ opacity: 0.7 })}
        animate={anim({ opacity: [0.7, 1, 0.7] })}
        transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.55], ease: 'easeInOut' }}
      />
      <rect x="206" y="70" width="18" height="8" rx="2" fill="url(#pv-grad)" />
      <rect x="206" y="84" width="44" height="5" rx="2.5" fill="var(--border-strong)" />

      {/* progress card: bar fills */}
      <rect x="196" y="108" width="90" height="38" rx="8" fill="rgba(255,255,255,0.02)" stroke="var(--border)" />
      <rect x="206" y="118" width="70" height="5" rx="2.5" fill="var(--border)" />
      <motion.rect
        x="206"
        y="118"
        width="35"
        height="5"
        rx="2.5"
        fill="url(#pv-grad)"
        initial={anim({ width: 0 })}
        animate={anim({ width: [0, 70, 70, 0] })}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.85, 1], ease: 'easeInOut' }}
      />
      <rect x="206" y="132" width="30" height="5" rx="2.5" fill="var(--border-strong)" />

      {/* KPI ripple bars */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.rect
          key={i}
          x={40 + i * 22}
          y="174"
          width="12"
          height="8"
          rx="3"
          fill={i === 3 ? '#22d3ee' : 'var(--border-strong)'}
          initial={anim({ height: 8, y: 174 })}
          animate={anim({ height: [8, 26, 8], y: [174, 156, 174] })}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}

      {/* pulsing accent */}
      <motion.circle
        cx="290"
        cy="34"
        r="3"
        fill="#22d3ee"
        initial={anim({ opacity: 0.4 })}
        animate={anim({ opacity: [0.4, 1, 0.4] })}
        transition={{ duration: 1.6, repeat: Infinity }}
      />

      {/* cursor — moves & clicks */}
      {!reduced && (
        <motion.g
          initial={{ x: 150, y: 150 }}
          animate={{ x: [150, 244, 244, 150, 150], y: [150, 74, 74, 150, 150] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.35, 0.55, 0.9, 1], ease: 'easeInOut' }}
        >
          <path
            d="M0 0 L0 15 L4 11 L7 17 L10 16 L7 10 L12 10 Z"
            fill="#ffffff"
            stroke="#04121a"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </motion.g>
      )}
    </svg>
  );
}
