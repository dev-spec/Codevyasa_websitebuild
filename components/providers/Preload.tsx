'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoMark } from '@/components/Logo';
import { ease } from '@/lib/motion';

interface PreloadCtx {
  /** True once the hero is allowed to run its intro reveal. */
  ready: boolean;
}
const Ctx = createContext<PreloadCtx>({ ready: true });
export const usePreload = () => useContext(Ctx);

const PANELS = 5;
const SESSION_KEY = 'cv-preloaded';

export function PreloadProvider({ children }: { children: React.ReactNode }) {
  // Decide synchronously-ish: show only on first visit of the session, and never
  // under reduced motion. Start hidden=false→true after mount to avoid SSR flash.
  const [phase, setPhase] = useState<'count' | 'wipe' | 'done'>('done');
  const [ready, setReady] = useState(true);
  const [count, setCount] = useState(0);
  const decided = useRef(false);

  useEffect(() => {
    if (decided.current) return;
    decided.current = true;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* ignore */
    }

    if (reduced || seen) {
      setReady(true);
      setPhase('done');
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }

    // Run the intro.
    setReady(false);
    setPhase('count');
    document.body.style.overflow = 'hidden';

    const duration = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast, then "arrives" at 100
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase('wipe');
        setReady(true); // hero reveals as the curtain lifts
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase === 'wipe') {
      const t = setTimeout(() => {
        setPhase('done');
        document.body.style.overflow = '';
      }, 950);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const skip = () => {
    setPhase('wipe');
    setReady(true);
  };

  return (
    <Ctx.Provider value={{ ready }}>
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            className="fixed inset-0 z-[10000]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            aria-hidden
          >
            {/* 5-panel curtain — each rises on wipe */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: PANELS }).map((_, i) => (
                <motion.div
                  key={i}
                  className="relative h-full flex-1 bg-[var(--bg-0)]"
                  initial={{ y: 0 }}
                  animate={phase === 'wipe' ? { y: '-101%' } : { y: 0 }}
                  transition={{ duration: 0.9, ease: ease.inOut, delay: phase === 'wipe' ? i * 0.06 : 0 }}
                >
                  <span className="absolute inset-0 opacity-[0.5] bg-grad-brand-soft" />
                </motion.div>
              ))}
            </div>

            {/* Intro: subtle mark top-left, big percentage counter bottom-right */}
            {phase === 'count' && (
              <button
                onClick={skip}
                className="absolute inset-0 cursor-pointer"
                aria-label="Skip intro"
              >
                <motion.div
                  className="absolute left-7 top-7 sm:left-10 sm:top-10"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: ease.out }}
                >
                  <LogoMark size={40} />
                </motion.div>

                <motion.div
                  className="absolute bottom-4 right-6 flex items-end leading-[0.8] text-text-0 sm:bottom-6 sm:right-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: ease.out }}
                >
                  <span className="font-semibold tabular-nums tracking-[-0.03em] [font-size:clamp(4.5rem,17vw,13rem)]">
                    {String(count).padStart(2, '0')}
                  </span>
                  <span className="mb-[0.12em] ml-1 font-semibold text-text-2 [font-size:clamp(1.8rem,6vw,4.5rem)]">
                    %
                  </span>
                </motion.div>

                <span className="absolute bottom-8 left-7 font-mono text-[11px] uppercase tracking-[0.2em] text-text-2/70 sm:left-10">
                  Loading — click to skip
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Ctx.Provider>
  );
}
