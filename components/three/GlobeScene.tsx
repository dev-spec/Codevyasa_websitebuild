'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { presenceNodes } from '@/content/presence';
import type { PresenceNode } from '@/content/types';
import { countryLabels } from '@/content/countryLabels';
import { usePrefersReducedMotion, useTheme } from '@/lib/hooks';

const RADIUS = 1.6;
const LABEL_RANK_MAX = 4; // lower = fewer, more-important labels

function latLngToVec3(lat: number, lng: number, r = RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function useGlowTexture() {
  return useMemo(() => {
    const s = 128;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.25, 'rgba(134,239,172,0.75)');
    g.addColorStop(1, 'rgba(134,239,172,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* --------------------------------- Earth ------------------------------------ */
function Earth() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/earth.png', (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      setTex(t);
    });
  }, [gl]);
  if (!tex) return null;
  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 96, 96]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}

/* --------------------------------- Atmosphere ------------------------------- */
const atmoVertex = /* glsl */ `
varying vec3 vN;
void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const atmoFragment = /* glsl */ `
varying vec3 vN; uniform float uPow; uniform float uMul; uniform vec3 uColor;
void main(){ float i = pow(max(uMul - dot(vN, vec3(0.0,0.0,1.0)), 0.0), uPow); gl_FragColor = vec4(uColor * i, i); }`;

function Atmosphere({ color, op }: { color: string; op: number }) {
  const uniforms = useMemo(
    () => ({ uPow: { value: 3.4 }, uMul: { value: 0.75 }, uColor: { value: new THREE.Color(color).multiplyScalar(op) } }),
    [color, op]
  );
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[RADIUS, 48, 48]} />
      <shaderMaterial vertexShader={atmoVertex} fragmentShader={atmoFragment} uniforms={uniforms} blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent depthWrite={false} />
    </mesh>
  );
}

/* --------------------------------- Labels ----------------------------------- */
function makeLabelSprite(text: string): { texture: THREE.Texture; aspect: number } {
  const dpr = 2;
  const fontSize = 30 * dpr;
  const pad = 10 * dpr;
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  const font = `600 ${fontSize}px Arial, "Segoe UI", sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fontSize + pad * 2;
  canvas.width = w;
  canvas.height = h;
  ctx = canvas.getContext('2d')!;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.strokeText(text, w / 2, h / 2);
  ctx.fillStyle = '#1c3a24';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return { texture: tex, aspect: w / h };
}

function Labels() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const data = useMemo(
    () =>
      countryLabels
        .filter((l) => l.rank <= LABEL_RANK_MAX)
        .map((l) => {
          const { texture, aspect } = makeLabelSprite(l.name);
          const pos = latLngToVec3(l.lat, l.lng, RADIUS * 1.02);
          return { pos, dir: pos.clone().normalize(), texture, aspect };
        }),
    []
  );
  const camDir = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    camDir.copy(camera.position).normalize();
    const kids = groupRef.current.children;
    for (let i = 0; i < kids.length; i++) {
      const s = kids[i] as THREE.Sprite;
      const facing = data[i].dir.dot(camDir);
      const o = THREE.MathUtils.clamp((facing - 0.25) / 0.35, 0, 1);
      (s.material as THREE.SpriteMaterial).opacity = o;
      s.visible = o > 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => {
        const S = 0.085;
        return (
          <sprite key={i} position={d.pos} scale={[S * d.aspect, S, 1]} renderOrder={2}>
            <spriteMaterial map={d.texture} transparent depthWrite={false} depthTest={false} opacity={0} />
          </sprite>
        );
      })}
    </group>
  );
}

/* --------------------------------- Marker ----------------------------------- */
function Marker({
  node,
  glow,
  onHover,
  setPaused,
  reduced,
}: {
  node: PresenceNode;
  glow: THREE.Texture;
  onHover: (n: PresenceNode | null) => void;
  setPaused: (v: boolean) => void;
  reduced: boolean;
}) {
  const pos = useMemo(() => latLngToVec3(node.lat, node.lng, RADIUS * 1.012), [node]);
  const up = useMemo(() => pos.clone().normalize(), [pos]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), up), [up]);
  const color = node.status === 'Expanding' ? '#f59e0b' : node.isHome ? '#15803d' : '#22c55e';
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reduced || !ring.current) return;
    const t = (state.clock.elapsedTime * (node.isHome ? 0.8 : 0.55)) % 1;
    ring.current.scale.setScalar(1 + t * (node.isHome ? 4.5 : 3));
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
  });

  return (
    <group position={pos} quaternion={quat}>
      <sprite scale={node.isHome ? 0.42 : 0.3}>
        <spriteMaterial map={glow} color={color} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.9} />
      </sprite>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
          setPaused(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          setPaused(false);
          document.body.style.cursor = '';
        }}
      >
        <sphereGeometry args={[node.isHome ? 0.04 : 0.03, 18, 18]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.036, 0.05, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.03, 0.045, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* --------------------------------- Scene ------------------------------------ */
function Scene({ onHover, reduced, isLight }: { onHover: (n: PresenceNode | null) => void; reduced: boolean; isLight: boolean }) {
  const glow = useGlowTexture();
  const [paused, setPaused] = useState(false);

  return (
    <>
      <ambientLight intensity={1} />
      <Earth />
      <Atmosphere color={isLight ? '#38bdf8' : '#5eb6e8'} op={isLight ? 0.5 : 0.85} />
      <Labels />
      {presenceNodes.map((n) => (
        <Marker key={n.id} node={n} glow={glow} onHover={onHover} setPaused={setPaused} reduced={reduced} />
      ))}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        autoRotate={!paused && !reduced}
        autoRotateSpeed={2.4}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />
    </>
  );
}

export default function GlobeScene({ onHover }: { onHover: (n: PresenceNode | null) => void }) {
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  const isLight = theme === 'light';
  const [ready, setReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!wrapRef.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never';

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 2]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 8], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.style.cursor = 'grab';
          setReady(true);
        }}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <Scene onHover={onHover} reduced={reduced} isLight={isLight} />
      </Canvas>
    </div>
  );
}
