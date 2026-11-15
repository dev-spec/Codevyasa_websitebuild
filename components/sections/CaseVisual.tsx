'use client';

import { Icon } from '@/components/icons/Icon';
import type { CaseStudy } from '@/content/types';
import { caseTheme, type MotifKind } from '@/content/caseThemes';
import { cn } from '@/lib/utils';

/**
 * Rich, on-brand illustrated header for a case-study card. Because most cases
 * are NDA/anonymized (no real client logos or product screenshots), we render a
 * bespoke themed motif (dashboard / app / chart / pipeline / chip) so each card
 * reads like a real product story instead of a bare number.
 * Theme data lives in content/caseThemes.ts (server-safe).
 */

/* --------------------------------- motifs ----------------------------------- */

function Dashboard({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 240" className="h-[88%] w-[88%]" preserveAspectRatio="xMidYMid meet">
      <rect x="52" y="34" width="296" height="172" rx="14" fill="#ffffff" />
      <circle cx="70" cy="50" r="3.5" fill="#cbd5e1" />
      <circle cx="82" cy="50" r="3.5" fill="#cbd5e1" />
      <circle cx="94" cy="50" r="3.5" fill="#cbd5e1" />
      <line x1="52" y1="64" x2="348" y2="64" stroke="#e2e8f0" strokeWidth="1.5" />
      {[70, 162, 254].map((x, i) => (
        <g key={i}>
          <rect x={x} y="78" width="76" height="42" rx="8" fill="#f1f5f9" />
          <rect x={x + 10} y="88" width="22" height="9" rx="2" fill={accent} />
          <rect x={x + 10} y="103" width="44" height="6" rx="3" fill="#e2e8f0" />
        </g>
      ))}
      <rect x="70" y="132" width="260" height="60" rx="8" fill="#f8fafc" />
      <polygon
        points="80,186 116,164 152,172 188,146 224,156 260,126 296,136 320,116 320,186"
        fill={accent}
        opacity="0.14"
      />
      <polyline
        points="80,186 116,164 152,172 188,146 224,156 260,126 296,136 320,116"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="116" r="4.5" fill={accent} />
    </svg>
  );
}

function App({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 240" className="h-[92%] w-[92%]" preserveAspectRatio="xMidYMid meet">
      <g transform="rotate(-9 150 130)" opacity="0.45">
        <rect x="92" y="40" width="98" height="184" rx="18" fill="#ffffff" />
      </g>
      <g>
        <rect x="150" y="26" width="108" height="196" rx="20" fill="#ffffff" />
        <rect x="192" y="34" width="24" height="4" rx="2" fill="#cbd5e1" />
        <rect x="160" y="48" width="88" height="34" rx="9" fill={accent} />
        <rect x="168" y="58" width="40" height="7" rx="3" fill="#ffffff" opacity="0.85" />
        <rect x="168" y="70" width="26" height="6" rx="3" fill="#ffffff" opacity="0.6" />
        {[94, 118, 142].map((y, i) => (
          <g key={i}>
            <circle cx="172" cy={y + 8} r="7" fill="#e2e8f0" />
            <rect x="186" y={y + 2} width="56" height="6" rx="3" fill="#eef2f7" />
            <rect x="186" y={y + 12} width="34" height="5" rx="2.5" fill="#f1f5f9" />
          </g>
        ))}
        {[168, 186, 204, 222].map((x, i) => {
          const h = [16, 26, 20, 32][i];
          return <rect key={i} x={x} y={200 - h} width="10" height={h} rx="3" fill={i === 3 ? accent : '#e2e8f0'} />;
        })}
      </g>
    </svg>
  );
}

function Chart({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 240" className="h-[88%] w-[88%]" preserveAspectRatio="xMidYMid meet">
      <rect x="50" y="38" width="300" height="164" rx="14" fill="#ffffff" />
      {[74, 106, 138, 170].map((y) => (
        <line key={y} x1="70" y1={y} x2="330" y2={y} stroke="#eef2f7" strokeWidth="1.5" />
      ))}
      {[86, 124, 162, 200, 238, 276].map((x, i) => {
        const h = [30, 44, 40, 62, 74, 92][i];
        return <rect key={i} x={x} y={182 - h} width="20" height={h} rx="4" fill="#e2e8f0" />;
      })}
      <polygon points="80,150 130,132 180,138 230,108 280,96 320,72 320,182 80,182" fill={accent} opacity="0.13" />
      <polyline
        points="80,150 130,132 180,138 230,108 280,96 320,72"
        fill="none"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="72" r="5" fill={accent} />
      <path d="M304 66 h18 v18" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function Pipeline({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 240" className="h-[86%] w-[86%]" preserveAspectRatio="xMidYMid meet">
      <line x1="70" y1="120" x2="330" y2="120" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
      <line x1="70" y1="120" x2="250" y2="120" stroke={accent} strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
      {[70, 160, 250, 330].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="120" r="18" fill="#ffffff" />
          {i === 0 || i === 3 ? (
            <g>
              <ellipse cx={x} cy="114" rx="9" ry="3.4" fill="none" stroke={accent} strokeWidth="2" />
              <path d={`M${x - 9} 114 v10 a9 3.4 0 0 0 18 0 v-10`} fill="none" stroke={accent} strokeWidth="2" />
            </g>
          ) : (
            <circle cx={x} cy="120" r="6" fill={accent} />
          )}
        </g>
      ))}
      <circle cx="205" cy="120" r="5" fill="#ffffff" />
      {[
        [160, 66],
        [250, 66],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1="102" x2={x} y2={y + 20} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
          <rect x={x - 30} y={y} width="60" height="26" rx="7" fill="#ffffff" opacity="0.9" />
          <rect x={x - 20} y={y + 8} width="26" height="5" rx="2.5" fill="#cbd5e1" />
          <circle cx={x + 16} cy={y + 13} r="3.5" fill={accent} />
        </g>
      ))}
    </svg>
  );
}

function Chip({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 240" className="h-[86%] w-[86%]" preserveAspectRatio="xMidYMid meet">
      {[
        [96, 70],
        [304, 70],
        [96, 170],
        [304, 170],
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1="200" y1="120" x2={x} y2={y} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="10" fill="none" stroke={accent} strokeWidth="2" />
          <circle cx={x} cy={y} r="3.5" fill={accent} />
        </g>
      ))}
      {/* pins */}
      {[-30, -10, 10, 30].map((o, i) => (
        <g key={i}>
          <rect x={200 + o - 3} y="70" width="6" height="10" rx="2" fill="#ffffff" opacity="0.7" />
          <rect x={200 + o - 3} y="160" width="6" height="10" rx="2" fill="#ffffff" opacity="0.7" />
          <rect x="130" y={120 + o - 3} width="10" height="6" rx="2" fill="#ffffff" opacity="0.7" />
          <rect x="260" y={120 + o - 3} width="10" height="6" rx="2" fill="#ffffff" opacity="0.7" />
        </g>
      ))}
      <rect x="152" y="80" width="96" height="80" rx="12" fill="#ffffff" />
      <rect x="168" y="96" width="64" height="48" rx="8" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="200" cy="120" r="9" fill={accent} />
    </svg>
  );
}

function Motif({ kind, accent }: { kind: MotifKind; accent: string }) {
  switch (kind) {
    case 'app':
      return <App accent={accent} />;
    case 'chart':
      return <Chart accent={accent} />;
    case 'pipeline':
      return <Pipeline accent={accent} />;
    case 'chip':
      return <Chip accent={accent} />;
    default:
      return <Dashboard accent={accent} />;
  }
}

/** Just the illustrated motif (no card chrome) — used large in the detail hero. */
export function CaseMotif({ index, className }: { index: number; className?: string }) {
  const theme = caseTheme(index);
  return (
    <div className={cn('grid place-items-center', className)}>
      <Motif kind={theme.motif} accent={theme.accent} />
    </div>
  );
}

export function CaseVisual({ index, card, className }: { index: number; card: CaseStudy; className?: string }) {
  const theme = caseTheme(index);
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: theme.grad }}>
      <div className="grid-overlay absolute inset-0 opacity-20" aria-hidden />
      <span
        className="pointer-events-none absolute -bottom-8 right-1 select-none font-display text-[8.5rem] font-semibold leading-none text-white/[0.06]"
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-white/10 backdrop-blur" style={{ color: theme.accent }}>
          <Icon name={theme.icon} size={18} />
        </span>
        <span className="rounded-pill bg-black/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur">
          {card.industry}
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pt-6">
        <Motif kind={theme.motif} accent={theme.accent} />
      </div>
    </div>
  );
}
