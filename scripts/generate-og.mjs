// Generates the social OG image + apple-touch icon from an on-brand SVG.
// Requires `sharp` (dev-only, not a runtime dependency):
//    pnpm add -D sharp && node scripts/generate-og.mjs && pnpm remove sharp
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('[generate-og] `sharp` is not installed. Run: pnpm add -D sharp');
  process.exit(1);
}

const root = process.cwd();

const markGlyph = (scale = 1, ox = 0, oy = 0) => `
  <g transform="translate(${ox},${oy}) scale(${scale})" fill="none" stroke="#18BAB5" stroke-width="3.4" stroke-linejoin="round">
    <path d="M43 24 33.5 40.45 14.5 40.45 5 24 14.5 7.55 33.5 7.55Z"/>
    <path d="M14 17 22 24 14 31M25 31H34" stroke-width="3.6" stroke-linecap="round"/>
  </g>`;

const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#0891B2"/><stop offset="0.5" stop-color="#22D3EE"/><stop offset="1" stop-color="#2DD4BF"/>
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#0891B2" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#2DD4BF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#070A0F"/>
  <g stroke="rgba(255,255,255,0.05)">
    ${Array.from({ length: 21 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="630"/>`).join('')}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="1200" y2="${i * 60}"/>`).join('')}
  </g>
  <circle cx="980" cy="180" r="300" fill="url(#orb)"/>
  <g transform="translate(80,68)">
    ${markGlyph(1.05, 0, 0)}
    <text x="64" y="42" font-family="'Segoe UI',Arial,sans-serif" font-size="30" font-weight="700" fill="#F4F7FB">CodeVyasa</text>
  </g>
  <text x="80" y="330" font-family="'Consolas','Courier New',monospace" font-size="22" letter-spacing="6" fill="#22D3EE">PRODUCT ENGINEERING · AI · DATA</text>
  <text x="76" y="430" font-family="'Segoe UI',Arial,sans-serif" font-size="96" font-weight="800" fill="#F4F7FB">Digital Acceleration</text>
  <text x="80" y="500" font-family="'Segoe UI',Arial,sans-serif" font-size="30" fill="#AEBACB">Innovative Services for a Transformed Digital World</text>
  <text x="80" y="580" font-family="'Consolas','Courier New',monospace" font-size="22" fill="#6B7789">www.codevyasa.com</text>
</svg>`;

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#070A0F"/>
  <g transform="translate(100,100) scale(6.5)" fill="none" stroke="#18BAB5" stroke-width="3.4" stroke-linejoin="round">
    <path d="M43 24 33.5 40.45 14.5 40.45 5 24 14.5 7.55 33.5 7.55Z"/>
    <path d="M14 17 22 24 14 31M25 31H34" stroke-width="3.8" stroke-linecap="round"/>
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(ogSvg)).png().toFile(join(root, 'public', 'og.png'));
  console.log('[generate-og] public/og.png');
  await sharp(Buffer.from(iconSvg)).resize(180, 180).png().toFile(join(root, 'app', 'apple-icon.png'));
  console.log('[generate-og] app/apple-icon.png');
  await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(join(root, 'public', 'favicon-512.png'));
  console.log('[generate-og] public/favicon-512.png');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
