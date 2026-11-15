import Link from 'next/link';
import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 pt-[var(--nav-h)]">
      <div className="text-center">
        <p className="eyebrow mb-6 text-accent-400">Error 404</p>
        <h1 className="text-gradient font-display text-[clamp(4rem,16vw,12rem)] font-semibold leading-none">404</h1>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-text-1">
          This page drifted off the map. Let’s get you back to solid ground.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button href="/" size="lg" iconRight={<span aria-hidden>→</span>}>
            Back home
          </Button>
          <Button href="/work" variant="ghost" size="lg">
            See our work
          </Button>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-text-2">
          <Link href="/expertise" className="hover:text-text-0">
            Expertise
          </Link>
          <Link href="/technology" className="hover:text-text-0">
            Technologies
          </Link>
          <Link href="/about" className="hover:text-text-0">
            About
          </Link>
          <Link href="/contact" className="hover:text-text-0">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
