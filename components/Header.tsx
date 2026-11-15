'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { Button } from './Button';
import { Magnetic } from './Magnetic';
import { ThemeToggle } from './ThemeToggle';
import { Icon } from './icons/Icon';
import { primaryNav, expertiseMega, technologyMega, type MegaKind } from '@/content/nav';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';
import { dur, ease } from '@/lib/motion';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<MegaKind | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
  }, [pathname]);

  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMega(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock scroll while mobile menu open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const openMega = (kind: MegaKind) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(kind);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 120);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[900] transition-all duration-400 ease-out',
        scrolled || mega ? 'border-b border-[var(--border)] backdrop-blur-md' : 'border-b border-transparent'
      )}
      style={{
        backgroundColor: scrolled || mega ? 'color-mix(in srgb, var(--bg-0) 94%, transparent)' : 'transparent',
      }}
      onMouseLeave={scheduleClose}
    >
      <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
        <Magnetic strength={6}>
          <Link href="/" aria-label="CodeVyasa home" className="relative z-10">
            <Logo />
          </Link>
        </Magnetic>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const hasMega = !!item.mega;
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => (hasMega ? openMega(item.mega!) : setMega(null))}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'link-underline relative flex items-center gap-1.5 rounded-pill px-4 py-2 text-[15px] text-text-1 transition-colors hover:text-text-0',
                    active && 'text-text-0'
                  )}
                  aria-haspopup={hasMega || undefined}
                  aria-expanded={hasMega ? mega === item.mega : undefined}
                  onFocus={() => (hasMega ? openMega(item.mega!) : setMega(null))}
                >
                  {item.label}
                  {hasMega && (
                    <svg
                      className={cn('transition-transform duration-300', mega === item.mega && 'rotate-180')}
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:grid" />
          <div className="hidden sm:block">
            <Button href="/contact" size="sm" iconRight={<span aria-hidden>→</span>}>
              Get in touch
            </Button>
          </div>
          {/* Mobile toggle */}
          <button
            className="grid h-10 w-10 place-items-center rounded-pill border border-[var(--border-strong)] text-text-0 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <div className="relative h-4 w-5">
              <span className={cn('absolute left-0 h-0.5 w-5 bg-current transition-all duration-300', mobileOpen ? 'top-1.5 rotate-45' : 'top-0.5')} />
              <span className={cn('absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all duration-300', mobileOpen && 'opacity-0')} />
              <span className={cn('absolute left-0 h-0.5 w-5 bg-current transition-all duration-300', mobileOpen ? 'top-1.5 -rotate-45' : 'top-[10px]')} />
            </div>
          </button>
        </div>
      </div>

      {/* Mega menu panel */}
      <AnimatePresence>
        {mega && (
          <motion.div
            key={mega}
            className="absolute inset-x-0 top-full hidden overflow-hidden border-b border-[var(--border)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] lg:block"
            style={{ backgroundColor: 'var(--bg-1)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: dur.sm, ease: ease.out }}
            onMouseEnter={() => openMega(mega)}
            onMouseLeave={scheduleClose}
          >
            <div className="shell py-8">
              {mega === 'expertise' ? (
                <div className="grid grid-cols-5 gap-6">
                  {expertiseMega.map((col) => (
                    <div key={col.id}>
                      <div className="mb-3 flex items-center gap-2 text-accent-400">
                        <Icon name={col.icon} size={18} />
                        <h3 className="text-sm font-semibold text-text-0">{col.heading}</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {col.links.map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className="block rounded-md px-2 py-1 text-[13.5px] text-text-1 transition-colors hover:bg-white/5 hover:text-text-0"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {technologyMega.map((col) => (
                    <div key={col.id}>
                      <h3 className="mb-3 text-sm font-semibold text-accent-400">{col.heading}</h3>
                      <ul className="grid grid-cols-1 gap-1.5">
                        {col.links.map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className="block rounded-md px-2 py-1 text-[13.5px] text-text-1 transition-colors hover:bg-white/5 hover:text-text-0"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  return (
    <motion.div
      className="fixed inset-0 top-[var(--nav-h)] z-[890] overflow-y-auto bg-[var(--bg-0)] px-6 py-8 lg:hidden"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: dur.sm, ease: ease.out }}
    >
      <nav className="flex flex-col gap-1" aria-label="Mobile">
        <MobileAccordion title="Services" open={openSection === 'exp'} onToggle={() => setOpenSection((s) => (s === 'exp' ? null : 'exp'))}>
          {expertiseMega.map((col) => (
            <div key={col.id} className="mb-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-accent-400">{col.heading}</p>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} onClick={onClose} className="block py-1.5 text-text-1">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </MobileAccordion>
        <MobileAccordion title="Products" open={openSection === 'tech'} onToggle={() => setOpenSection((s) => (s === 'tech' ? null : 'tech'))}>
          {technologyMega.map((col) => (
            <div key={col.id} className="mb-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-accent-400">{col.heading}</p>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} onClick={onClose} className="block py-1.5 text-text-1">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </MobileAccordion>
        <Link href="/work" onClick={onClose} className="border-b border-[var(--border)] py-4 text-lg text-text-0">
          Insights
        </Link>
        <Link href="/resources" onClick={onClose} className="border-b border-[var(--border)] py-4 text-lg text-text-0">
          Resources
        </Link>
        <Link href="/about" onClick={onClose} className="border-b border-[var(--border)] py-4 text-lg text-text-0">
          About Us
        </Link>
        <div className="mt-6 flex items-center justify-between">
          <ThemeToggle />
          <Button href="/contact" onClick={onClose}>
            Get in touch
          </Button>
        </div>
        <a href={site.phoneHref} className="mt-6 font-mono text-sm text-text-2">
          {site.phoneDisplay}
        </a>
      </nav>
    </motion.div>
  );
}

function MobileAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)]">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-4 text-lg text-text-0" aria-expanded={open}>
        {title}
        <svg className={cn('transition-transform duration-300', open && 'rotate-45')} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: dur.sm, ease: ease.out }} className="overflow-hidden">
            <div className="pb-4 pl-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
