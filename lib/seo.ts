import type { Metadata } from 'next';
import { site } from '@/content/site';

interface PageSeo {
  title: string;
  description: string;
  path: string; // e.g. "/work"
  ogImage?: string;
}

/** Normalize to a trailing slash to match the static export (`trailingSlash: true`). */
export function canonicalUrl(path: string): string {
  const p = path === '/' ? '/' : path.endsWith('/') ? path : `${path}/`;
  return `${site.url}${p}`;
}

/** Build consistent per-page metadata (canonical + OG + Twitter). */
export function buildMetadata({ title, description, path, ogImage = '/og.png' }: PageSeo): Metadata {
  const url = canonicalUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${site.name} — ${title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
