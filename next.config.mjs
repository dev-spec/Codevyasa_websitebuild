/** @type {import('next').NextConfig} */

// CodeVyasa.com — STATIC EXPORT build.
// `output: 'export'` produces a fully static `out/` folder (HTML/CSS/JS + assets)
// that drops onto ANY host: a CMS static area, a company web server, S3/CDN, Netlify,
// GitHub Pages, etc. — with zero Node runtime required.
//
// Notes for maintainers:
//  - Image Optimization requires a running Node server, so it is disabled here
//    (`images.unoptimized: true`). We ship pre-sized assets and use next/image with
//    explicit dimensions to keep CLS ~0.
//  - `trailingSlash: true` makes every route emit `/route/index.html`, which is what
//    generic/static web servers and most CMS static hosts expect — no rewrite rules needed.
//  - There are NO server Route Handlers in this build (static export forbids them). The
//    contact form POSTs to a configurable endpoint (see .env.example). The optional
//    Node/Prisma/Resend backend lives in /server-optional and is documented in the README.

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Keep the static build green even if a lint rule trips; run `pnpm lint` separately.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // three.js ships untranspiled ESM in places; let Next transpile the 3D stack.
  transpilePackages: ['three'],
};

export default nextConfig;
