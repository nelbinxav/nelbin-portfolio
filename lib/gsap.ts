import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** The one animation engine. Everything scroll-driven goes through GSAP. */
let registered = false;
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/** Read a numeric motion token (seconds) from the CSS custom properties. */
export function token(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const ease = { out: "expo.out", soft: "power2.out", inOut: "power3.inOut" } as const;
export const REDUCED = "(prefers-reduced-motion: reduce)";
export const NO_PREF = "(prefers-reduced-motion: no-preference)";
