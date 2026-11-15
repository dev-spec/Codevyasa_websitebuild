# CodeVyasa.com

The CodeVyasa corporate website — an AI-first product-engineering company.
Built as a **static-export Next.js 14 app** so it deploys onto **any host**
(a CMS static area, your company web server, S3/CDN, Netlify, GitHub Pages, or
Vercel) with **zero server runtime required**.

> Design bar: Awwwards-calibre. WebGL hero, an interactive 3D globe, a custom
> cursor state-machine, magnetic CTAs, drag carousels, word-by-word headline
> reveals, cinematic preloader + route transitions — all reduced-motion-safe
> and keyboard-accessible.

---

## Tech stack

- **Next.js 14 (App Router) + TypeScript**, `output: 'export'` (static HTML/CSS/JS)
- **Tailwind CSS** with a fully custom token system (`tailwind.config.ts` + `app/globals.css`)
- **Framer Motion** (UI/layout motion) · **GSAP + ScrollTrigger** + **Lenis** (smooth scroll)
- **React Three Fiber / drei / three / postprocessing** (hero object + globe, custom GLSL)
- **split-type**-style headline reveals · **zod** validation
- Self-hosted fonts: **Clash Display** (display), **Inter Tight** (UI), **JetBrains Mono** (mono)

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Requirements: Node ≥ 18.18 and pnpm. (`npm install && npm run dev` also works.)

## Build (static export)

```bash
pnpm build          # → produces ./out  (fully static, self-contained)
pnpm serve:out      # preview the exported site locally (npx serve out)
```

`pnpm build` runs `next build` (which exports to `out/`) and a `postbuild` step
that adds `.nojekyll` and a `200.html` fallback so the folder drops onto any
static host cleanly.

## Deployment — pick whichever matches your host

Everything the site needs is inside **`out/`** after `pnpm build`. There is no
Node server to run.

| Host | How |
| --- | --- |
| **CMS static area / company web server** | Upload the **contents of `out/`** to your web root (or a subfolder). Routes are emitted with trailing slashes (`/work/index.html`), so no rewrite rules are needed. |
| **Netlify** | Build command `pnpm build`, publish directory `out`. |
| **Vercel** | Import the repo — it auto-detects Next.js. (Static export is respected.) |
| **AWS S3 + CloudFront** | Sync `out/` to the bucket; set `index.html` as the index document. |
| **GitHub Pages** | Push `out/` to the Pages branch (the `.nojekyll` file is already added). |

> **Deploying under a sub-path** (e.g. `example.com/site/`)? Set `basePath` and
> `assetPrefix` in `next.config.mjs` to that path and rebuild.

### Environment variables

Copy `.env.example` → `.env.local` and set what you need. Only `NEXT_PUBLIC_*`
values are used by the static build (they are inlined at build time):

- `NEXT_PUBLIC_SITE_URL` — your production URL (canonical tags, sitemap, OG).
- `NEXT_PUBLIC_CONTACT_ENDPOINT` — where the contact form POSTs (see below).
- `NEXT_PUBLIC_BOOKING_URL` — optional Calendly/cal.com link for "Book a meeting".
- `NEXT_PUBLIC_GA4_ID` — optional; analytics only loads when set.

## Contact form — three modes

1. **Demo mode (default):** no endpoint set → the form validates, shows the real
   success UI, and logs the payload to the console. Nothing is transmitted.
2. **Any JSON endpoint:** set `NEXT_PUBLIC_CONTACT_ENDPOINT` to a Formspree/Basin
   URL, a CRM webhook, or your own function. The form POSTs the JSON payload.
3. **Included backend (`/server-optional`):** a ready-made serverless function
   with **zod + honeypot + IP rate-limit + Cloudflare Turnstile + Prisma/Postgres
   + Resend (SMTP fallback)** emailing `sales@codevyasa.com`. See
   [`server-optional/README.md`](server-optional/README.md).

## Content

All copy lives in a typed content layer under [`/content`](content) and is
rendered from there (nothing is hard-coded in components). Homepage copy,
testimonials, offices, stats, the mega-menu, all 24 expertise + 25 technology +
8 case-study pages are defined here. Edit content there, not in components.

## Regenerating OG image + icons

The social image (`public/og.png`) and touch icons are pre-generated. To rebuild
them from the on-brand template:

```bash
pnpm add -D sharp
node scripts/generate-og.mjs
pnpm remove sharp
```

## Accessibility & performance

- Full `prefers-reduced-motion` path — the preloader, cursor, 3D loops, marquees
  and every reveal degrade gracefully.
- Keyboard-navigable nav, carousels and forms; visible focus rings; skip-to-content link.
- 3D scenes are lazy-loaded (`ssr: false`) behind an intersection trigger, capped
  at DPR 2, paused when the tab is hidden, with static fallbacks (and a WebGL
  error boundary).
- Dark theme ships by default with a working light theme toggle (persisted).

## Project structure

```
app/                 routes (static-exported), layout, template (route transitions), sitemap/robots/icon
components/          design system (Cursor, Magnetic, Reveal, Button, …), sections/, three/, providers/
content/             typed content layer (single source of truth for copy)
lib/                 motion tokens, hooks, utils, seo, contact schema
public/fonts/        self-hosted woff2
public/og.png        social share image
scripts/             postbuild + asset generation
server-optional/     optional Node/Prisma/Resend contact backend (not part of the static build)
```

## Notes

- **git** was not installed on the build machine — initialize a repo before
  pushing to a host that deploys from git (`git init && git add -A && git commit`).
- Remaining real assets (client logos, headshots, exact accent hex, keys) are
  tracked in [`TODO_ASSETS.md`](TODO_ASSETS.md). The site ships with tasteful
  branded placeholders until those land.
