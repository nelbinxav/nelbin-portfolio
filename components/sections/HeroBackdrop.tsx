"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const NodeField = dynamic(() => import("./NodeField"), { ssr: false });

/**
 * Gate for the one WebGL layer on the site. It mounts only after the page has loaded and gone idle,
 * on a wide screen, on a device that reports enough cores/memory, with motion allowed and data-saver off.
 * Anywhere else the hero is the clean CSS/SVG version (the glows stay).
 */
function canAfford3D() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (innerWidth < 900) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  if (nav.connection?.saveData) return false;
  return true;
}

export function HeroBackdrop() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!canAfford3D()) return;
    const start = () => ("requestIdleCallback" in window ? requestIdleCallback(() => setOn(true), { timeout: 2500 }) : setTimeout(() => setOn(true), 1200));
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
  }, []);

  return on ? <NodeField /> : null;
}
