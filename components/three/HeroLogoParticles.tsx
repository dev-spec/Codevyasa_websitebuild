'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion, useTheme } from '@/lib/hooks';
import { Floor, Hud, Network, Streams } from './heroFx';

/* =============================================================================
   HeroLogoParticles — the CodeVyasa mark, built from thousands of particles,
   inside a living 3D world.

   Logo
   • Sampled live from the real logo file (public/assets/brand/logo-mark.png).
   • On load (when the preloader lifts) the particles swirl in on a vortex and
     assemble the hexagon; the `>_` prompt "types in" left-to-right last, then a
     pulse fires as it locks into place.
   • Once formed it rotates in true 3D (the extrusion sits on its own depth layer)
     holding front-facing between turns. Hover scatters the particles.

   World (components/three/heroFx.ts)
   • Holographic grid floor drifting toward the viewer, horizon glow, and a sonar
     pulse that ripples out from beneath the logo.
   • A neural constellation fills the space behind the headline, signals firing
     along its links; data comets stream from it into the logo.
   • A HUD (ring, rotating ticks, scan arc, tilted orbits with beads) frames the
     logo, with leader lines out to two glass stat chips that count up.
   • The camera drifts and parallaxes with the pointer, so everything has depth.

   Theme-aware throughout (additive glow on dark, crisp teal on light, cross-
   fading on toggle). Perf: one canvas / loop, pauses off-screen and in hidden
   tabs, DPR capped, lighter on phones, a still frame under reduced motion.
   ========================================================================== */

const LOGO_SRC = '/assets/brand/logo-mark.png';
const CAM_Z = 420;
const FORM_DUR = 1.7; // per-particle flight time (s)
const MAX_DELAY = 1.2; // stagger spread (s)
const FORM_TOTAL = FORM_DUR + MAX_DELAY; // fully assembled
const CYCLE = 9; // rotation cycle once formed (s)
const HOLD = 5.2; // front-facing hold inside each cycle (s)
const FIRST_SPIN_AFTER = 2.2; // first turn starts this long after forming (s)
const DUST = 520;
const NAV_H = 76;

type Sample = { x: number; y: number; z: number; r: number; g: number; b: number; kind: number };

/** Read the logo's pixels and turn every opaque one into a particle target. */
function sampleLogo(img: HTMLImageElement, cols: number) {
  const w = cols;
  const h = Math.round((cols * img.naturalHeight) / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const raw: Sample[] = [];
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 120) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const fx = x / w, fy = y / h;
      // The `>_` prompt lives in this box of the source artwork.
      const inPrompt = fx > 0.305 && fx < 0.695 && fy > 0.335 && fy < 0.666;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isShadow = mx - mn < 0.14 && lum < 0.5;
      const kind = isShadow ? 2 : inPrompt ? 1 : 0;
      // Depth layers: prompt raised, face at 0, extrusion pushed back.
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
  const s = 1 / rows; // logo height normalised to 1
  const pts = raw.map((p) => ({
    ...p,
    x: (p.x - cx + (Math.random() - 0.5) * 0.7) * s,
    y: -(p.y - cy + (Math.random() - 0.5) * 0.7) * s,
  }));
  return { pts, rows };
}

const VERT = /* glsl */ `
uniform float uTime;
uniform float uForm;
uniform float uFormDur;
uniform float uPixelRatio;
uniform float uSize;
uniform float uLight;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uAspect;
uniform float uPulse;

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

  // Vortex: the scattered start point swirls around the logo's axis as it flies in.
  float ang = (1.0 - e) * (3.2 + aSeed * 2.6) * (1.0 - isDust);
  float cs = cos(ang), sn = sin(ang);
  vec3 s = vec3(aStart.x * cs - aStart.z * sn, aStart.y, aStart.x * sn + aStart.z * cs);
  s.z *= 0.42; // flatten the vortex so no particle swings through the camera
  vec3 p = mix(s, position, e);
  p.y += sin(e * 3.14159) * (aSeed - 0.5) * 0.35 * (1.0 - isDust);

  // Living shimmer once settled; dust drifts in a slow orbit.
  p += vec3(
    sin(uTime * 1.3 + aSeed * 40.0),
    cos(uTime * 1.1 + aSeed * 31.0),
    sin(uTime * 0.9 + aSeed * 17.0)
  ) * (0.0032 + isDust * 0.035) * e;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;

  // Cursor repel, in screen space so it works at any rotation.
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float f = smoothstep(0.2, 0.0, dist) * uMouseStrength * e;
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  dir.x /= uAspect;
  clip.xy += dir * f * 0.085 * clip.w;
  gl_Position = clip;

  float sizeK = aKind < 0.5 ? 1.0 : (aKind < 1.5 ? 1.12 : (aKind < 2.5 ? 0.95 : 0.7));
  float size = uSize * sizeK * (0.75 + aSeed * 0.5) * mix(1.9, 1.0, e);
  gl_PointSize = min(size * uPixelRatio * (320.0 / max(-mv.z, 1.0)), 30.0 * uPixelRatio);

  // Colour: neon brand cyan on dark, deep saturated teal on light for contrast.
  // The ring stays brighter than the prompt glyph, like the real artwork.
  vec3 darkCol = aKind < 0.5 ? aColor * vec3(0.85, 1.2, 1.2) : aColor * vec3(0.9, 1.25, 1.25);
  vec3 lightCol = aKind < 0.5 ? aColor * vec3(0.32, 0.62, 0.68) : aColor * vec3(0.3, 0.55, 0.6);
  vec3 col = mix(darkCol, lightCol, uLight);
  if (aKind > 1.5 && aKind < 2.5) col = mix(vec3(0.1, 0.3, 0.36), vec3(0.24, 0.22, 0.24), uLight);
  if (aKind > 2.5) col = mix(vec3(0.3, 0.9, 0.95), vec3(0.03, 0.45, 0.52), uLight);
  col *= 1.0 + uPulse * 0.9;
  vColor = col;

  float baseA = aKind < 0.5 ? 0.78 : (aKind < 1.5 ? 0.9 : (aKind < 2.5 ? 0.5 : 0.32));
  baseA = mix(baseA, min(1.0, baseA * 1.2), uLight);
  if (aKind > 2.5) baseA *= mix(1.0, 0.65, uLight);
  float fadeIn = clamp(uForm / 0.6, 0.0, 1.0) * started;
  // keep the nav band clean: fade anything drifting behind the header
  float headerFade = smoothstep(1.0, 0.8, ndc.y);
  vAlpha = baseA * mix(0.45, 1.0, e) * fadeIn * headerFade;
}
`;

const FRAG = /* glsl */ `
uniform float uLight;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  // Dark: bright core with a soft bloom halo. Light: a crisp, solid bead.
  float core = 1.0 - smoothstep(0.1, 0.26, r);
  float halo = pow(max(0.0, 1.0 - r * 2.0), 2.2);
  float glow = core * 0.9 + halo * 0.5;
  float disc = 1.0 - smoothstep(0.3, 0.48, r);
  gl_FragColor = vec4(vColor, vAlpha * mix(glow, disc, uLight));
}
`;

function easeInOutCubic(k: number) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

function haloTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/** Static still of the logo — used if WebGL is unavailable. */
function StaticLogo() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[13svh] lg:items-center lg:justify-end lg:pr-[max(3rem,calc((100vw-1320px)/2+4rem))] lg:pt-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SRC} alt="" className="h-[28svh] w-auto lg:h-[54vh]" draggable={false} />
    </div>
  );
}

function CountUp({ to, on }: { to: number; on: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const start = performance.now() + 250;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / 1400));
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, to]);
  return <>{v}</>;
}

/** Glass stat chip that hangs off the HUD on a leader line. */
function StatChip({
  on,
  label,
  value,
  suffix,
  caption,
  bar,
  delay,
}: {
  on: boolean;
  label: string;
  value: number;
  suffix: string;
  caption: string;
  bar: number;
  delay: number;
}) {
  return (
    <div
      className={`w-[200px] rounded-2xl border border-[var(--border-strong)] px-4 py-3 shadow-[0_22px_55px_-26px_rgba(8,110,135,0.6)] transition-all duration-700 ease-out ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
      style={{ background: 'color-mix(in srgb, var(--bg-1) 84%, transparent)', transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-400" />
        </span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="tabular font-display text-[28px] font-semibold leading-none text-text-0">
          <CountUp to={value} on={on} />
          {suffix}
        </span>
        <span className="text-[12px] leading-tight text-text-2">{caption}</span>
      </div>
      <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-grad-brand transition-[width] duration-[1600ms] ease-out"
          style={{ width: on ? `${bar}%` : '0%', transitionDelay: `${delay + 250}ms` }}
        />
      </div>
    </div>
  );
}

export default function HeroLogoParticles({ ready = true }: { ready?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipsWrapRef = useRef<HTMLDivElement>(null);
  const chipARef = useRef<HTMLDivElement>(null);
  const chipBRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const [chipsOn, setChipsOn] = useState(false);

  const readyRef = useRef(ready);
  readyRef.current = ready;
  const lightRef = useRef(theme === 'light');
  lightRef.current = theme === 'light';
  const kickRef = useRef<() => void>(() => {});

  // Repaint on theme change (matters when paused / reduced-motion).
  useEffect(() => {
    kickRef.current();
  }, [theme, ready]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 1, 6000);
    camera.position.set(0, 0, CAM_Z);
    const group = new THREE.Group();

    // ---------------------------------------------------------------- world
    const small = container.clientWidth < 768;
    const fx = {
      floor: new Floor(),
      network: new Network(small ? 40 : 92, dpr),
      streams: new Streams(small ? 4 : 7, dpr),
      hud: new Hud(dpr),
    };
    scene.add(fx.floor.mesh, fx.network.group, fx.streams.group, fx.hud.group, group);

    const uniforms = {
      uTime: { value: 0 },
      uForm: { value: -1 },
      uFormDur: { value: FORM_DUR },
      uPixelRatio: { value: dpr },
      uSize: { value: 4 },
      uLight: { value: lightRef.current ? 1 : 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseStrength: { value: 0 },
      uAspect: { value: 1 },
      uPulse: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const haloTex = haloTexture();
    const haloMat = new THREE.SpriteMaterial({
      map: haloTex,
      color: new THREE.Color('#22d3ee'),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      opacity: 0,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(2.1);
    halo.position.z = -0.2;
    halo.renderOrder = 0;
    group.add(halo);

    // Every material that swaps additive (dark) ↔ normal (light) blending.
    const blendMats: THREE.Material[] = [material, haloMat, fx.floor.mat, ...fx.network.mats, ...fx.streams.mats, ...fx.hud.mats];
    let additive = !lightRef.current;
    const applyBlending = () => {
      const b = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      for (const m of blendMats) {
        m.blending = b;
        m.needsUpdate = true;
      }
    };
    applyBlending();

    let geometry: THREE.BufferGeometry | null = null;
    let points: THREE.Points | null = null;
    let rows = 150;
    let disposed = false;
    let pxToWorld = 1;
    let viewW = 1;

    // ---------------------------------------------------------------- chips
    const layoutChips = (desktop: boolean, w: number, h: number, cxPx: number, cyPx: number, logoPx: number) => {
      const A = chipARef.current;
      const B = chipBRef.current;
      if (!desktop || !A || !B || !A.offsetWidth || !B.offsetWidth) {
        fx.hud.setLeaders(null, null);
        return;
      }
      const aw = A.offsetWidth, ah = A.offsetHeight, bw = B.offsetWidth, bh = B.offsetHeight;
      // A sits above-left of the logo, B below-right — both clear of the copy.
      let aLeft = cxPx - logoPx * 0.6 - aw;
      let aTop = cyPx - logoPx * 0.6 - ah;
      const title = document.querySelector('[data-hero-title]');
      if (title) {
        const tr = title.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        const titleRight = tr.right - cr.left;
        const titleTop = tr.top - cr.top;
        if (aTop + ah > titleTop - 14 && aLeft < titleRight + 36) aLeft = titleRight + 36;
      }
      aTop = Math.max(aTop, NAV_H + 18);
      const bLeft = Math.min(cxPx + logoPx * 0.6, w - bw - 28);
      const bTop = Math.min(cyPx + logoPx * 0.6, h - bh - 30);
      A.style.transform = `translate3d(${aLeft}px, ${aTop}px, 0)`;
      B.style.transform = `translate3d(${bLeft}px, ${bTop}px, 0)`;
      const toHud = (px: number, py: number): [number, number] => [(px - cxPx) / logoPx, (cyPx - py) / logoPx];
      fx.hud.setLeaders(toHud(aLeft + aw - 20, aTop + ah), toHud(bLeft + 20, bTop));
    };

    // ---------------------------------------------------------------- layout
    const layout = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      viewW = w;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
      pxToWorld = visH / h;
      const vh = Math.min(window.innerHeight, h);
      const desktop = w >= 1024;
      let cxPx: number, cyPx: number, logoPx: number;
      let shellL = 0;
      if (desktop) {
        const pad = Math.min(32, Math.max(20, w * 0.04));
        const shellW = Math.min(1320, w) - pad * 2;
        shellL = (w - shellW) / 2;
        cxPx = shellL + shellW * 0.745;
        cyPx = h * 0.5 + 28;
        logoPx = Math.min(vh * 0.54, shellW * 0.34);
      } else {
        cxPx = w / 2;
        cyPx = vh * 0.285;
        logoPx = Math.min(w * 0.46, vh * 0.25);
      }
      const wx = (px: number) => (px - w / 2) * pxToWorld;
      const wy = (py: number) => (h / 2 - py) * pxToWorld;

      group.position.set(wx(cxPx), wy(cyPx), 0);
      const logoWorld = logoPx * pxToWorld;
      group.scale.setScalar(logoWorld);
      uniforms.uAspect.value = w / h;
      uniforms.uSize.value = (logoPx / rows) * 2.05;

      fx.floor.layout(visH);
      fx.hud.place(group.position.x, group.position.y, logoWorld);
      if (desktop) {
        // constellation owns the headline band; the floor owns the lower copy area
        fx.network.layout(wx(shellL - 10), wx(cxPx - logoPx * 0.8 - 30), wy(h * 0.6), wy(Math.max(NAV_H + 34, h * 0.14)));
        fx.streams.configure(fx.network.nodes, (n) => n.u, (n) => n.v, 150, 222);
      } else {
        fx.network.layout(wx(0), wx(w), wy(h * 0.97), wy(cyPx + logoPx * 0.8));
        fx.streams.configure(fx.network.nodes, (n) => n.v, (n) => n.u, 240, 300);
      }
      layoutChips(desktop, w, h, cxPx, cyPx, logoPx);
      return { w, h, visH };
    };

    // ------------------------------------------------------------- particles
    const build = (img: HTMLImageElement) => {
      if (disposed) return;
      const sampled = sampleLogo(img, small ? 160 : 250);
      rows = sampled.rows;
      let pts = sampled.pts;
      const cap = small ? 6500 : 15000;
      if (pts.length > cap) pts = pts.sort(() => Math.random() - 0.5).slice(0, cap);

      const { w, h } = layout();
      const scale = group.scale.x;
      const visW = w * pxToWorld;
      const visH = h * pxToWorld;

      // prompt extent → left-to-right "typing" order for the `>_`
      let pMin = Infinity, pMax = -Infinity;
      for (const p of pts) if (p.kind === 1) { pMin = Math.min(pMin, p.x); pMax = Math.max(pMax, p.x); }
      const pW = Math.max(0.0001, pMax - pMin);

      const n = pts.length + DUST;
      const target = new Float32Array(n * 3);
      const start = new Float32Array(n * 3);
      const color = new Float32Array(n * 3);
      const kind = new Float32Array(n);
      const seed = new Float32Array(n);
      const delay = new Float32Array(n);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        target.set([p.x, p.y, p.z], i * 3);
        color.set([p.r, p.g, p.b], i * 3);
        kind[i] = p.kind;
        seed[i] = Math.random();
        // Start: scattered across the whole hero (and some from far off-screen),
        // expressed in the logo group's local space.
        let wxp: number, wyp: number, wzp: number;
        if (Math.random() < 0.72) {
          wxp = (Math.random() - 0.5) * visW * 1.2;
          wyp = (Math.random() - 0.5) * visH * 1.2;
          wzp = (Math.random() - 0.5) * 360;
        } else {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(2 * Math.random() - 1);
          const rad = visW * (0.6 + Math.random() * 0.6);
          wxp = Math.sin(ph) * Math.cos(th) * rad;
          wyp = Math.sin(ph) * Math.sin(th) * rad * 0.6;
          wzp = Math.cos(ph) * rad * 0.5;
        }
        start.set([(wxp - group.position.x) / scale, (wyp - group.position.y) / scale, wzp / scale], i * 3);
        if (p.kind === 1) {
          // `>_` types in left → right, last.
          delay[i] = MAX_DELAY * (0.55 + 0.4 * ((p.x - pMin) / pW) + Math.random() * 0.05);
        } else {
          // Hexagon assembles in a rotating sweep.
          const a = (Math.atan2(p.y, p.x) + Math.PI) / (Math.PI * 2);
          delay[i] = MAX_DELAY * (0.55 * a + 0.3 * Math.random());
        }
      }

      for (let j = 0; j < DUST; j++) {
        const i = pts.length + j;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const rad = 0.62 + Math.random() * 0.55;
        const x = Math.sin(ph) * Math.cos(th) * rad;
        const y = Math.sin(ph) * Math.sin(th) * rad * 0.9;
        const z = Math.cos(ph) * rad * 0.6;
        target.set([x, y, z], i * 3);
        start.set([x, y, z], i * 3);
        color.set([0.25, 0.85, 0.9], i * 3);
        kind[i] = 3;
        seed[i] = Math.random();
        delay[i] = 0.4 + Math.random() * 1.4;
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(target, 3));
      geometry.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
      geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
      geometry.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
      geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
      points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      points.renderOrder = 2;
      group.add(points);
      kick();
    };

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => build(img);
    img.onerror = () => setFailed(true);
    img.src = LOGO_SRC;

    // ------------------------------------------------------------- pointer
    const mouse = { x: 9, y: 9, inside: false };
    const tilt = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouse.inside = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1;
      mouse.x = nx;
      mouse.y = ny;
    };
    const onLeave = () => {
      mouse.inside = false;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    // --------------------------------------------------------------- loop
    let raf = 0;
    let visible = true;
    let elapsed = 0;
    let formStart = -1;
    let last = 0;
    let chipsShown = false;

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      const live = !reduced;
      if (live) elapsed += dt;

      // Formation is cued by the preloader lifting; restart if it re-shows.
      if (points) {
        if (reduced) formStart = elapsed - 100;
        else if (formStart < 0 && readyRef.current) formStart = elapsed + 0.15;
        else if (formStart >= 0 && !readyRef.current) formStart = -1;
      }
      const form = formStart < 0 ? -1 : elapsed - formStart;
      uniforms.uForm.value = form;
      uniforms.uTime.value = elapsed;

      // Theme cross-fade (+ blending swap at the midpoint).
      const lt = lightRef.current ? 1 : 0;
      uniforms.uLight.value = reduced ? lt : uniforms.uLight.value + (lt - uniforms.uLight.value) * Math.min(1, dt * 6);
      const l = uniforms.uLight.value;
      if (l < 0.5 !== additive) {
        additive = l < 0.5;
        applyBlending();
      }

      // Logo rotation: hold front-facing, then an eased full turn; gentle sway.
      const after = form - FORM_TOTAL;
      let spin = 0;
      let pulse = 0;
      if (live && after > 0) {
        const ct = (after + (HOLD - FIRST_SPIN_AFTER)) % CYCLE;
        if (ct > HOLD) spin = easeInOutCubic((ct - HOLD) / (CYCLE - HOLD)) * Math.PI * 2;
        spin += Math.sin(after * 0.55) * 0.1;
        pulse = Math.exp(-after * 3.5);
      }
      uniforms.uPulse.value = pulse;

      // Cursor: repel + subtle tilt; the camera parallaxes (and idly drifts).
      const m = mouse.inside && live ? 1 : 0;
      uniforms.uMouseStrength.value += (m - uniforms.uMouseStrength.value) * Math.min(1, dt * 5);
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      tilt.y += ((m ? mouse.x * 0.22 : 0) - tilt.y) * Math.min(1, dt * 3);
      tilt.x += ((m ? -mouse.y * 0.14 : 0) - tilt.x) * Math.min(1, dt * 3);
      group.rotation.set(tilt.x, spin + tilt.y, 0);

      const camTX = live ? (m ? mouse.x * 10 : Math.sin(elapsed * 0.21) * 5) : 0;
      const camTY = live ? (m ? mouse.y * 6 : Math.cos(elapsed * 0.17) * 3) : 0;
      cam.x += (camTX - cam.x) * Math.min(1, dt * 2.2);
      cam.y += (camTY - cam.y) * Math.min(1, dt * 2.2);
      camera.position.set(cam.x, cam.y, CAM_Z);
      const wrap = chipsWrapRef.current;
      if (wrap) wrap.style.transform = `translate3d(${(-cam.x / pxToWorld).toFixed(2)}px, ${(cam.y / pxToWorld).toFixed(2)}px, 0)`;

      const formed = form < 0 ? 0 : Math.min(1, Math.max(0, (form - 0.6) / FORM_TOTAL));
      haloMat.opacity = (l > 0.5 ? 0.1 : 0.22) * formed * (1 + pulse * 1.5);

      // World choreography: floor → network → HUD → streams → chips.
      const ap = (at: number, dur: number) => (reduced ? 1 : form < 0 ? 0 : Math.min(1, Math.max(0, (form - at) / dur)));
      const desk = viewW >= 1024;
      let scanR = 0;
      let scanA = 0;
      if (live && after > 0) {
        const k = (after % 6.5) / 4.8;
        if (k < 1) {
          scanR = k * 1800;
          scanA = (1 - k) * 0.75;
        }
      }
      fx.floor.update(elapsed, l, ap(0, 1.6) * (desk ? 1 : 0.7), group.position.x, scanR, scanA, CAM_Z);
      fx.network.update(elapsed, dt, live, l, ap(0.25, 1.8) * (desk ? 1 : 0.5));
      fx.streams.update(elapsed, fx.network.cur, group.position.x, group.position.y, group.scale.x * 0.62, l, ap(FORM_TOTAL, 1.4) * (desk ? 1 : 0.7), live);
      const chipsK = ap(FORM_TOTAL + 0.3, 0.9);
      fx.hud.update(elapsed, ap(FORM_TOTAL - 0.5, 1.2), chipsK, l, live, tilt.x, tilt.y);
      if (chipsK > 0 && !chipsShown) {
        chipsShown = true;
        setChipsOn(true);
      }

      renderer.render(scene, camera);
      if (live && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    kickRef.current = () => {
      last = 0;
      kick();
    };

    layout();
    kick();
    // Re-measure once web fonts settle (the headline width drives chip placement).
    document.fonts?.ready.then(() => {
      if (!disposed) {
        layout();
        kick();
      }
    });

    const onResize = () => {
      layout();
      kick();
    };
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting;
        if (visible) {
          last = 0;
          kick();
        }
      },
      { rootMargin: '60px' },
    );
    io.observe(container);
    const onVisibility = () => {
      if (!document.hidden) {
        last = 0;
        kick();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      kickRef.current = () => {};
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      img.onload = null;
      geometry?.dispose();
      material.dispose();
      haloMat.dispose();
      haloTex.dispose();
      fx.floor.dispose();
      fx.network.dispose();
      fx.streams.dispose();
      fx.hud.dispose();
      renderer.dispose();
    };
  }, [reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      {failed ? <StaticLogo /> : <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />}

      {/* Desktop readability scrim — soft, so the 3D world still reads behind the headline. */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(95deg, color-mix(in srgb, var(--bg-0) 55%, transparent) 0%, color-mix(in srgb, var(--bg-0) 26%, transparent) 32%, transparent 56%)',
        }}
      />

      {!failed && (
        <div ref={chipsWrapRef} className="pointer-events-none absolute inset-0 hidden lg:block">
          <div ref={chipARef} className="absolute left-0 top-0 will-change-transform" style={{ transform: 'translate3d(-9999px,0,0)' }}>
            <StatChip on={chipsOn} label="Delivered" value={200} suffix="+" caption="projects shipped" bar={82} delay={0} />
          </div>
          <div ref={chipBRef} className="absolute left-0 top-0 will-change-transform" style={{ transform: 'translate3d(-9999px,0,0)' }}>
            <StatChip on={chipsOn} label="Client trust" value={96} suffix="%" caption="retention rate" bar={96} delay={180} />
          </div>
        </div>
      )}
    </div>
  );
}
