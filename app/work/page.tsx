import { PageHeader } from '@/components/PageHeader';
import { WorkGrid } from '@/components/sections/WorkGrid';
import { CTABand } from '@/components/CTABand';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Work',
  description:
    'Featured success stories from CodeVyasa — real outcomes across product engineering, data, DevOps, AI and IoT.',
  path: '/work',
});

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Success Stories"
        title="Work that moves the metric"
        intro="A selection of engagements where CodeVyasa delivered measurable outcomes — filter by industry or service."
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Work', href: '/work' },
        ]}
      />
      <WorkGrid />
      <CTABand />
    </>
  );
}
