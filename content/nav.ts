import { pillars } from './expertise';
import { technologyPages, technologyCategories } from './technologies';
import type { TechnologyPage } from './types';

export interface NavLink {
  label: string;
  href: string;
}

export type MegaKind = 'expertise' | 'technology';

export interface PrimaryNavItem {
  label: string;
  href: string;
  mega?: MegaKind;
}

/** Header primary navigation. Labels are display-only; routes are unchanged. */
export const primaryNav: PrimaryNavItem[] = [
  { label: 'Services', href: '/expertise', mega: 'expertise' },
  { label: 'Products', href: '/technology', mega: 'technology' },
  { label: 'Insights', href: '/work' },
  { label: 'Resources', href: '/resources' },
  { label: 'About Us', href: '/about' },
];

/** The mega-menu columns for "Our Expertise" — one column per pillar. */
export const expertiseMega = pillars.map((p) => ({
  id: p.id,
  heading: p.menuLabel,
  icon: p.icon,
  blurb: p.blurb,
  links: p.subServices.map((s) => ({ label: s.label, href: `/expertise/${s.slug}` })),
}));

/** The mega-menu columns for "Our Technologies" — one column per category. */
export const technologyMega = technologyCategories.map((cat) => ({
  id: cat.toLowerCase(),
  heading: cat,
  links: technologyPages
    .filter((t: TechnologyPage) => t.category === cat)
    .map((t) => ({ label: t.name, href: `/technology/${t.slug}` })),
}));

/** Footer link columns — labels + targets match the live footer exactly. */
export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Expertise',
    links: [
      { label: 'Gen AI', href: '/expertise/gen-ai' },
      { label: 'DevOps Consulting', href: '/expertise/devops-consulting' },
      { label: 'Cloud Enablement Services', href: '/expertise/cloud-enablement-services' },
      { label: 'Data Lake and Pipeline Design', href: '/expertise/data-lake-and-pipeline-design' },
      { label: 'Quality Control', href: '/expertise/quality-control' },
      { label: 'Application Modernization', href: '/expertise/application-modernization' },
      { label: 'Mobile Application Development', href: '/expertise/mobile-application-development' },
      { label: 'UX / UI Design', href: '/expertise/ux-ui-design' },
    ],
  },
  {
    heading: 'Technologies',
    links: [
      { label: 'Golang', href: '/technology/go-lang' },
      { label: 'Javascript', href: '/technology/javascript' },
      { label: 'Java', href: '/technology/java' },
      { label: 'React Native', href: '/technology/reactive-native' },
      { label: 'Flutter', href: '/technology/flutter' },
      { label: 'Python', href: '/technology/python' },
      { label: 'React', href: '/technology/react' },
    ],
  },
  {
    heading: 'CodeVyasa',
    links: [
      { label: 'Work', href: '/work' },
      { label: 'About', href: '/about' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
];
