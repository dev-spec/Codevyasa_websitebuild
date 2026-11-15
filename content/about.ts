/**
 * About page copy. Headings, paragraphs, values and perks are pulled VERBATIM
 * from the live /about page. Spot-check and extend with any founding-story /
 * leadership content when supplied (TODO_ASSETS §6).
 */

export const about = {
  eyebrow: 'About Us',
  headline: 'CODEVYASA BELIEVES IN A CLIENT-CENTRIC APPROACH TO BUSINESS',
  intro: [
    'We are a leading software product engineering and development firm, offering top-tier IT consulting, cutting-edge app development, and on-demand tech resources tailored to the unique needs of early-stage and mid-market product firms.',
    'Throughout our remarkable three-year journey, we have consistently surpassed expectations, achieving exceptional milestones and garnering prestigious accolades.',
  ],
  clientCentric: [
    'We cater our services to a diverse range of clients that extend from ambitious startups to well-established organizations.',
    'We strive to cultivate long-lasting partnerships with our clients along with a deep understanding of their unique objectives and challenges.',
    'Our skilled professionals ensure solutions that drive tangible business outcomes.',
  ],
  values: [
    {
      title: 'Inclusivity',
      description: 'We build teams and products that welcome everyone, valuing diverse perspectives.',
    },
    {
      title: 'Integrity',
      description: 'We do what is right, keep our commitments and stay honest with clients and each other.',
    },
    {
      title: 'Ownership Mentality',
      description: 'We take responsibility end to end and act like owners of every outcome.',
    },
    {
      title: 'Continuous Learning and Growth',
      description: 'We invest in our people and keep sharpening our craft as technology evolves.',
    },
    {
      title: 'Respect',
      description: 'We treat colleagues, clients and communities with genuine respect.',
    },
    {
      title: 'Get Things Done',
      description: 'We are biased to action and ship real, working results.',
    },
  ],
  perks: [
    { label: 'Health & Insurance', icon: 'health' },
    { label: 'Performance Bonus', icon: 'chart' },
    { label: 'Flexible Hours', icon: 'clock' },
    { label: 'Maternity & Paternity Leave', icon: 'family' },
    { label: 'Hybrid model', icon: 'home' },
    { label: 'Paid leave', icon: 'wallet' },
  ],
  // Intro video for "Life at CodeVyasa". Drop the file at
  // /public/assets/videos/codevyasa-intro.mp4 (+ optional intro-poster.jpg),
  // OR set `youtubeId` to a YouTube video id to embed instead (recommended for
  // large videos so the site stays light). `youtubeId` takes priority over `src`.
  video: {
    src: '/assets/videos/codevyasa-intro.mp4',
    poster: '/assets/videos/intro-poster.jpg',
    youtubeId: '',
    title: 'Inside CodeVyasa',
  },
  ctas: {
    jobs: { label: 'View Job Opening', href: '/contact' },
  },
} as const;
