'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Low-GPU animated background: a drifting particle grid rendered on a 2D canvas
 * (cheaper than WebGL). Drifts with scroll velocity + cursor, pauses when the
 * tab is hidden, and falls back to a static field under reduced motion (Part D §8).
 */
export function BackgroundField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    // Decorative layer — 1× pixels are plenty and roughly quarter the paint
    // cost of a 2× (retina) buffer, which matters since it repaints full-screen.
    const dpr = 1;
    const spacing = 60;
    const mouse = { x: 0.5, y: 0.5 };
    let lastScroll = window.scrollY;
    let scrollVel = 0;
    let running = true;
    let t = 0;
    // Cap to ~30fps so the background never competes with scroll for frames.
    const frameInterval = 1000 / 30;
    let lastDraw = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const px = (mouse.x - 0.5) * 24;
      const py = (mouse.y - 0.5) * 24 + scrollVel * 0.4;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * spacing;
          const by = j * spacing;
          const wave = Math.sin((i + j) * 0.5 + t) * 1.4;
          const x = bx + px * ((j % 3) - 1) * 0.3 + wave;
          const y = by + py * ((i % 3) - 1) * 0.3 + wave;
          // distance to cursor for a soft accent glow (skip sqrt unless near)
          const dx = x - mouse.x * w;
          const dy = y - mouse.y * h;
          const d2 = dx * dx + dy * dy;
          const near = d2 < 48400 ? Math.max(0, 1 - Math.sqrt(d2) / 220) : 0;
          const alpha = 0.05 + near * 0.35;
          ctx.fillStyle = near > 0.05 ? `rgba(34,211,238,${alpha})` : `rgba(174,186,203,${0.05 + near})`;
          const s = 1.4 + near * 1.6;
          ctx.fillRect(x, y, s, s);
        }
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < frameInterval) return; // throttle to ~30fps
      lastDraw = now;
      t += 0.012;
      const sy = window.scrollY;
      scrollVel += ((sy - lastScroll) - scrollVel) * 0.1;
      lastScroll = sy;
      scrollVel *= 0.92;
      draw();
    };

    const onMouse = (e: PointerEvent) => {
      mouse.x = e.clientX / w;
      mouse.y = e.clientY / h;
    };
    const onVisibility = () => {
      running = document.visibilityState === 'visible' && !reduced;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMouse, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced) {
      draw(); // static single frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* static CSS gradient fallback always painted underneath */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(8,145,178,0.10), transparent 60%), radial-gradient(50% 40% at 85% 30%, rgba(45,212,191,0.08), transparent 60%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
    </div>
  );
}
