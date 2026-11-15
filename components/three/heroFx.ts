import * as THREE from 'three';

/* =============================================================================
   Hero FX — the 3D world around the particle logo. Plain three.js classes
   (no React) that share one scene / render loop with HeroLogoParticles:

     Floor    holographic perspective grid + horizon glow + sonar pulse
     Network  neural constellation behind the headline, signals firing on edges
     Streams  data comets flowing from the network into the logo
     Hud      precision ring, ticks, scan arc, tilted orbits + chip leader lines

   Every class renders in light AND dark: colours cross-fade on `light` (0..1)
   and the owner swaps additive ↔ normal blending at the midpoint.
   ========================================================================== */

export const CYAN_DARK = new THREE.Color('#22d3ee');
export const CYAN_LIGHT = new THREE.Color('#0e7490');
const GLOW_DARK = new THREE.Color('#7dedfb');
const GLOW_LIGHT = new THREE.Color('#0b6a83');

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------- materials */

const LINE_VERT = /* glsl */ `
attribute float aAlpha;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uDepthFade;
varying float vAlpha;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  float side = clamp((w.z - uCenter.z) / max(uRadius, 0.0001), -1.0, 1.0);
  vAlpha = aAlpha * mix(1.0, 0.2 + 0.8 * smoothstep(-0.9, 0.4, side), uDepthFade);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const LINE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, vAlpha * uOpacity); }`;

const GLOW_VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
uniform float uPixelRatio;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(aSize * uPixelRatio * (320.0 / max(-mv.z, 1.0)), 26.0 * uPixelRatio);
  vAlpha = aAlpha;
}`;

const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uLight;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float glow = (1.0 - smoothstep(0.08, 0.24, r)) * 0.95 + pow(max(0.0, 1.0 - r * 2.0), 2.0) * 0.55;
  float disc = 1.0 - smoothstep(0.26, 0.46, r);
  gl_FragColor = vec4(uColor, mix(glow, disc, uLight) * vAlpha * uOpacity);
}`;

function lineMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: 1 },
      uDepthFade: { value: 0 },
    },
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

function glowMat(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0 },
      uLight: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Colour + opacity for a themed material. */
function paint(m: THREE.ShaderMaterial, light: number, opacity: number, dark = CYAN_DARK, lite = CYAN_LIGHT) {
  (m.uniforms.uColor.value as THREE.Color).copy(dark).lerp(lite, light);
  m.uniforms.uOpacity.value = opacity;
  if (m.uniforms.uLight) m.uniforms.uLight.value = light;
}

function dyn(arr: Float32Array, size: number) {
  const a = new THREE.BufferAttribute(arr, size);
  a.setUsage(THREE.DynamicDrawUsage);
  return a;
}

function pointsGeo(n: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', dyn(new Float32Array(n * 3), 3));
  g.setAttribute('aSize', dyn(new Float32Array(n), 1));
  g.setAttribute('aAlpha', dyn(new Float32Array(n), 1));
  return g;
}

function linesGeo(verts: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', dyn(new Float32Array(verts * 3), 3));
  g.setAttribute('aAlpha', dyn(new Float32Array(verts).fill(1), 1));
  return g;
}

/** Circle / arc as LineSegments vertices in the XY plane. */
function arcGeo(r: number, from: number, sweep: number, segs: number, alpha?: (k: number) => number) {
  const g = linesGeo(segs * 2);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const a = g.getAttribute('aAlpha') as THREE.BufferAttribute;
  for (let i = 0; i < segs; i++) {
    const t0 = from + (sweep * i) / segs;
    const t1 = from + (sweep * (i + 1)) / segs;
    p.setXYZ(i * 2, Math.cos(t0) * r, Math.sin(t0) * r, 0);
    p.setXYZ(i * 2 + 1, Math.cos(t1) * r, Math.sin(t1) * r, 0);
    const al = alpha ? alpha(i / segs) : 1;
    a.setX(i * 2, al);
    a.setX(i * 2 + 1, al);
  }
  return g;
}

/* ------------------------------------------------------------------ floor */

const FLOOR_VERT = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const FLOOR_FRAG = /* glsl */ `
uniform float uTime;
uniform float uLight;
uniform float uOpacity;
uniform vec2 uScanCenter;
uniform float uScanR;
uniform float uScanA;
uniform float uCamZ;
varying vec3 vW;

float grid(vec2 p, float cell, float w) {
  vec2 q = p / cell;
  vec2 g = abs(fract(q - 0.5) - 0.5) / (fwidth(q) * w);
  return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
  float dist = uCamZ - vW.z;
  vec2 p = vec2(vW.x, vW.z + uTime * 14.0);
  float minor = grid(p, 40.0, 1.0);
  float major = grid(p, 200.0, 1.5);
  float far = 1.0 - smoothstep(850.0, 2050.0, dist);
  float side = 1.0 - smoothstep(900.0, 2500.0, abs(vW.x));
  float fade = far * side;

  // sonar pulse: thin, and it dies out before it reaches the copy on the left
  float r = length(vec2(vW.x, vW.z) - uScanCenter);
  float ring = exp(-pow((r - uScanR) / 18.0, 2.0)) * uScanA * (1.0 - smoothstep(250.0, 1300.0, r));
  float haze = exp(-pow((dist - 1720.0) / 340.0, 2.0)) * side;

  vec3 col = mix(vec3(0.13, 0.83, 0.93), vec3(0.03, 0.45, 0.57), uLight);
  float lines = minor * 0.3 + major * 0.55;
  float a = lines * mix(0.5, 0.36, uLight) * fade;
  a += ring * (0.08 + lines * 1.6) * fade;
  a += haze * mix(0.065, 0.04, uLight);
  gl_FragColor = vec4(col, a * uOpacity);
}`;

export class Floor {
  readonly mesh: THREE.Mesh;
  readonly mat: THREE.ShaderMaterial;

  constructor() {
    const geo = new THREE.PlaneGeometry(6000, 2800, 1, 1);
    geo.rotateX(-Math.PI / 2);
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLight: { value: 0 },
        uOpacity: { value: 0 },
        uScanCenter: { value: new THREE.Vector2() },
        uScanR: { value: 0 },
        uScanA: { value: 0 },
        uCamZ: { value: 420 },
      },
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.position.set(0, -118, -1100);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -4;
  }

  layout(visH: number) {
    this.mesh.position.y = -visH * 0.448;
  }

  update(time: number, light: number, opacity: number, scanX: number, scanR: number, scanA: number, camZ: number) {
    const u = this.mat.uniforms;
    u.uTime.value = time;
    u.uLight.value = light;
    u.uOpacity.value = opacity;
    (u.uScanCenter.value as THREE.Vector2).set(scanX, 0);
    u.uScanR.value = scanR;
    u.uScanA.value = scanA;
    u.uCamZ.value = camZ;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}

/* ---------------------------------------------------------------- network */

export type NetNode = { u: number; v: number; z: number; p1: number; p2: number; hub: boolean };

export class Network {
  readonly group = new THREE.Group();
  readonly nodes: NetNode[] = [];
  readonly cur: Float32Array;
  readonly mats: THREE.ShaderMaterial[];
  private base: Float32Array;
  private edges: [number, number][] = [];
  private adj: number[][];
  private nodeGeo: THREE.BufferGeometry;
  private lineGeo: THREE.BufferGeometry;
  private pulseGeo: THREE.BufferGeometry;
  private nodeMat: THREE.ShaderMaterial;
  private lineMat: THREE.ShaderMaterial;
  private pulseMat: THREE.ShaderMaterial;
  private pulses: { e: number; dir: number; t: number; sp: number }[] = [];

  constructor(count: number, pixelRatio: number) {
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        u: Math.random(),
        v: Math.random(),
        z: Math.random() * 2 - 1,
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2,
        hub: Math.random() < 0.12,
      });
    }
    // k-nearest links in a space stretched like the (wide) region they fill
    this.adj = this.nodes.map(() => []);
    const seen = new Set<string>();
    for (let i = 0; i < count; i++) {
      const d = this.nodes
        .map((n, j) => ({ j, d: Math.hypot((n.u - this.nodes[i].u) * 1.6, n.v - this.nodes[i].v) }))
        .filter((x) => x.j !== i && x.d < 0.3)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of d) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const e = this.edges.push([Math.min(i, j), Math.max(i, j)]) - 1;
        this.adj[i].push(e);
        this.adj[j].push(e);
      }
    }

    this.base = new Float32Array(count * 3);
    this.cur = new Float32Array(count * 3);

    this.nodeGeo = pointsGeo(count);
    const ns = this.nodeGeo.getAttribute('aSize') as THREE.BufferAttribute;
    const na = this.nodeGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    this.nodes.forEach((n, i) => {
      ns.setX(i, n.hub ? 7.5 : 3.2 + Math.random() * 2.6);
      na.setX(i, (n.hub ? 1 : 0.7) * (0.55 + 0.45 * ((n.z + 1) / 2)));
    });
    this.nodeMat = glowMat(pixelRatio);
    const pts = new THREE.Points(this.nodeGeo, this.nodeMat);

    this.lineGeo = linesGeo(this.edges.length * 2);
    const la = this.lineGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    this.edges.forEach(([a, b], k) => {
      const na2 = this.nodes[a], nb = this.nodes[b];
      const len = Math.hypot((na2.u - nb.u) * 1.6, na2.v - nb.v);
      const al = (1 - len / 0.32) * (0.5 + 0.5 * ((na2.z + nb.z + 2) / 4));
      la.setX(k * 2, al);
      la.setX(k * 2 + 1, al);
    });
    this.lineMat = lineMat();
    const lines = new THREE.LineSegments(this.lineGeo, this.lineMat);

    const P = Math.min(22, this.edges.length);
    for (let i = 0; i < P; i++) {
      this.pulses.push({
        e: Math.floor(Math.random() * this.edges.length),
        dir: Math.random() < 0.5 ? 0 : 1,
        t: Math.random(),
        sp: 0.45 + Math.random() * 0.6,
      });
    }
    this.pulseGeo = pointsGeo(P);
    const ps = this.pulseGeo.getAttribute('aSize') as THREE.BufferAttribute;
    for (let i = 0; i < P; i++) ps.setX(i, 6.5);
    this.pulseMat = glowMat(pixelRatio);
    const pulses = new THREE.Points(this.pulseGeo, this.pulseMat);

    for (const o of [lines, pts, pulses]) {
      o.frustumCulled = false;
      o.renderOrder = -3;
    }
    this.group.add(lines, pts, pulses);
    this.mats = [this.nodeMat, this.lineMat, this.pulseMat];
  }

  /** Map the constellation into a world-space box (z spread for depth). */
  layout(xLeft: number, xRight: number, yBottom: number, yTop: number) {
    this.nodes.forEach((n, i) => {
      this.base[i * 3] = xLeft + n.u * (xRight - xLeft);
      this.base[i * 3 + 1] = yBottom + n.v * (yTop - yBottom);
      this.base[i * 3 + 2] = -55 + n.z * 95;
    });
    this.cur.set(this.base);
  }

  update(time: number, dt: number, animate: boolean, light: number, opacity: number) {
    const n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      const nd = this.nodes[i];
      const k = animate ? 1 : 0;
      this.cur[i * 3] = this.base[i * 3] + Math.sin(time * 0.23 + nd.p1) * 7 * k;
      this.cur[i * 3 + 1] = this.base[i * 3 + 1] + Math.cos(time * 0.19 + nd.p2) * 6 * k;
      this.cur[i * 3 + 2] = this.base[i * 3 + 2] + Math.sin(time * 0.17 + nd.p1 + nd.p2) * 10 * k;
    }
    const np = this.nodeGeo.getAttribute('position') as THREE.BufferAttribute;
    (np.array as Float32Array).set(this.cur);
    np.needsUpdate = true;

    const lp = this.lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const la = lp.array as Float32Array;
    this.edges.forEach(([a, b], k) => {
      la[k * 6] = this.cur[a * 3];
      la[k * 6 + 1] = this.cur[a * 3 + 1];
      la[k * 6 + 2] = this.cur[a * 3 + 2];
      la[k * 6 + 3] = this.cur[b * 3];
      la[k * 6 + 4] = this.cur[b * 3 + 1];
      la[k * 6 + 5] = this.cur[b * 3 + 2];
    });
    lp.needsUpdate = true;

    // signals hop node → node along the links
    const pp = this.pulseGeo.getAttribute('position') as THREE.BufferAttribute;
    const pa = this.pulseGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    this.pulses.forEach((p, i) => {
      if (animate) {
        p.t += dt * p.sp;
        if (p.t >= 1) {
          const [a, b] = this.edges[p.e];
          const at = p.dir === 0 ? b : a;
          const options = this.adj[at].filter((e) => e !== p.e);
          const next = options.length ? options[Math.floor(Math.random() * options.length)] : p.e;
          p.e = next;
          p.dir = this.edges[next][0] === at ? 0 : 1;
          p.t = 0;
          p.sp = 0.45 + Math.random() * 0.6;
        }
      }
      const [a, b] = this.edges[p.e];
      const from = p.dir === 0 ? a : b;
      const to = p.dir === 0 ? b : a;
      pp.setXYZ(
        i,
        this.cur[from * 3] + (this.cur[to * 3] - this.cur[from * 3]) * p.t,
        this.cur[from * 3 + 1] + (this.cur[to * 3 + 1] - this.cur[from * 3 + 1]) * p.t,
        this.cur[from * 3 + 2] + (this.cur[to * 3 + 2] - this.cur[from * 3 + 2]) * p.t,
      );
      pa.setX(i, Math.sin(Math.PI * p.t));
    });
    pp.needsUpdate = true;
    pa.needsUpdate = true;

    paint(this.lineMat, light, opacity * (light > 0.5 ? 0.3 : 0.4));
    paint(this.nodeMat, light, opacity * (light > 0.5 ? 0.85 : 1));
    paint(this.pulseMat, light, opacity, GLOW_DARK, GLOW_LIGHT);
  }

  dispose() {
    this.nodeGeo.dispose();
    this.lineGeo.dispose();
    this.pulseGeo.dispose();
    this.mats.forEach((m) => m.dispose());
  }
}

/* ---------------------------------------------------------------- streams */

const SEGS = 44;
const TAIL = 8;
const COMETS = 2;

function bez(a: number, b: number, c: number, d: number, t: number) {
  const m = 1 - t;
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
}

export class Streams {
  readonly group = new THREE.Group();
  readonly mats: THREE.ShaderMaterial[];
  private n: number;
  private src: number[] = [];
  private ang: number[] = [];
  private r1: number[] = [];
  private r2: number[] = [];
  private sp: number[] = [];
  private off: number[] = [];
  private lineGeo: THREE.BufferGeometry;
  private cometGeo: THREE.BufferGeometry;
  private lineMat: THREE.ShaderMaterial;
  private cometMat: THREE.ShaderMaterial;
  private pts = new Float32Array(12);

  constructor(n: number, pixelRatio: number) {
    this.n = n;
    for (let i = 0; i < n; i++) {
      this.r1.push(Math.random());
      this.r2.push(Math.random());
      this.sp.push(0.3 + Math.random() * 0.16);
      this.off.push(Math.random());
    }
    this.lineGeo = linesGeo(n * SEGS * 2);
    const la = this.lineGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    for (let s = 0; s < n; s++) {
      for (let i = 0; i < SEGS; i++) {
        for (const [k, t] of [
          [0, i / SEGS],
          [1, (i + 1) / SEGS],
        ] as const) {
          la.setX((s * SEGS + i) * 2 + k, smooth(0, 0.22, t) * (0.25 + 0.75 * t));
        }
      }
    }
    this.lineMat = lineMat();
    const lines = new THREE.LineSegments(this.lineGeo, this.lineMat);

    this.cometGeo = pointsGeo(n * COMETS * TAIL);
    const cs = this.cometGeo.getAttribute('aSize') as THREE.BufferAttribute;
    for (let i = 0; i < n * COMETS * TAIL; i++) cs.setX(i, 9.5 * (1 - ((i % TAIL) / TAIL) * 0.72));
    this.cometMat = glowMat(pixelRatio);
    const comets = new THREE.Points(this.cometGeo, this.cometMat);

    for (const o of [lines, comets]) {
      o.frustumCulled = false;
      o.renderOrder = -2;
    }
    this.group.add(lines, comets);
    this.mats = [this.lineMat, this.cometMat];
  }

  /** Pick the network nodes that feed the logo, and the ring angles they enter at (degrees). */
  configure(nodes: NetNode[], score: (n: NetNode) => number, spread: (n: NetNode) => number, angFrom: number, angTo: number) {
    const order = nodes.map((nd, i) => ({ i, s: score(nd), w: spread(nd) })).sort((a, b) => b.s - a.s);
    const chosen: { i: number; w: number }[] = [];
    for (const c of order) {
      if (chosen.length >= this.n) break;
      if (chosen.every((x) => Math.abs(x.w - c.w) > 0.09)) chosen.push(c);
    }
    while (chosen.length < this.n) chosen.push(order[chosen.length % order.length]);
    chosen.sort((a, b) => b.w - a.w);
    this.src = chosen.map((c) => c.i);
    this.ang = this.src.map((_, k) => THREE.MathUtils.degToRad(angFrom + ((angTo - angFrom) * (k + 0.5)) / this.n));
  }

  update(time: number, cur: Float32Array, cx: number, cy: number, R: number, light: number, opacity: number, animate: boolean) {
    if (!this.src.length) return;
    const lp = this.lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const cp = this.cometGeo.getAttribute('position') as THREE.BufferAttribute;
    const ca = this.cometGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    const P = this.pts;

    for (let s = 0; s < this.n; s++) {
      const si = this.src[s] * 3;
      const a = this.ang[s];
      const ux = Math.cos(a), uy = Math.sin(a);
      // P0 node · P3 on the ring · P1/P2 shape a smooth approach from outside
      P[0] = cur[si]; P[1] = cur[si + 1]; P[2] = cur[si + 2];
      P[9] = cx + ux * R; P[10] = cy + uy * R; P[11] = 0;
      P[3] = P[0] + (P[9] - P[0]) * 0.38; P[4] = P[1] + (P[10] - P[1]) * 0.08 + (this.r1[s] - 0.5) * 70; P[5] = 50 + this.r2[s] * 60;
      P[6] = P[9] + ux * R * 0.8; P[7] = P[10] + uy * R * 0.8 + (this.r1[s] - 0.5) * R * 0.3; P[8] = 30;

      for (let i = 0; i < SEGS; i++) {
        for (let k = 0; k < 2; k++) {
          const t = (i + k) / SEGS;
          lp.setXYZ((s * SEGS + i) * 2 + k, bez(P[0], P[3], P[6], P[9], t), bez(P[1], P[4], P[7], P[10], t), bez(P[2], P[5], P[8], P[11], t));
        }
      }

      for (let c = 0; c < COMETS; c++) {
        const head = animate ? (time * this.sp[s] + this.off[s] + c / COMETS) % 1 : (this.off[s] + c / COMETS) % 1;
        for (let j = 0; j < TAIL; j++) {
          const t = clamp01(head - j * 0.017);
          const idx = (s * COMETS + c) * TAIL + j;
          cp.setXYZ(idx, bez(P[0], P[3], P[6], P[9], t), bez(P[1], P[4], P[7], P[10], t), bez(P[2], P[5], P[8], P[11], t));
          const ends = smooth(0, 0.1, head) * (1 - smooth(0.9, 1, head));
          ca.setX(idx, Math.pow(1 - j / TAIL, 1.5) * ends);
        }
      }
    }
    lp.needsUpdate = true;
    cp.needsUpdate = true;
    ca.needsUpdate = true;

    paint(this.lineMat, light, opacity * (light > 0.5 ? 0.5 : 0.48));
    paint(this.cometMat, light, opacity, GLOW_DARK, GLOW_LIGHT);
  }

  dispose() {
    this.lineGeo.dispose();
    this.cometGeo.dispose();
    this.mats.forEach((m) => m.dispose());
  }
}

/* -------------------------------------------------------------------- hud */

type Part = { obj: THREE.Object3D; mat: THREE.ShaderMaterial; base: number; baseLight: number; depth?: boolean };

export class Hud {
  readonly group = new THREE.Group();
  readonly mats: THREE.ShaderMaterial[] = [];
  private parts: Part[] = [];
  private ticks: THREE.Group;
  private arcs: THREE.Group;
  private dashed: THREE.Group;
  private orbitA: THREE.Group;
  private orbitB: THREE.Group;
  private leaderGeo: THREE.BufferGeometry;
  private leaderMat: THREE.ShaderMaterial;
  private beadGeo: THREE.BufferGeometry;
  private beadMat: THREE.ShaderMaterial;
  private leaders: (number[] | null)[] = [null, null];
  private v = new THREE.Vector3();

  constructor(pixelRatio: number) {
    const add = (geo: THREE.BufferGeometry, parent: THREE.Object3D, base: number, baseLight: number, depth = false) => {
      const mat = lineMat();
      const obj = new THREE.LineSegments(geo, mat);
      obj.frustumCulled = false;
      obj.renderOrder = -1;
      parent.add(obj);
      this.parts.push({ obj, mat, base, baseLight, depth });
      this.mats.push(mat);
    };

    add(arcGeo(0.62, 0, Math.PI * 2, 160), this.group, 0.4, 0.45);

    this.ticks = new THREE.Group();
    const T = 120;
    const tg = linesGeo(T * 2);
    const tp = tg.getAttribute('position') as THREE.BufferAttribute;
    const ta = tg.getAttribute('aAlpha') as THREE.BufferAttribute;
    for (let i = 0; i < T; i++) {
      const a = (i / T) * Math.PI * 2;
      const major = i % 10 === 0;
      const r0 = 0.648, r1 = major ? 0.695 : 0.668;
      tp.setXYZ(i * 2, Math.cos(a) * r0, Math.sin(a) * r0, 0);
      tp.setXYZ(i * 2 + 1, Math.cos(a) * r1, Math.sin(a) * r1, 0);
      ta.setX(i * 2, major ? 1 : 0.55);
      ta.setX(i * 2 + 1, major ? 1 : 0.55);
    }
    add(tg, this.ticks, 0.55, 0.55);
    this.group.add(this.ticks);

    this.arcs = new THREE.Group();
    add(arcGeo(0.62, 0, THREE.MathUtils.degToRad(52), 40, (k) => 0.15 + 0.85 * k), this.arcs, 1, 0.9);
    add(arcGeo(0.62, Math.PI, THREE.MathUtils.degToRad(20), 16, (k) => 0.15 + 0.85 * k), this.arcs, 0.85, 0.8);
    this.group.add(this.arcs);

    this.dashed = new THREE.Group();
    const D = 90;
    const dg = linesGeo(D * 2);
    const dp = dg.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < D; i++) {
      const a0 = (i / D) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / D / 2;
      dp.setXYZ(i * 2, Math.cos(a0) * 0.71, Math.sin(a0) * 0.71, 0);
      dp.setXYZ(i * 2 + 1, Math.cos(a1) * 0.71, Math.sin(a1) * 0.71, 0);
    }
    add(dg, this.dashed, 0.26, 0.3);
    this.group.add(this.dashed);

    this.orbitA = new THREE.Group();
    this.orbitA.rotation.order = 'YXZ';
    add(arcGeo(0.76, 0, Math.PI * 2, 140), this.orbitA, 0.42, 0.45, true);
    this.orbitB = new THREE.Group();
    this.orbitB.rotation.order = 'YXZ';
    add(arcGeo(0.82, 0, Math.PI * 2, 150), this.orbitB, 0.3, 0.36, true);
    this.group.add(this.orbitA, this.orbitB);

    this.leaderGeo = linesGeo(4);
    this.leaderMat = lineMat();
    const leader = new THREE.LineSegments(this.leaderGeo, this.leaderMat);
    leader.frustumCulled = false;
    leader.renderOrder = -1;
    this.group.add(leader);
    this.mats.push(this.leaderMat);

    // beads: 2 orbit beads + 4 leader end-points
    this.beadGeo = pointsGeo(6);
    const bs = this.beadGeo.getAttribute('aSize') as THREE.BufferAttribute;
    [9, 8, 4.5, 4.5, 4.5, 4.5].forEach((s, i) => bs.setX(i, s));
    this.beadMat = glowMat(pixelRatio);
    const beads = new THREE.Points(this.beadGeo, this.beadMat);
    beads.frustumCulled = false;
    beads.renderOrder = -1;
    this.group.add(beads);
    this.mats.push(this.beadMat);
  }

  /** Centre on the logo; `scale` = the logo's world height (HUD units are logo-heights). */
  place(x: number, y: number, scale: number) {
    this.group.position.set(x, y, 0);
    this.group.userData.scale = scale;
  }

  /** Leader end-points in HUD units, or null to hide. Each starts on the ring. */
  setLeaders(a: [number, number] | null, b: [number, number] | null) {
    this.leaders = [a, b].map((p) => {
      if (!p) return null;
      const len = Math.hypot(p[0], p[1]);
      if (len < 0.76) return null;
      return [(p[0] / len) * 0.7, (p[1] / len) * 0.7, p[0], p[1]];
    });
  }

  update(time: number, appear: number, chips: number, light: number, animate: boolean, tiltX: number, tiltY: number) {
    const scale = (this.group.userData.scale as number) || 1;
    const k = 1 - Math.pow(1 - clamp01(appear), 3);
    this.group.scale.setScalar(scale * (0.9 + 0.1 * k));
    this.group.rotation.set(tiltX * 0.5, tiltY * 0.5, 0);

    const t = animate ? time : 0;
    this.ticks.rotation.z = t * 0.035;
    this.arcs.rotation.z = -t * 0.55 + (1 - k) * 2.2;
    this.dashed.rotation.z = -t * 0.05;
    this.orbitA.rotation.set(1.2, t * 0.14, -0.42);
    this.orbitB.rotation.set(1.02, -t * 0.1 + 1.4, 0.55);

    this.group.updateMatrixWorld(true);
    const center = this.group.getWorldPosition(this.v.set(0, 0, 0)).clone();

    for (const p of this.parts) {
      p.mat.uniforms.uDepthFade.value = p.depth ? 1 : 0;
      (p.mat.uniforms.uCenter.value as THREE.Vector3).copy(center);
      p.mat.uniforms.uRadius.value = scale * 0.85;
      paint(p.mat, light, k * (light > 0.5 ? p.baseLight : p.base));
    }

    // leaders
    const lp = this.leaderGeo.getAttribute('position') as THREE.BufferAttribute;
    const la = this.leaderGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    this.leaders.forEach((l, i) => {
      if (l) {
        lp.setXYZ(i * 2, l[0], l[1], 0);
        lp.setXYZ(i * 2 + 1, l[2], l[3], 0);
      }
      la.setX(i * 2, l ? 1 : 0);
      la.setX(i * 2 + 1, l ? 0.6 : 0);
    });
    lp.needsUpdate = true;
    la.needsUpdate = true;
    paint(this.leaderMat, light, clamp01(chips) * (light > 0.5 ? 0.6 : 0.5));

    // beads riding the two orbits (dim when behind the logo) + leader end dots
    const bp = this.beadGeo.getAttribute('position') as THREE.BufferAttribute;
    const ba = this.beadGeo.getAttribute('aAlpha') as THREE.BufferAttribute;
    const orbitBead = (g: THREE.Group, r: number, ang: number, i: number) => {
      g.updateMatrix();
      this.v.set(Math.cos(ang) * r, Math.sin(ang) * r, 0).applyMatrix4(g.matrix);
      bp.setXYZ(i, this.v.x, this.v.y, this.v.z);
      ba.setX(i, 0.25 + 0.75 * smooth(-0.6, 0.35, this.v.z / r));
    };
    orbitBead(this.orbitA, 0.76, t * 0.85 + 0.6, 0);
    orbitBead(this.orbitB, 0.82, -t * 0.65 + 2.4, 1);
    this.leaders.forEach((l, i) => {
      for (let e = 0; e < 2; e++) {
        const idx = 2 + i * 2 + e;
        if (l) bp.setXYZ(idx, l[e * 2], l[e * 2 + 1], 0);
        ba.setX(idx, l ? clamp01(chips) : 0);
      }
    });
    bp.needsUpdate = true;
    ba.needsUpdate = true;
    paint(this.beadMat, light, k, GLOW_DARK, GLOW_LIGHT);
  }

  dispose() {
    this.group.traverse((o) => {
      if (o instanceof THREE.LineSegments || o instanceof THREE.Points) o.geometry.dispose();
    });
    this.mats.forEach((m) => m.dispose());
  }
}
