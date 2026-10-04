"use client";

import { useEffect, useRef } from "react";

/**
 * Card that tilts toward the pointer with a soft glare.
 * Only active for a fine pointer without reduced-motion; elsewhere it is a plain card.
 * Keep `data-reveal` on a wrapper, never on this element: both write to `transform`.
 */
export function TiltCard({
  children,
  className = "",
  max = 7,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  as?: "div" | "article";
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!ok.matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
    };
    const onEnter = () => el.classList.add("is-tilting");
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
    </Component>
  );
}
