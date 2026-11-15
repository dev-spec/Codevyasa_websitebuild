'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion, useTheme } from '@/lib/hooks';

/**
 * Hero background — a flowing, domain-warped "aurora" gradient rendered on a
 * single fullscreen shader quad. Interest concentrates on the RIGHT; the LEFT
 * stays close to the theme base so the white/dark headline reads cleanly.
 * Theme-aware, reduced-motion-safe, and paused when scrolled off-screen.
 */

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uBase;
uniform vec3 uA1;
uniform vec3 uA2;
uniform float uAccent;
varying vec2 vUv;

vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x*x0.x + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 rot = mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<4;i++){ v += a*snoise(p); p = rot*p*2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = vUv;
  vec2 p = uv;
  p.x *= uRes.x / max(uRes.y, 1.0);
  float t = uTime * 0.045;

  vec2 q = vec2(fbm(p*1.4 + vec2(0.0, t)), fbm(p*1.4 + vec2(4.3, t*1.2)));
  float f = fbm(p*1.4 + q*1.8 + vec2(t*0.6, -t*0.4));
  float f2 = fbm(p*2.3 + q*1.0 + vec2(9.0, -t*0.8));

  float aurora = smoothstep(0.12, 0.95, f*0.5 + 0.5);
  float a2 = smoothstep(0.30, 1.0, f2*0.5 + 0.5);

  float rightBias = smoothstep(0.24, 0.98, uv.x);
  float glow = smoothstep(0.6, 0.0, distance(uv, vec2(0.76, 0.58)));

  float intensity = aurora * (0.28 + 0.95*rightBias) + glow*0.45*aurora;

  vec3 col = uBase;
  col = mix(col, uA1, clamp(intensity * uAccent, 0.0, 1.0));
  col = mix(col, uA2, clamp(a2 * rightBias * uAccent * 0.55, 0.0, 1.0));

  // vignette toward base
  float vig = smoothstep(1.2, 0.35, distance(uv, vec2(0.55, 0.5)));
  col = mix(uBase, col, mix(0.82, 1.0, vig));

  // subtle grain (kills banding)
  float g = fract(sin(dot(uv * (uTime*0.4 + 1.0), vec2(12.9898,78.233))) * 43758.5453);
  col += (g - 0.5) * 0.013;

  gl_FragColor = vec4(col, 1.0);
}`;

interface Palette {
  base: [number, number, number];
  a1: [number, number, number];
  a2: [number, number, number];
}
const DARK: Palette = { base: [0.023, 0.035, 0.055], a1: [0.05, 0.34, 0.42], a2: [0.11, 0.62, 0.75] };
const LIGHT: Palette = { base: [0.93, 0.955, 0.98], a1: [0.66, 0.86, 0.92], a2: [0.42, 0.74, 0.86] };

// Stable Canvas props (module constants) so a theme-toggle re-render never
// reconfigures the renderer/camera.
const CAMERA = { position: [0, 0, 1] as [number, number, number] };
const GL = { antialias: false, powerPreference: 'high-performance' as const };
const DPR: [number, number] = [1, 1.5];

function AuroraPlane({ isLight, reduced }: { isLight: boolean; reduced: boolean }) {
  // Uniforms are created ONCE (stable identity) so a theme toggle never replaces
  // the material/uniforms object — instead we mutate the colour values in place.
  // Rebuilding the uniforms on toggle made R3F swap the material and froze the
  // render loop until a reload; this avoids that entirely.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uBase: { value: new THREE.Vector3().fromArray(DARK.base) },
      uA1: { value: new THREE.Vector3().fromArray(DARK.a1) },
      uA2: { value: new THREE.Vector3().fromArray(DARK.a2) },
      uAccent: { value: 1.0 },
    }),
    []
  );
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const pal = isLight ? LIGHT : DARK;
    uniforms.uBase.value.fromArray(pal.base);
    uniforms.uA1.value.fromArray(pal.a1);
    uniforms.uA2.value.fromArray(pal.a2);
    invalidate(); // paint one frame with the new colours (also covers reduced-motion)
  }, [isLight, uniforms, invalidate]);

  useFrame((state, delta) => {
    if (!reduced) uniforms.uTime.value += delta;
    uniforms.uRes.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export default function HeroAurora() {
  const reduced = usePrefersReducedMotion();
  const isLight = useTheme() === 'light';
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
        <AuroraPlane isLight={isLight} reduced={reduced} />
      </Canvas>
    </div>
  );
}
