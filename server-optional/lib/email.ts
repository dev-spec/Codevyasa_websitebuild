// Branded email delivery: Resend primary, Nodemailer SMTP fallback.
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface ContactPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  requirement: string;
  requirementLabel: string;
  message?: string;
  source: string;
  ip?: string;
}

const brandHtml = (p: ContactPayload) => `
<div style="font-family:Inter,Arial,sans-serif;background:#070A0F;color:#F4F7FB;padding:32px;border-radius:14px;max-width:560px;margin:auto">
  <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#22D3EE">New enquiry · CodeVyasa</div>
  <h1 style="font-size:24px;margin:12px 0 20px">${escape(p.name)} — ${escape(p.requirementLabel)}</h1>
  <table style="width:100%;border-collapse:collapse;font-size:14px;color:#AEBACB">
    ${row('Name', p.name)}
    ${row('Company', p.company || '—')}
    ${row('Email', p.email)}
    ${row('Phone', p.phone || '—')}
    ${row('Requirement', p.requirementLabel)}
    ${row('Source', p.source)}
    ${row('IP', p.ip || '—')}
  </table>
  ${p.message ? `<div style="margin-top:20px;padding:16px;background:#0F1826;border-radius:10px;color:#F4F7FB">${escape(p.message)}</div>` : ''}
  <div style="margin-top:24px;font-size:12px;color:#6B7789">Sent from codevyasa.com contact form</div>
</div>`;

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 0;color:#6B7789;width:120px">${k}</td><td style="padding:6px 0;color:#F4F7FB">${escape(v)}</td></tr>`;

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export async function sendContactEmail(p: ContactPayload): Promise<void> {
  const to = process.env.CONTACT_TO_EMAIL || 'sales@codevyasa.com';
  const from = process.env.CONTACT_FROM_EMAIL || 'website@codevyasa.com';
  const subject = `New enquiry: ${p.name} — ${p.requirementLabel}`;
  const html = brandHtml(p);

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from, to, subject, html, replyTo: p.email });
    return;
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from, to, subject, html, replyTo: p.email });
    return;
  }

  throw new Error('No email transport configured (set RESEND_API_KEY or SMTP_*).');
}
