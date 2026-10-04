"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FlowNode } from "@/content/case-studies/types";

interface Edge {
  d: string;
  head: string;
  len: number;
}

/** Snake layout: rows alternate direction so every connection is a short straight run. */
const place = (i: number, cols: number) => {
  const row = Math.floor(i / cols);
  const col = row % 2 === 0 ? i % cols : cols - 1 - (i % cols);
  return { c: col + 1, r: row + 1 };
};

function Packet({ d, begin, len }: { d: string; begin: number; len: number }) {
  const dur = 1.6 + len / 90;
  return (
    <circle r="3" fill="var(--accent)">
      <animateMotion path={d} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" keyTimes="0;0.55;1" keyPoints="0;1;1" calcMode="linear" />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.08;0.5;0.55;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </circle>
  );
}

/**
 * Data-driven, responsive flow diagram. Nodes are real buttons laid out by CSS grid
 * (1 column on phones, 2 on tablets, 4 on desktop); the connecting lines are measured
 * from the rendered boxes, so one component gives each screen size its own layout.
 */
export function FlowDiagram({ nodes }: { nodes: FlowNode[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const focus = hover ?? selected;

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const boxes = Array.from(wrap.querySelectorAll<HTMLElement>("[data-node]")).map((el) => ({
      x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight,
    }));
    const next: Edge[] = [];
    for (let i = 0; i < boxes.length - 1; i++) {
      const a = boxes[i], b = boxes[i + 1];
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
      if (Math.abs(bx - ax) > Math.abs(by - ay)) {
        const s = bx > ax ? 1 : -1;
        const x1 = ax + (s * a.w) / 2, x2 = bx - (s * b.w) / 2;
        next.push({ d: `M${x1} ${ay} L${x2} ${ay}`, len: Math.abs(x2 - x1), head: `M${x2 - s * 7} ${ay - 5} L${x2} ${ay} L${x2 - s * 7} ${ay + 5}` });
      } else {
        const s = by > ay ? 1 : -1;
        const y1 = ay + (s * a.h) / 2, y2 = by - (s * b.h) / 2;
        next.push({ d: `M${ax} ${y1} L${ax} ${y2}`, len: Math.abs(y2 - y1), head: `M${ax - 5} ${y2 - s * 7} L${ax} ${y2} L${ax + 5} ${y2 - s * 7}` });
      }
    }
    setEdges(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Scroll-driven build-up: nodes and lines appear in order as the diagram scrolls through.
  const edgeCount = edges.length;
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !edgeCount) return;
    let cancelled = false;
    let teardown = () => {};
    void import("@/lib/gsap").then(({ registerGsap, NO_PREF }) => {
    if (cancelled) return;
    const { gsap } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add(NO_PREF, () => {
      const nodeEls = wrap.querySelectorAll("[data-node]");
      const lines = wrap.querySelectorAll("[data-edge-line]");
      const heads = wrap.querySelectorAll("[data-edge-head]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap, start: "top 85%", end: "bottom 72%", scrub: 0.5,
          onUpdate: (self) => wrap.classList.toggle("is-live", self.progress > 0.97),
        },
      });
      nodeEls.forEach((n, i) => {
        tl.to(n, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, i * 1.4);
        if (lines[i]) tl.to(lines[i], { strokeDashoffset: 0, duration: 1.1 }, i * 1.4 + 0.7);
        if (heads[i]) tl.to(heads[i], { opacity: 1, duration: 0.25 }, i * 1.4 + 1.75);
      });
    });
    teardown = () => mm.revert();
    });
    const io = new IntersectionObserver(([e]) =>
      e.isIntersecting ? svgRef.current?.unpauseAnimations?.() : svgRef.current?.pauseAnimations?.(),
    );
    if (svgRef.current) io.observe(svgRef.current);
    return () => {
      cancelled = true;
      teardown();
      io.disconnect();
    };
  }, [edgeCount]);

  const node = focus === null ? null : nodes[focus];
  const downstream = focus === null ? 0 : nodes.length - 1 - focus;

  return (
    <div>
      <div ref={wrapRef} className="flow" data-focus={focus !== null} onPointerLeave={() => setHover(null)}>
        <svg ref={svgRef} className="flow-svg" aria-hidden="true" focusable="false">
          {edges.map((e, i) => (
            <g key={i} className="flow-edge-g" data-down={focus !== null && i >= focus}>
              <path className="flow-edge" data-edge-line d={e.d} pathLength={1} />
              <path className="flow-head" data-edge-head d={e.head} />
            </g>
          ))}
          <g className="flow-packets">
            {edges.map((e, i) =>
              focus === null || i >= focus ? <Packet key={i} d={e.d} len={e.len} begin={(i % 4) * 0.8} /> : null,
            )}
          </g>
        </svg>

        {nodes.map((n, i) => {
          const m = place(i, 1), t = place(i, 2), d = place(i, 4);
          return (
            <button
              key={n.id}
              type="button"
              data-node
              className="flow-node"
              data-down={focus !== null && i >= focus}
              data-selected={focus === i}
              aria-pressed={selected === i}
              style={{ "--c1": m.c, "--r1": m.r, "--c2": t.c, "--r2": t.r, "--c4": d.c, "--r4": d.r } as React.CSSProperties}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              <span className="flow-node-body">
                <span className="flow-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="flow-title">{n.label}</span>
                {n.tool ? <span className="flow-tool">{n.tool}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-12 min-h-[9.5rem] border-t border-[var(--line)] pt-6" aria-live="polite">
        {node ? (
          <div className="grid gap-4 md:grid-cols-12 md:gap-10">
            <p className="label label-accent md:col-span-3">
              Stage {String((focus ?? 0) + 1).padStart(2, "0")} of {nodes.length}
            </p>
            <div className="md:col-span-6">
              <h3 className="h3">{node.label}</h3>
              <p className="mt-3 text-[var(--muted)]">{node.summary}</p>
            </div>
            <p className="label md:col-span-3 md:text-right">
              {downstream > 0 ? `Feeds ${downstream} later ${downstream === 1 ? "stage" : "stages"}` : "Final stage"}
            </p>
          </div>
        ) : (
          <p className="text-[var(--muted)]">Select any stage to see what it does and everything downstream of it.</p>
        )}
      </div>
    </div>
  );
}
