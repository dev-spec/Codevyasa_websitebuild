import { PageHeader } from '@/components/PageHeader';
import { CTABand } from '@/components/CTABand';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Resources',
  description: 'Guides, articles and tools from CodeVyasa — coming soon.',
  path: '/resources',
});

// Placeholder — content (guides, whitepapers, tools, etc.) to be added later.
export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Resources are on the way"
        intro="We're putting together guides, articles and tools to help you build better. Check back soon."
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Resources', href: '/resources' },
        ]}
      />
      <CTABand />
    </>
  );
}
