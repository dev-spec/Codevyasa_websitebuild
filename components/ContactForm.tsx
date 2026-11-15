'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TextField, TextArea, SelectField } from './Field';
import { Button } from './Button';
import { contactSchema, type ContactFieldErrors, type ContactInput } from '@/lib/contactSchema';
import { requirementOptions, contact } from '@/content/contact';
import { site } from '@/content/site';
import { dur, ease } from '@/lib/motion';

type Status = 'idle' | 'sending' | 'success' | 'error';

const empty: ContactInput = {
  name: '',
  company: '',
  email: '',
  phone: '',
  requirement: '' as ContactInput['requirement'],
  message: '',
  company_website: '',
};

export function ContactForm({ source = 'homepage' }: { source?: string }) {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const set = (k: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: ContactFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // Honeypot filled → pretend success, don't transmit.
    if (parsed.data.company_website) {
      setStatus('success');
      return;
    }

    setStatus('sending');
    const payload = { ...parsed.data, source, submittedAt: new Date().toISOString() };
    delete (payload as Partial<typeof payload>).company_website;

    try {
      if (site.contactEndpoint) {
        const res = await fetch(site.contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      } else {
        // No endpoint configured → open the visitor's email client, prefilled to
        // sales@codevyasa.com, so a submission is never silently lost.
        const reqLabel =
          requirementOptions.find((o) => o.value === parsed.data.requirement)?.label ?? parsed.data.requirement;
        const bodyLines = [
          `Name: ${parsed.data.name}`,
          parsed.data.company ? `Company: ${parsed.data.company}` : '',
          `Email: ${parsed.data.email}`,
          parsed.data.phone ? `Phone: ${parsed.data.phone}` : '',
          `Requirement: ${reqLabel}`,
          parsed.data.message ? `\n${parsed.data.message}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
          `New enquiry from ${parsed.data.name}`
        )}&body=${encodeURIComponent(bodyLines)}`;
        // eslint-disable-next-line no-console
        console.info('[CodeVyasa contact] no NEXT_PUBLIC_CONTACT_ENDPOINT set — falling back to mailto.');
        window.location.href = mailto;
        await new Promise((r) => setTimeout(r, 300));
      }
      setStatus('success');
      setValues(empty);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.md, ease: ease.out }}
            className="card-surface flex min-h-[420px] flex-col items-center justify-center p-10 text-center"
          >
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-grad-brand">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#04121a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-h3 font-semibold text-text-0">{contact.successMessage}</h3>
            <p className="mt-3 max-w-md text-text-1">
              Our team will reach out shortly. Prefer email?{' '}
              <a href={`mailto:${site.email}`} className="text-accent-400 underline">
                {site.email}
              </a>
            </p>
            <button onClick={() => setStatus('idle')} className="mt-8 text-sm text-text-2 underline hover:text-text-0">
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-surface grid gap-5 p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Name" required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
              <TextField label="Company Name" value={values.company} onChange={set('company')} error={errors.company} autoComplete="organization" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Email" type="email" required value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
              <TextField label="Phone Number" type="tel" value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" />
            </div>
            <SelectField
              label="Requirements"
              required
              options={requirementOptions as unknown as { value: string; label: string }[]}
              value={values.requirement}
              onChange={set('requirement')}
              error={errors.requirement}
            />
            <TextArea label="Tell us about your project (optional)" value={values.message} onChange={set('message')} error={errors.message} />

            {/* Honeypot — visually hidden, off-screen, not tabbable */}
            <div className="absolute left-[-9999px]" aria-hidden>
              <label>
                Company website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.company_website}
                  onChange={set('company_website')}
                />
              </label>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" disabled={status === 'sending'} magnetic={false}>
                {status === 'sending' ? contact.submitSending : contact.cta}
              </Button>
              <span className="text-sm text-text-2">
                or call{' '}
                <a href={site.phoneHref} className="text-text-1 hover:text-text-0">
                  {site.phoneDisplay}
                </a>
              </span>
            </div>

            {status === 'error' && (
              <p role="alert" className="text-sm text-[#ff6b6b]">
                {contact.errorMessage}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
