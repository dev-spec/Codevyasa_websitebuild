import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { expertiseSlugs } from '@/content/expertise';
import { technologySlugs } from '@/content/technologies';
import { caseStudySlugs } from '@/content/caseStudies';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: string[] = [
    '/',
    '/work',
    '/about',
    '/contact',
    '/expertise',
    '/technology',
    '/privacy',
    '/terms',
    ...expertiseSlugs.map((s) => `/expertise/${s}`),
    ...technologySlugs.map((s) => `/technology/${s}`),
    ...caseStudySlugs.map((s) => `/case-study/${s}`),
  ];

  const withSlash = (p: string) => (p === '/' ? '/' : p.endsWith('/') ? p : `${p}/`);

  return paths.map((path) => ({
    url: `${site.url}${withSlash(path)}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.split('/').length > 2 ? 0.6 : 0.8,
  }));
}
