"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient hero diagram: real tools on the left feed an automation layer,
 * which drives the systems on the right. Decorative, but every label is a tool
 * actually used. Motion: lines draw in, then small data packets travel along them.
 */
const left = [
  { y: 150, label: "Apollo", sub: "Lead sourcing" },
  { y: 280, label: "LinkedIn", sub: "Prospecting" },
  { y: 410, label: "Sheets / CSV", sub: "Lead data" },
];
const right = [
  { y: 150, label: "GoHighLevel", sub: "CRM + sequences" },
  { y: 280, label: "WebinarGeek", sub: "Webinars" },
  { y: 410, label: "Google Calendar", sub: "Scheduling" },
];
const NW = 164;
const NH = 54;
const HUB = { x: 300, y: 280, r: 50 };
const lPath = (y: number) => `M${8 + NW} ${y} C 215 ${y}, 205 ${HUB.y}, ${HUB.x - HUB.r} ${HUB.y}`;
const rPath = (y: number) => `M${HUB.x + HUB.r} ${HUB.y} C 395 ${HUB.y}, 385 ${y}, ${592 - NW} ${y}`;
const aiPath = `M${HUB.x} ${68 + NH / 2 + 10} L${HUB.x} ${HUB.y - HUB.r}`;

function Packet({ path, begin, dur = 3.2, color = "var(--violet)" }: { path: string; begin: number; dur?: number; color?: string }) {
  return (
    <circle r="3.2" fill={color}>
      <animateMotion path={path} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" keyTimes="0;0.5;1" keyPoints="0;1;1" calcMode="linear" />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.08;0.45;0.5;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </circle>
  );
}

export function HeroSystem() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    let cancelled = false;
    let teardown = () => {};

    // pause the packets when the diagram is off-screen
    const io = new IntersectionObserver(([e]) =>
      e.isIntersecting ? svg.unpauseAnimations?.() : svg.pauseAnimations?.(),
    );
    io.observe(svg);

    void import("@/lib/gsap").then(({ registerGsap, NO_PREF, ease }) => {
    if (cancelled) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(NO_PREF, () => {
      const q = (s: string) => svg.querySelectorAll(s);
      const tl = gsap.timeline({ paused: true, defaults: { ease: ease.out } });
      tl.to(q(".hs-cap"), { opacity: 1, duration: 0.8, stagger: 0.1 }, 0)
        .to(q(".hs-in"), { opacity: 1, duration: 0.9, stagger: 0.12 }, 0.1)
        .to(q(".hs-edge-in"), { strokeDashoffset: 0, duration: 1.1, stagger: 0.1, ease: "power2.inOut" }, 0.5)
        .to(q(".hs-core-wrap"), { opacity: 1, duration: 1 }, 0.7)
        .to(q(".hs-ai"), { opacity: 1, duration: 0.9 }, 0.9)
        .to(q(".hs-edge-out"), { strokeDashoffset: 0, duration: 1.1, stagger: 0.1, ease: "power2.inOut" }, 1.4)
        .to(q(".hs-out"), { opacity: 1, duration: 0.9, stagger: 0.12 }, 1.8)
        .add(() => svg.classList.add("hs-live"), 2.4);
      ScrollTrigger.create({ trigger: svg, start: "top 82%", once: true, onEnter: () => tl.play() });
    });

    teardown = () => mm.revert();
    });

    return () => {
      cancelled = true;
      teardown();
      io.disconnect();
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 500"
      role="img"
      aria-label="Diagram: lead sources such as Apollo and LinkedIn feed an automation layer connected to AI, which drives a CRM, webinar platform and calendar."
      className="block h-auto w-full"
    >
      <text className="hs-cap" x="8" y="60">INPUTS</text>
      <text className="hs-cap" x="592" y="60" textAnchor="end">SYSTEMS</text>

      {/* edges */}
      {left.map((n) => (
        <path key={n.label} className="hs-edge hs-edge-in" d={lPath(n.y)} pathLength={1} />
      ))}
      {right.map((n) => (
        <path key={n.label} className="hs-edge hs-edge-out" d={rPath(n.y)} pathLength={1} />
      ))}
      <path className="hs-edge hs-edge-in" d={aiPath} pathLength={1} />

      {/* core */}
      <g className="hs-core-wrap">
        <circle className="hs-ring" cx={HUB.x} cy={HUB.y} r={HUB.r + 26} />
        <circle className="hs-ring" cx={HUB.x} cy={HUB.y} r={HUB.r + 50} />
        <circle className="hs-core" cx={HUB.x} cy={HUB.y} r={HUB.r} />
        <text className="hs-label" x={HUB.x} y={HUB.y - 2} textAnchor="middle" style={{ fontSize: 14 }}>Automation</text>
        <text className="hs-label" x={HUB.x} y={HUB.y + 17} textAnchor="middle" style={{ fontSize: 14 }}>layer</text>
      </g>
      <text className="hs-sub hs-core-wrap" x={HUB.x} y={HUB.y + HUB.r + 22} textAnchor="middle">Make.com · n8n · APIs</text>

      {/* AI */}
      <g className="hs-node hs-ai">
        <rect x={HUB.x - 75} y={68 - NH / 2 + 10} width={150} height={NH} rx="3" />
        <text className="hs-label" x={HUB.x} y={68 + 1} textAnchor="middle">AI · LLMs</text>
        <text className="hs-sub" x={HUB.x} y={68 + 20} textAnchor="middle">Drafts + decisions</text>
      </g>

      {/* nodes */}
      {left.map((n) => (
        <g key={n.label} className="hs-node hs-in">
          <rect x="8" y={n.y - NH / 2} width={NW} height={NH} rx="3" />
          <text className="hs-label" x="16" y={n.y - 3}>{n.label}</text>
          <text className="hs-sub" x="16" y={n.y + 16}>{n.sub}</text>
        </g>
      ))}
      {right.map((n) => (
        <g key={n.label} className="hs-node hs-out">
          <rect x={592 - NW} y={n.y - NH / 2} width={NW} height={NH} rx="3" />
          <text className="hs-label" x={592 - NW + 14} y={n.y - 3}>{n.label}</text>
          <text className="hs-sub" x={592 - NW + 14} y={n.y + 16}>{n.sub}</text>
        </g>
      ))}

      {/* data packets: inputs arrive at the core, then leave toward the systems */}
      <g className="hs-packets" aria-hidden="true">
        {left.map((n, i) => <Packet key={`l${i}`} path={lPath(n.y)} begin={i * 0.45} />)}
        {right.map((n, i) => <Packet key={`r${i}`} path={rPath(n.y)} begin={1.6 + i * 0.45} color="var(--blue)" />)}
        <Packet path={aiPath} begin={0.9} dur={3.2} />
      </g>
    </svg>
  );
}
