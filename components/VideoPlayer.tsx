'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  /** Local file in /public, e.g. /assets/videos/codevyasa-intro.mp4 */
  src?: string;
  /** Poster image; falls back to a branded gradient if missing. */
  poster?: string;
  /** YouTube video id — takes priority over `src` when set. */
  youtubeId?: string;
  title?: string;
  className?: string;
}

/**
 * Click-to-play video. Shows a branded poster + play button first (keeps the
 * page light), then loads the actual video only when the visitor hits play —
 * works with a local file or a YouTube embed.
 */
export function VideoPlayer({ src, poster, youtubeId, title, className }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [posterOk, setPosterOk] = useState(false);

  useEffect(() => {
    if (!poster) return;
    let live = true;
    const im = new window.Image();
    im.onload = () => live && setPosterOk(true);
    im.onerror = () => live && setPosterOk(false);
    im.src = poster;
    return () => {
      live = false;
    };
  }, [poster]);

  const canPlay = Boolean(youtubeId || src);

  return (
    <div className={cn('card-surface relative aspect-video w-full overflow-hidden rounded-lg', className)}>
      {playing && youtubeId ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'CodeVyasa video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : playing && src ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className="absolute inset-0 h-full w-full bg-black object-contain"
          src={src}
          poster={posterOk ? poster : undefined}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <button
          type="button"
          onClick={() => canPlay && setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play ${title || 'CodeVyasa video'}`}
          data-cursor="cta"
        >
          {posterOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0b3a48,#0e4e5e 55%,#0e7490)' }} />
          )}
          <div className="grid-overlay absolute inset-0 opacity-20" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/40 backdrop-blur-md transition-transform duration-400 group-hover:scale-110">
            <span className="pointer-events-none absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-white/40" aria-hidden />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffff" aria-hidden className="translate-x-[2px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>

          {title && (
            <span className="absolute bottom-5 left-6 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Watch</span>
              {title}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
