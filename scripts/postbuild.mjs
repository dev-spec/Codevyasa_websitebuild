// Runs after `next build` (static export). Prepares the `out/` folder for
// dropping onto any static host / CMS with zero surprises.
import { writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.cwd(), 'out');

if (!existsSync(out)) {
  console.warn('[postbuild] no out/ directory — skipping (did `next build` run with output: "export"?)');
  process.exit(0);
}

// GitHub Pages / Jekyll-based hosts otherwise ignore files/folders starting with "_".
writeFileSync(join(out, '.nojekyll'), '');

// SPA-style fallback: some static hosts look for 200.html. Next emits 404.html;
// mirror it so hosts that expect 200.html still serve the app shell.
const notFound = join(out, '404.html');
if (existsSync(notFound)) {
  try {
    copyFileSync(notFound, join(out, '200.html'));
  } catch {
    /* non-fatal */
  }
}

console.log('[postbuild] out/ prepared for static hosting (.nojekyll, 200.html fallback).');
