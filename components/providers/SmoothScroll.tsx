'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Lenis smooth scroll (lerp ~0.1) synced to the GSAP ticker, so every
 * ScrollTrigger reads the same scroll position (Part D §2). Degrades to native
 * scroll under prefers-reduced-motion.
 */

interface ScrollCtx {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
}

const Ctx = createContext<ScrollCtx>({ lenis: null, scrollTo: () => {} });

export const useSmoothScroll = () => useContext(Ctx);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    if (reduced) {
      // No smooth scroll under reduced motion — keep ScrollTrigger working natively.
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = instance;
    setLenis(instance);

    instance.on('scroll', ScrollTrigger.update);

    const onRaf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);

    // Recompute triggers once images/fonts settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = setTimeout(refresh, 600);

    return () => {
      gsap.ticker.remove(onRaf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
      window.removeEventListener('load', refresh);
      clearTimeout(t);
    };
  }, [reduced]);

  const scrollTo: ScrollCtx['scrollTo'] = (target, opts) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target as any, { offset: opts?.offset ?? 0, immediate: opts?.immediate });
    } else if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  return <Ctx.Provider value={{ lenis, scrollTo }}>{children}</Ctx.Provider>;
}
