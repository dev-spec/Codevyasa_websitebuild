import * as THREE from 'three';

/** Soft light textures: a radial glow, a light curtain, and a tapered laser line. */
export function gradientTexture(kind: 'radial' | 'sheet' | 'line') {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  if (kind === 'radial') {
    // tight core, soft falloff that is fully gone well inside the quad — reads as light, not a disc
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.12, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.12)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    g.addColorStop(0.62, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  } else {
    // vertical profile × horizontal taper (no hard sides)
    const img = ctx.createImageData(s, s);
    for (let y = 0; y < s; y++) {
      // sheet: brightest at the canvas bottom (= bottom of the quad), fading up;
      // line: a thin gaussian core across the middle of the quad
      const vy = kind === 'sheet' ? Math.pow(y / (s - 1), 2.2) : Math.exp(-Math.pow((y - s / 2) / (s * 0.18), 2));
      for (let x = 0; x < s; x++) {
        const u = x / (s - 1);
        const taper = Math.pow(Math.sin(Math.PI * u), kind === 'line' ? 0.6 : 1.4);
        const a = Math.max(0, Math.min(1, vy * taper));
        const i = (y * s + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
