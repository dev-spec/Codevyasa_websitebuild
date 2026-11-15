# TODO_ASSETS.md — CodeVyasa.com Rebuild

Everything Claude Code needs from you to take the site from "impressive demo" to "who built this?!". Drop files into `/public/assets/...` as noted. Anything not supplied gets a tasteful branded placeholder and is flagged here until replaced.

Priority key: **P0** = blocks a polished first look · **P1** = needed before launch · **P2** = nice-to-have.

---

## ✅ BUILD STATUS (what shipped, what you still need to supply)

The full site is **built and passing a static production build** (`pnpm build` → `out/`, 72 pages).
Everything below marked _placeholder_ works today with a tasteful branded stand-in and
is safe to swap without touching component code — the data lives in `/content`.

**Done / built:**
- ✅ Entire site: 11-section homepage, `/work`, `/about`, `/contact`, all **24 expertise** + **25 technology** + **8 case-study** pages, privacy & terms. Every mega-menu & footer link resolves.
- ✅ **Verbatim** homepage copy, testimonials (exact quotes/names/titles), stats, offices, footer columns, contact block — crawled from the live site.
- ✅ Design system, WebGL hero (custom GLSL), **3D globe** with arcs/markers, cursor FSM, magnetic CTAs, drag carousels, preloader, route transitions, reduced-motion paths.
- ✅ Self-hosted fonts (Clash Display / Inter Tight / JetBrains Mono).
- ✅ Favicon (`app/icon.svg`), Apple touch icon, generated **OG image** (`public/og.png`).
- ✅ SEO: per-page metadata, canonical, JSON-LD (Organization/WebSite/Breadcrumb/Article), `sitemap.xml`, `robots.txt`, env-gated GA4.
- ✅ Working contact form (zod validation, honeypot, success/error UI) + **optional full backend** in `/server-optional` (Prisma + Resend + Turnstile).

**Placeholders — replace with the real thing (paths/data noted):**
- ⛳ **Brand accent hex** — using the brief's baseline blue→cyan→violet (`app/globals.css` `:root`). Confirm CodeVyasa's real accent with marketing and update the tokens.
- ⛳ **Logo** — abstract branded mark in `components/Logo.tsx` + `app/icon.svg`. Drop official SVGs in `public/assets/brand/` and swap.
- ⛳ **Client logos** — the trust wall uses styled wordmark tiles (data in `content/site.ts › clientLogos`). Add cleared SVGs to `public/assets/clients/` and switch the tiles to `<img>` if desired.
- ⛳ **Testimonial headshots** — carousel uses monogram avatars (data in `content/testimonials.ts`). Add square photos to `public/assets/team/`.
- ⛳ **Case-study hero images + exact metrics/copy** — cards use branded gradient covers; detail copy is representative (`content/caseStudies.ts`). Replace with live copy + real numbers + images in `public/assets/case-studies/`.
- ⛳ **Expertise/technology page copy** — real, topic-specific copy is written per page; **spot-check against live** `/expertise/*` and `/technology/*` and adjust where the live wording differs.
- ⛳ **Awards** — intentionally empty (`content/awards.ts`); add only real, verifiable badges and the homepage strip appears automatically.
- ⛳ **Privacy/Terms** — starter templates (`app/privacy`, `app/terms`); have legal review before launch.

**Keys / config you must set in `.env.local` (see `.env.example`):**
- 🔑 `NEXT_PUBLIC_SITE_URL` (production URL) · `NEXT_PUBLIC_CONTACT_ENDPOINT` (form target) · optional `NEXT_PUBLIC_BOOKING_URL`, `NEXT_PUBLIC_GA4_ID`.
- 🔑 For the optional backend: `RESEND_API_KEY` (or `SMTP_*`), `DATABASE_URL`, `TURNSTILE_*`.

---

## 1. Brand core (P0)

- [ ] **Exact brand hex codes** — primary accent, secondary, background, text. If unknown, pull from the live site's CSS + logo; confirm the accent with marketing. Put final values in Part C of the build brief.
- [ ] **Logo — primary**, SVG, on transparent (light-on-dark version). Vector, not PNG.
- [ ] **Logo — inverted/dark** version (dark-on-light) SVG, for the light theme + OG images.
- [ ] **Logo mark only** (icon, no wordmark), SVG — for favicon, preloader draw-in, mobile nav.
- [ ] **Favicon set** — 512×512 PNG master + `favicon.ico`. (Claude Code can generate the rest.)
- [ ] **Font licenses / confirmation** — confirm Clash Display / Satoshi + Inter Tight/Geist are OK, or name the licensed brand fonts to use instead. If commercial fonts, provide the woff2 files.
- [ ] **Brand guidelines PDF** if one exists (spacing, do/don'ts, tone).

## 2. Client logos — the trust wall (P0)

- [ ] **All client logos** currently referenced on the live site, re-exported as **SVG** (or ≥400px transparent PNG). Grayscale isn't needed — the site desaturates them and colors on hover.
  - From the live testimonials at minimum: **Bureau, Amazon, Mamaearth, Viacom18**, plus the logos in the segment strip. Add every client logo you're cleared to show.
- [ ] **Approved client list** — written confirmation of which names/logos you're allowed to display publicly (some contracts restrict this). Mark any that are NDA → we use "unicorn / Fortune-500 fintech" style anonymized tiles instead.
- [ ] Target: **12–24 logos** for two marquee rows. More is fine.

## 3. Case studies / success stories (P0 for featured 8, P1 for rest)

For **each** of the 8 featured case studies (and any others live):
- [ ] **Hero image** — 1600×1000px, WebP/JPG. Real product/UI screenshots or brand-styled visuals beat stock.
- [ ] **Client logo** (covered above if overlapping).
- [ ] **2 hard metrics** per card — the number + label (e.g. "4X operational efficiency", "90% faster reporting", "50+ startups scaled"). These drive the count-up animation; the site feels hollow without real numbers.
- [ ] **One-line outcome** (~10–14 words) for the card.
- [ ] **Full detail-page copy** — Challenge / Approach / Solution / Results, plus tech stack used. (Pull exact from live where it exists; fill gaps for any thin ones.)

The 8 featured slugs: `codevyasa-a-reliable-tech-partner-for-international-giants`, `propelling-early-stage-tech-ventures-to-unprecedented-heights`, `from-startup-to-unicorn-our-journey-with-50-pioneers`, `codevyasas-impact-through-automation-qa`, `enhancing-data-pipelines-...`, `securing-energy-systems-...`, `devops-and-sre-...`, `up-grad`.

## 4. Testimonials (P0)

- [ ] **Headshots** — 400×400px, for: Sandesh Gs, Harish Rama Rao, Jayant Chauhan, Sayantani G, Jitendra Agrawal. (Live site has some — re-export clean, square, consistent crop.)
- [ ] **Exact quotes + name + title + company** — already on the live site; confirm nothing has changed and add any new ones.
- [ ] Company logos for each testimonial (covered in §2).

## 5. Global presence section (P0 — this is the screenshot moment)

- [ ] **Confirm the country list + status:** India (home), USA, Canada, Germany, UAE, Indonesia — and which are "office" vs "presence/expanding." UAE/GCC tagged "Expanding" per the brief; confirm.
- [ ] **Per-location detail** (short): city, one-line focus/role, "office" or "delivery/sales presence."
- [ ] Any **office photos** (optional, P2) — 1200×800px, for hover cards or the About page.
- [ ] Coordinates aren't needed — Claude Code will plot from country/city.

## 6. Company / About (P1)

- [ ] **About copy** — pull exact from live `/about`; supply anything missing (founding story, mission, values).
- [ ] **Leadership** (optional but strong) — name, title, headshot 600×600px, 1-line bio for founder + key execs.
- [ ] **Real company stats confirmation** — 200+ projects, 450+ technocrats, 90% CAGR, 96% retention, 80+ clients, 12+ industries. Confirm these are current (update if the numbers have moved since the live site).
- [ ] **Team / office culture photos** (P2) — 4–8 landscape shots, 1600px wide, for About + careers vibe.

## 7. Awards / recognition (P1, skip if none)

- [ ] Award or certification **badges** (ISO, Clutch, GoodFirms, etc.) as SVG/PNG transparent, + the award name/year. Only include real ones.

## 8. Expertise & Technology pages (P1)

- [ ] **Exact copy** for all 24 expertise + 25 technology pages — Claude Code crawls the live site for these; your job is to **spot-check** the crawl and fill any page that's thin or missing.
- [ ] Optional **per-pillar visuals** (P2) — if you want custom illustrations for Product/Data/DevOps/AI/IOT instead of the animated code-motifs the brief generates.

## 9. Contact / backend (P0 for launch)

- [ ] **Destination email** confirmed — sales@codevyasa.com (and any CC, e.g. a CRM inbox).
- [ ] **Resend API key** (or SMTP host/user/pass) → goes in `.env`, never in the repo.
- [ ] **Postgres connection string** (Neon/Supabase free tier is fine) for storing form submissions.
- [ ] **Calendar link** for "Book a Meeting" (Calendly/cal.com) if you want the CTA to open a real booking flow.
- [ ] **Phone number** confirmed: +1 (904) 339-8674 (live footer shows this — verify it's current).
- [ ] Optional: **Cloudflare Turnstile** site+secret keys for spam protection.

## 10. Deploy / ops (P1)

- [ ] **Domain access** or DNS records to point at Vercel (or hand-off to whoever manages DNS).
- [ ] **Vercel account** (or let Claude Code build it deploy-ready and you connect).
- [ ] **GA4 measurement ID** (optional) for analytics.
- [ ] **Legal pages** content — Privacy Policy + Terms (the live site lacks them; a billion-dollar-looking site should have them). Get these from legal or use a standard template to start.

---

## Folder layout Claude Code will expect
```
/public/assets/
  brand/        logo-light.svg, logo-dark.svg, mark.svg, favicon.png
  clients/      <client>.svg ...
  case-studies/ <slug>-hero.webp ...
  team/         <name>.webp ...
  offices/      <city>.webp ...
  awards/       <badge>.svg ...
/content/       (copy — crawled + your fills)
.env            (keys — from §9/§10, never committed)
```

## Image specs cheat-sheet
- Logos/badges/icons → **SVG** (fallback PNG transparent, ≥400px).
- Photos → **WebP** primary; hero/case 1600×1000, headshots 400×400 square, office 1600×1067.
- Keep every raster **≤300KB** where possible (Claude Code re-optimizes via next/image, but start light).
- Provide **@2x** for anything critical; Claude Code handles responsive sizing.

## The 20% that creates 80% of the "wow"
If you can only chase a few things first: **exact brand hex + clean logo SVGs (§1)**, **real client logos with clearance (§2)**, **real metrics on the featured case studies (§3)**, and **the global-presence detail (§5)**. Nail those four and the site lands; everything else is polish.
