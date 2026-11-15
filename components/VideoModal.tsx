'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  /** Local file in /public, e.g. /assets/videos/founder-story.mp4 */
  src?: string;
  /** YouTube id — takes priority over `src` when set. */
  youtubeId?: string;
  poster?: string;
  title?: string;
}

/**
 * Lightbox video player. Opens over the page (no layout space used), plays a
 * local file or a YouTube embed, and only mounts the video while open — so it
 * never preloads or keeps playing after it's closed. Rendered through a portal
 * to <body> so it always centers on the viewport regardless of any transformed
 * (animated) ancestor.
 */
export function VideoModal({ open, onClose, src, youtubeId, poster, title }: VideoModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Video'}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" aria-hidden />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            data-cursor="cta"
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <motion.div
            className="relative z-[1] w-full max-w-4xl overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl"
            initial={{ scale: 0.94, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full">
              {youtubeId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={title || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : src ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                  src={src}
                  poster={poster || undefined}
                  controls
                  autoPlay
                  playsInline
                />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
