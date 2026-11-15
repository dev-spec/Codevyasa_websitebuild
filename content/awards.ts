/**
 * Awards / certifications. EMPTY by default on purpose — Anti-AI law #5 forbids
 * inventing recognitions. Add ONLY real, verifiable badges here (name, year,
 * optional logo in /public/assets/awards) and the homepage strip appears
 * automatically (TODO_ASSETS §7).
 *
 * Example shape:
 *   { name: 'ISO 27001 Certified', year: '2024', logo: '/assets/awards/iso.svg' }
 */
export interface Award {
  name: string;
  year?: string;
  logo?: string;
}

export const awards: Award[] = [];
