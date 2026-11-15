'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
// Hero background options (all preserved):
//   'ribbon'      → flowing volumetric light ribbon (blue→cyan) over deep navy — forced-dark
//   'hands'       → "Creation": robotic + human hand (dot-matrix 3D), the mark forms between them
//   'cinematic'   → particles assemble the logo, a scan turns it into photoreal glass
//   'logo'        → particle logo inside the 3D "world" (grid floor, network, HUD)
//   'singularity' → black-hole accretion disk (WebGL2)
//   'hills'       → animated GLSL wireframe terrain
//   'aurora'      → flowing shader aurora
// REVERT: set HERO_BG to any of the other values to restore a previous one.
import {
  HeroAuroraCanvas,
  HeroCinematicCanvas,
  HeroHandsCanvas,
  HeroHillsCanvas,
  HeroLogoCanvas,
  HeroRibbonCanvas,
  HeroSingularityCanvas,
} from '@/components/three/Lazy';

const HERO_BG = 'ribbon' as 'ribbon' | 'hands' | 'cinematic' | 'logo' | 'singularity' | 'hills' | 'aurora';
/** Modes where the logo is the hero object (it sits above the copy on phones). */
const LOGO_MODE = HERO_BG === 'cinematic' || HERO_BG === 'logo';
/** Centred composition: the scene fills the upper band, the copy is centred beneath it. */
const CENTER_MODE = HERO_BG === 'hands';
/** Left-aligned cinematic composition over a full-bleed light ribbon. */
const RIBBON_MODE = HERO_BG === 'ribbon';
const SCENE_MODE = LOGO_MODE || CENTER_MODE || RIBBON_MODE;

// The singularity background is opaque deep-space black, so the hero renders as
// a dark section in BOTH light and dark site themes — these token overrides keep
// the headline, scrim and buttons readable over it. (No-op for the other bgs.)
const DARK_HERO_TOKENS =
  HERO_BG === 'singularity' || HERO_BG === 'ribbon'
    ? ({
        ['--bg-0']: '#070a0f',
        ['--bg-1']: '#0b111c',
        ['--bg-2']: '#0f1826',
        ['--surface']: '#121b2b',
        ['--text-0']: '#f4f7fb',
        ['--text-1']: '#aebacb',
        ['--text-2']: '#8b98ab',
        ['--accent-400']: '#22d3ee',
        ['--accent-500']: '#06b6d4',
        ['--border']: 'rgba(255,255,255,0.08)',
        ['--border-strong']: 'rgba(255,255,255,0.16)',
      } as CSSProperties)
    : undefined;

const LAYOUT = CENTER_MODE
  ? {
      shell: 'flex flex-col items-center pb-10 pt-[46svh] text-center lg:pb-12 lg:pt-[60svh]',
      eyebrow: 'mb-4',
      title: 'mx-auto max-w-[16ch] lg:max-w-none [font-size:clamp(2.6rem,5vw,5.5rem)] [line-height:0.95]',
      sub: 'mx-auto mt-5',
      ctas: 'mt-8 justify-center',
      trust: 'mt-7 justify-center',
    }
  : {
      shell: LOGO_MODE ? 'pb-28 pt-[46svh] lg:pb-0 lg:pt-24' : 'pt-24',
      eyebrow: 'mb-6',
      title: 'max-w-[13ch] [font-size:clamp(3rem,6.4vw,6.25rem)] [line-height:0.92]',
      sub: 'mt-8',
      ctas: 'mt-11',
      trust: 'mt-14',
    };
import { SplitText } from '@/components/SplitText';
import { Button } from '@/components/Button';
import { usePreload } from '@/components/providers/Preload';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { dur, ease } from '@/lib/motion';

export function Hero() {
  const { ready } = usePreload();
  const { scrollTo } = useSmoothScroll();

  return (
    <section
      className={`relative flex min-h-[100svh] overflow-hidden ${CENTER_MODE ? 'items-start' : 'items-center'}`}
      style={DARK_HERO_TOKENS}
    >
      {/* Animated hero background (see HERO_BG above) */}
      <div className="absolute inset-0 -z-10">
        {HERO_BG === 'ribbon' ? (
          <HeroRibbonCanvas ready={ready} />
        ) : HERO_BG === 'hands' ? (
          <HeroHandsCanvas ready={ready} />
        ) : HERO_BG === 'cinematic' ? (
          <HeroCinematicCanvas ready={ready} />
        ) : HERO_BG === 'logo' ? (
          <HeroLogoCanvas ready={ready} />
        ) : HERO_BG === 'singularity' ? (
          <HeroSingularityCanvas />
        ) : HERO_BG === 'hills' ? (
          <HeroHillsCanvas />
        ) : (
          <HeroAuroraCanvas />
        )}
      </div>

      {/* Scene modes bring their own stage + soft scrim inside the canvas layer,
          so the flat grid texture + hard scrim are skipped. */}
      {!SCENE_MODE && (
        <>
          {/* subtle 4% grid texture */}
          <div className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-25" aria-hidden />
          {/* left readability scrim — keeps the headline crisp over the background in any theme */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
            style={{ background: 'linear-gradient(95deg, var(--bg-0) 0%, var(--bg-0) 30%, transparent 70%)' }}
          />
        </>
      )}

      {/* Ribbon: soft navy scrim on the left so the headline reads over the light sweep */}
      {RIBBON_MODE && (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              'linear-gradient(100deg, rgba(4,7,18,0.92) 0%, rgba(4,7,18,0.6) 34%, rgba(4,7,18,0) 66%)',
          }}
        />
      )}

      <div className={`shell relative w-full ${LAYOUT.shell}`}>
        <motion.p
          className={`eyebrow text-accent-400 ${LAYOUT.eyebrow}`}
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.1 }}
        >
          PRODUCT ENGINEERING · AI · DATA
          <span aria-hidden className="cv-caret ml-2 inline-block h-[1em] w-[0.55em] translate-y-[0.16em] bg-accent-400" />
        </motion.p>

        <h1 data-hero-title className={`text-balance font-semibold text-text-0 [letter-spacing:-0.035em] ${LAYOUT.title}`}>
          {ready ? (
            <SplitText text="Intelligence at Scale" by="word" as="span" animateOnMount staggerKey="base" />
          ) : (
            <span className="opacity-0">Intelligence at Scale</span>
          )}
        </h1>

        <motion.p
          className={`max-w-xl text-body-lg text-text-1 ${LAYOUT.sub}`}
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.55 }}
        >
          Innovative Services for a Transformed Digital World
        </motion.p>

        <motion.div
          className={`flex flex-wrap items-center gap-4 ${LAYOUT.ctas}`}
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: dur.md, ease: ease.out, delay: 0.7 }}
        >
          <Button href="/contact" size="lg" iconRight={<span aria-hidden>→</span>}>
            Contact Us
          </Button>
          <Button href="/work" variant="ghost" size="lg">
            Our Work
          </Button>
        </motion.div>

        {/* trust micro-line */}
        <motion.div
          className={`flex items-center gap-3 text-sm text-text-2 ${LAYOUT.trust}`}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: dur.lg, ease: ease.out, delay: 1 }}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          Trusted by 100+ companies globally — unicorns, enterprises & startups
        </motion.div>
      </div>

      {/* scroll cue (the centred layout already fills the bottom of the screen) */}
      {!CENTER_MODE && (
        <motion.button
          onClick={() => scrollTo('#trust', { offset: -80 })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-2"
          aria-label="Scroll down"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: dur.md }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <span className="relative flex h-9 w-5 justify-center rounded-pill border border-[var(--border-strong)]">
            <motion.span
              className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-400"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.button>
      )}
    </section>
  );
}
