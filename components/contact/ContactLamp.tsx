'use client';

/* =============================================================================
   ContactLamp — an interactive pendant lamp for the Contact hero.
   The page loads in a dim "dark room". A bulb hangs in the top-right blank
   space; hovering / clicking / focusing it "turns on the lights", clearing the
   shroud and revealing the whole page with a warm-to-cyan glow.

   Fully self-contained + revertible: this component owns every style it uses
   (plus the --lamp-shroud-* tokens in globals.css). To revert, remove the two
   lines that mount <ContactLamp /> on app/contact/page.tsx — the page returns to
   normal with nothing left behind. Desktop only (>=1024px); on smaller screens
   it renders nothing so mobile UX is untouched.
   ========================================================================== */

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function ContactLamp() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false); // desktop (lg+) only
  const [on, setOn] = useState(false); // latched light switch
  const [touched, setTouched] = useState(false); // has the visitor interacted yet
  const [tug, setTug] = useState(0); // pull-cord animation trigger

  // Only run the effect on large screens — leaves mobile completely untouched.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Respect reduced-motion: start with the lights on, skip the dramatic reveal.
  useEffect(() => {
    if (reduced) {
      setOn(true);
      setTouched(true);
    }
  }, [reduced]);

  if (!enabled) return null;

  const lit = on;

  const turnOn = () => {
    setTouched(true);
    if (!on) setOn(true);
  };
  const toggle = () => {
    setTouched(true);
    setTug((t) => t + 1);
    setOn((v) => !v);
  };

  return (
    <>
      {/* ---- Dark-room shroud: dims the page, brighter pool under the bulb ---- */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          background:
            'radial-gradient(78vmax 78vmax at var(--lamp-x) var(--lamp-cy), var(--lamp-shroud-near) 0%, var(--lamp-shroud-far) 46%)',
          // Position tokens shared with the lamp layer below.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--lamp-x' as any]: 'min(84%, calc(100% - 150px))',
          ['--lamp-cy' as any]: 'calc(var(--lamp-drop) + 78px)',
          ['--lamp-drop' as any]: 'clamp(150px, 21vh, 250px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: lit ? 0 : 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ---- The lamp itself (cord + bulb + pull cord) ---- */}
      <div
        className="pointer-events-none fixed top-0 z-[70]"
        style={{
          left: 'min(84%, calc(100% - 150px))',
          transform: 'translateX(-50%)',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--lamp-drop' as any]: 'clamp(150px, 21vh, 250px)',
        }}
      >
        <motion.div
          style={{ transformOrigin: '50% 0%' }}
          initial={{ rotate: reduced ? 0 : -8, opacity: 0 }}
          animate={
            reduced
              ? { rotate: 0, opacity: 1 }
              : { rotate: [-2.1, 2.1, -2.1], opacity: 1 }
          }
          transition={
            reduced
              ? { duration: 0.6 }
              : {
                  rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 0.9, ease: 'easeOut' },
                }
          }
        >
          {/* hanging wire from the ceiling */}
          <div
            aria-hidden
            className="mx-auto w-[2px] rounded-full"
            style={{
              height: 'var(--lamp-drop)',
              background:
                'linear-gradient(to bottom, transparent, rgba(148,163,184,0.55) 22%, rgba(148,163,184,0.55))',
            }}
          />

          <div className="relative -mt-[2px] flex justify-center">
            <button
              type="button"
              data-cursor="cta"
              aria-label="Turn the page lights on or off"
              aria-pressed={on}
              onClick={toggle}
              onPointerEnter={turnOn}
              onFocus={turnOn}
              className="pointer-events-auto relative flex flex-col items-center outline-none"
            >
              {/* soft ambient halo */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[46px] -translate-x-1/2 rounded-full blur-2xl"
                style={{
                  width: 300,
                  height: 300,
                  background:
                    'radial-gradient(circle, rgba(255,226,170,0.6) 0%, rgba(34,211,238,0.28) 38%, transparent 70%)',
                }}
                animate={{ opacity: lit ? 1 : 0.14, scale: lit ? 1 : 0.55 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* volumetric light beam pouring down into the room */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[70px] -translate-x-1/2"
                style={{
                  width: 560,
                  height: 660,
                  background:
                    'radial-gradient(58% 82% at 50% 0%, rgba(255,236,196,0.18), rgba(34,211,238,0.06) 46%, transparent 72%)',
                  clipPath: 'polygon(43% 0%, 57% 0%, 100% 100%, 0% 100%)',
                }}
                animate={{ opacity: lit ? 1 : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* the bulb */}
              <motion.svg
                width="84"
                viewBox="0 0 92 150"
                className="relative"
                animate={{
                  filter: lit
                    ? 'drop-shadow(0 0 14px rgba(255,214,140,0.9)) drop-shadow(0 0 42px rgba(34,211,238,0.55))'
                    : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
                }}
                transition={{ duration: 0.6 }}
                whileTap={{ scale: 0.97 }}
              >
                <defs>
                  <radialGradient id="cvLampGlass" cx="50%" cy="40%" r="62%">
                    <stop offset="0%" stopColor="#fff5d8" />
                    <stop offset="42%" stopColor="#ffd47f" />
                    <stop offset="100%" stopColor="#f0a63c" stopOpacity="0.7" />
                  </radialGradient>
                </defs>

                {/* metal cap */}
                <g fill="#98a2b3">
                  <rect x="36" y="4" width="20" height="9" rx="2" />
                  <path d="M33 13 H59 L57 27 H35 Z" />
                </g>
                <g stroke="rgba(9,14,22,0.35)" strokeWidth="1.2">
                  <line x1="34" y1="18" x2="58" y2="18" />
                  <line x1="34.5" y1="23" x2="57.5" y2="23" />
                </g>

                {/* glass */}
                <path
                  d="M35 27 C33 40 12 48 12 82 C12 116 28 140 46 140 C64 140 80 116 80 82 C80 48 59 40 57 27 Z"
                  fill={lit ? 'url(#cvLampGlass)' : 'rgba(255,255,255,0.05)'}
                  stroke={lit ? 'rgba(255,238,200,0.95)' : 'rgba(160,172,188,0.4)'}
                  strokeWidth="1.6"
                  style={{ transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                />
                {/* glass highlight */}
                <path
                  d="M28 46 C24 58 22 74 26 92"
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity={lit ? 0.7 : 0.25}
                />

                {/* filament */}
                <path
                  d="M40 31 L42 66 Q44 74 46 70 Q48 74 50 66 L52 31"
                  fill="none"
                  stroke={lit ? '#fff6d6' : '#3f4a59'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'stroke 0.4s ease' }}
                />
              </motion.svg>

              {/* pull cord */}
              <span aria-hidden className="pointer-events-none relative mt-[2px] flex flex-col items-center">
                <span
                  className="w-[2px]"
                  style={{ height: 34, background: 'rgba(148,163,184,0.5)' }}
                />
                <motion.span
                  key={tug}
                  className="rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: lit
                      ? 'radial-gradient(circle at 35% 30%, #fff2c8, #f0a63c)'
                      : 'radial-gradient(circle at 35% 30%, #cfd7e2, #79839a)',
                    boxShadow: lit ? '0 0 12px rgba(255,206,122,0.8)' : 'none',
                  }}
                  initial={{ y: 0 }}
                  animate={touched ? { y: [0, 9, 0] } : { y: reduced ? 0 : [0, 4, 0] }}
                  transition={
                    touched
                      ? { duration: 0.45, ease: 'easeOut' }
                      : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                />
              </span>

              {/* invite label (before first interaction only) */}
              {!touched && (
                <motion.span
                  className="pointer-events-none absolute left-1/2 top-[212px] -translate-x-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.28em] text-text-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.35, 0.9, 0.35] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Turn on the lights
                </motion.span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
