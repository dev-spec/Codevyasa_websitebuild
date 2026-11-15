import type { IconKey } from './types';

/**
 * Per-case visual theme (gradient + accent + service icon + motif). Kept in a
 * plain (non-'use client') module so both server components (case-study detail
 * page) and client components (cards) can call `caseTheme()`.
 */
export type MotifKind = 'dashboard' | 'app' | 'chart' | 'pipeline' | 'chip';

export interface CaseTheme {
  grad: string;
  accent: string;
  icon: IconKey;
  motif: MotifKind;
}

export const CASE_THEMES: CaseTheme[] = [
  { grad: 'linear-gradient(155deg,#0b3a52,#0e5a6b 60%,#0e7490)', accent: '#5eead4', icon: 'product', motif: 'dashboard' },
  { grad: 'linear-gradient(155deg,#12324f,#1e5a8a)', accent: '#7dd3fc', icon: 'mobile', motif: 'app' },
  { grad: 'linear-gradient(155deg,#1e2a5a,#3730a3)', accent: '#a5b4fc', icon: 'chart', motif: 'chart' },
  { grad: 'linear-gradient(155deg,#0e4a5a,#0891b2)', accent: '#5eead4', icon: 'shield', motif: 'dashboard' },
  { grad: 'linear-gradient(155deg,#0f2c48,#155e75)', accent: '#67e8f9', icon: 'pipeline', motif: 'pipeline' },
  { grad: 'linear-gradient(155deg,#10283a,#0e7490)', accent: '#5eead4', icon: 'chip', motif: 'chip' },
  { grad: 'linear-gradient(155deg,#1a2450,#2563a0)', accent: '#93c5fd', icon: 'devops', motif: 'pipeline' },
  { grad: 'linear-gradient(155deg,#0b3a52,#134e63 60%,#0e7490)', accent: '#5eead4', icon: 'bolt', motif: 'app' },
];

export function caseTheme(index: number): CaseTheme {
  return CASE_THEMES[index % CASE_THEMES.length];
}
