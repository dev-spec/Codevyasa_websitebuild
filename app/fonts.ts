import localFont from 'next/font/local';

/**
 * Self-hosted fonts (public/fonts). Self-hosting keeps zero external font
 * requests at runtime — essential for a site that may be deployed behind a CMS
 * or on an offline/company network, and it eliminates layout-shift from FOUT.
 *
 *  Display : Clash Display (Fontshare) — the editorial grotesk, our #1 anti-AI signal.
 *  Body/UI : Inter Tight (Google/Fontsource).
 *  Mono    : JetBrains Mono — eyebrows, labels, stats, terminal easter-egg.
 */

export const fontDisplay = localFont({
  src: [
    { path: '../public/fonts/ClashDisplay-Variable.woff2', weight: '200 700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Space Grotesk', 'system-ui', 'sans-serif'],
  preload: true,
});

export const fontSans = localFont({
  src: [
    { path: '../public/fonts/InterTight-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/InterTight-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/InterTight-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/InterTight-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
  preload: true,
});

export const fontMono = localFont({
  src: [
    { path: '../public/fonts/JetBrainsMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/JetBrainsMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  preload: false,
});
