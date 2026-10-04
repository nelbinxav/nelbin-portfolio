"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroUniverse = dynamic(() => import("./HeroUniverse"), { ssr: false });

/** Loads the universe after the page has painted and the browser is idle, so the hero text is never waiting on it. */
export function UniverseGate() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const go = () => setOn(true);
    const start = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 1800 }) : setTimeout(go, 600));
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
  }, []);
  return on ? <HeroUniverse /> : null;
}
