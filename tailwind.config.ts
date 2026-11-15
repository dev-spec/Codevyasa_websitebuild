import type { Config } from 'tailwindcss';

/**
 * CodeVyasa design system — tokens mirror lib/motion.ts and app/globals.css.
 * Colors are wired to CSS variables so the light/dark themes swap without a rebuild.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'text-0': 'var(--text-0)',
        'text-1': 'var(--text-1)',
        'text-2': 'var(--text-2)',
        accent: {
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
        },
        violet: {
          500: 'var(--violet-500)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // fluid scale — clamp(min, preferred, max)
        'display-xl': ['clamp(5.5rem, 11vw, 10rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        h1: ['clamp(3.5rem, 7vw, 6.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        h2: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.75rem, 2.6vw, 2.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'body-lg': ['clamp(1.125rem, 1.4vw, 1.25rem)', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.65' }],
        eyebrow: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.16em' }],
      },
      spacing: {
        // px scale: 2,4,8,12,16,24,32,48,64,96,128,192
        '2px': '2px',
        18: '4.5rem',
        22: '5.5rem',
        section: 'clamp(4rem, 10vw, 12rem)',
        'section-sm': 'clamp(4rem, 8vw, 6rem)',
      },
      maxWidth: {
        shell: '1320px',
        prose: '68ch',
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 24px 80px -32px rgba(0,0,0,0.6)',
        'card-hover': '0 40px 120px -40px rgba(0,0,0,0.7)',
        glow: '0 0 40px rgba(34,211,238,0.35)',
        'inset-hi': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(120deg,#0891B2 0%,#22D3EE 50%,#2DD4BF 100%)',
        'grad-brand-soft': 'linear-gradient(120deg,rgba(8,145,178,0.14) 0%,rgba(34,211,238,0.14) 50%,rgba(45,212,191,0.14) 100%)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16,1,0.30,1)',
        'in-out': 'cubic-bezier(0.83,0,0.17,1)',
        soft: 'cubic-bezier(0.22,0.61,0.36,1)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
        600: '600ms',
        900: '900ms',
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        'marquee-x': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-x-reverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee-x var(--marquee-duration,40s) linear infinite',
        'marquee-reverse': 'marquee-x-reverse var(--marquee-duration,40s) linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'pulse-ring': 'pulse-ring 2.6s cubic-bezier(0.16,1,0.30,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
