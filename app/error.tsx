'use client';

import { useEffect } from 'react';
import { Button } from '@/components/Button';

/** Global error boundary for unexpected runtime errors (App Router). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="grid min-h-[70vh] place-items-center px-6 pt-[var(--nav-h)]">
      <div className="text-center">
        <p className="eyebrow mb-6 text-accent-400">Something went wrong</p>
        <h1 className="text-gradient font-display text-[clamp(3rem,10vw,7rem)] font-semibold leading-none">Oops.</h1>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-text-1">
          An unexpected error interrupted this page. You can try again, or head back home.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button onClick={() => reset()} size="lg" magnetic={false} iconRight={<span aria-hidden>↻</span>}>
            Try again
          </Button>
          <Button href="/" variant="ghost" size="lg">
            Back home
          </Button>
        </div>
      </div>
    </section>
  );
}
