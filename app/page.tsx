import { Hero } from '@/components/sections/Hero';
import { TrustWall } from '@/components/sections/TrustWall';
import { Stats } from '@/components/sections/Stats';
import { ExpertiseExplorer } from '@/components/sections/ExpertiseExplorer';
import { CaseStudyCarousel } from '@/components/sections/CaseStudyCarousel';
import { GlobalPresence } from '@/components/sections/GlobalPresence';
import { Engagement } from '@/components/sections/Engagement';
import { Testimonials } from '@/components/sections/Testimonials';
import { Awards } from '@/components/sections/Awards';
import { Contact } from '@/components/sections/Contact';

// Home page only → Helvetica Now Display. Uses the licensed font once its files
// are self-hosted (see public/fonts/README-helvetica.txt); until then it falls
// back to the nearest system Helvetica. REVERT: delete the wrapper <div> (keep
// the fragment) to restore the site's Clash Display / Inter Tight typography.
const HELVETICA_NOW =
  "'Helvetica Now Display', 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif";

export default function HomePage() {
  return (
    <div
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--font-display' as any]: HELVETICA_NOW,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--font-sans' as any]: HELVETICA_NOW,
      }}
    >
      <Hero />
      <TrustWall />
      <Stats />
      <ExpertiseExplorer />
      <CaseStudyCarousel />
      <GlobalPresence />
      <Engagement />
      <Testimonials />
      <Awards />
      <Contact />
    </div>
  );
}
