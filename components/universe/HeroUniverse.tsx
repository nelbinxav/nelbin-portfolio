"use client";

import { useEffect, useRef } from "react";
import { universe, fragments, flows, buildAdjacency, type UniverseItem } from "@/content/universe";
import { formationRow, rng, hash, smooth, type Rect, type Keep } from "@/lib/universe-layout";

/**
 * The hero "Systems Universe": every tool, concept, process and system is a label travelling on an orbit round the
 * portrait, like planets round a sun. Labels fade out as they pass behind the text or the photo. The cursor is a faint
 * gravitational field; selecting something nearly stops the orbit and lights up the things it connects to
 * with thin lines and the occasional data pulse. Rarely, the items assemble into a real workflow.
 *
 * Rendering is hybrid: DOM elements (real text, focusable systems) moved with transforms, plus one canvas for
 * lines, pulses and background fragments. React renders the markup once; everything else is imperative and
 * runs in a single requestAnimationFrame loop that pauses off-screen. No layout reads happen per frame.
 */

interface Run {
  it: UniverseItem;
  el: HTMLElement;
  sys: boolean;
  w: number; h: number;
  slot: number;
  a: number;            // current opacity
  leaving: boolean;
  x: number; y: number; // current centre
  bx: number; by: number; // position on its orbit (before the cursor nudge)
  z: number;            // 0 = far side of its orbit, 1 = near side
  vis: number;          // 0..1: how clear of the text, the portrait and the edges it is right now
  cf: number; cfT: number; // smoothed / target "not underneath a nearer label" factor
  ox: number; oy: number; // smoothed cursor displacement
  fpos: { x: number; y: number } | null;
  fw: number;           // formation weight 0..1
  rep: number;          // how strongly the cursor nudges it
  on: boolean;
  near: boolean;
  pop?: HTMLElement;
  lab: HTMLElement;
  pw: number; ph: number;
  lastShown: number;
}
interface Link { a: string; b: string; p: number; want: boolean; age: number; delay: number; seq: number; formation: boolean; bend: number }
/** A place on an orbit. The item living in it travels round the portrait like a planet. */
interface Slot { ring: number; th0: number; x: number; y: number; z: number; vis: number; cat: UniverseItem["category"]; occ: string | null; kind: "sys" | "minor" }
interface Ring { rx: number; ry: number; om: number }

const CAT_ALPHA = { system: [0.78, 0.2], tool: [0.4, 0.5], concept: [0.26, 0.42], process: [0.3, 0.46], capability: [0.32, 0.46] } as const;
/** Orbit setup per screen size: rings around the portrait, systems, and the share of each kind among the smaller labels. */
const SETUP: Record<"d" | "t" | "m", { rings: number; sys: number; spacing: number; periods: number[]; gx0: number; gx: number; gy0: number; gy: number; frags: number }> = {
  d: { rings: 4, sys: 10, spacing: 150, periods: [80, 115, 160, 215], gx0: 70, gx: 170, gy0: 44, gy: 92, frags: 14 },
  t: { rings: 3, sys: 7, spacing: 150, periods: [85, 125, 175], gx0: 60, gx: 130, gy0: 40, gy: 70, frags: 8 },
  m: { rings: 2, sys: 4, spacing: 120, periods: [90, 135], gx0: 44, gx: 36, gy0: 36, gy: 60, frags: 0 },
};
const MIX: UniverseItem["category"][] = ["tool", "concept", "tool", "process", "capability", "tool", "process", "concept", "tool", "capability", "process", "tool"];

function PopBody({ it }: { it: UniverseItem }) {
  const h = it.hoverContent;
  if (!h) return null;
  return (
    <span className="u-pop" role={it.category === "system" ? undefined : "presentation"}>
      <span className="u-pop-title" aria-hidden="true">{it.label}</span>
      {it.description && it.category === "system" ? <span className="u-pop-desc">{it.description}</span> : null}
      {h.flow ? (
        <span className="u-pop-flow">
          {h.flow.map((f, i) => (
            <span key={f}>{i > 0 ? <i aria-hidden="true">→</i> : null}{f}{" "}</span>
          ))}
        </span>
      ) : null}
      {h.facts ? <span className="u-pop-facts">{h.facts.map((f) => <span key={f}>{f}</span>)}</span> : null}
      {h.tags ? <span className="u-pop-tags">{h.tags.map((t) => <span key={t}>{t}</span>)}</span> : null}
    </span>
  );
}

export default function HeroUniverse() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current!;
    const canvas = canvasRef.current!;
    const hero = layer.parentElement as HTMLElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const adj = buildAdjacency(universe);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const rand = rng(Math.floor(Math.random() * 1e9));

    // ---- runtime items -------------------------------------------------------------------------
    const runs = new Map<string, Run>();
    layer.querySelectorAll<HTMLElement>("[data-uid]").forEach((el) => {
      const it = universe.find((u) => u.id === el.dataset.uid);
      if (!it) return;
      const pop = el.querySelector<HTMLElement>(".u-pop") ?? undefined;
      const lab = el.querySelector<HTMLElement>(".u-label")!;
      runs.set(it.id, {
        it, el, lab, sys: it.category === "system", w: 80, h: 24, slot: -1, a: 0, leaving: false, x: 0, y: 0, bx: 0, by: 0, z: 0.5, vis: 1, cf: 1, cfT: 1,
        ox: 0, oy: 0, fpos: null, fw: 0,
        rep: 0.6 + hash(it.id + "g") * 0.4, on: false, near: false, pop, pw: 220, ph: 120, lastShown: -99,
      });
    });
    const list = [...runs.values()];

    // ---- state ---------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1, mode: "d" | "t" | "m" = "d";
    let heroRect = hero.getBoundingClientRect();
    let rectDirty = false;
    let keeps: Keep[] = [];          // the hero text and the portrait: labels fade out as they pass behind these
    let bnd: Rect = { l: 14, t: 84, r: 0, b: 0 };
    let center = { x: 0, y: 0 };     // the "sun": the portrait
    let rings: Ring[] = [];
    let slots: Slot[] = [];
    let orbitT = 0, orbitSpeed = 1;  // orbit clock; slows right down while something is selected
    let placed = true;
    const sizeOf: Record<string, { w: number; h: number }> = {};
    const frags: { t: string; x: number; y: number; vx: number; vy: number; a: number }[] = [];
    const links = new Map<string, Link>();
    let active: string | null = null;
    let focusId: string | null = null;
    let formation: { ids: string[]; until: number; started: number } | null = null;
    let flowCursor = Math.floor(rand() * flows.length);
    let fragFade = 1;
    let nextFormation = 0, nextRotate = 0, lastHot = 0;
    const P = { tx: -999, ty: -999, x: -999, y: -999, inside: false, touch: false, hideAt: 0 };
    const cur = { x: -999, y: -999, rx: -999, ry: -999, k: 0 };
    let visible = true, raf = 0, last = 0, t0 = 0, ready = false, layoutTimer = 0;

    const inKeep = (x: number, y: number, pad: number) => keeps.some((k) => x > k.rect.l - pad && x < k.rect.r + pad && y > k.rect.t - pad && y < k.rect.b + pad);

    /** 1 = clear, 0 = fully behind the text / portrait / edge. Fades start before the label actually touches. */
    function clearance(x: number, y: number, w: number, h: number) {
      let f = 1;
      const m = 22;
      for (const { rect: k } of keeps) {
        const ox = Math.min(x + w / 2, k.r + m) - Math.max(x - w / 2, k.l - m);
        const oy = Math.min(y + h / 2, k.b + m) - Math.max(y - h / 2, k.t - m);
        if (ox > 0 && oy > 0) f = Math.min(f, 1 - smooth((ox * oy) / (w * h), 0, 0.3));
      }
      const xl = x - w / 2, xr = W - (x + w / 2), yt = y - h / 2 - 72, yb = H - (y + h / 2) - 6;
      return f * smooth(Math.min(xl, xr), 0, 30) * smooth(yt, -4, 16) * smooth(yb, -4, 14);
    }

    // ---- layout (only on mount, resize and font load) -------------------------------------------
    function layout() {
      W = layer.clientWidth; H = layer.clientHeight;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      heroRect = hero.getBoundingClientRect();
      mode = W >= 1024 ? "d" : W >= 640 ? "t" : "m";
      const cfg = SETUP[mode];

      keeps = [...hero.querySelectorAll<HTMLElement>("[data-keepout]")]
        .filter((e) => e.offsetWidth > 0)
        .map((e) => {
          const c = e.getBoundingClientRect();
          return { rect: { l: c.left - heroRect.left, t: c.top - heroRect.top, r: c.right - heroRect.left, b: c.bottom - heroRect.top }, vertical: false };
        });
      bnd = { l: 14, r: W - 14, t: 84, b: H - (mode === "m" ? 76 : 104) };

      // the sun: the portrait. Rings are ellipses around it, spaced so the innermost clears the photo.
      const orb = hero.querySelector<HTMLElement>("[data-orbit]")?.getBoundingClientRect();
      const hw = orb ? orb.width / 2 : 140, hh = orb ? orb.height / 2 : 170;
      center = orb ? { x: orb.left - heroRect.left + hw, y: orb.top - heroRect.top + hh } : { x: W * 0.78, y: H / 2 };
      rings = Array.from({ length: cfg.rings }, (_, i) => ({ rx: hw + cfg.gx0 + i * cfg.gx, ry: hh + cfg.gy0 + i * cfg.gy, om: (Math.PI * 2) / cfg.periods[i] }));

      // measure everything; show only as many systems as this screen gets
      let sysIdx = 0;
      for (const r of list) {
        if (r.sys) r.el.hidden = false;
        r.w = r.el.offsetWidth || r.w; r.h = r.el.offsetHeight || r.h;
        if (r.sys) r.el.hidden = sysIdx++ >= cfg.sys;
        if (r.pop) { r.pw = r.pop.offsetWidth || r.pw; r.ph = r.pop.offsetHeight || r.ph; }
        r.slot = -1; r.leaving = false; r.fpos = null; r.fw = 0; r.ox = 0; r.oy = 0; r.cf = 1; r.cfT = 1;
      }
      for (const cat of ["tool", "concept", "process", "capability"]) {
        const g = list.filter((r) => r.it.category === cat);
        sizeOf[cat] = { w: g.reduce((s, r) => s + r.w, 0) / g.length, h: g.reduce((s, r) => s + r.h, 0) / g.length };
      }

      // slots: evenly spaced round each ring, so neighbours on a ring never meet
      slots = [];
      const circ = (r: Ring) => Math.PI * (3 * (r.rx + r.ry) - Math.sqrt((3 * r.rx + r.ry) * (r.rx + 3 * r.ry)));
      const sysRings = cfg.rings >= 3 ? [1, 2] : [0, 1];
      const sysRuns = list.filter((r) => r.sys && !r.el.hidden);
      let sysLeft = sysRuns.length, mix = Math.floor(rand() * MIX.length);
      rings.forEach((ring, ri) => {
        const isSysRing = sysRings.includes(ri);
        const n = Math.max(3, Math.floor(circ(ring) / (isSysRing ? cfg.spacing * 1.05 : cfg.spacing)));
        const share = isSysRing ? Math.ceil(sysLeft / (sysRings.length - sysRings.indexOf(ri))) : 0;
        const sysAt = new Set(Array.from({ length: Math.min(share, Math.floor(n / 2)) }, (_, i) => Math.floor((i * n) / share)));
        const off = rand() * Math.PI * 2;
        for (let j = 0; j < n; j++) {
          const isSys = sysAt.has(j);
          const cat: UniverseItem["category"] = isSys ? "system" : MIX[mix++ % MIX.length];
          slots.push({ ring: ri, th0: off + (j / n) * Math.PI * 2, x: 0, y: 0, z: 0.5, vis: 1, cat, occ: null, kind: isSys ? "sys" : "minor" });
        }
        sysLeft -= sysAt.size;
      });

      // fill the slots: systems first, then a weighted pick per category
      const sysSlots = slots.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "sys");
      sysRuns.forEach((r, i) => { const t = sysSlots[i]; if (t) { t.s.occ = r.it.id; r.slot = t.i; } });
      slots.forEach((s, i) => {
        if (s.kind !== "minor") return;
        const pick = weightedPick(list.filter((r) => r.it.category === s.cat));
        if (pick) { pick.slot = i; s.occ = pick.it.id; }
      });
      geometry(0, null);
      for (const r of list) { if (r.slot >= 0) { r.x = r.bx; r.y = r.by; } r.a = reduced ? baseAlpha(r) * r.vis : 0; }

      frags.length = 0;
      for (let i = 0; i < cfg.frags; i++) {
        let x = 0, y = 0, k = 0;
        do { x = rand() * W; y = 70 + rand() * (H - 90); k++; } while (k < 16 && inKeep(x, y, 24));
        frags.push({ t: fragments[i % fragments.length], x, y, vx: (rand() - 0.5) * 3, vy: (rand() - 0.5) * 2, a: 0.1 + rand() * 0.1 });
      }
      links.clear(); setActive(null);
      if (reduced) renderStatic();
    }

    /** Positions of every slot and occupant at orbit time `ot`, their clearance, and who sits under whom. */
    function geometry(ot: number, dt: number | null) {
      for (const s of slots) {
        const ring = rings[s.ring];
        const th = s.th0 + ring.om * ot;
        s.x = center.x + ring.rx * Math.cos(th);
        s.y = center.y + ring.ry * Math.sin(th);
        s.z = (Math.sin(th) + 1) / 2;
        const sz = s.kind === "sys" ? { w: 190, h: 42 } : sizeOf[s.cat] ?? { w: 90, h: 24 };
        s.vis = clearance(s.x, s.y, sz.w, sz.h);
      }
      const showing: Run[] = [];
      for (const r of list) {
        r.cfT = 1;
        if (r.el.hidden) continue;
        if (r.slot >= 0) {
          const s = slots[r.slot];
          r.bx = s.x; r.by = s.y; r.z = s.z;
        }
        if (r.slot >= 0 || r.fw > 0.02) {
          r.vis = r.fpos && r.fw > 0.5 ? 1 : clearance(r.bx + r.ox, r.by + r.oy, r.w, r.h);
          showing.push(r);
        }
      }
      // labels never print on top of each other: the one further away gives way
      for (let i = 0; i < showing.length; i++) {
        const A = showing[i];
        if (A.a < 0.04 && A.vis < 0.2) continue;
        for (let j = i + 1; j < showing.length; j++) {
          const B = showing[j];
          if (B.a < 0.04 && B.vis < 0.2) continue;
          const ox = Math.min(A.bx + A.w / 2, B.bx + B.w / 2) - Math.max(A.bx - A.w / 2, B.bx - B.w / 2) + 6;
          const oy = Math.min(A.by + A.h / 2, B.by + B.h / 2) - Math.max(A.by - A.h / 2, B.by - B.h / 2) + 4;
          if (ox <= 0 || oy <= 0) continue;
          const ratio = (ox * oy) / (Math.min(A.w * A.h, B.w * B.h));
          const f = 1 - smooth(ratio, 0, 0.16);
          const rankA = (A.sys ? 2 : 0) + A.z + A.it.depth, rankB = (B.sys ? 2 : 0) + B.z + B.it.depth;
          if (rankA >= rankB) B.cfT = Math.min(B.cfT, f); else A.cfT = Math.min(A.cfT, f);
        }
      }
      if (dt === null) for (const r of list) r.cf = r.cfT;
    }

    function weightedPick(pool: Run[]): Run | null {
      const cand = pool.filter((r) => !r.leaving && r.slot < 0 && !r.fpos && !r.el.hidden);
      if (!cand.length) return null;
      const w = cand.map((r) => r.it.importance * (0.6 + r.it.depth) / (1 + Math.max(0, 6 - (performance.now() / 1000 - r.lastShown)) * 0.4));
      let x = rand() * w.reduce((a, b) => a + b, 0);
      for (let i = 0; i < cand.length; i++) { x -= w[i]; if (x <= 0) return cand[i]; }
      return cand[cand.length - 1];
    }

    function baseAlpha(r: Run) {
      const [lo, k] = CAT_ALPHA[r.it.category];
      return lo + k * r.it.depth * (r.sys ? 0.5 : 1);
    }

    // ---- activation and relationships ------------------------------------------------------------
    function related(id: string) { return adj.get(id) ?? []; }
    const s0 = (i: number) => (slots[i].occ ? runs.get(slots[i].occ!) : undefined);

    /** Brings every item related to `anchor` onto a clear, visible slot near it (called once the orbit has settled). */
    function gather(anchor: Run) {
      const rel = related(anchor.it.id).map((id) => runs.get(id)).filter((r): r is Run => !!r && !r.el.hidden && !r.sys);
      const locked = new Set<string>([anchor.it.id, ...related(anchor.it.id)]);
      for (const r of rel) {
        if (r.slot >= 0 && slots[r.slot].vis > 0.6) { r.leaving = false; continue; }
        let best = -1, bd = Infinity;
        for (const pass of [true, false]) {
          slots.forEach((s, i) => {
            if (s.kind !== "minor" || s.vis < 0.7 || (pass && s.cat !== r.it.category)) return;
            if (s.occ && locked.has(s.occ)) return;
            if (formation && s.occ && formation.ids.includes(s.occ)) return;
            const d = Math.hypot(s.x - anchor.x, s.y - anchor.y);
            if (d < bd) { bd = d; best = i; }
          });
          if (best >= 0) break;
        }
        if (best < 0) continue;
        if (r.slot >= 0) { slots[r.slot].occ = null; }
        const old = s0(best);
        if (old) { old.slot = -1; old.leaving = true; old.a = Math.min(old.a, 0.2); }
        slots[best].occ = r.it.id; r.slot = best; r.leaving = false; r.a = 0; r.cf = 1;
        r.bx = r.x = slots[best].x; r.by = r.y = slots[best].y; r.lastShown = performance.now() / 1000;
      }
      geometry(orbitT, 0);
    }

    function setActive(id: string | null) {
      if (id === active) return;
      if (active) {
        const p = runs.get(active); p?.el.classList.remove("is-active");
        for (const rid of related(active)) runs.get(rid)?.el.classList.remove("is-related");
      }
      active = id;
      placed = false;
      layer.classList.toggle("has-active", !!id);
      if (id) {
        const a = runs.get(id)!;
        a.el.classList.add("is-active");
        for (const rid of related(id)) runs.get(rid)?.el.classList.add("is-related");
        if (formation) endFormation();
        if (reduced) { gather(a); placePop(a); placed = true; }
      }
      if (reduced) renderStatic();
    }

    /** Opens the detail panel on the side that never covers the central text. */
    function placePop(r: Run) {
      if (!r.pop) return;
      const rx = r.fpos ? r.fpos.x : r.bx, ry = r.fpos ? r.fpos.y : r.by; // where it will settle
      const pw = r.pw, ph = r.ph, g = 12;
      const overlap = (l: number, t: number) => {
        let area = 0;
        for (const { rect: k } of keeps) {
          const ox = Math.min(l + pw, k.r + 6) - Math.max(l, k.l - 6), oy = Math.min(t + ph, k.b + 6) - Math.max(t, k.t - 6);
          if (ox > 0 && oy > 0) area += ox * oy;
        }
        if (l < 6) area += (6 - l) * ph * 4;
        if (l + pw > W - 6) area += (l + pw - W + 6) * ph * 4;
        if (t < 76) area += (76 - t) * pw * 4;
        if (t + ph > H - 6) area += (t + ph - H + 6) * pw * 4;
        return area;
      };
      const cl = (l: number) => Math.min(W - pw - 10, Math.max(10, l));
      const aligns = [rx - pw / 2, rx - r.w / 2, rx + r.w / 2 - pw, W - pw - 10, 10].map(cl);
      const cands: { dir: string; l: number; t: number }[] = [];
      for (const l of aligns) {
        cands.push({ dir: "below", l, t: ry + r.h / 2 + g });
        cands.push({ dir: "above", l, t: ry - r.h / 2 - g - ph });
      }
      const vt = Math.min(H - ph - 6, Math.max(76, ry - ph / 2));
      cands.push({ dir: "right", l: rx + r.w / 2 + g, t: vt }, { dir: "left", l: rx - r.w / 2 - g - pw, t: vt });
      let best = cands[0], bs = Infinity;
      for (const c of cands) {
        const sc = overlap(c.l, c.t) + (c.dir === (ry < H / 2 ? "above" : "below") ? 40 : 0); // mild preference for opening toward the middle
        if (sc < bs) { bs = sc; best = c; }
      }
      r.pop.dataset.dir = best.dir;
      r.pop.style.setProperty("--pop-x", `${Math.round(best.l - (rx - r.w / 2))}px`);
      r.pop.style.setProperty("--pop-y", `${Math.round(vt - ry)}px`);
    }

    // ---- formations ------------------------------------------------------------------------------
    function startFormation(now: number) {
      for (let k = 0; k < flows.length; k++) {
        const f = flows[(flowCursor + k) % flows.length];
        const rs = f.ids.map((id) => runs.get(id)).filter((r): r is Run => !!r && !r.el.hidden);
        if (rs.length < 3) continue;
        const rowY = H - (mode === "m" ? 44 : 56);
        if (keeps.some((kk) => kk.rect.b + 24 > rowY - 14 && kk.rect.t < rowY + 14)) continue;
        const row = formationRow(rs.map((r) => r.w), bnd.l, bnd.r, rowY, mode === "m" ? 0 : 7);
        if (!row) continue;
        flowCursor = (flowCursor + k + 1) % flows.length;
        rs.forEach((r, i) => {
          r.fpos = row[i];
          r.leaving = false;
          if (r.slot < 0 && r.a < 0.03) { r.x = r.bx = row[i].x; r.y = r.by = row[i].y; }
        });
        formation = { ids: rs.map((r) => r.it.id), started: now, until: now + 9 };
        links.clear();
        rs.slice(1).forEach((r, i) => { links.set(`f${i}`, { a: rs[i].it.id, b: r.it.id, p: 0, want: true, age: 0, delay: i * 0.35 + 0.8, seq: i, formation: true, bend: 0.08 }); });
        return;
      }
    }
    function endFormation() { formation = null; for (const l of links.values()) if (l.formation) l.want = false; }

    // ---- per-frame --------------------------------------------------------------------------------
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = now / 1000;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      if (rectDirty) { heroRect = hero.getBoundingClientRect(); rectDirty = false; }
      if (P.touch && P.hideAt && now > P.hideAt) { P.inside = false; P.hideAt = 0; }

      // cursor field
      const fk = 1 - Math.exp(-dt * 16);
      if (P.inside) {
        if (P.x < -900) { P.x = P.tx; P.y = P.ty; }
        P.x += (P.tx - P.x) * fk; P.y += (P.ty - P.y) * fk;
      }
      cur.k += ((P.inside ? 1 : 0) - cur.k) * (1 - Math.exp(-dt * 5));
      const fieldOn = cur.k > 0.02;

      // who is the cursor on? (distance to the label box, with hysteresis)
      let hot: string | null = focusId;
      if (!hot && P.inside) {
        let bd = P.touch ? 54 : 34;
        for (const r of list) {
          if (r.a < 0.3 || r.el.hidden) continue;
          const dx = Math.max(Math.abs(P.x - r.x) - r.w / 2, 0), dy = Math.max(Math.abs(P.y - r.y) - r.h / 2, 0);
          const d = Math.hypot(dx, dy) - (r.sys ? 8 : 0) - (r.it.id === active ? 22 : 0);
          if (d < bd) { bd = d; hot = r.it.id; }
        }
      }
      if (hot) lastHot = t;
      setActive(hot);
      const hasActive = !!active;

      // the planets keep turning, but slow almost to a stop while something is selected
      orbitSpeed += ((hasActive ? 0 : formation ? 0.3 : 1) - orbitSpeed) * (1 - Math.exp(-dt * 3));
      orbitT += dt * orbitSpeed;
      geometry(orbitT, dt);
      if (hasActive && !placed && orbitSpeed < 0.05) {
        placed = true;
        const A = runs.get(active!)!;
        gather(A);
        placePop(A);
      }

      // calm, occasional behaviour: swap labels while they are out of sight, assemble a system
      if (!reduced && ready) {
        if (!hasActive && !formation && t > nextRotate) {
          nextRotate = t + 1.6 + rand() * 1.6;
          const cands = slots.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "minor" && s.occ && !runs.get(s.occ)!.leaving);
          const hidden = cands.filter(({ s }) => s.vis < 0.25);
          const pool = hidden.length && rand() < 0.8 ? hidden : cands;
          if (pool.length) runs.get(pool[Math.floor(rand() * pool.length)].s.occ!)!.leaving = true;
        }
        if (!formation && !hasActive && t > nextFormation && t - lastHot > 2.5) {
          startFormation(t);
          nextFormation = t + 30 + rand() * 18;
        } else if (formation && t > formation.until) {
          endFormation();
        }
      }

      for (const r of list) {
        if (r.el.hidden) continue;
        const isActive = r.it.id === active;
        const isRel = hasActive && !isActive && related(active!).includes(r.it.id);
        const inForm = !!r.fpos;
        if (r.fpos && !formation) { r.fw += (0 - r.fw) * (1 - Math.exp(-dt * 1.3)); if (r.fw < 0.02) { r.fw = 0; r.fpos = null; } }
        else if (r.fpos) r.fw += (1 - r.fw) * (1 - Math.exp(-dt * 1.4));
        const showing = r.slot >= 0 || r.fw > 0.02;

        // finish a fade-out and bring in a replacement of the same category
        if (r.leaving && r.a < 0.02) {
          r.leaving = false;
          if (r.slot >= 0) {
            const s = slots[r.slot]; const si = r.slot; r.slot = -1;
            const next = weightedPick(list.filter((q) => q.it.category === s.cat));
            if (next) { next.slot = si; s.occ = next.it.id; next.bx = next.x = s.x; next.by = next.y = s.y; next.lastShown = t; next.a = 0; next.cf = 1; }
            else s.occ = null;
          }
        }

        if (!showing && r.a < 0.012) { r.a = 0; if (r.on) { r.on = false; r.el.classList.remove("is-on"); r.el.style.opacity = "0"; } continue; }

        // position on the orbit, bent toward the formation row while one is assembling
        let bx = r.bx, by = r.by;
        if (r.fpos) { bx += (r.fpos.x - bx) * smooth(r.fw, 0, 1); by += (r.fpos.y - by) * smooth(r.fw, 0, 1); }

        // the cursor as a faint gravitational field: a small nudge, with inertia
        let tx = 0, ty = 0, prox = 0;
        if (fieldOn && !inForm && !isActive) {
          const dx = r.x - P.x, dy = r.y - P.y, d = Math.hypot(dx, dy) || 1;
          const R = 320;
          if (d < R) {
            const f = (1 - d / R) ** 2;
            tx = (dx / d) * f * 14 * (0.35 + r.it.depth) * r.rep * cur.k; ty = (dy / d) * f * 14 * (0.35 + r.it.depth) * r.rep * cur.k;
          }
          prox = smooth(1 - d / 230, 0, 1) * cur.k;
        }
        const ik = 1 - Math.exp(-dt * 3.1);
        r.ox += (tx - r.ox) * ik; r.oy += (ty - r.oy) * ik;
        const x = bx + r.ox, y = by + r.oy;
        r.x = x; r.y = y;
        r.cf += (r.cfT - r.cf) * (1 - Math.exp(-dt * 6));

        // opacity, scale, sharpness: the far side of an orbit is smaller and dimmer, and anything
        // passing behind the text or the portrait, or under a nearer label, fades out
        const depthLook = 0.62 + 0.38 * r.z;
        let tgt = (baseAlpha(r) + prox * 0.45) * depthLook * r.vis * r.cf;
        if (r.leaving) tgt = 0;
        else if (isActive) tgt = 1;
        else if (isRel) tgt = 0.92 * r.vis;
        else if (hasActive) tgt = 0;
        if (formation && !inForm) tgt *= 0.12;
        if (formation && inForm) tgt = 1;
        const up = tgt > r.a;
        r.a += (tgt - r.a) * (1 - Math.exp(-dt * (up ? (isActive || isRel ? 4.5 : 1.2) : hasActive && !isActive && !isRel ? 7 : 1.6)));
        const s = (0.8 + 0.3 * r.it.depth) * (0.9 + 0.2 * r.z) * (1 + prox * 0.1 + (isActive ? 0.1 : isRel ? 0.04 : 0));
        const wantNear = isActive || isRel || prox > 0.45 || r.it.depth > 0.6 || r.z > 0.75 || (inForm && r.fw > 0.5);
        if (wantNear !== r.near) { r.near = wantNear; r.el.classList.toggle("is-near", wantNear); }
        const on = r.a > 0.012;
        if (on !== r.on) { r.on = on; r.el.classList.toggle("is-on", on); }
        if (!on) r.a = Math.min(r.a, 0.011);
        r.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
        r.lab.style.transform = `scale(${s.toFixed(3)})`;
        r.el.style.opacity = r.a.toFixed(3);
      }

      drawCanvas(t, dt);
      moveCursor(dt, !!hot);
    }

    function drawCanvas(t: number, dt: number) {
      ctx!.clearRect(0, 0, W, H);

      fragFade += ((active ? 0 : 1) - fragFade) * Math.min(1, dt * 6);
      // far-background technical fragments
      if (frags.length && fragFade > 0.02) {
        ctx!.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        for (const f of frags) {
          f.x += f.vx * dt; f.y += f.vy * dt;
          if (f.x < -90) f.x = W + 40; else if (f.x > W + 90) f.x = -40;
          if (f.y < 74) f.y = H - 20; else if (f.y > H - 8) f.y = 76;
          if (inKeep(f.x, f.y, 20)) continue;
          ctx!.fillStyle = `rgba(190,188,255,${f.a * fragFade * (formation ? 0.4 : 1)})`;
          ctx!.fillText(f.t, f.x, f.y);
        }
      }

      // desired links: the active item to the related items that are actually on show
      for (const l of links.values()) if (!l.formation) l.want = false;
      if (active) {
        const A = runs.get(active)!;
        const nearest = related(active)
          .map((rid) => runs.get(rid))
          .filter((r): r is Run => !!r && !r.el.hidden && (r.slot >= 0 || !!r.fpos) && r.vis > 0.5 && r.a > 0.25)
          .sort((p, q) => Math.hypot(p.x - A.x, p.y - A.y) - Math.hypot(q.x - A.x, q.y - A.y))
          .slice(0, 9)
          .map((r) => r.it.id);
        nearest.forEach((rid, i) => {
          const key = `${active}>${rid}`;
          let l = links.get(key);
          if (!l) { l = { a: active!, b: rid, p: 0, want: true, age: 0, delay: i * 0.06, seq: i, formation: false, bend: (hash(key) - 0.5) * 0.18 }; links.set(key, l); }
          l.want = true;
        });
      }
      // lines never run through the text or the portrait
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(0, 0, W, H);
      for (const { rect: k } of keeps) ctx!.rect(k.l - 12, k.t - 8, k.r - k.l + 24, k.b - k.t + 16);
      ctx!.clip("evenodd");
      for (const [key, l] of links) {
        const A = runs.get(l.a), B = runs.get(l.b);
        if (!A || !B) { links.delete(key); continue; }
        if (l.want) { l.age += dt; const tp = Math.min(1, Math.max(0, (l.age - l.delay) * 2.4)); if (tp > l.p) l.p = tp; }
        else { l.age = 0; l.p -= dt * (l.formation ? 2.4 : 0.85); if (l.p <= 0) { links.delete(key); continue; } }
        if (l.p < 0.01) continue;
        const ax = A.x, ay = A.y, bx = B.x, by = B.y;
        const mx = (ax + bx) / 2, my = (ay + by) / 2, len = Math.hypot(bx - ax, by - ay) || 1;
        const cx = mx - ((by - ay) / len) * len * l.bend, cy = my + ((bx - ax) / len) * len * l.bend;
        const at = (u: number) => { const i = 1 - u; return [i * i * ax + 2 * i * u * cx + u * u * bx, i * i * ay + 2 * i * u * cy + u * u * by]; };
        const fade = Math.min(1, l.p * 1.6) * (l.formation ? 0.8 : 0.62) * Math.min(1, Math.min(A.a, B.a) * 2 + 0.2);
        ctx!.beginPath();
        const N = 20;
        for (let i = 0; i <= N; i++) { const u = (i / N) * l.p; const [px, py] = at(u); if (i === 0) ctx!.moveTo(px, py); else ctx!.lineTo(px, py); }
        ctx!.strokeStyle = `rgba(138,133,255,${fade})`; ctx!.lineWidth = 1; ctx!.stroke();
        // an occasional pulse of data along a finished link
        if (!reduced && l.p > 0.98 && l.want) {
          const cyc = 3.8;
          const ph = ((t - (l.formation ? l.seq * 0.9 : hash(`${l.a}${l.b}`) * cyc)) % cyc + cyc) % cyc / 1.2;
          if (ph < 1) {
            const [px, py] = at(ph);
            ctx!.beginPath(); ctx!.arc(px, py, 4.5, 0, 6.283); ctx!.fillStyle = "rgba(125,188,255,0.16)"; ctx!.fill();
            ctx!.beginPath(); ctx!.arc(px, py, 1.9, 0, 6.283); ctx!.fillStyle = "rgba(190,224,255,0.95)"; ctx!.fill();
          }
        }
      }
      ctx!.restore();
    }

    function moveCursor(dt: number, hot: boolean) {
      const dot = dotRef.current, ring = ringRef.current;
      if (!dot || !ring || coarse) return;
      cur.x += (P.x - cur.x) * (1 - Math.exp(-dt * 30)); cur.y += (P.y - cur.y) * (1 - Math.exp(-dt * 30));
      cur.rx += (P.x - cur.rx) * (1 - Math.exp(-dt * 9)); cur.ry += (P.y - cur.ry) * (1 - Math.exp(-dt * 9));
      dot.style.transform = `translate3d(${cur.x.toFixed(1)}px,${cur.y.toFixed(1)}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${cur.rx.toFixed(1)}px,${cur.ry.toFixed(1)}px,0) translate(-50%,-50%) scale(${hot ? 1.9 : 1})`;
      dot.style.opacity = ring.style.opacity = cur.k.toFixed(2);
    }

    /** Reduced motion: no orbiting. One still frame, redrawn only when focus or hover changes. */
    function renderStatic() {
      geometry(0, null);
      for (const r of list) {
        if (r.el.hidden) continue;
        const isActive = r.it.id === active, isRel = !!active && related(active).includes(r.it.id);
        const showing = r.slot >= 0;
        if (showing) { r.x = r.bx; r.y = r.by; }
        let a = showing ? baseAlpha(r) * (0.62 + 0.38 * r.z) * r.vis * r.cf : 0;
        if (isActive) a = 1; else if (isRel) a = 0.92 * r.vis; else if (active) a = 0;
        r.a = a;
        r.on = a > 0.012; r.el.classList.toggle("is-on", r.on);
        r.el.classList.toggle("is-near", isActive || isRel || r.it.depth > 0.6);
        const sc = (0.8 + 0.3 * r.it.depth) * (0.9 + 0.2 * r.z) * (isActive ? 1.1 : 1);
        r.el.style.transform = `translate3d(${r.x}px,${r.y}px,0) translate(-50%,-50%)`;
        r.lab.style.transform = `scale(${sc})`;
        r.el.style.opacity = a.toFixed(3);
      }
      ctx!.clearRect(0, 0, W, H);
      if (!active) return;
      const A = runs.get(active)!;
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(0, 0, W, H);
      for (const { rect: k } of keeps) ctx!.rect(k.l - 12, k.t - 8, k.r - k.l + 24, k.b - k.t + 16);
      ctx!.clip("evenodd");
      ctx!.strokeStyle = "rgba(138,133,255,0.55)"; ctx!.lineWidth = 1;
      for (const rid of related(active)) {
        const B = runs.get(rid);
        if (!B || B.el.hidden || B.slot < 0 || B.vis < 0.5) continue;
        ctx!.beginPath(); ctx!.moveTo(A.x, A.y); ctx!.lineTo(B.x, B.y); ctx!.stroke();
      }
      ctx!.restore();
    }

    // ---- events -----------------------------------------------------------------------------------
    const toLocal = (e: PointerEvent) => { P.tx = e.clientX - heroRect.left; P.ty = e.clientY - heroRect.top; };
    const onMove = (e: PointerEvent) => { if (reduced) return; P.touch = e.pointerType === "touch"; P.inside = true; P.hideAt = 0; toLocal(e); };
    const onDown = (e: PointerEvent) => { if (reduced) return; P.touch = e.pointerType === "touch"; P.inside = true; toLocal(e); if (P.touch) { P.x = P.tx; P.y = P.ty; } };
    const onUp = (e: PointerEvent) => { if (e.pointerType === "touch") P.hideAt = performance.now() + 2200; };
    const onLeave = (e: PointerEvent) => { if (e.pointerType !== "touch") P.inside = false; };
    const onScroll = () => { rectDirty = true; };
    const onFocusIn = (e: FocusEvent) => { const id = (e.target as HTMLElement).closest<HTMLElement>("[data-uid]")?.dataset.uid; if (id) { focusId = id; if (reduced) setActive(id); } };
    const onFocusOut = () => { focusId = null; if (reduced) setActive(null); };
    const onEnter = (e: PointerEvent) => { if (reduced) { const id = (e.currentTarget as HTMLElement).dataset.uid; if (id) setActive(id); } };
    const onExit = () => { if (reduced && !focusId) setActive(null); };

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerdown", onDown, { passive: true });
    hero.addEventListener("pointerup", onUp, { passive: true });
    hero.addEventListener("pointercancel", onUp, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    addEventListener("scroll", onScroll, { passive: true });
    layer.addEventListener("focusin", onFocusIn);
    layer.addEventListener("focusout", onFocusOut);
    if (reduced) list.forEach((r) => { r.el.addEventListener("pointerenter", onEnter as EventListener); r.el.addEventListener("pointerleave", onExit); });

    const relayout = () => { clearTimeout(layoutTimer); layoutTimer = window.setTimeout(layout, 180); };
    const ro = new ResizeObserver(relayout);
    ro.observe(layer);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) last = performance.now(); });
    io.observe(hero);
    const onVis = () => { visible = !document.hidden; last = performance.now(); };
    document.addEventListener("visibilitychange", onVis);

    layout();
    void document.fonts?.ready.then(layout);
    layer.classList.add("is-ready");
    if (reduced) layer.classList.add("is-static");
    else {
      t0 = performance.now() / 1000;
      nextRotate = t0 + 5; nextFormation = t0 + 13;
      ready = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf); clearTimeout(layoutTimer);
      hero.removeEventListener("pointermove", onMove); hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onUp); hero.removeEventListener("pointercancel", onUp);
      hero.removeEventListener("pointerleave", onLeave); removeEventListener("scroll", onScroll);
      layer.removeEventListener("focusin", onFocusIn); layer.removeEventListener("focusout", onFocusOut);
      ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={layerRef} className="u-layer" aria-label="Systems universe: tools, systems and processes Nelbin works with">
      <canvas ref={canvasRef} className="u-canvas" aria-hidden="true" />
      {universe.map((it) =>
        it.category === "system" ? (
          <button key={it.id} type="button" className="u-item" data-cat="system" data-uid={it.id} data-far={it.depth < 0.38}>
            <span className="u-dot" aria-hidden="true" />
            <span className="u-label">{it.label}</span>
            <PopBody it={it} />
          </button>
        ) : (
          <span key={it.id} className="u-item" data-cat={it.category} data-uid={it.id} data-far={it.depth < 0.38} aria-hidden="true">
            <span className="u-label">{it.label}</span>
            <PopBody it={it} />
          </span>
        ),
      )}
      <div ref={ringRef} className="u-cur-ring" aria-hidden="true" />
      <div ref={dotRef} className="u-cur-dot" aria-hidden="true" />
    </div>
  );
}

