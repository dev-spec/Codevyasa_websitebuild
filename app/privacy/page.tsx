import { PageHeader } from '@/components/PageHeader';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How CodeVyasa collects, uses and protects your information.',
  path: '/privacy',
});

// NOTE: starter template — have legal review/replace before launch (TODO_ASSETS §10).
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        crumbs={[
          { name: 'Home', href: '/' },
          { name: 'Privacy', href: '/privacy' },
        ]}
      />
      <section className="pb-section">
        <div className="shell max-w-prose space-y-6 text-body text-text-1">
          <p className="text-text-2">Last updated: {site.copyrightYear}</p>
          <p>
            This Privacy Policy explains how {site.name} (“we”, “us”) collects, uses and safeguards information when
            you interact with this website and our services.
          </p>
          <Heading>Information we collect</Heading>
          <p>
            When you submit our contact form we collect the details you provide — such as your name, company, email,
            phone number and message — solely to respond to your enquiry. We may also collect standard, non-identifying
            analytics about how the site is used.
          </p>
          <Heading>How we use information</Heading>
          <p>
            We use your information to respond to enquiries, provide and improve our services, and communicate with you
            about your request. We do not sell your personal information.
          </p>
          <Heading>Data retention & security</Heading>
          <p>
            We retain submissions only as long as necessary to serve your enquiry and meet legal obligations, and we
            apply reasonable technical and organisational measures to protect your data.
          </p>
          <Heading>Your rights</Heading>
          <p>
            You may request access to, correction of, or deletion of your personal information by emailing{' '}
            <a href={`mailto:${site.email}`} className="text-accent-400 underline">
              {site.email}
            </a>
            .
          </p>
          <Heading>Contact</Heading>
          <p>
            For any privacy questions, contact us at{' '}
            <a href={`mailto:${site.email}`} className="text-accent-400 underline">
              {site.email}
            </a>{' '}
            or {site.phoneDisplay}.
          </p>
        </div>
      </section>
    </>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-h3 font-semibold text-text-0">{children}</h2>;
}
