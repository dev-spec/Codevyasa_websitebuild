'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { usePrefersReducedMotion, useTheme } from '@/lib/hooks';
import { BURST_FRAG, BURST_VERT, HALFTONE_FRAG, SCREEN_VERT } from './halftone';
import { buildRobot, dressHuman, HandRig, loadHand, mixPose, type HandPose } from './handRig';
import { FORM_DUR, FORM_TOTAL, LOGO_SRC, MAX_DELAY, PARTICLE_FRAG, PARTICLE_VERT, sampleLogo, type LogoSample } from './logoParticles';

/* =============================================================================
   HeroHands — "Creation".

   A robotic hand (AI) and a human hand reach toward each other from the edges
   of the hero, drawn as a living dot-matrix screen over real 3D hands. Between
   their fingertips the CodeVyasa mark assembles from scattered particles; as it
   locks in, the particles flare and a burst of light spills cyan onto both
   fingertips. The particle mark then turns between them.
   The cursor drifts the camera (the dots ripple with the 3D parallax).

   Perf: one Canvas; the hands render into a tiny offscreen buffer (≈ one texel
   per dot); pauses off-screen; DPR capped; lighter on phones; still frame under
   reduced motion.
   ========================================================================== */

const CAM_Z = 10;
const FOV = 30;
const HANDS_IN = 1.7; // dot-matrix boot-in of the hands (s)
const FORM_AT = 0.45; // particles start swirling in
const DONE = FORM_AT + FORM_TOTAL; // the particle mark locks in → flare + burst
const CYCLE = 10; // turn cycle once formed (s)
const HOLD = 6.2; // front-facing hold inside each cycle (s)
const FIRST_SPIN = 2.2;
const DUST = 300;
const HAND_LEN = 0.17; // wrist → index tip in the hand model (m)
const BG = { dark: '#070a0f', light: '#f7f9fc' };

const HAND_URL = { robot: '/assets/models/hand-right.glb', human: '/assets/models/hand-left.glb' };

// Robot: the reaching "creator" hand — index straight and sure, the rest relaxed
// so every machined finger reads in silhouette.
const ROBOT_POSE: HandPose = {
  thumb: { flex: [10, 14, 8] },
  'index-finger': { flex: [0, 2, 3, 2] },
  'middle-finger': { flex: [2, 24, 34, 18] },
  'ring-finger': { flex: [4, 32, 42, 22] },
  'pinky-finger': { flex: [6, 38, 46, 26], spread: -4 },
};
const ROBOT_IDLE: HandPose = {
  thumb: { flex: [12, 17, 10] },
  'index-finger': { flex: [0, 4, 5, 3] },
  'middle-finger': { flex: [2, 28, 38, 20] },
  'ring-finger': { flex: [4, 36, 46, 24] },
  'pinky-finger': { flex: [6, 42, 50, 28], spread: -4 },
};
// Human: relaxed, reaching — gentle natural curl, index just extended.
const HUMAN_POSE: HandPose = {
  thumb: { flex: [8, 12, 10] },
  'index-finger': { flex: [0, 10, 18, 10] },
  'middle-finger': { flex: [1, 30, 46, 26] },
  'ring-finger': { flex: [3, 38, 54, 30] },
  'pinky-finger': { flex: [5, 44, 56, 32], spread: -3 },
};
const HUMAN_IDLE: HandPose = {
  thumb: { flex: [10, 15, 12] },
  'index-finger': { flex: [0, 14, 22, 12] },
  'middle-finger': { flex: [1, 35, 50, 28] },
  'ring-finger': { flex: [3, 42, 58, 32] },
  'pinky-finger': { flex: [5, 48, 60, 34], spread: -3 },
};

type Layout = {
  x: number;
  y: number;
  s: number;
  desktop: boolean;
  visW: number;
  visH: number;
  ppw: number;
  handLen: number;
  gap: number;
  /** how steeply the hands rise toward the mark (fingers' up-component) */
  tilt: number;
  cellCss: number;
};

/** Mark centred in the upper band (copy sits below it); hands scale with the viewport. */
function computeLayout(w: number, h: number): Layout {
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
  const visW = visH * (w / h);
  const ppw = visH / h;
  const vh = Math.min(typeof window === 'undefined' ? h : window.innerHeight, h);
  const desktop = w >= 1024;
  const cx = w / 2;
  let cy: number, logoPx: number, handPx: number, gapPx: number;
  if (desktop) {
    cy = vh * 0.4;
    logoPx = Math.min(vh * 0.3, w * 0.16);
    handPx = Math.min(w * 0.27, vh * 0.72);
    gapPx = Math.max(18, w * 0.014);
  } else if (w >= 640) {
    // tablet: the desktop composition, scaled
    cy = vh * 0.3;
    logoPx = Math.min(w * 0.22, vh * 0.2);
    handPx = w * 0.4;
    gapPx = 12;
  } else {
    // phone: a "V" — both hands rise from the lower corners toward the mark,
    // using the screen diagonal so each hand reads whole
    cy = vh * 0.25;
    logoPx = Math.min(w * 0.28, vh * 0.16);
    handPx = w * 0.62;
    gapPx = 4;
  }
  const tilt = desktop ? 0.11 : w >= 640 ? 0.25 : 0.62;
  return {
    x: (cx - w / 2) * ppw,
    y: (h / 2 - cy) * ppw,
    s: logoPx * ppw,
    desktop,
    visW,
    visH,
    ppw,
    handLen: handPx * ppw,
    gap: gapPx * ppw,
    tilt,
    cellCss: Math.min(7.5, Math.max(4, w / 260)),
  };
}

function easeInOutCubic(k: number) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

/* --------------------------------------------------------------------- scene */

function Scene({ ready, isLight, reduced }: { ready: boolean; isLight: boolean; reduced: boolean }) {
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const L = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);

  const readyRef = useRef(ready);
  readyRef.current = ready;

  /* ---------- hands: their own lit scene, rendered into a dot-sized buffer */
  const hands = useMemo(() => {
    const s = new THREE.Scene();
    // contrasty studio light: form reads in the dot sizes; a cool rim outlines the silhouettes
    s.add(new THREE.HemisphereLight('#d6ecff', '#1a1f26', 0.35));
    const key = new THREE.DirectionalLight('#ffffff', 2.7);
    key.position.set(-2, 5, 6);
    const rim = new THREE.DirectionalLight('#9fe9ff', 2.4);
    rim.position.set(0, 3, -5);
    const logo = new THREE.PointLight('#22d3ee', 0, 0, 2);
    s.add(key, rim, logo);
    const mats = {
      skin: new THREE.MeshStandardMaterial({ color: '#e0a387', roughness: 0.6, metalness: 0, envMapIntensity: 0.5 }),
      robot: {
        // satin alloy: enough diffuse that the form reads in dots, enough sheen to look machined
        shell: new THREE.MeshStandardMaterial({ color: '#e4eaf0', metalness: 0.3, roughness: 0.48, envMapIntensity: 0.8 }),
        joint: new THREE.MeshStandardMaterial({ color: '#56616d', metalness: 0.6, roughness: 0.4, envMapIntensity: 0.8 }),
        dark: new THREE.MeshStandardMaterial({ color: '#151b21', metalness: 0.4, roughness: 0.55 }),
        core: new THREE.MeshBasicMaterial({ color: new THREE.Color('#22d3ee').multiplyScalar(2.2), toneMapped: false }),
      },
    };
    const rt = new THREE.WebGLRenderTarget(4, 4, {
      type: THREE.HalfFloatType,
      samples: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 4 : 0,
    });
    return { scene: s, logoLight: logo, mats, rt };
  }, []);

  const [rigs, setRigs] = useState<{ robot: HandRig; human: HandRig } | null>(null);
  useEffect(() => {
    let dead = false;
    Promise.all([loadHand(HAND_URL.robot), loadHand(HAND_URL.human)])
      .then(([r, h]) => {
        if (dead) return;
        const robot = new HandRig(r, 'right');
        buildRobot(robot, hands.mats.robot);
        const human = new HandRig(h, 'left');
        dressHuman(human, hands.mats.skin);
        hands.scene.add(robot.root, human.root);
        setRigs({ robot, human });
      })
      .catch(() => {
        /* no hands → the mark still forms on its own */
      });
    return () => {
      dead = true;
    };
  }, [hands]);

  const halftone = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: hands.rt.texture },
          uRes: { value: new THREE.Vector2(1, 1) },
          uCell: { value: 8 },
          uLight: { value: 0 },
          uReveal: { value: 0 },
        },
        vertexShader: SCREEN_VERT,
        fragmentShader: HALFTONE_FRAG,
        transparent: true,
        depthWrite: false,
      }),
    [hands],
  );

  // the hands buffer: ~2×2 texels per dot (the dot pass averages each cell)
  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const cell = L.cellCss * dpr;
    const bw = size.width * dpr;
    const bh = size.height * dpr;
    hands.rt.setSize(Math.ceil(bw / cell) * 2, Math.ceil(bh / cell) * 2);
    halftone.uniforms.uRes.value.set(bw, bh);
    halftone.uniforms.uCell.value = cell;
  }, [gl, hands, halftone, L, size.width, size.height]);

  /* ---------- the mark: a particle logo (it stays particles — no solid/glass stage) */
  const [sample, setSample] = useState<{ pts: LogoSample[]; rows: number } | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setSample(sampleLogo(img, window.innerWidth < 768 ? 150 : 230));
    img.onerror = () => setImgFailed(true);
    img.src = LOGO_SRC;
    return () => {
      img.onload = null;
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: -1 },
      uFormDur: { value: FORM_DUR },
      uPixelRatio: { value: 1 },
      uSize: { value: 3 },
      uRefDist: { value: CAM_Z * 0.76 },
      uLight: { value: 0 },
      uPulse: { value: 0 },
      uScanY: { value: -1e5 },
      uScanA: { value: -1e5 },
      uScanB: { value: 1e5 },
      uScanBand: { value: 0.1 },
    }),
    [],
  );
  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [uniforms, isLight],
  );
  const burst = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uIntensity: { value: 0 },
          uSpin: { value: 0 },
          uReach: { value: 0.4 },
          uHole: { value: 0.3 },
          uLight: { value: isLight ? 1 : 0 },
        },
        vertexShader: BURST_VERT,
        fragmentShader: BURST_FRAG,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [isLight],
  );

  // particle field — scattered across the whole hero, then swirled into the mark
  const pointsGeo = useMemo(() => {
    if (!sample) return null;
    let pts = sample.pts;
    const cap = L.desktop ? 14000 : 6000;
    if (pts.length > cap) pts = [...pts].sort(() => Math.random() - 0.5).slice(0, cap);
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
      let wx: number, wy: number, wz: number;
      if (Math.random() < 0.72) {
        wx = (Math.random() - 0.5) * L.visW * 1.2;
        wy = (Math.random() - 0.5) * L.visH * 1.2;
        wz = (Math.random() - 0.5) * CAM_Z * 0.86;
      } else {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const rad = L.visW * (0.6 + Math.random() * 0.6);
        wx = Math.sin(ph) * Math.cos(th) * rad;
        wy = Math.sin(ph) * Math.sin(th) * rad * 0.6;
        wz = Math.cos(ph) * rad * 0.5;
      }
      start.set([(wx - L.x) / L.s, (wy - L.y) / L.s, wz / L.s], i * 3);
      delay[i] =
        p.kind === 1
          ? MAX_DELAY * (0.55 + 0.4 * ((p.x - pMin) / pW) + Math.random() * 0.05)
          : MAX_DELAY * (0.55 * ((Math.atan2(p.y, p.x) + Math.PI) / (Math.PI * 2)) + 0.3 * Math.random());
    }
    for (let j = 0; j < DUST; j++) {
      const i = pts.length + j;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const rad = 0.62 + Math.random() * 0.6;
      const v = [Math.sin(ph) * Math.cos(th) * rad, Math.sin(ph) * Math.sin(th) * rad * 0.9, Math.cos(ph) * rad * 0.6];
      target.set(v, i * 3);
      start.set(v, i * 3);
      color.set([0.3, 0.9, 0.95], i * 3);
      kind[i] = 3;
      seed[i] = Math.random();
      delay[i] = 0.4 + Math.random() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(target, 3));
    g.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample]);

  useEffect(() => () => pointsGeo?.dispose(), [pointsGeo]);
  useEffect(() => () => pointsMat.dispose(), [pointsMat]);
  useEffect(() => () => burst.dispose(), [burst]);
  useEffect(
    () => () => {
      halftone.dispose();
      hands.rt.dispose();
      hands.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x?.dispose());
        }
      });
    },
    [halftone, hands],
  );

  // pointer (window-level: the copy layer sits above the canvas)
  const mouse = useRef({ x: 0, y: 0, inside: false });
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouse.current = { x: nx, y: ny, inside: nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1 };
    };
    const onLeave = () => (mouse.current.inside = false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [gl]);

  const group = useRef<THREE.Group>(null!);
  const burstMesh = useRef<THREE.Mesh>(null!);
  const st = useRef({ elapsed: 0, start: -1, tilt: { x: 0, y: 0 }, cam: { x: 0, y: 0 } });
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), F: new THREE.Vector3(), B: new THREE.Vector3(), c: new THREE.Color() }), []);

  useFrame((state, delta) => {
    const S = st.current;
    const dt = Math.min(delta, 0.05);
    const live = !reduced;
    if (live) S.elapsed += dt;
    const t = S.elapsed;

    // master timeline — cued by the preloader lifting (restarts if it re-shows)
    if (reduced || imgFailed) S.start = t - 100;
    else if (pointsGeo) {
      if (S.start < 0 && readyRef.current) S.start = t + 0.1;
      else if (S.start >= 0 && !readyRef.current) S.start = -1;
    }
    const T = S.start < 0 ? -1 : S.elapsed - S.start;
    const form = T < 0 ? -1 : T - FORM_AT; // particle timeline (negative = not yet)
    const l = isLight ? 1 : 0;

    // pointer: logo tilt; camera parallax (gentle idle drift otherwise)
    const m = mouse.current.inside && live ? 1 : 0;
    const k3 = Math.min(1, dt * 3);
    S.tilt.y += ((m ? mouse.current.x * 0.3 : 0) - S.tilt.y) * k3;
    S.tilt.x += ((m ? -mouse.current.y * 0.18 : 0) - S.tilt.x) * k3;
    const camTX = live ? (m ? mouse.current.x * 0.38 : Math.sin(t * 0.21) * 0.14) : 0;
    const camTY = live ? (m ? mouse.current.y * 0.2 : Math.cos(t * 0.17) * 0.07) : 0;
    S.cam.x += (camTX - S.cam.x) * Math.min(1, dt * 2);
    S.cam.y += (camTY - S.cam.y) * Math.min(1, dt * 2);
    state.camera.position.set(S.cam.x, S.cam.y, CAM_Z);
    state.camera.lookAt(S.cam.x * 0.35, S.cam.y * 0.35, 0);

    // the mark: hold front-facing, eased full turn each cycle, sway + float
    const after = form - (DONE - FORM_AT);
    let spin = 0;
    if (live && after > 0) {
      const ct = (after + (HOLD - FIRST_SPIN)) % CYCLE;
      if (ct > HOLD) spin = easeInOutCubic((ct - HOLD) / (CYCLE - HOLD)) * Math.PI * 2;
      spin += Math.sin(after * 0.45) * 0.14;
    }
    const bob = live ? Math.sin(t * 0.8) * 0.022 * L.s : 0;
    const g = group.current;
    g.position.set(L.x, L.y + bob, 0);
    g.scale.setScalar(L.s);
    g.rotation.set(S.tilt.x, spin + S.tilt.y, 0);

    // lock-in: the moment the last particle lands, the mark flares
    const pulse = after > 0 && live ? Math.exp(-after * 2.4) : 0;
    const formedK = form < 0 ? 0 : Math.min(1, Math.max(0, (form - 0.3) / FORM_TOTAL));

    // particles
    uniforms.uForm.value = form;
    uniforms.uTime.value = t;
    uniforms.uLight.value = l;
    uniforms.uPulse.value = pulse * (l ? 0.35 : 1);
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    uniforms.uSize.value = sample ? (L.s / L.ppw / sample.rows) * 2.05 : 3;

    // the burst behind the mark: wakes with the formation, flares on lock-in
    const reach = 0.46 * L.s + L.gap;
    const bm = burstMesh.current;
    const bd = Math.max(L.s * (L.desktop ? 3.2 : 2.7), reach * 2.3);
    bm.position.set(L.x, L.y + bob, -0.6 * L.s);
    bm.scale.set(bd, bd, 1);
    const done = T >= DONE ? 1 : 0;
    burst.uniforms.uReach.value = reach / (bd / 2);
    burst.uniforms.uHole.value = (0.5 * L.s) / (bd / 2);
    burst.uniforms.uSpin.value = t * 0.05;
    burst.uniforms.uIntensity.value =
      (formedK * 0.25 + done * (0.6 + 0.08 * Math.sin(t * 1.3)) + pulse * 1.3) * (l ? 0.75 : 1);

    // hands: boot in from the edges, glide to almost-touching, breathe
    const rv = reduced ? 1 : T < 0 ? 0 : Math.min(1, T / HANDS_IN);
    halftone.uniforms.uReveal.value = rv;
    halftone.uniforms.uLight.value = l;
    if (rigs) {
      const ease = 1 - Math.pow(1 - rv, 3);
      const breathe = live ? Math.sin(t * 0.55) : 0;
      const tipX = reach + (1 - ease) * 0.35 * L.handLen + breathe * 0.025 * L.s;
      const scale = L.handLen / HAND_LEN;
      const idle = live ? 0.5 + 0.5 * Math.sin(t * 0.9) : 0;
      const sway = live ? Math.sin(t * 0.5) * 0.02 : 0;

      const place = (rig: HandRig, side: -1 | 1, pose: HandPose, fx: number, fy: number) => {
        rig.pose(pose);
        rig.root.scale.setScalar(scale);
        rig.root.position.set(0, 0, 0);
        rig.orient(tmp.F.set(fx, fy, 0), tmp.B.set(0, 0.8, 0.6));
        const tip = rig.jointWorld('index-finger-tip', tmp.v);
        rig.root.position.set(L.x + side * tipX - tip.x, L.y - tip.y, -tip.z);
      };
      // fingers point up a little (a lot on phones), so each forearm settles down and out
      place(rigs.robot, -1, mixPose(ROBOT_POSE, ROBOT_IDLE, idle), 1, L.tilt + sway);
      place(rigs.human, 1, mixPose(HUMAN_POSE, HUMAN_IDLE, 1 - idle), -1, L.tilt - 0.02 - sway);

      // the mark's light spills onto the fingertips
      hands.logoLight.position.set(L.x, L.y, 0.35 * L.s);
      hands.logoLight.intensity = (formedK * 1.2 + done * 1.4 + pulse * 22) * (l ? 0.7 : 1);
      if (scene.environment && hands.scene.environment !== scene.environment) hands.scene.environment = scene.environment;

      // render the hands into the dot buffer with the live camera
      const prev = gl.getRenderTarget();
      gl.getClearColor(tmp.c);
      const prevAlpha = gl.getClearAlpha();
      gl.setRenderTarget(hands.rt);
      gl.setClearColor(0x000000, 0);
      gl.clear(true, true, false);
      gl.render(hands.scene, state.camera);
      gl.setRenderTarget(prev);
      gl.setClearColor(tmp.c, prevAlpha);
    }
  });

  return (
    <>
      <color attach="background" args={[isLight ? BG.light : BG.dark]} />
      <ambientLight intensity={isLight ? 0.55 : 0.18} />

      {/* studio light baked into an environment map (robot alloy reflections) — no HDR files */}
      {isLight ? (
        <Environment key="env-light" resolution={256} frames={1}>
          <color attach="background" args={['#4b5863']} />
          <Lightformer form="rect" intensity={4} color="#ffffff" scale={[12, 2.4, 1]} position={[0, 6, 2]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#ffffff" scale={[1.6, 10, 1]} position={[-7, 0, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#a5f3fc" scale={[1.6, 10, 1]} position={[7, 0, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" scale={[16, 16, 1]} position={[0, -6, 0]} rotation-x={-Math.PI / 2} />
          <Lightformer form="rect" intensity={3.2} color="#ffffff" scale={[1.1, 14, 1]} position={[2.3, 0, 9.5]} rotation={[0, Math.PI, 0.35]} />
          <Lightformer form="rect" intensity={2.2} color="#ffffff" scale={[0.35, 14, 1]} position={[0.5, 0, 9.5]} rotation={[0, Math.PI, 0.35]} />
        </Environment>
      ) : (
        <Environment key="env-dark" resolution={256} frames={1}>
          <color attach="background" args={['#02080b']} />
          <Lightformer form="rect" intensity={1.3} color="#cffafe" scale={[12, 2.4, 1]} position={[0, 6, 2]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={6} color="#22d3ee" scale={[1.4, 10, 1]} position={[-7, 0, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={5} color="#2dd4bf" scale={[1.4, 10, 1]} position={[7, 0, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" intensity={2.2} color="#e0fbff" scale={3} position={[0, 1, 9]} />
          <Lightformer form="rect" intensity={2} color="#a78bfa" scale={[14, 6, 1]} position={[0, -3, -8]} />
        </Environment>
      )}

      {/* the hands, as a dot-matrix screen */}
      <mesh material={halftone} frustumCulled={false} renderOrder={-2}>
        <planeGeometry args={[1, 1]} />
      </mesh>

      {/* light burst behind the mark */}
      <mesh ref={burstMesh} material={burst} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
      </mesh>

      {/* the mark: a particle logo */}
      <group ref={group}>
        {pointsGeo && <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} renderOrder={2} />}
      </group>

      {/* light theme: linear output + no vignette, so the studio white is exactly the page white */}
      <EffectComposer multisampling={L.desktop ? 4 : 0}>
        <Bloom
          mipmapBlur
          intensity={isLight ? 0.2 : 0.95}
          luminanceThreshold={isLight ? 1 : 0.55}
          luminanceSmoothing={0.25}
          radius={0.72}
        />
        <ToneMapping mode={isLight ? ToneMappingMode.LINEAR : ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.28} darkness={isLight ? 0 : 0.5} />
        <Noise opacity={isLight ? 0.018 : 0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
      </EffectComposer>
    </>
  );
}

/* ------------------------------------------------------------------ wrapper */

export default function HeroHands({ ready = true }: { ready?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  const isLight = theme === 'light';
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 120 }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : visible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene ready={ready} isLight={isLight} reduced={reduced} />
      </Canvas>
      {/* soft floor under the copy so the headline always reads over the hands */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--bg-0) 70%, transparent) 42%, var(--bg-0) 100%)',
        }}
      />
    </div>
  );
}
