import { PageHeader } from '@/components/PageHeader';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'The terms governing your use of the CodeVyasa website.',
  path: '/terms',
});

// NOTE: starter template — have legal review/replace before launch (TODO_ASSETS §10).
export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Terms', href: '/terms' },
        ]}
      />
      <section className="pb-section">
        <div className="shell max-w-prose space-y-6 text-body text-text-1">
          <p className="text-text-2">Last updated: {site.copyrightYear}</p>
          <p>
            These Terms govern your use of the {site.name} website. By accessing or using the site, you agree to these
            Terms.
          </p>
          <Heading>Use of the site</Heading>
          <p>
            You may use this site for lawful purposes only. The content is provided for general information about our
            services and may change without notice.
          </p>
          <Heading>Intellectual property</Heading>
          <p>
            All content, branding and materials on this site are owned by {site.name} or its licensors and may not be
            reproduced without permission.
          </p>
          <Heading>No warranty</Heading>
          <p>
            The site is provided “as is” without warranties of any kind. We are not liable for any loss arising from
            your use of the site to the fullest extent permitted by law.
          </p>
          <Heading>Contact</Heading>
          <p>
            Questions about these Terms? Email{' '}
            <a href={`mailto:${site.email}`} className="text-accent-400 underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-h3 font-semibold text-text-0">{children}</h2>;
}
