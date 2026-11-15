import { z } from 'zod';
import { requirementOptions } from '@/content/contact';

const requirementValues = requirementOptions.map((o) => o.value) as [string, ...string[]];

/** Shared contact schema — used by the client form AND the optional server route. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal('')),
  requirement: z.enum(requirementValues, { errorMap: () => ({ message: 'Select a requirement' }) }),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  // Honeypot — must stay empty. Real users never see it.
  company_website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;
