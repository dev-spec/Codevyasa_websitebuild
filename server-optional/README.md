# Optional server backend — contact form

The main site is a **static export** (`output: 'export'`) and needs **no server**.
The contact form on the static site POSTs to whatever you set as
`NEXT_PUBLIC_CONTACT_ENDPOINT`. This folder is **one ready-made implementation**
of that endpoint — a small serverless function that:

1. Validates input with **zod**
2. Rejects spam via a **honeypot** + **IP rate-limit** (5/min) + optional **Cloudflare Turnstile**
3. Persists the submission to **Postgres** via **Prisma** (Neon/Supabase free tier work)
4. Emails **sales@codevyasa.com** via **Resend** (falls back to SMTP/Nodemailer)
5. Returns typed JSON `{ ok: true }` / `{ error }`

You do **not** have to use this — any endpoint that accepts the JSON payload
(Formspree, Basin, a CRM webhook, your own API) works. This is here so you have a
first-class, on-brand option.

## Payload the static form sends

```jsonc
{
  "name": "Jane Doe",
  "company": "Acme",
  "email": "jane@acme.com",
  "phone": "+1 555 0100",
  "requirement": "product-saas",     // product-saas | data-engineering | devops-cloud | ai | iot
  "message": "…",
  "source": "homepage",
  "submittedAt": "2026-01-01T00:00:00.000Z"
}
```

## Deploy options

### A) Vercel serverless function (simplest alongside a static host)
1. Copy `api/contact.ts` into a Vercel project's `api/` directory (or deploy this
   folder as its own Vercel project).
2. `pnpm add zod resend nodemailer @prisma/client && pnpm add -D prisma`
3. Set env vars (see root `.env.example`): `RESEND_API_KEY` (or `SMTP_*`),
   `DATABASE_URL`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, optional `TURNSTILE_SECRET_KEY`.
4. `npx prisma migrate deploy` (or `npx prisma db push`).
5. In the **static site**, set `NEXT_PUBLIC_CONTACT_ENDPOINT` to the function URL,
   e.g. `https://your-api.vercel.app/api/contact`, and rebuild the static site.

### B) Any Node host / your own server
`api/contact.ts` is a standard `(req, res)` handler — wrap it with Express/Fastify
or run it in any serverless platform. Enable CORS for your site's origin (a
permissive example is included and commented).

### C) Full-server mode (no static export)
If you'd rather run the whole site as a server-rendered Next.js app on Node/Vercel,
move `api/contact.ts` to `app/api/contact/route.ts` (convert to a Route Handler),
remove `output: 'export'` from `next.config.mjs`, and point the form at `/api/contact`.
