'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import type { PresenceNode } from '@/content/types';

/** Only mount the (heavy) 3D canvas once its container scrolls near the viewport. */
function useNearViewport<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });
const GlobeScene = dynamic(() => import('./GlobeScene'), { ssr: false });

/** Static gradient orb fallback for the hero (reduced-motion / no-WebGL / loading). */
function HeroFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="h-[46vmin] w-[46vmin] rounded-full blur-[2px]"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #22d3ee, #0891b2 45%, #2dd4bf 80%, transparent)',
          boxShadow: '0 0 120px rgba(34,211,238,0.35)',
          opacity: 0.85,
        }}
      />
    </div>
  );
}

export function HeroCanvas() {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<HeroFallback />}>
          <HeroScene />
        </WebGLBoundary>
      ) : (
        <HeroFallback />
      )}
    </div>
  );
}

const HeroAurora = dynamic(() => import('./HeroAurora'), { ssr: false });

/** Static gradient fallback for the aurora (matches its resting look). */
function HeroAuroraFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(70% 90% at 78% 55%, rgba(28,158,192,0.35), transparent 60%), radial-gradient(60% 80% at 62% 42%, rgba(14,87,105,0.40), transparent 65%), var(--bg-0)',
      }}
    />
  );
}

/** Flowing shader-aurora hero background (premium, text-safe). */
export function HeroAuroraCanvas() {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<HeroAuroraFallback />}>
          <HeroAurora />
        </WebGLBoundary>
      ) : (
        <HeroAuroraFallback />
      )}
    </div>
  );
}

const HeroRibbon = dynamic(() => import('./HeroRibbon'), { ssr: false });

/** Static dark fallback for the ribbon (matches its resting look). */
function HeroRibbonFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(55% 70% at 84% 40%, rgba(150,190,255,0.30), transparent 62%), radial-gradient(85% 95% at 72% 55%, rgba(36,86,240,0.42), transparent 66%), #040712',
      }}
    />
  );
}

/** Flowing volumetric light-ribbon hero background (blue→cyan, forced-dark). */
export function HeroRibbonCanvas({ ready }: { ready: boolean }) {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<HeroRibbonFallback />}>
          <HeroRibbon ready={ready} />
        </WebGLBoundary>
      ) : (
        <HeroRibbonFallback />
      )}
    </div>
  );
}

const HeroHills = dynamic(() => import('./HeroHills'), { ssr: false });

/** Flowing GLSL "hills" hero background (animated wireframe terrain). */
export function HeroHillsCanvas() {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<HeroAuroraFallback />}>
          <HeroHills />
        </WebGLBoundary>
      ) : (
        <HeroAuroraFallback />
      )}
    </div>
  );
}

const HeroLogoParticles = dynamic(() => import('./HeroLogoParticles'), { ssr: false });

/** Still logo, positioned like the particle one — shown only if WebGL fails. */
function HeroLogoFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[13svh] lg:items-center lg:justify-end lg:pr-[max(3rem,calc((100vw-1320px)/2+4rem))] lg:pt-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/brand/logo-mark.png" alt="" className="h-[28svh] w-auto lg:h-[54vh]" draggable={false} />
    </div>
  );
}

/** The CodeVyasa logo assembling from particles, then rotating in 3D. */
export function HeroLogoCanvas({ ready }: { ready: boolean }) {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near && (
        <WebGLBoundary fallback={<HeroLogoFallback />}>
          <HeroLogoParticles ready={ready} />
        </WebGLBoundary>
      )}
    </div>
  );
}

const HeroCinematic = dynamic(() => import('./HeroCinematic'), { ssr: false });

/** "Materialisation": particle logo → photoreal glass logo on a reflective stage. */
export function HeroCinematicCanvas({ ready }: { ready: boolean }) {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near && (
        <WebGLBoundary fallback={<HeroLogoFallback />}>
          <HeroCinematic ready={ready} />
        </WebGLBoundary>
      )}
    </div>
  );
}

const HeroHands = dynamic(() => import('./HeroHands'), { ssr: false });

/** Still mark for the "Creation" hero — shown only if WebGL fails. */
function HeroHandsFallback() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[28svh] flex justify-center lg:top-[40svh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/brand/logo-mark.png" alt="" className="h-[19svh] w-auto -translate-y-1/2 lg:h-[30svh]" draggable={false} />
    </div>
  );
}

/** "Creation": a robotic and a human hand (dot-matrix 3D) with the mark forming between them. */
export function HeroHandsCanvas({ ready }: { ready: boolean }) {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near && (
        <WebGLBoundary fallback={<HeroHandsFallback />}>
          <HeroHands ready={ready} />
        </WebGLBoundary>
      )}
    </div>
  );
}

const SingularityHorizon = dynamic(() => import('./SingularityHorizon'), { ssr: false });

/** Black-hole accretion-disk hero background (WebGL2). */
export function HeroSingularityCanvas() {
  const { ref, near } = useNearViewport<HTMLDivElement>('0px');
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<HeroAuroraFallback />}>
          <SingularityHorizon height="100%" hud={false} interactive={false} interval={0} particles={4000} />
        </WebGLBoundary>
      ) : (
        <HeroAuroraFallback />
      )}
    </div>
  );
}

/** Static dotted-globe fallback (SVG) for the globe section. */
function GlobeFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 200" className="h-[70%] w-[70%] opacity-80">
        <defs>
          <radialGradient id="gf" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#0f2740" />
            <stop offset="100%" stopColor="#050a12" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="72" fill="url(#gf)" stroke="rgba(34,211,238,0.4)" />
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={i} cx="100" cy="100" rx={72} ry={12 + i * 9} fill="none" stroke="rgba(34,211,238,0.12)" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <ellipse key={`v${i}`} cx="100" cy="100" rx={12 + i * 9} ry={72} fill="none" stroke="rgba(45,212,191,0.1)" />
        ))}
      </svg>
    </div>
  );
}

export function GlobeCanvas({ onHover }: { onHover: (n: PresenceNode | null) => void }) {
  // Start well before it enters view so the JS chunk + texture are ready in time.
  const { ref, near } = useNearViewport<HTMLDivElement>('800px');
  // Warm the earth texture in parallel with the three.js chunk so it's cached
  // by the time the scene's TextureLoader asks for it (kills the load hitch).
  useEffect(() => {
    if (!near) return;
    const img = new Image();
    img.src = '/textures/earth.png';
  }, [near]);
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <WebGLBoundary fallback={<GlobeFallback />}>
          <GlobeScene onHover={onHover} />
        </WebGLBoundary>
      ) : (
        <GlobeFallback />
      )}
    </div>
  );
}
