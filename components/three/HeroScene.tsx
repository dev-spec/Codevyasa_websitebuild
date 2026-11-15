'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import { usePrefersReducedMotion } from '@/lib/hooks';

function DisplacedSphere({ reduced }: { reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#0891B2') },
      uColorB: { value: new THREE.Color('#22D3EE') },
      uColorC: { value: new THREE.Color('#2DD4BF') },
    }),
    []
  );

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    if (!reduced) u.uTime.value += delta;

    // damped drift toward cursor
    const target = state.pointer;
    mouse.current.x += (target.x - mouse.current.x) * 0.04;
    mouse.current.y += (target.y - mouse.current.y) * 0.04;
    u.uMouse.value.set(mouse.current.x, mouse.current.y);

    // scroll compress + fade (hero scrolls out over one viewport)
    const progress =
      typeof window !== 'undefined' ? Math.min(window.scrollY / window.innerHeight, 1) : 0;
    u.uScroll.value += (progress - u.uScroll.value) * 0.1;

    if (meshRef.current && !reduced) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x = mouse.current.y * 0.2;
      meshRef.current.scale.setScalar(1 - u.uScroll.value * 0.25);
    }
  });

  const scale = Math.min(viewport.width, viewport.height) * 0.34;

  return (
    <mesh ref={meshRef} scale={scale}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export default function HeroScene() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <DisplacedSphere reduced={reduced} />
    </Canvas>
  );
}
