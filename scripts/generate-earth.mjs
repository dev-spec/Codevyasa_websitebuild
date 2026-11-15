// Bakes an equirectangular Earth texture (blue ocean, green land, country borders)
// from public-domain Natural Earth country polygons, and extracts country labels.
// Requires @napi-rs/canvas (dev-only):
//   pnpm add -D @napi-rs/canvas && node scripts/generate-earth.mjs && pnpm remove @napi-rs/canvas
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';

const SRC = process.argv[2] || 'C:/Users/Admin/AppData/Local/Temp/claude/geo/ne_110m_admin_0_countries.geojson';
const geo = JSON.parse(readFileSync(SRC, 'utf8'));

const W = 2048;
const H = 1024;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Ocean
ctx.fillStyle = '#a7d8ef';
ctx.fillRect(0, 0, W, H);

const proj = (lng, lat) => [((lng + 180) / 360) * W, ((90 - lat) / 180) * H];

ctx.lineJoin = 'round';
ctx.lineWidth = 1.1;
for (const f of geo.features) {
  const g = f.geometry;
  if (!g) continue;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const rings of polys) {
    // skip polygons that straddle the antimeridian to avoid wrap smears
    let minX = Infinity, maxX = -Infinity;
    for (const ring of rings) for (const [lng] of ring) { if (lng < minX) minX = lng; if (lng > maxX) maxX = lng; }
    if (maxX - minX > 180) continue;

    ctx.beginPath();
    for (const ring of rings) {
      ring.forEach(([lng, lat], i) => {
        const [x, y] = proj(lng, lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
    ctx.fillStyle = '#aedaa0';
    ctx.fill('evenodd');
    ctx.strokeStyle = 'rgba(78,112,84,0.55)';
    ctx.stroke();
  }
}

mkdirSync(new URL('../public/textures/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/textures/earth.png', import.meta.url), canvas.toBuffer('image/png'));

const labels = geo.features
  .map((f) => ({
    name: f.properties.NAME,
    lat: f.properties.LABEL_Y,
    lng: f.properties.LABEL_X,
    rank: f.properties.LABELRANK,
  }))
  .filter((l) => l.name && Number.isFinite(l.lat) && Number.isFinite(l.lng))
  .map((l) => ({ ...l, lat: Math.round(l.lat * 100) / 100, lng: Math.round(l.lng * 100) / 100 }));

writeFileSync(
  new URL('../content/countryLabels.ts', import.meta.url),
  `// AUTO-GENERATED from public-domain Natural Earth admin-0 (LABEL_X/Y). Do not edit by hand.
export interface CountryLabel { name: string; lat: number; lng: number; rank: number }
export const countryLabels: CountryLabel[] = ${JSON.stringify(labels)};
`
);

console.log(`[earth] public/textures/earth.png (${W}x${H}) + ${labels.length} labels → content/countryLabels.ts`);
