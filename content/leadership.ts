/**
 * Leadership / Founder content.
 *
 * ✍️  REPLACE the placeholder text below with the real founder's name, title,
 *     message and bio. Drop the founder photo at /public/assets/team/founder.jpg
 *     (square or portrait, ≥800px) — until then a polished monogram shows.
 *     Add more execs to `leadership` and they render as a grid below the founder.
 */

export interface Leader {
  name: string;
  role: string;
  /** A short first-person message shown large (the "wow" pull-quote). */
  message: string;
  /** 1–3 short bio paragraphs. */
  bio: string[];
  /** /assets/team/<file> — photo-or-monogram fallback handles a missing file. */
  photo: string;
  linkedin?: string;
  /** e.g. "Founder · Since 2021" */
  tenure?: string;
  /** A small highlight stat, e.g. { value: "800+", label: "Engineers led" }. */
  highlight?: { value: string; label: string };
  /** Optional short video, opened in a lightbox from a button beside "Connect on LinkedIn". */
  video?: { src?: string; youtubeId?: string; poster?: string; title?: string };
  featured?: boolean;
}

export const founder: Leader = {
  name: 'Shubham Garg',
  role: 'Founder & CEO',
  message:
    'We started CodeVyasa on a simple conviction — that world-class engineering shouldn’t be a privilege reserved for a few. Every product we ship carries that belief forward.',
  bio: [
    'From a small, determined team to 800+ engineers across four offices, we’ve grown by staying obsessed with one thing: outcomes our clients can measure. We partner with founders and enterprises alike, and we treat every build as if it were our own.',
    'The next chapter is AI-first — smarter systems, faster delivery, and a footprint that now reaches from India to the US and into the Gulf. The mission stays the same: turn ambitious ideas into products the world relies on.',
  ],
  photo: '/assets/team/founder.png',
  linkedin: 'https://www.linkedin.com/in/shubham-garg-b83648ba/',
  tenure: 'Founder · Since 2021',
  highlight: { value: '800+', label: 'Engineers led' },
  // Founder video — drop the file at /public/assets/videos/founder-story.mp4,
  // OR set `youtubeId` to a YouTube id to embed instead (takes priority over src).
  // The button beside "Connect on LinkedIn" opens it in a lightbox.
  video: {
    src: '/assets/videos/founder-story.mp4',
    youtubeId: '',
    poster: '',
    title: 'Shubham Garg — Founder story',
  },
  featured: true,
};

/** Add more leaders here to render an executive grid under the founder. */
export const leadership: Leader[] = [];
