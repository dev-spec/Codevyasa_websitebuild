/* =============================================================================
   Particle-logo building blocks for the cinematic hero: pixel sampling of the
   real logo + a shader where particles swirl in, assemble, and then vanish into
   glass as the materialisation scan line passes over them.
   ========================================================================== */

export const LOGO_SRC = '/assets/brand/logo-mark.png';
export const FORM_DUR = 1.7; // per-particle flight time (s)
export const MAX_DELAY = 1.2; // stagger spread (s)
export const FORM_TOTAL = FORM_DUR + MAX_DELAY; // fully assembled

export type LogoSample = { x: number; y: number; z: number; r: number; g: number; b: number; kind: number };

/** Read the logo's pixels; every opaque one becomes a particle target (logo height = 1). */
export function sampleLogo(img: HTMLImageElement, cols: number) {
  const w = cols;
  const h = Math.round((cols * img.naturalHeight) / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const raw: LogoSample[] = [];
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 120) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const fx = x / w, fy = y / h;
      const inPrompt = fx > 0.305 && fx < 0.695 && fy > 0.335 && fy < 0.666;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isShadow = mx - mn < 0.14 && lum < 0.5;
      const kind = isShadow ? 2 : inPrompt ? 1 : 0;
      const z = kind === 1 ? 0.045 : kind === 2 ? (inPrompt ? 0.012 : -0.085) : 0;
      raw.push({ x, y, z, r, g, b, kind });
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rows = Math.max(1, maxY - minY);
  const s = 1 / rows;
  const pts = raw.map((p) => ({
    ...p,
    x: (p.x - cx + (Math.random() - 0.5) * 0.7) * s,
    y: -(p.y - cy + (Math.random() - 0.5) * 0.7) * s,
  }));
  return { pts, rows };
}

export const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uForm;
uniform float uFormDur;
uniform float uPixelRatio;
uniform float uSize;
uniform float uRefDist;
uniform float uLight;
uniform float uPulse;
uniform float uScanY;   // swept bottom-up: glass where y <= uScanY
uniform float uScanA;   // swept from the left:  glass where x <= uScanA
uniform float uScanB;   // swept from the right: glass where x >= uScanB
uniform float uScanBand;

attribute vec3 aStart;
attribute vec3 aColor;
attribute float aKind;
attribute float aSeed;
attribute float aDelay;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float started = step(0.0, uForm);
  float t = clamp((uForm - aDelay) / uFormDur, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 4.0);
  float isDust = step(2.5, aKind);

  // vortex flight from the scattered start
  float ang = (1.0 - e) * (3.2 + aSeed * 2.6) * (1.0 - isDust);
  float cs = cos(ang), sn = sin(ang);
  vec3 s = vec3(aStart.x * cs - aStart.z * sn, aStart.y, aStart.x * sn + aStart.z * cs);
  s.z *= 0.42;
  vec3 p = mix(s, position, e);
  p.y += sin(e * 3.14159) * (aSeed - 0.5) * 0.35 * (1.0 - isDust);
  p += vec3(
    sin(uTime * 1.3 + aSeed * 40.0),
    cos(uTime * 1.1 + aSeed * 31.0),
    sin(uTime * 0.9 + aSeed * 17.0)
  ) * (0.0032 + isDust * 0.04) * e;

  vec4 wp = modelMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;

  // materialisation: behind the scan front(s) the particles have become glass;
  // the band just ahead of a front flares like a cutting laser
  float swept = max(step(wp.y, uScanY), max(step(wp.x, uScanA), step(uScanB, wp.x)));
  float scanned = swept * (1.0 - isDust);
  float nearFront = max(
    1.0 - smoothstep(0.0, uScanBand, wp.y - uScanY),
    max(1.0 - smoothstep(0.0, uScanBand, wp.x - uScanA), 1.0 - smoothstep(0.0, uScanBand, uScanB - wp.x))
  );
  float front = nearFront * (1.0 - scanned) * (1.0 - isDust);

  float sizeK = aKind < 0.5 ? 1.0 : (aKind < 1.5 ? 1.12 : (aKind < 2.5 ? 0.95 : 0.75));
  float size = uSize * sizeK * (0.75 + aSeed * 0.5) * mix(1.9, 1.0, e) * (1.0 + front * 0.7);
  gl_PointSize = min(size * uPixelRatio * (uRefDist / max(-mv.z, 0.001)), 30.0 * uPixelRatio);

  vec3 darkCol = aKind < 0.5 ? aColor * vec3(0.85, 1.2, 1.2) : aColor * vec3(0.9, 1.25, 1.25);
  vec3 lightCol = aKind < 0.5 ? aColor * vec3(0.32, 0.62, 0.68) : aColor * vec3(0.3, 0.55, 0.6);
  vec3 col = mix(darkCol, lightCol, uLight);
  // the mark's shaded rim: deep teal (not grey — on white grey reads as dirt)
  if (aKind > 1.5 && aKind < 2.5) col = mix(vec3(0.1, 0.3, 0.36), vec3(0.02, 0.26, 0.31), uLight);
  if (aKind > 2.5) col = mix(vec3(0.45, 0.92, 0.98), vec3(0.04, 0.48, 0.56), uLight);
  col *= 1.0 + uPulse * 0.9 + front * mix(2.4, 0.6, uLight);
  vColor = pow(max(col, vec3(0.0)), vec3(2.2)); // authored sRGB → linear for the HDR pipeline

  float baseA = aKind < 0.5 ? 0.78 : (aKind < 1.5 ? 0.9 : (aKind < 2.5 ? 0.5 : 0.42));
  baseA = mix(baseA, min(1.0, baseA * 1.2), uLight);
  if (aKind > 2.5) baseA *= 1.0 - uLight; // motes glow in the dark; on white they read as dust
  float fadeIn = clamp(uForm / 0.6, 0.0, 1.0) * started;
  float headerFade = smoothstep(1.0, 0.8, gl_Position.y / gl_Position.w);
  vAlpha = baseA * mix(0.45, 1.0, e) * fadeIn * headerFade * (1.0 - scanned);
}
`;

export const PARTICLE_FRAG = /* glsl */ `
uniform float uLight;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float core = 1.0 - smoothstep(0.1, 0.26, r);
  float halo = pow(max(0.0, 1.0 - r * 2.0), 2.2);
  float glow = core * 0.9 + halo * 0.5;
  float disc = 1.0 - smoothstep(0.3, 0.48, r);
  gl_FragColor = vec4(vColor, vAlpha * mix(glow, disc, uLight));
  #include <colorspace_fragment>
}
`;
