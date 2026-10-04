"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { bookingHref } from "@/lib/links";
import { Arrow } from "@/components/ui/Arrow";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const items = site.nav.filter((n) => n.enabled);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="nav tone-ink" data-scrolled={scrolled} data-open={open}>
      <div className="wrap flex h-full items-center justify-between">
        <Link href="/" className="signature" onClick={() => setOpen(false)}>
          <span className="sr-only">{site.name}, home</span>
          <span aria-hidden="true">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {items.map((n) => (
            <Link key={n.label} href={n.href} className="nav-link">{n.label}</Link>
          ))}
          <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-quiet">
            Book a call <Arrow />
          </a>
        </nav>

        <button
          type="button"
          className="-mr-2 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l14 14M20 6L6 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M4 9h18M4 17h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div id="mobile-menu" className="tone-ink fixed inset-x-0 bottom-0 top-[var(--nav-h)] lg:hidden">
          <nav aria-label="Mobile" className="wrap flex h-full flex-col justify-between py-10">
            <ul>
              {items.map((n) => (
                <li key={n.label} className="border-t border-[var(--line)]">
                  <Link href={n.href} onClick={() => setOpen(false)} className="display block py-5 text-[2.4rem]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={bookingHref()} target="_blank" rel="noopener" onClick={() => setOpen(false)} className="btn btn-primary self-start">
              Book a call <Arrow />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
