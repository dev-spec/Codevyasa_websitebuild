/** Contact section copy + form schema options (verbatim from the live site). */

export const contact = {
  headline: 'Expert Hands, Real Results Crafting Your Vision',
  sub: 'Get in touch with us today!',
  cta: 'BOOK A MEETING',
  submitIdle: 'BOOK A MEETING',
  submitSending: 'Sending…',
  successMessage: 'Thank you! Your submission has been received!',
  errorMessage: 'Oops! Something went wrong while submitting the form.',
} as const;

/** Requirements dropdown — exact option labels + stable enum values. */
export const requirementOptions = [
  { value: 'product-saas', label: 'Product / SaaS Development and Innovation' },
  { value: 'data-engineering', label: 'Data Engineering' },
  { value: 'devops-cloud', label: 'Dev-Ops and Cloud' },
  { value: 'ai', label: 'AI' },
  { value: 'iot', label: 'IOT' },
] as const;

export type RequirementValue = (typeof requirementOptions)[number]['value'];
