import type { PresenceNode } from './types';

/**
 * Global Presence data (Appendix 2). India is the home base; arcs radiate from
 * India to every other hub. UAE/GCC is tagged "Expanding". Coordinates are
 * approximate country/city centroids used to plot markers + great-circle arcs.
 */
export const presenceNodes: PresenceNode[] = [
  {
    id: 'india',
    country: 'India',
    cities: ['Noida', 'Delhi', 'Bangalore'],
    role: 'Global headquarters & primary delivery',
    focus: 'Engineering, product, data & AI delivery across all disciplines.',
    status: 'Home base',
    lat: 23.5,
    lng: 79.0,
    isHome: true,
  },
  {
    id: 'usa',
    country: 'USA',
    cities: ['St. Johns, Florida'],
    role: 'North America office',
    focus: 'Client partnership, solutioning and account leadership.',
    status: 'Office',
    lat: 30.1,
    lng: -81.6,
  },
  {
    id: 'canada',
    country: 'Canada',
    cities: ['Toronto'],
    role: 'North America presence',
    focus: 'Delivery & sales presence for North American clients.',
    status: 'Delivery & sales',
    lat: 43.7,
    lng: -79.4,
  },
  {
    id: 'germany',
    country: 'Germany',
    cities: ['Berlin'],
    role: 'European presence',
    focus: 'Delivery & sales presence for EU clients.',
    status: 'Delivery & sales',
    lat: 52.5,
    lng: 13.4,
  },
  {
    id: 'uae',
    country: 'UAE',
    cities: ['Dubai'],
    role: 'Gulf / GCC expansion',
    focus: 'Expanding into the Gulf/GCC region — new delivery & sales hub.',
    status: 'Expanding',
    lat: 25.2,
    lng: 55.3,
  },
  {
    id: 'indonesia',
    country: 'Indonesia',
    cities: ['Jakarta'],
    role: 'Southeast Asia presence',
    focus: 'Delivery & sales presence for SEA clients.',
    status: 'Delivery & sales',
    lat: -6.2,
    lng: 106.8,
  },
];

export const homeNode = presenceNodes.find((n) => n.isHome)!;

export const presenceStats = [
  { value: '6', label: 'Geographies' },
  { value: '4', label: 'Offices' },
  { value: '3', label: 'Continents' },
];
