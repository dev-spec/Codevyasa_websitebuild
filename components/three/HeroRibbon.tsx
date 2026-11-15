'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * "Ribbon" hero background — a flowing, volumetric light ribbon sweeping
 * diagonally across a near-black navy field, glowing from electric blue (left)
 * into brand cyan (right). Rendered on a single fullscreen shader quad.
 *
 * This hero is intentionally DARK in BOTH site themes (Hero.tsx forces the dark
 * token set for it, like the singularity bg), so there is no "white theme"
 * variant to break. Reduced-motion safe; paused when scrolled off-screen;
 * reveals in sync with the preloader via the `ready` prop (uReveal 0→1).
 */

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2  uRes;
uniform float uReveal;   // 0..1 intro reveal
uniform vec3  uBase;     // deep navy
uniform vec3  uBlue;     // royal/electric blue
uniform vec3  uCyan;     // brand cyan (gentle lean, right)
uniform vec3  uHot;      // soft white-blue highlight
varying vec2 vUv;

// One flowing silk layer: a soft body + a bright luminous crest along an
// undulating, animated centerline → the "fold" of a silk ribbon of light.
float silk(vec2 uv, float t, float baseY, float slope, float amp, float freq, float ph, float width){
  float yc = baseY + slope*uv.x
           + amp*sin(uv.x*freq + ph + t)
           + 0.55*amp*sin(uv.x*freq*1.7 - ph*1.2 + t*1.35)
           + 0.14*sin(uv.y*3.0 + t*0.8);
  float d  = uv.y - yc;
  float w  = width * mix(0.75, 1.15, smoothstep(0.0, 1.0, uv.x));   // thin → crest stays curved
  float body  = exp(-(d*d) / (2.0 * w * w));
  float crest = exp(-(d*d) / (2.0 * (w*0.16) * (w*0.16)));
  return body * 0.42 + crest * 0.8;
}

void main(){
  vec2 uv = vUv;
  float t = uTime * 0.33;                       // flowing, alive (not a static glow)
  float rb = smoothstep(0.0, 0.8, uv.x);        // keep the LEFT dark for the headline

  // three flowing, curved silk crests at different speeds → living, morphing ribbon
  float s1 = silk(uv, t,      0.34, 0.18, 0.17, 2.2, 0.0, 0.10);
  float s2 = silk(uv, t*1.2,  0.48, 0.12, 0.14, 2.9, 2.3, 0.075);
  float s3 = silk(uv, t*0.8,  0.24, 0.26, 0.13, 1.7, 4.4, 0.13);

  float ribbon = (s1 + s2*0.7 + s3*0.6);
  ribbon *= smoothstep(0.08, 0.5, uv.x);        // nothing starts at the text edge

  // modest soft blue wash so the field reads blue without blowing to white
  float wash = rb * smoothstep(0.2, 1.0, uv.x) * smoothstep(1.05, 0.0, abs(uv.y-0.52)*1.1) * 0.22;

  float intensity = clamp((ribbon * 0.85 + wash) * mix(0.30, 1.0, rb), 0.0, 1.45);

  // blue-dominant → white ONLY on the thin crest peaks
  vec3 col = uBase;
  col = mix(col, uBlue, smoothstep(0.03, 0.48, intensity));
  col = mix(col, uCyan, smoothstep(0.40, 0.95, intensity) * 0.55);
  col = mix(col, uHot,  smoothstep(1.02, 1.45, intensity) * 0.9);

  // vignette toward base
  float vig = smoothstep(1.45, 0.20, distance(uv, vec2(0.62, 0.50)));
  col = mix(uBase, col, mix(0.90, 1.0, vig));

  // intro reveal (grow the light out of the base)
  col = mix(uBase, col, clamp(uReveal, 0.0, 1.0));

  // tiny dither to kill banding (no smoke)
  float gr = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (gr - 0.5) * 0.006;

  gl_FragColor = vec4(col, 1.0);
}`;

// Single dark palette (the hero is forced-dark in both themes).
const PAL = {
  base: [0.015, 0.027, 0.049] as [number, number, number], // deep navy #040712
  blue: [0.14, 0.34, 0.95] as [number, number, number], // royal/electric blue
  cyan: [0.16, 0.72, 0.95] as [number, number, number], // brand cyan (gentle lean)
  hot: [0.92, 0.96, 1.0] as [number, number, number], // luminous white-blue crest
};

const CAMERA = { position: [0, 0, 1] as [number, number, number] };
const GL = { antialias: false, powerPreference: 'high-performance' as const };
const DPR: [number, number] = [1, 1.5];

function RibbonPlane({ reduced, ready }: { reduced: boolean; ready: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 0 },
      uBase: { value: new THREE.Vector3().fromArray(PAL.base) },
      uBlue: { value: new THREE.Vector3().fromArray(PAL.blue) },
      uCyan: { value: new THREE.Vector3().fromArray(PAL.cyan) },
      uHot: { value: new THREE.Vector3().fromArray(PAL.hot) },
    }),
    []
  );
  const invalidate = useThree((s) => s.invalidate);

  // Reduced motion: snap the ribbon on (static) and paint one frame.
  useEffect(() => {
    if (reduced) {
      uniforms.uReveal.value = 1;
      invalidate();
    }
  }, [reduced, uniforms, invalidate]);

  useFrame((state, delta) => {
    const u = uniforms;
    u.uRes.value.set(state.size.width, state.size.height);
    if (!reduced) {
      u.uTime.value += delta;
      const target = ready ? 1 : 0;
      u.uReveal.value += (target - u.uReveal.value) * Math.min(1, delta * 1.6);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export default function HeroRibbon({ ready = true }: { ready?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never';

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas className="!absolute inset-0" dpr={DPR} frameloop={frameloop} gl={GL} orthographic camera={CAMERA}>
        <RibbonPlane reduced={reduced} ready={ready} />
      </Canvas>
    </div>
  );
}
