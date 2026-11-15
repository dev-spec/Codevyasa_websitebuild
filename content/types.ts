/** Shared content types. Everything rendered on the site is typed through here. */

export type IconKey =
  | 'product'
  | 'data'
  | 'devops'
  | 'ai'
  | 'iot'
  | 'design'
  | 'code'
  | 'web'
  | 'mobile'
  | 'refresh'
  | 'support'
  | 'shield'
  | 'pipeline'
  | 'chart'
  | 'cloud'
  | 'server'
  | 'brain'
  | 'spark'
  | 'chip'
  | 'database'
  | 'globe'
  | 'bolt'
  | 'health'
  | 'clock'
  | 'family'
  | 'home'
  | 'wallet';

export interface SubService {
  label: string; // exact label as shown in the live mega-menu
  slug: string; // resolves to /expertise/[slug]
}

export interface Pillar {
  id: string;
  /** Menu label (exact) */
  menuLabel: string;
  /** Homepage explorer name */
  name: string;
  /** Exact blurb from the live homepage — do not edit. */
  blurb: string;
  icon: IconKey;
  subServices: SubService[];
}

export interface Capability {
  title: string;
  description: string;
}

export interface ExpertisePage {
  slug: string;
  title: string;
  pillarId: string;
  eyebrow: string;
  summary: string;
  overview: string[];
  capabilities: Capability[];
  outcomes: string[];
  icon: IconKey;
  relatedTech: string[]; // technology slugs
}

export interface TechnologyPage {
  slug: string;
  name: string; // exact menu label
  category: 'Frontend' | 'Backend' | 'Mobile' | 'Database';
  summary: string;
  overview: string[];
  useCases: string[];
  strengths: Capability[];
  icon: IconKey;
}

export interface Metric {
  value: string; // e.g. "4X", "90%", "50+"
  label: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  clientAnonymized?: boolean;
  industry: string;
  service: string;
  outcome: string; // one-line card outcome
  metrics: Metric[]; // 2 hard metrics for the card count-ups
  heroImage: string;
  logo?: string;
  tags: string[];
  challenge: string[];
  approach: string[];
  solution: string[];
  results: string[];
  techStack: string[];
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  logo?: string;
  avatar?: string;
}

export interface Office {
  city: string;
  country: string;
  address: string;
  isHQ?: boolean;
}

export interface PresenceNode {
  id: string;
  country: string;
  cities: string[];
  role: string;
  focus: string;
  status: 'Home base' | 'Office' | 'Delivery & sales' | 'Expanding';
  lat: number;
  lng: number;
  isHome?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
}
