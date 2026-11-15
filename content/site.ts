import type { Office, StatItem, IconKey } from './types';

export const site = {
  name: 'CodeVyasa',
  legalName: 'CodeVyasa',
  tagline: 'Digital Acceleration',
  description:
    'CodeVyasa is an AI-first product engineering company and a trusted outsourcing partner for over 100 companies globally — spanning product & SaaS, data engineering, DevOps & cloud, AI and IoT.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.codevyasa.com',
  email: 'sales@codevyasa.com',
  phoneDisplay: '+1 (904) 339-8674',
  phoneHref: 'tel:+19043398674',
  copyrightYear: 2024, // matches the live footer "©2024"
  foundedYear: 2021,
  social: {
    linkedin: 'https://www.linkedin.com/company/codevyasa/',
    glassdoor: 'https://www.glassdoor.com/Overview/Working-at-CodeVyasa',
  },
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || '',
  contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '',
} as const;

/** Homepage trust line (verbatim). */
export const trust = {
  line: 'CodeVyasa is a trusted Outsourcing partner for over 100 companies globally',
  sub: 'Including giant unicorns, enterprises and startups',
} as const;

/** Industry segment chips (verbatim, in order). */
export const segments: string[] = [
  'Fintech',
  'International Clients',
  'Unicorns',
  'Retail',
  'SaaS',
  'IOT',
];

/** Quantifying Excellence — exact numbers + labels. */
export const stats: StatItem[] = [
  { value: '200+', label: 'Projects Undertaken' },
  { value: '450+', label: 'Technocrats' },
  { value: '90%', label: 'CAGR' },
  { value: '96%', label: 'Client Retention Rate' },
  { value: '80+', label: 'Clients' },
  { value: '12+', label: 'Industries' },
];

/** Footer + contact office addresses (verbatim). */
export const offices: Office[] = [
  {
    city: 'Noida',
    country: 'India',
    address: 'Logix Cyber Park, 10th Floor, Tower D, Smartworks, Sector 62, Noida, Uttar Pradesh 201301',
    isHQ: true,
  },
  { city: 'Delhi', country: 'India', address: 'Libaspur, Delhi, 110042' },
  { city: 'Bangalore', country: 'India', address: '91 Springboard' },
  { city: 'Florida', country: 'USA', address: '55 Bush Pl, 32259 St. Johns, Florida' },
];

export interface ClientLogo {
  name: string;
  /** Real self-hosted logo in /public/assets/clients (named clients only). */
  file?: string;
  /** Sector icon used for NDA/anonymized stand-ins that have no real logo. */
  icon?: IconKey;
  anonymized?: boolean;
}

/** Trusted-partner wall. Entries with a `file` render the real logo (white,
 *  monochrome); the rest render as a clean wordmark of the name. To upgrade any
 *  wordmark to a real logo, drop an official white/monochrome SVG in
 *  /public/assets/clients and set `file`.
 *
 *  ⚠️ Integrity: these must be genuine, cleared clients. Confirm you're allowed
 *  to display each brand publicly before launch (TODO_ASSETS §2). */
export const clientLogos: ClientLogo[] = [
  { name: 'Amazon', file: '/assets/clients/amazon.svg' },
  { name: 'Walmart', file: '/assets/clients/walmart.svg' },
  { name: 'Salesforce', file: '/assets/clients/salesforce.svg' },
  { name: 'Wipro', file: '/assets/clients/wipro.svg' },
  { name: 'Flipkart', file: '/assets/clients/flipkart.svg' },
  { name: 'Airtel', file: '/assets/clients/airtel.svg' },
  { name: 'Nokia', file: '/assets/clients/nokia.svg' },
  { name: 'HDFC Bank', file: '/assets/clients/hdfcbank.svg' },
  { name: 'Deloitte', file: '/assets/clients/deloitte.ico' },
  { name: 'Reliance', file: '/assets/clients/reliance.ico' },
  { name: 'Cox', file: '/assets/clients/cox.png' },
  { name: 'WeWork', file: '/assets/clients/wework.png' },
  { name: 'Enphase', file: '/assets/clients/enphase.png' },
  { name: 'Myntra', file: '/assets/clients/myntra.png' },
  { name: 'Blinkit', file: '/assets/clients/blinkit.png' },
  { name: 'upGrad', file: '/assets/clients/upgrad.png' },
  { name: 'Mamaearth', file: '/assets/clients/mamaearth.png' },
  { name: 'Viacom18', file: '/assets/clients/viacom18.png' },
  { name: 'Bureau', file: '/assets/clients/bureau.png' },
  { name: 'PolicyBazaar', file: '/assets/clients/policybazaar.png' },
  { name: 'Pine Labs' },
  { name: 'Acko', file: '/assets/clients/acko.png' },
  { name: 'Jupiter', file: '/assets/clients/jupiter.png' },
  { name: 'Turtlemint', file: '/assets/clients/turtlemint.png' },
  { name: 'ET Money', file: '/assets/clients/et-money.png' },
  { name: 'Yatra', file: '/assets/clients/yatra.png' },
  { name: 'Tata 1mg', file: '/assets/clients/tata-1mg.png' },
  { name: 'Tata CLiQ', file: '/assets/clients/tata-cliq.png' },
  { name: 'LimeRoad', file: '/assets/clients/limeroad.png' },
  { name: 'CityFurnish', file: '/assets/clients/cityfurnish.png' },
  { name: 'Macmerise', file: '/assets/clients/macmerise.png' },
  { name: 'Newgen', file: '/assets/clients/newgen.png' },
  { name: 'Netcore', file: '/assets/clients/netcore.png' },
  { name: 'Affle' },
  { name: 'Accion', file: '/assets/clients/accion.png' },
  { name: 'Accionlabs', file: '/assets/clients/accionlabs.png' },
  { name: 'Cactus', file: '/assets/clients/cactus.png' },
  { name: 'Wingify', file: '/assets/clients/wingify.png' },
  { name: 'Haptik', file: '/assets/clients/haptik.png' },
  { name: 'Atomberg', file: '/assets/clients/atomberg.png' },
  { name: 'Nanoprecise', file: '/assets/clients/nanoprecise.png' },
  { name: 'Haber', file: '/assets/clients/haber.png' },
];
