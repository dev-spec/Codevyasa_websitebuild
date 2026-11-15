# CODEVYASA.COM — MASTER BUILD BRIEF v2 (paste this entire file into Claude Code as message #1)

You are the **lead design engineer + full-stack engineer** for **CodeVyasa** — an AI-first product engineering company (~800 engineers; offices in Noida, Delhi, Bangalore, Florida USA; expanding into the Gulf/GCC). I am rebuilding our corporate website from scratch, and it ships on our production domain. This is the face of the company.

**The bar:** when a stranger googles "CodeVyasa" and lands here, they should stop, lean in, and ask *"who built this?"* — the calibre of an Awwwards Site of the Day / a top Framer/agency flagship. It must read **handcrafted and expensive**, never AI-generated, never templated. Precision over hype: every animation below has defined timing, easing, and intent. Follow them.

Direction references (study behaviour, do not copy code): **accenture.com** (hero scale + editorial motion), **recro.io** (WebGL, client wall, industry cards), **appinventiv.com** (drag success-story carousel + hard metrics), **insightsoftware.com** (enterprise polish). Content source of truth: **https://www.codevyasa.com/**.

---

## PART A — OPERATING RULES

1. **Content fidelity is absolute.** Crawl the entire live site first and reproduce **every page, every button label, every link, and identical text**. Nothing invented, paraphrased, or dropped. Store it in a typed content layer and render from it. (Full sitemap + verbatim homepage copy in **Appendix 1**.)
2. **Anti-"AI-look" laws** (Appendix 4) are hard requirements, not suggestions.
3. **Motion spec is literal.** Where I give a cubic-bezier, duration, or stagger, use exactly that. Build a single `motion.ts` tokens file so timing is consistent everywhere.
4. **Everything is reduced-motion-safe and keyboard-accessible.** Every effect degrades gracefully.
5. Work in the **phased plan (Part H)**. Show me the plan, ask for assets + exact brand hex up front, then build. After each phase, self-check against its acceptance gate before moving on.

---

## PART B — TECH STACK

- **Next.js 14+ App Router + TypeScript**, **Tailwind CSS** with fully custom tokens (Part C).
- **Framer Motion** (component/UI motion, layout, AnimatePresence) + **GSAP + ScrollTrigger** (scroll choreography, pinning, scrub) + **Lenis** (smooth scroll, synced to GSAP ticker).
- **React Three Fiber + @react-three/drei + three** for the hero object and the global-presence globe. Custom GLSL where noted. Postprocessing: bloom + subtle chromatic aberration (@react-three/postprocessing), tuned low.
- **split-type** (or GSAP SplitText) for headline reveals.
- **Backend:** Next Route Handlers / server actions; **zod** validation; **Resend** (fallback Nodemailer SMTP) for email to sales@codevyasa.com; **Prisma + Postgres** (Neon/Supabase) for submissions; honeypot + IP rate-limit + Turnstile-ready.
- **Content:** MDX + Contentlayer (or typed TS modules) under `/content`.
- **SEO:** Metadata API, per-page dynamic OG images (@vercel/og), JSON-LD (Organization, WebSite, BreadcrumbList, Article), `sitemap.xml`, `robots.txt`.
- **Analytics:** Vercel Analytics + Speed Insights + env-gated GA4.
- **Deploy:** Vercel. Ship `.env.example`, seed script, README, `TODO_ASSETS.md`.

---

## PART C — DESIGN SYSTEM (extract real tokens first, then lock these)

**Step 1:** Sample the live site's computed CSS + logo SVG (Webflow CDN) to capture CodeVyasa's real brand hues and logo geometry. If exact accent is ambiguous, use the baseline below and keep it ruthlessly consistent.

### Color tokens (CSS vars + Tailwind theme)
Premium dark, aurora-accented. Provide a light theme too; ship dark as default.
```
--bg-0:  #070A0F   /* page base, near-black ink */
--bg-1:  #0B111C   /* deep navy */
--bg-2:  #0F1826   /* raised surface */
--surface: #121B2B /* cards */
--border:  rgba(255,255,255,0.08)
--border-strong: rgba(255,255,255,0.14)
--text-0: #F4F7FB /* primary */
--text-1: #AEBACB /* secondary */
--text-2: #6B7789 /* muted */
--accent-500: #3B82F6  /* primary accent — replace with CodeVyasa's real accent */
--accent-400: #22D3EE  /* cyan tip of gradient */
--accent-600: #2563EB
--violet-500: #7C3AED  /* AI/energy secondary */
--grad-brand: linear-gradient(120deg,#2563EB 0%,#22D3EE 50%,#7C3AED 100%)
--glow: 0 0 40px rgba(34,211,238,0.35)
```
Semantic usage: brand gradient appears in hero object, section eyebrow accents, active states, globe arcs, and the animated wordmark — nowhere else, to keep it premium.

### Type system (this is the #1 anti-AI signal — commit hard)
- **Display:** a variable editorial grotesk — **Clash Display** or **Satoshi** (Fontshare) for H1/H2/section titles.
- **Body/UI:** **Inter Tight** or **Geist**.
- **Mono (accents/labels/eyebrows/terminal easter egg):** **Geist Mono** or **JetBrains Mono**.
- Scale (fluid, `clamp()`): Display XL 88→160px, H1 56→104, H2 40→72, H3 28→40, body-lg 18→20, body 16, eyebrow 13 mono uppercase +0.16em tracking.
- Display headlines: tight tracking (−0.02em), line-height 0.95–1.02, mixed-weight where tasteful.

### Spacing / radius / shadow / grid
- Spacing scale (px): 2,4,8,12,16,24,32,48,64,96,128,192.
- Section vertical rhythm: 96–192px desktop, 64–96 mobile.
- Radii: sm 8, md 14, lg 22, pill 999. Cards: 1px `--border` + inset highlight + soft ambient shadow `0 24px 80px -32px rgba(0,0,0,.6)`.
- Layout: 12-col grid, max-width 1320px, 24–32px gutters; allow full-bleed sections. Use asymmetric/bento compositions, never centered-stack monotony.

---

## PART D — GLOBAL MOTION & INTERACTION SYSTEMS (site-wide)

Create `lib/motion.ts`:
```
ease.out   = [0.16, 1, 0.30, 1]     // primary, "expensive" ease-out-expo-ish
ease.inOut = [0.83, 0, 0.17, 1]     // transitions / pins
ease.soft  = [0.22, 0.61, 0.36, 1]
dur.xs=0.2 sm=0.4 md=0.6 lg=0.9 xl=1.2   (seconds)
stagger.tight=0.04 base=0.07 loose=0.12
```

1. **Preloader (first visit only, sessionStorage-gated):** brand mesh-gradient wash + logo mask draw-in (SVG stroke → fill), a mono counter 0→100, then a **curtain-up column wipe** (5 vertical panels, staggered 0.06s, `ease.inOut`, 0.9s) revealing the hero. Total ≤1.6s, skippable, disabled for reduced-motion.
2. **Lenis smooth scroll** (lerp ~0.1) synced to the GSAP ticker; all ScrollTriggers use it. Momentum feel, not laggy.
3. **Custom cursor = finite state machine** (`components/Cursor.tsx`): a 6px dot (instant) + 34px ring (spring, stiffness 400 / damping 40). States: `default` → `link` (ring grows to 56, mix-blend-difference) → `cta` (magnetic pull, label optional) → `view` (ring becomes filled pill "View →" over case cards) → `drag` (ring → "⇄ Drag" over carousels) → `text` (thin I-beam over inputs). Hide on touch devices.
4. **Magnetic elements:** CTAs, nav items, social icons, carousel arrows translate toward cursor up to 8–14px with a spring, snapping back on leave. Reusable `<Magnetic strength={n}>`.
5. **Scroll reveals (`<Reveal>`):** variants `fade-up` (y 24→0, opacity, dur.md, ease.out), `mask-up` (clip-path inset reveal), `word` and `char` split-text for headlines (stagger.base, dur.md). Trigger at 80% viewport, run once, batched via ScrollTrigger for perf.
6. **Section transitions:** thin gradient rule that "draws" left→right on enter; eyebrow label types in (mono). Parallax on media (±40–80px, scrub).
7. **Route transitions:** AnimatePresence + a full-screen brand-gradient panel that wipes in (0.5s ease.inOut), swaps route, wipes out; keep scroll position sane; no white flash. Shared-element morph for case-study thumbnail → detail hero where feasible.
8. **Animated backgrounds:** one low-GPU WebGL mesh-gradient/particle-grid field that drifts with scroll velocity + cursor; pauses when tab hidden or off-screen; static CSS gradient fallback.
9. **Micro-interaction catalog** (build all): magnetic buttons with animated gradient border sweep; link underlines that wipe in from left; **count-up** stats (IntersectionObserver, ease.out, 1.4s); tilt-on-hover cards (rotateX/Y ≤6°, spring) with a glare highlight; dual-direction infinite logo **marquees** (pause on hover); hover-preview on case cards (image scale 1.06 + reveal metric); button press micro-scale 0.98.

---

## PART E — HOMEPAGE, SECTION BY SECTION (with choreography)

**1. Hero — Accenture-scale, WebGL-backed.** Full viewport.
- Background: R3F scene — a slowly rotating **distorted sphere / particle brand-mark** using a custom vertex-displacement GLSL shader (noise-driven), colored with `--grad-brand`, subtle bloom, drifts toward the cursor (damped), and on scroll compresses + fades as the page moves down (ScrollTrigger scrub). Mesh-gradient + 4% grid overlay above it, vignette.
- Foreground: mono eyebrow ("PRODUCT ENGINEERING · AI · DATA"), H1 **"Digital Acceleration"** in Display XL, revealed **word-by-word** (mask-up, stagger.base) on preloader exit; sub "Innovative Services for a Transformed Digital World" fades up after. Primary magnetic CTA **"Contact Us"** + ghost "Our Work". Animated scroll cue.
- On reduced-motion: static gradient + still 3D frame.

**2. Trusted-by client wall (Recro-style).** Eyebrow + line "Trusted outsourcing partner for over 100 companies globally." Two infinite marquee rows (opposite directions, different speeds), real client logos grayscale → color + subtle lift on hover, pause on hover. Segment chips below: Fintech · International Clients · Unicorns · Retail · SaaS · IOT.

**3. Quantifying Excellence.** Bento grid of 6 stat tiles (200+ · 450+ · 90% · 96% · 80+ · 12+, exact labels). Count-up on enter, tiles tilt on hover, one hero tile spans 2 cols with a small animated sparkline/grid motif. Numbers use tabular mono.

**4. Our Expertise — interactive explorer.** 5 pillars (Product/SaaS, Data Engineering, DevOps & Cloud, AI, IOT). Left: vertical selectable list (active item slides an accent indicator, ease.out). Right: animated panel swaps the pillar's **exact blurb** + its sub-service links (all → real expertise pages) + a bespoke visual per pillar (e.g. animated data-pipeline nodes for Data, neural-net pulse for AI, container/deploy motif for DevOps). Cross-fade + y-stagger on switch.

**5. Featured Case Studies / Success Stories (Appinventiv-style).** Horizontal **drag carousel** (Framer Motion drag + inertia, or Embla + wheel/drag): each card = client logo, one-line outcome, 2 hard-metric count-ups (e.g. "4X ops improvement", "90% faster"), image with parallax, cursor → `view`. Snap points, progress bar, arrow + keyboard nav, edge fade. Cards deep-link to real `/case-study/...`. Include the 8 live case studies (Appendix 1).

**6. 🌍 GLOBAL PRESENCE — the signature moment.** Pinned section. Interactive **3D globe** (R3F): dark globe with glowing dotted landmasses, markers for **India, USA, Canada, Germany, UAE, Indonesia**, animated great-circle **arcs** pulsing between hubs (India as home base). Auto-rotates; on hover/drag it stops and a marker pops a card (region + focus + "expanding: Gulf/GCC" tag). Scroll scrubs the globe rotation to bring each region forward while a side panel updates copy. Counters: geographies, offices. If a full globe is heavy, ship a premium SVG world map with the same arc + marker choreography as fallback — but attempt the globe. **This is the screenshot section — make it flawless.**

**7. How We Work / Engagement models.** Clean bento explaining Staff Augmentation + Fixed Bid with minimalist animated diagrams (line-draw on scroll).

**8. Client Tales (testimonials).** Premium carousel with **exact** quotes/names/titles/company logos (Appendix 1). Large quote-mark motif, avatar, drag + auto-advance (pause on hover), animated progress dots.

**9. Awards / recognition** (optional, if badges supplied): mono marquee.

**10. Contact / Book a Meeting.** Headline "Expert Hands, Real Results Crafting Your Vision". Working form: Name*, Company Name, Email*, Phone Number, Requirements (Product/SaaS Development and Innovation, Data Engineering, Dev-Ops and Cloud, AI, IOT). Inline zod validation, animated focus states, real success/error UI, "BOOK A MEETING" CTA, phone +1 (904) 339-8674, sales@codevyasa.com. Subtle mesh-gradient backdrop.

**11. Footer.** Giant animated CodeVyasa wordmark (mask reveal on scroll). Four offices + exact addresses (Appendix 1). Link columns: Expertise, Technologies, Company (Work/About/Contact) — every current link. LinkedIn + Glassdoor. Updated copyright. Back-to-top magnetic button.

---

## PART F — SUB-PAGES (all real, all polished)

- **/work:** filterable case-study grid (industry/service filters animate with layout transitions), hover-preview cards, grid/drag toggle.
- **/case-study/[slug]:** editorial template — shared-element hero (client + outcome), Challenge / Approach / Solution / Results, oversized metric callouts (count-up), tech-stack chips, image parallax, prev/next case link. Content exact to live.
- **/expertise/[slug]** + **/technology/[slug]:** one strong reusable template each (hero, overview = exact live copy, capabilities grid, related cross-links, CTA). **Every** mega-menu + footer link resolves to a finished page (full slug lists in Appendix 1).
- **/about:** story, stats reprise, leadership (if provided), global-presence reprise, culture, CTA — exact live copy.
- **/contact:** full experience — form + offices (map) + direct contact + socials.

---

## PART G — BACKEND, SEO, PERFORMANCE

**Data model (Prisma):**
```
Submission { id, name, company?, email, phone?, requirement (enum), message?,
             source (page), ip, userAgent, createdAt }
```
**Contact API (`/api/contact`):** zod validation → honeypot + rate-limit (e.g. 5/min/IP) → persist → Resend email to sales@codevyasa.com (branded HTML template) → typed JSON `{ok}` / `{error}`. Turnstile-ready. Optimistic UI with success/error states.

**SEO:** per-page metadata + canonical, dynamic OG images, JSON-LD as above, `sitemap.xml`, `robots.txt`, semantic headings, alt text everywhere.

**Performance budget (enforce):** Lighthouse Perf ≥90 mobile / a11y 100 / SEO 100. LCP <2.5s, CLS <0.05, INP <200ms. Lazy-load all 3D (dynamic import, `ssr:false`) behind an intersection trigger; `next/image` for all raster; preload display font; cap R3F DPR at 2, pause loops off-screen; code-split heavy carousels. Ship a `prefers-reduced-motion` and low-power path.

---

## PART H — BUILD PHASES (self-check each gate before proceeding)

- **P1 — Foundations:** repo, tokens (Part C), `motion.ts`, Lenis+GSAP+cursor, layout, mega-menu, footer, content layer + **full crawl of live copy**. *Gate:* nav/footer links all resolve; smooth scroll + cursor feel right; tokens consistent.
- **P2 — Homepage:** all 11 sections with full choreography. *Gate:* hero WebGL + globe perform ≥50fps mid-tier laptop; reduced-motion path works; content verbatim.
- **P3 — Sub-pages:** case-study, expertise, technology, about, contact templates + all slug pages. *Gate:* every menu/footer link lands on a finished page; case-study detail matches live content.
- **P4 — Backend + SEO:** forms (email+DB), validation, OG, sitemap, JSON-LD, analytics. *Gate:* real submission arrives by email + stored; Lighthouse targets met.
- **P5 — Polish + deploy:** micro-interactions audit, route transitions, cross-browser + mobile QA, `README`, `.env.example`, `TODO_ASSETS.md`, Vercel deploy. *Gate:* clean clone → `pnpm i && pnpm dev` runs; production build passes.

Deliver a real design system in `components/` (Button, Magnetic, Cursor, Reveal, SplitText, Marquee, StatCounter, TiltCard, CaseStudyCarousel, ExpertiseExplorer, Globe, MegaMenu, Footer, PageTransition, Preloader, Field, etc.). Where I haven't supplied an asset, use tasteful branded placeholders and log it in `TODO_ASSETS.md`.

---

## APPENDIX 1 — CONTENT TO REPLICATE (crawl live for the rest)

**Sitemap.** Home `/`, `/work`, `/about`, `/contact`.
**Expertise** `/expertise/`: ux-ui-design, software-development, web-platform-development, mobile-application-development, application-modernization, support-and-maintenance, quality-control, data-lake-and-pipeline-design, etl, dashboarding-and-analytics, data-observability-and-quality, data-injection-pipeline, cloud-enablement-services, cloud-migration, devops-consulting, cloud-cyber-security-services, architecture-design, deep-learning, gen-ai, automation-rpa, embedded-system-design-and-testing, hardware-design-and-testing, data-injection-pipeline-2, data-analytics.
**Technology** `/technology/`: html-css, javascript, pwa, react, angular, vue-js, bootstrap, nextjs, backbonjs, java, python, ruby, php, node-js, go-lang, spark-scala, android, ios, kotlin, reactive-native, flutter, sql-databases, data-warehouse, dba-services, in-memory-cache-services.
**Case studies** `/case-study/`: codevyasa-a-reliable-tech-partner-for-international-giants, propelling-early-stage-tech-ventures-to-unprecedented-heights, from-startup-to-unicorn-our-journey-with-50-pioneers, codevyasas-impact-through-automation-qa, enhancing-data-pipelines-strengthening-connectivity-with-advanced-engineering, securing-energy-systems-fortifying-connectivity-with-embedded-technology, devops-and-sre-helping-enterprises-achieve-operational-efficiency, up-grad. (Add any others found live.)

**Verbatim homepage anchors** — Hero "Digital Acceleration" / "Innovative Services for a Transformed Digital World" / CTA "Contact Us". Trust line "CodeVyasa is a trusted Outsourcing partner for over 100 companies globally" + "Including giant unicorns, enterprises and startups". Segments: Fintech, International Clients, Unicorns, Retail, SaaS, IOT. Stats: **200+ Projects Undertaken, 450+ Technocrats, 90% CAGR, 96% Client Retention Rate, 80+ Clients, 12+ Industries**. Expertise blurbs (pull exact live text for Product/SaaS, Data Engineering, DevOps & Cloud, AI, IOT + their sub-links). **Client Tales:** Sandesh Gs — Global Head of Technology; Harish Rama Rao — Senior VP of Engineering; Jayant Chauhan — CPTO; Sayantani G — HR Manager; Jitendra Agrawal — Head of Technology (keep exact quotes + company logos). Contact: "Expert Hands, Real Results Crafting Your Vision", "BOOK A MEETING", **+1 (904) 339-8674**, **sales@codevyasa.com**. Footer offices: **Noida** — Logix Cyber Park, 10th Floor, Tower D, Smartworks, Sector 62, Noida, UP 201301; **Delhi** — Libaspur, Delhi 110042; **Bangalore** — 91 Springboard; **Florida, USA** — 55 Bush Pl, 32259 St. Johns, Florida. Footer link columns (Expertise, Technologies, Company) + LinkedIn + Glassdoor + copyright (current year).

## APPENDIX 2 — GLOBAL PRESENCE DATA
Markers + arcs for: **India** (home — Noida/Delhi/Bangalore), **USA** (Florida), **Canada**, **Germany**, **UAE** (Gulf/GCC expansion), **Indonesia**. Tag UAE/GCC as "Expanding". Arcs radiate from India to each hub.

## APPENDIX 3 — SIGNATURE / "WHO BUILT THIS?" ELEMENTS
3D globe with pulsing arcs · WebGL displaced-sphere hero reacting to cursor · word-by-word headline reveals · cursor state-machine + magnetic CTAs · drag success-story carousel with metric count-ups · cinematic route + preloader wipes · animated engagement-model diagrams · a subtle **mono "terminal" easter egg** in the AI/Product section (self-typing lines) · optional flagged **"Ask CodeVyasa" concierge** UI stub wired to a Route Handler. Taste gate: cut anything gimmicky; restraint reads as expensive.

## APPENDIX 4 — ANTI-"AI-LOOK" LAWS (hard requirements)
1. No generic centered hero-stack repeated down the page — use asymmetric/bento/editorial layouts. 2. No default component-library styling; bespoke design system only. 3. Committed premium typography with real hierarchy and mixed weights. 4. No emoji-as-icons, no clip-art; consistent custom icon set. 5. Real content only (Appendix 1) — zero lorem. 6. Intentional whitespace + optical alignment, not uniform padding. 7. Consistent motion language from `motion.ts` — no random durations. 8. One restrained accent-gradient system, not rainbow gradients everywhere. 9. Every interactive element has hover/focus/active/disabled states. 10. Pixel-tight spacing on a real scale; no arbitrary margins.

---

**Start now:** print the phased plan, list the exact assets + brand hex you need from me, flag any live page you can't access (I'll paste that content), then begin Phase 1.
