import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontDisplay, fontSans, fontMono } from './fonts';
import { site } from '@/content/site';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { PreloadProvider } from '@/components/providers/Preload';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackgroundField } from '@/components/BackgroundField';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import { Analytics } from '@/components/Analytics';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'CodeVyasa — Digital Acceleration | AI-first Product Engineering',
    template: '%s | CodeVyasa',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'CodeVyasa',
    'product engineering',
    'software development',
    'data engineering',
    'DevOps',
    'cloud',
    'artificial intelligence',
    'IoT',
    'outsourcing partner',
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: 'CodeVyasa — Digital Acceleration',
    description: site.description,
    url: `${site.url}/`,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'CodeVyasa — Digital Acceleration' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeVyasa — Digital Acceleration',
    description: site.description,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#070A0F',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-md focus:bg-[var(--bg-2)] focus:px-4 focus:py-2 focus:text-text-0"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <PreloadProvider>
            <BackgroundField />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </PreloadProvider>
        </SmoothScroll>

        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Analytics />
      </body>
    </html>
  );
}
