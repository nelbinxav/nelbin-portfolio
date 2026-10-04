"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Wires the declarative motion hooks used across the site:
 *   [data-reveal]   fade + rise when scrolled into view
 *   [data-mask]     words rise out of their mask
 *   [data-line]     a rule draws left to right
 *   [data-counter]  a number counts up (data-to, data-prefix, data-suffix)
 *   [data-parallax] drifts by N px across the scroll (glows)
 * Smooth scrolling (Lenis) is desktop pointer only; touch keeps native scrolling.
 * Under prefers-reduced-motion none of this runs and content is simply shown.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    let teardown = () => {};

    // GSAP is loaded as its own chunk after hydration, so it never competes with first paint.
    void import("@/lib/gsap").then(({ registerGsap, token, ease, NO_PREF }) => {
    if (cancelled) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();

    mm.add(NO_PREF, () => {
      const base = token("--dur-base", 0.8);
      const slow = token("--dur-slow", 1.2);

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: base, ease: ease.out, stagger: 0.09 }),
      });

      gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.fromTo(
              el.querySelectorAll(".mask-i"),
              { yPercent: 112, y: 0 },
              { yPercent: 0, y: 0, duration: slow, ease: ease.out, stagger: 0.045 },
            ),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(el, { scaleX: 1, duration: slow * 1.3, ease: ease.inOut }),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          y: parseFloat(el.dataset.parallax ?? "0"),
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const to = parseFloat(el.dataset.to ?? "0");
        const prefix = el.dataset.prefix ?? "";
        const suffix = el.dataset.suffix ?? "";
        const state = { v: 0 };
        const paint = () => (el.textContent = `${prefix}${Math.round(state.v)}${suffix}`);
        paint();
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(state, { v: to, duration: 1.9, ease: "power3.out", onUpdate: paint }),
        });
      });
    });

    // Smooth scroll: only for a fine pointer with motion allowed, driven by the same GSAP ticker
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      let stopped = false;
      let cleanup = () => {};
      void import("lenis").then(({ default: Lenis }) => {
        if (stopped) return;
        const lenis = new Lenis({ lerp: 0.1, anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        cleanup = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });
      return () => {
        stopped = true;
        cleanup();
      };
    });

    root.classList.add("ready");
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    teardown = () => mm.revert();
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, [pathname]);

  return null;
}
