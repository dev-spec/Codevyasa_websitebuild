/**
 * Optional contact endpoint (Vercel-style Node serverless handler).
 * Deploy this to receive the static site's contact submissions. See ../README.md.
 *
 * Flow: CORS → method → honeypot → rate-limit → zod → Turnstile? → persist? → email.
 */
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { sendContactEmail } from '../lib/email';

// Reuse a single Prisma client across warm invocations.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = process.env.DATABASE_URL ? globalForPrisma.prisma ?? new PrismaClient() : null;
if (prisma && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const requirementMap: Record<string, { label: string; enum: string }> = {
  'product-saas': { label: 'Product / SaaS Development and Innovation', enum: 'product_saas' },
  'data-engineering': { label: 'Data Engineering', enum: 'data_engineering' },
  'devops-cloud': { label: 'Dev-Ops and Cloud', enum: 'devops_cloud' },
  ai: { label: 'AI', enum: 'ai' },
  iot: { label: 'IOT', enum: 'iot' },
};

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().default(''),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(''),
  requirement: z.enum(['product-saas', 'data-engineering', 'devops-cloud', 'ai', 'iot']),
  message: z.string().trim().max(2000).optional().default(''),
  source: z.string().trim().max(80).optional().default('website'),
  company_website: z.string().max(0).optional(), // honeypot
  turnstileToken: z.string().optional(),
});

// naive in-memory rate limit (per warm instance). Use Redis/Upstash for multi-instance.
const hits = new Map<string, { count: number; ts: number }>();
const WINDOW = 60_000;
const LIMIT = 5;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  rec.count += 1;
  return rec.count > LIMIT;
}

async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → skip
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip || '' }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

export default async function handler(req: any, res: any) {
  // CORS (tighten `origin` to your domain in production)
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip =
    (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || '').trim();

  if (rateLimited(ip || 'unknown')) return res.status(429).json({ error: 'Too many requests' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const parsed = schema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid submission', issues: parsed.error.flatten() });

  const data = parsed.data;
  if (data.company_website) return res.status(200).json({ ok: true }); // honeypot → silently accept

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return res.status(400).json({ error: 'Spam verification failed' });
  }

  const req_ = requirementMap[data.requirement];

  try {
    if (prisma) {
      await prisma.submission.create({
        data: {
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone || null,
          requirement: req_.enum as any,
          message: data.message || null,
          source: data.source,
          ip: ip || null,
          userAgent: req.headers['user-agent']?.toString() || null,
        },
      });
    }

    await sendContactEmail({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      requirement: data.requirement,
      requirementLabel: req_.label,
      message: data.message,
      source: data.source,
      ip,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] error', err);
    return res.status(500).json({ error: 'Something went wrong while submitting the form.' });
  }
}
