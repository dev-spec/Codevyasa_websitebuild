import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with correct override precedence. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number to a range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Map a value from one range to another. */
export function mapRange(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);
}

/** First 1–2 initials from a name, uppercased (for avatar monograms). */
export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Turn a title into a URL-safe slug. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Parse a metric string like "200+", "90%", "4X", "12+" into a numeric target
 * plus prefix/suffix, so <StatCounter> can animate just the number.
 */
export function parseMetric(raw: string): { value: number; prefix: string; suffix: string; decimals: number } {
  const match = raw.match(/^([^0-9-]*)(-?[0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return { value: 0, prefix: '', suffix: raw, decimals: 0 };
  const [, prefix, num, suffix] = match;
  const decimals = num.includes('.') ? num.split('.')[1].length : 0;
  return { value: parseFloat(num), prefix: prefix ?? '', suffix: suffix ?? '', decimals };
}
