# /public/assets

Drop-in location for real brand assets. The site works today with branded
placeholders; replace files here (and update the matching paths in `/content`)
as clearance/assets land. See the repo-root `TODO_ASSETS.md`.

```
brand/         logo-light.svg, logo-dark.svg, mark.svg   (placeholders — replace with official logos)
clients/       <client>.svg        client logos for the trust wall (content/site.ts › clientLogos)
case-studies/  <slug>.svg|.webp    1600×1000 hero images  (content/caseStudies.ts › heroImage)
team/          <name>.svg|.webp    400×400 headshots       (content/testimonials.ts › avatar)
offices/       <city>.webp         optional office photos
awards/        <badge>.svg         only real, verifiable badges (content/awards.ts)
```

Logos/icons → SVG (or ≥400px transparent PNG). Photos → WebP, ≤300KB where possible.
