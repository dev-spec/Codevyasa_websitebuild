'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { usePrefersReducedMotion, useTheme } from '@/lib/hooks';
import { gradientTexture } from './fxTextures';
import { buildLogoGeometry } from './logoGeometry';
import { FORM_DUR, FORM_TOTAL, LOGO_SRC, MAX_DELAY, PARTICLE_FRAG, PARTICLE_VERT, sampleLogo, type LogoSample } from './logoParticles';

/* =============================================================================
   HeroCinematic — "Materialisation".

   1. When the preloader lifts, particles sampled from the real logo swirl in on a
      vortex and assemble the CodeVyasa mark (the `>_` types in last).
   2. A laser scan sweeps up the mark; everything below the line turns from
      particles into a solid, physically-rendered GLASS logo (real refraction,
      chromatic dispersion, studio reflections), with a flash as it completes.
   3. The glass logo then floats over a glossy reflective stage, backlit, with
      out-of-focus motes in the air, and turns slowly while studio light rakes
      across it. The cursor moves the key light and tilts the logo.

   Dark: deep-space studio, cyan rim lights, bloom. Light: crystal on a white
   studio sweep. Restrained on purpose — one hero object, cinematic light.
   Perf: one Canvas; pauses off-screen; DPR capped; lighter on phones (no
   mirror floor, cheaper glass); still frame under reduced motion.
   ========================================================================== */

const CAM_Z = 10;
const FOV = 30;
const SCAN_AT = FORM_TOTAL + 0.35; // scan starts shortly after the mark locks in
const SCAN_DUR = 1.5;
const DONE = SCAN_AT + SCAN_DUR;
const CYCLE = 10; // turn cycle once materialised (s)
const HOLD = 6.2; // front-facing hold inside each cycle (s)
const FIRST_SPIN = 2; // first full turn this long after materialising (s)
const DUST = 380;

const BG = { dark: '#070a0f', light: '#f7f9fc' };

type Layout = { x: number; y: number; s: number; floorY: number; desktop: boolean; visW: number; visH: number; ppw: number };

/** Logo placement in world units: right column on desktop, above the copy on phones. */
function computeLayout(w: number, h: number): Layout {
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
  const visW = visH * (w / h);
  const ppw = visH / h;
  const vh = Math.min(typeof window === 'undefined' ? h : window.innerHeight, h);
  const desktop = w >= 1024;
  let cx: number, cy: number, logoPx: number;
  if (desktop) {
    const pad = Math.min(32, Math.max(20, w * 0.04));
    const shellW = Math.min(1320, w) - pad * 2;
    const shellL = (w - shellW) / 2;
    cx = shellL + shellW * 0.745;
    cy = h * 0.46;
    logoPx = Math.min(vh * 0.5, shellW * 0.33);
  } else {
    cx = w / 2;
    cy = vh * 0.27;
    logoPx = Math.min(w * 0.5, vh * 0.26);
  }
  const s = logoPx * ppw;
  return { x: (cx - w / 2) * ppw, y: (h / 2 - cy) * ppw, s, floorY: (h / 2 - cy) * ppw - s * 0.62, desktop, visW, visH, ppw };
}

function easeInOutCubic(k: number) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

/* --------------------------------------------------------------------- scene */

function Scene({ ready, isLight, reduced }: { ready: boolean; isLight: boolean; reduced: boolean }) {
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const L = useMemo(() => computeLayout(size.width, size.height), [size.width, size.height]);

  const readyRef = useRef(ready);
  readyRef.current = ready;

  const logoGeometry = useMemo(() => buildLogoGeometry(), []);
  const tex = useMemo(
    () => ({ radial: gradientTexture('radial'), sheet: gradientTexture('sheet'), line: gradientTexture('line') }),
    [],
  );
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e5), []);

  const [sample, setSample] = useState<{ pts: LogoSample[]; rows: number } | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => setSample(sampleLogo(img, window.innerWidth < 768 ? 160 : 250));
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
      uLight: { value: isLight ? 1 : 0 },
      uPulse: { value: 0 },
      uScanY: { value: -1e5 },
      uScanA: { value: -1e5 },
      uScanB: { value: 1e5 },
      uScanBand: { value: 0.1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniforms],
  );

  // Particle field — built once the logo is sampled; starts scatter across the hero.
  const pointsGeo = useMemo(() => {
    if (!sample) return null;
    const small = !L.desktop;
    let pts = sample.pts;
    const cap = small ? 6500 : 15000;
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
  useEffect(
    () => () => {
      logoGeometry.dispose();
      pointsMat.dispose();
      tex.radial.dispose();
      tex.sheet.dispose();
      tex.line.dispose();
    },
    [logoGeometry, pointsMat, tex],
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
  const glass = useRef<THREE.Mesh>(null!);
  const backlight = useRef<THREE.Mesh>(null!);
  const scanLine = useRef<THREE.Mesh>(null!);
  const scanSheet = useRef<THREE.Mesh>(null!);
  const keyLight = useRef<THREE.PointLight>(null!);
  const motes = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null);
  const st = useRef({ elapsed: 0, formStart: -1, light: isLight ? 1 : 0, additive: !isLight, tilt: { x: 0, y: 0 }, cam: { x: 0, y: 0 } });

  useFrame((state, delta) => {
    const S = st.current;
    const dt = Math.min(delta, 0.05);
    const live = !reduced;
    if (live) S.elapsed += dt;
    const t = S.elapsed;

    // timeline — cued by the preloader lifting (restarts if it re-shows)
    if (reduced || imgFailed) S.formStart = t - 100;
    else if (pointsGeo) {
      if (S.formStart < 0 && readyRef.current) S.formStart = t + 0.15;
      else if (S.formStart >= 0 && !readyRef.current) S.formStart = -1;
    }
    const form = S.formStart < 0 ? -1 : t - S.formStart;

    // theme cross-fade (+ blending swap at the midpoint)
    const lt = isLight ? 1 : 0;
    S.light = reduced ? lt : S.light + (lt - S.light) * Math.min(1, dt * 6);
    const l = S.light;
    if (l < 0.5 !== S.additive) {
      S.additive = l < 0.5;
      const b = S.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      for (const m of [pointsMat, backlight.current?.material, scanLine.current?.material, scanSheet.current?.material]) {
        if (m && !Array.isArray(m)) {
          m.blending = b;
          m.needsUpdate = true;
        }
      }
    }

    // pointer: tilt + key light; camera parallax (gentle idle drift otherwise)
    const m = mouse.current.inside && live ? 1 : 0;
    const k3 = Math.min(1, dt * 3);
    S.tilt.y += ((m ? mouse.current.x * 0.3 : 0) - S.tilt.y) * k3;
    S.tilt.x += ((m ? -mouse.current.y * 0.18 : 0) - S.tilt.x) * k3;
    const camTX = live ? (m ? mouse.current.x * 0.22 : Math.sin(t * 0.21) * 0.1) : 0;
    const camTY = live ? (m ? mouse.current.y * 0.12 : Math.cos(t * 0.17) * 0.05) : 0;
    S.cam.x += (camTX - S.cam.x) * Math.min(1, dt * 2);
    S.cam.y += (camTY - S.cam.y) * Math.min(1, dt * 2);
    state.camera.position.set(S.cam.x, S.cam.y, CAM_Z);

    // logo: hold front-facing, eased full turn each cycle, gentle sway + float
    const after = form - DONE;
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

    // materialisation scan
    let scanY = -1e5;
    let scanK = 0;
    if (form >= DONE) {
      scanY = 1e5;
      scanK = 1;
    } else if (form >= SCAN_AT) {
      scanK = (form - SCAN_AT) / SCAN_DUR;
      const lo = L.y + bob - 0.56 * L.s;
      const hi = L.y + bob + 0.56 * L.s;
      scanY = lo + (hi - lo) * easeInOutCubic(scanK);
    }
    clipPlane.constant = scanY; // glass shows where y <= scanY
    const scanning = scanK > 0 && scanK < 1;
    const scanFade = scanning ? Math.min(1, scanK * 8) * Math.min(1, (1 - scanK) * 6) : 0;
    const lineMat = scanLine.current.material as THREE.MeshBasicMaterial;
    const sheetMat = scanSheet.current.material as THREE.MeshBasicMaterial;
    scanLine.current.visible = scanSheet.current.visible = scanning;
    if (scanning) {
      scanLine.current.position.set(L.x, scanY, 0.2 * L.s);
      scanLine.current.scale.set(L.s * 1.45, L.s * 0.035, 1);
      scanSheet.current.position.set(L.x, scanY + 0.16 * L.s, 0.18 * L.s);
      scanSheet.current.scale.set(L.s * 1.35, L.s * 0.32, 1);
      lineMat.opacity = scanFade;
      sheetMat.opacity = scanFade * (l > 0.5 ? 0.22 : 0.3);
    }
    lineMat.color.set(l > 0.5 ? '#0e7490' : '#22d3ee').multiplyScalar(l > 0.5 ? 1 : 4);
    sheetMat.color.set(l > 0.5 ? '#22d3ee' : '#22d3ee').multiplyScalar(l > 0.5 ? 0.8 : 1.6);

    const pulse = after > 0 && live ? Math.exp(-after * 2.6) : 0;

    // particle uniforms
    uniforms.uForm.value = form;
    uniforms.uTime.value = t;
    uniforms.uLight.value = l;
    uniforms.uPulse.value = 0;
    uniforms.uScanY.value = scanY;
    uniforms.uScanBand.value = 0.09 * L.s;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    uniforms.uSize.value = sample ? (L.s / L.ppw / sample.rows) * 2.05 : 3;

    // backlight: grows with the formation, flares when the glass completes
    const formedK = form < 0 ? 0 : Math.min(1, Math.max(0, (form - 0.3) / FORM_TOTAL));
    const bl = backlight.current;
    bl.position.set(L.x, L.y + 0.08 * L.s, -0.45 * L.s);
    bl.scale.setScalar(L.s * 1.9);
    const blMat = bl.material as THREE.MeshBasicMaterial;
    blMat.opacity = (l > 0.5 ? 0.45 : 0.42) * formedK * (1 + pulse * 1.4);
    blMat.color.set(l > 0.5 ? '#9be7f0' : '#0fb5c9').multiplyScalar(l > 0.5 ? 1 : 1.1 + pulse * 2);

    // key light follows the cursor (rakes highlights across the glass)
    const kl = keyLight.current;
    const kx = m ? mouse.current.x * L.s * 1.4 : Math.sin(t * 0.4) * L.s * 0.9;
    const ky = m ? mouse.current.y * L.s : 0.55 * L.s;
    kl.position.set(L.x + kx, L.y + ky, 1.3 * L.s);
    kl.intensity = (l > 0.5 ? 6 : 14) * (form >= SCAN_AT ? 1 : 0) * (1 + pulse);

    // light-theme shadow: narrows as the mark turns edge-on, softens as it floats up
    const sh = shadow.current;
    if (sh) {
      const turn = Math.abs(Math.cos(spin + S.tilt.y));
      sh.position.set(L.x, L.floorY, -0.05 * L.s);
      sh.scale.set(L.s * 1.5 * (0.3 + 0.7 * turn), L.s * 0.22, 1);
      (sh.material as THREE.MeshBasicMaterial).opacity = 0.3 * formedK * (1 - bob / L.s * 6);
    }

    if (motes.current) {
      motes.current.position.set(L.x, L.y, 0);
      motes.current.visible = form >= 0 && l < 0.5;
    }
  });

  // Brand-cyan crystal: tinted body + a soft inner glow so it reads as the CodeVyasa
  // mark (not smoked glass), with crisp studio reflections riding over it.
  const tint = isLight
    ? { color: '#e6fdff', attenuationColor: '#0bb5c9', attenuationDistance: 0.45, envMapIntensity: 2, emissive: '#08a4b8', emissiveIntensity: 0.14 }
    : { color: '#6fe6f4', attenuationColor: '#22d3ee', attenuationDistance: 0.5, envMapIntensity: 1.9, emissive: '#0bb3c7', emissiveIntensity: 0.28 };

  return (
    <>
      <color attach="background" args={[isLight ? BG.light : BG.dark]} />
      <fog attach="fog" args={[isLight ? BG.light : BG.dark, CAM_Z * 1.15, CAM_Z * 2.7]} />
      <ambientLight intensity={isLight ? 0.55 : 0.18} />
      <pointLight ref={keyLight} color={isLight ? '#ffffff' : '#cffafe'} distance={L.s * 5} decay={2} />

      {/* studio lighting baked into an environment map — no external HDR files */}
      {isLight ? (
        // product-photography studio: cool-grey walls (dark "flags" give the glass
        // crisp edges on white), white strip softboxes, a bright white floor bounce
        <Environment key="env-light" resolution={256} frames={1}>
          <color attach="background" args={['#4b5863']} />
          <Lightformer form="rect" intensity={4} color="#ffffff" scale={[12, 2.4, 1]} position={[0, 6, 2]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#ffffff" scale={[1.6, 10, 1]} position={[-7, 0, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={3} color="#a5f3fc" scale={[1.6, 10, 1]} position={[7, 0, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer form="ring" intensity={1.5} color="#ffffff" scale={3} position={[0, 1, 9]} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" scale={[16, 16, 1]} position={[0, -6, 0]} rotation-x={-Math.PI / 2} />
          {/* slanted strips behind the camera: they streak across the glass face as it turns */}
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
          <Lightformer form="rect" intensity={2} color="#0ea5b7" scale={[14, 6, 1]} position={[0, -3, -8]} />
        </Environment>
      )}

      {/* soft volumetric backlight behind the mark */}
      <mesh ref={backlight} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex.radial} transparent depthWrite={false} toneMapped={false} opacity={0} />
      </mesh>

      {/* the mark: particles → glass */}
      <group ref={group}>
        <mesh ref={glass} geometry={logoGeometry} renderOrder={1}>
          <MeshTransmissionMaterial
            {...tint}
            clippingPlanes={[clipPlane]}
            transmission={1}
            thickness={0.18}
            roughness={0.03}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropicBlur={0.08}
            distortion={0.08}
            distortionScale={0.3}
            temporalDistortion={0.04}
            clearcoat={1}
            clearcoatRoughness={0.04}
            backside={false}
            samples={L.desktop ? 6 : 3}
            resolution={L.desktop ? 512 : 256}
          />
        </mesh>
        {pointsGeo && <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} renderOrder={2} />}
      </group>

      {/* materialisation scan: a laser line + a light curtain above it */}
      <mesh ref={scanLine} visible={false} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex.line} transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh ref={scanSheet} visible={false} renderOrder={3}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex.sheet} transparent depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>

      {/* out-of-focus motes hanging in the light (dark theme) */}
      <group ref={motes} visible={false}>
        <Sparkles count={L.desktop ? 48 : 26} scale={[L.s * 2.3, L.s * 1.5, L.s * 1.2]} size={3.4} speed={0.2} opacity={0.7} noise={0.8} color="#8ff0fb" />
      </group>

      {isLight ? (
        // seamless white studio: no floor edge, just a soft teal shadow pooled under the floating glass
        <mesh ref={shadow} renderOrder={0}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex.radial} color="#0b4f5c" transparent depthWrite={false} toneMapped={false} opacity={0} fog={false} />
        </mesh>
      ) : (
        // glossy black stage
        <mesh rotation-x={-Math.PI / 2} position={[0, L.floorY, -8]}>
          <planeGeometry args={[70, 40]} />
          {L.desktop ? (
            <MeshReflectorMaterial
              blur={[380, 90]}
              resolution={768}
              mixBlur={1}
              mixStrength={26}
              mixContrast={1}
              roughness={0.9}
              depthScale={1.1}
              minDepthThreshold={0.35}
              maxDepthThreshold={1.3}
              color="#06080b"
              metalness={0.55}
              mirror={0.6}
            />
          ) : (
            <meshStandardMaterial color="#080b10" roughness={0.55} metalness={0.2} />
          )}
        </mesh>
      )}

      {/* light theme: linear output + no vignette, so the studio white is exactly the page white */}
      <EffectComposer multisampling={L.desktop ? 4 : 0}>
        <Bloom
          mipmapBlur
          intensity={isLight ? 0.22 : 1.05}
          luminanceThreshold={isLight ? 1 : 0.6}
          luminanceSmoothing={0.25}
          radius={0.72}
        />
        <ToneMapping mode={isLight ? ToneMappingMode.LINEAR : ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.28} darkness={isLight ? 0 : 0.55} />
        <Noise opacity={isLight ? 0.018 : 0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
      </EffectComposer>
    </>
  );
}

/* ------------------------------------------------------------------ wrapper */

export default function HeroCinematic({ ready = true }: { ready?: boolean }) {
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
      {/* soft desktop scrim so the copy always reads, whatever the light is doing */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(95deg, color-mix(in srgb, var(--bg-0) 55%, transparent) 0%, color-mix(in srgb, var(--bg-0) 22%, transparent) 34%, transparent 55%)',
        }}
      />
    </div>
  );
}
