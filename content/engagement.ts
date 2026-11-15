import type { IconKey } from './types';

/** How We Work — engagement models (Part E §7). */
export const engagementModels: {
  id: string;
  title: string;
  tagline: string;
  description: string;
  points: string[];
  icon: IconKey;
}[] = [
  {
    id: 'staff-augmentation',
    title: 'Staff Augmentation',
    tagline: 'Scale your team, not your overhead',
    description:
      'Plug senior, cross-functional engineers directly into your team and delivery cadence. You keep control of the roadmap; we bring the horsepower — scaling up or down as your needs change.',
    points: [
      'Vetted senior engineers, embedded in your sprints',
      'Flexible ramp up and ramp down',
      'You own priorities and process',
      'Time-and-materials, transparent billing',
    ],
    icon: 'product',
  },
  {
    id: 'fixed-bid',
    title: 'Fixed Bid',
    tagline: 'Defined scope, predictable delivery',
    description:
      'For well-defined scopes, we own delivery end to end against a fixed price and timeline. You get a committed outcome, clear milestones and a single accountable partner.',
    points: [
      'Fixed price and timeline',
      'Milestone-based delivery and demos',
      'End-to-end ownership and accountability',
      'Ideal for well-scoped projects and MVPs',
    ],
    icon: 'bolt',
  },
];
