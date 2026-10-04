"use client";

import { useEffect, useRef } from "react";
import { universe, fragments, flows, buildAdjacency, type UniverseItem } from "@/content/universe";
import { relax, formationRow, rng, hash, smooth, type Rect } from "@/lib/universe-layout";

/**
 * The hero "Systems Universe": every tool, concept, process and system as a floating label with depth.
 * The cursor is a gentle gravitational field, nearby items wake up, and the things they connect to light up
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
  bx: number; by: number; // last base position (kept for items fading out of a slot)
  ox: number; oy: number; // smoothed cursor displacement
  fpos: { x: number; y: number } | null;
  fw: number;           // formation weight 0..1
  ph1: number; ph2: number; w1: number; w2: number; ax: number; ay: number;
  rep: number;          // +1 pushed away by the cursor, negative = gently drawn in
  on: boolean;
  near: boolean;
  pop?: HTMLElement;
  lab: HTMLElement;
  pw: number; ph: number;
  lastShown: number;
  pull: number;
}
interface Link { a: string; b: string; p: number; want: boolean; age: number; delay: number; seq: number; formation: boolean; bend: number }
interface Slot { x: number; y: number; cat: UniverseItem["category"]; occ: string | null; kind: "sys" | "minor" }

const CAT_ALPHA = { system: [0.78, 0.2], tool: [0.4, 0.5], concept: [0.26, 0.42], process: [0.3, 0.46], capability: [0.32, 0.46] } as const;
const MINOR: Record<"d" | "t" | "m", { sys: number; cats: Record<string, number>; frags: number }> = {
  d: { sys: 10, cats: { tool: 11, concept: 6, process: 6, capability: 5 }, frags: 14 },
  t: { sys: 8, cats: { tool: 7, concept: 3, process: 4, capability: 3 }, frags: 8 },
  m: { sys: 4, cats: { tool: 4, concept: 1, process: 2, capability: 1 }, frags: 0 },
};

function PopBody({ it }: { it: UniverseItem }) {
  const h = it.hoverContent;
  if (!h) return null;
  return (
    <span className="u-pop" role={it.category === "system" ? undefined : "presentation"}>
      <span className="u-pop-title">{it.label}</span>
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
    const coreEl = hero.querySelector<HTMLElement>("[data-hero-core]");
    const ctx = canvas.getContext("2d");
    if (!coreEl || !ctx) return;

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
        it, el, lab, sys: it.category === "system", w: 80, h: 24, slot: -1, a: 0, leaving: false, x: 0, y: 0, bx: 0, by: 0, ox: 0, oy: 0,
        fpos: null, fw: 0,
        ph1: hash(it.id + "a") * 6.28, ph2: hash(it.id + "b") * 6.28,
        w1: 6.28 / (46 + hash(it.id + "c") * 50), w2: 6.28 / (62 + hash(it.id + "d") * 60),
        ax: 7 + hash(it.id + "e") * 14, ay: 6 + hash(it.id + "f") * 12,
        rep: hash(it.id + "g") > 0.28 ? 1 : -0.4, on: false, near: false, pop, pw: 220, ph: 120, lastShown: -99, pull: 0,
      });
    });
    const list = [...runs.values()];

    // ---- state ---------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1, mode: "d" | "t" | "m" = "d";
    let fullWidth = false;
    let heroRect = hero.getBoundingClientRect();
    let rectDirty = false;
    let core: Rect = { l: 0, t: 0, r: 0, b: 0 };
    let slots: Slot[] = [];
    let nFrag = 0;
    const frags: { t: string; x: number; y: number; vx: number; vy: number; a: number }[] = [];
    const links = new Map<string, Link>();
    let active: string | null = null;
    let pullRun: Run | undefined; // the last active item: related items keep leaning toward it while they settle back
    let focusId: string | null = null;
    let formation: { ids: string[]; until: number; started: number } | null = null;
    let flowCursor = Math.floor(rand() * flows.length);
    let nextFormation = 0, nextRotate = 0, lastHot = 0;
    const P = { tx: -999, ty: -999, x: -999, y: -999, inside: false, touch: false, hideAt: 0 };
    const cur = { x: -999, y: -999, rx: -999, ry: -999, k: 0 };
    let visible = true, raf = 0, last = 0, t0 = 0, ready = false, layoutTimer = 0;
    const smoothPar = { x: 0, y: 0 };

    // ---- layout (only on mount, resize and font load) -------------------------------------------
    function layout() {
      W = layer.clientWidth; H = layer.clientHeight;
      if (!W || !H) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      heroRect = hero.getBoundingClientRect();
      mode = W >= 1024 ? "d" : W >= 640 ? "t" : "m";
      const cfg = MINOR[mode];

      const c = coreEl!.getBoundingClientRect();
      core = { l: c.left - heroRect.left, t: c.top - heroRect.top, r: c.right - heroRect.left, b: c.bottom - heroRect.top };

      // show only as many systems as this screen size can hold, measure everything
      let sysIdx = 0;
      for (const r of list) {
        if (r.sys) r.el.hidden = sysIdx++ >= cfg.sys;
        r.w = r.el.offsetWidth || r.w; r.h = r.el.offsetHeight || r.h;
        if (r.pop) { r.pw = r.pop.offsetWidth || r.pw; r.ph = r.pop.offsetHeight || r.ph; }
        r.slot = -1; r.leaving = false; r.fpos = null; r.fw = 0; r.ox = 0; r.oy = 0;
      }

      fullWidth = core.r - core.l > W * 0.75;
      const bounds: Rect = { l: 14, r: W - 14, t: 84, b: H - (mode === "m" ? 76 : 104) };
      const excl: Rect = { l: core.l - 46, t: core.t - 30, r: core.r + 46, b: core.b + 30 };
      const sysRuns = list.filter((r) => r.sys && !r.el.hidden);
      const avg = (cat: string) => {
        const g = list.filter((r) => r.it.category === cat);
        return { w: g.reduce((s, r) => s + r.w, 0) / g.length, h: g.reduce((s, r) => s + r.h, 0) / g.length };
      };
      const reqs = [
        ...sysRuns.map((r) => {
          const ip = r.it.initialPosition ?? { x: 0, y: 0 };
          return { w: r.w, h: r.h, weight: 3, seed: { x: W / 2 + ip.x * (W / 2 - 40), y: H / 2 + ip.y * (H / 2 - 70) } };
        }),
      ];
      const minorCats: UniverseItem["category"][] = [];
      for (const [cat, n] of Object.entries(cfg.cats)) for (let i = 0; i < n; i++) minorCats.push(cat as UniverseItem["category"]);
      for (const cat of minorCats) { const a = avg(cat); reqs.push({ w: a.w, h: a.h, weight: 1, seed: undefined as never }); }
      const pts = relax(reqs, bounds, excl, 11 + Math.round(W / 40), fullWidth);

      slots = [];
      sysRuns.forEach((r, i) => { slots.push({ ...pts[i], cat: "system", occ: r.it.id, kind: "sys" }); r.slot = i; });
      minorCats.forEach((cat, i) => slots.push({ ...pts[sysRuns.length + i], cat, occ: null, kind: "minor" }));

      // fill each minor slot with a weighted pick from its category
      for (const cat of Object.keys(cfg.cats)) {
        const pool = list.filter((r) => r.it.category === cat);
        for (let si = 0; si < slots.length; si++) {
          const s = slots[si];
          if (s.kind !== "minor" || s.cat !== cat) continue;
          const pick = weightedPick(pool.filter((r) => r.slot < 0));
          if (pick) { pick.slot = si; s.occ = pick.it.id; }
        }
      }
      for (const r of list) {
        if (r.slot >= 0) { r.bx = slots[r.slot].x; r.by = slots[r.slot].y; r.x = r.bx; r.y = r.by; }
        r.a = reduced ? baseAlpha(r) : 0;
      }

      nFrag = cfg.frags;
      frags.length = 0;
      for (let i = 0; i < nFrag; i++) {
        let x = 0, y = 0, k = 0;
        do { x = rand() * W; y = 70 + rand() * (H - 90); k++; } while (k < 16 && ((x > excl.l && x < excl.r && y > excl.t && y < excl.b) || slots.some((sl) => Math.abs(sl.x - x) < 90 && Math.abs(sl.y - y) < 34)));
        frags.push({ t: fragments[i % fragments.length], x, y, vx: (rand() - 0.5) * 3, vy: (rand() - 0.5) * 2, a: 0.1 + rand() * 0.1 });
      }
      links.clear(); setActive(null);
      if (reduced) renderStatic();
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

    function summon(id: string, anchor: Run) {
      const r = runs.get(id);
      if (!r || r.el.hidden) return;
      if (r.slot >= 0) { r.leaving = false; return; }
      if (r.sys) return;
      const lock = new Set<string>([anchor.it.id, ...related(anchor.it.id)]);
      let best = -1, bd = Infinity;
      for (const pass of [true, false]) {
        slots.forEach((s, i) => {
          if (s.kind !== "minor" || (pass && s.cat !== r.it.category)) return;
          if (s.occ && lock.has(s.occ)) return;
          if (formation && s.occ && formation.ids.includes(s.occ)) return;
          const d = Math.hypot(s.x - anchor.x, s.y - anchor.y);
          if (d < bd) { bd = d; best = i; }
        });
        if (best >= 0) break;
      }
      if (best < 0) return;
      const old = s0(best);
      if (old) { old.slot = -1; old.leaving = true; }
      slots[best].occ = id; r.slot = best; r.leaving = false;
      r.bx = r.x = slots[best].x; r.by = r.y = slots[best].y; r.lastShown = performance.now() / 1000;
    }
    const s0 = (i: number) => (slots[i].occ ? runs.get(slots[i].occ!) : undefined);

    function setActive(id: string | null) {
      if (id === active) return;
      if (active) {
        const p = runs.get(active); p?.el.classList.remove("is-active");
        for (const rid of related(active)) runs.get(rid)?.el.classList.remove("is-related");
      }
      active = id;
      layer.classList.toggle("has-active", !!id);
      if (id) {
        const a = runs.get(id)!;
        a.el.classList.add("is-active");
        pullRun = a;
        placePop(a);
        for (const rid of related(id)) { summon(rid, a); runs.get(rid)?.el.classList.add("is-related"); }
        if (formation) endFormation();
      }
      if (reduced) renderStatic();
    }

    /** Opens the detail panel on the side that never covers the central text. */
    function placePop(r: Run) {
      if (!r.pop) return;
      const rx = r.fpos ? r.fpos.x : r.bx, ry = r.fpos ? r.fpos.y : r.by; // where it will settle
      const pw = r.pw, ph = r.ph, g = 12;
      const ex: Rect = { l: core.l - 6, t: core.t - 6, r: core.r + 6, b: core.b + 6 };
      const hit = (l: number, t: number) => !(l + pw < ex.l || l > ex.r || t + ph < ex.t || t > ex.b);
      const cl = (l: number) => Math.min(W - pw - 10, Math.max(10, l));
      // try centred, then aligned to the item's left edge, then to its right edge
      const aligns = [rx - pw / 2, rx - r.w / 2, rx + r.w / 2 - pw, W - pw - 10, 10].map(cl);
      const below = ry + r.h / 2 + g, above = ry - r.h / 2 - g - ph;
      const order = ry < H / 2 ? ["below", "above"] : ["above", "below"];
      let dir = "", left = aligns[0];
      for (const d of order) {
        const t = d === "below" ? below : above;
        if (t < 76 || t + ph > H - 6) continue;
        const l = aligns.find((al) => !hit(al, t));
        if (l !== undefined) { dir = d; left = l; break; }
      }
      if (!dir) dir = W - (rx + r.w / 2) > rx - r.w / 2 ? "right" : "left";
      r.pop.dataset.dir = dir;
      r.pop.style.setProperty("--pop-x", `${Math.round(left - (rx - r.w / 2))}px`);
    }

    // ---- formations ------------------------------------------------------------------------------
    function startFormation(now: number) {
      for (let k = 0; k < flows.length; k++) {
        const f = flows[(flowCursor + k) % flows.length];
        const rs = f.ids.map((id) => runs.get(id)).filter((r): r is Run => !!r && !r.el.hidden);
        if (rs.length < 3) continue;
        const row = formationRow(rs.map((r) => r.w), W, H - (mode === "m" ? 44 : 56), mode === "m" ? 0 : 7);
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
    function endFormation() { formation = null; }

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
      smoothPar.x += ((P.inside ? P.x / W - 0.5 : 0) - smoothPar.x) * (1 - Math.exp(-dt * 1.4));
      smoothPar.y += ((P.inside ? P.y / H - 0.5 : 0) - smoothPar.y) * (1 - Math.exp(-dt * 1.4));

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

      // calm, occasional behaviour: rotate the pool, assemble a system
      if (!reduced && ready) {
        if (!hasActive && !formation && t > nextRotate) {
          nextRotate = t + 2.4 + rand() * 1.8;
          const cands = slots.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "minor" && s.occ && runs.get(s.occ)!.a > 0.7 && !runs.get(s.occ)!.leaving);
          if (cands.length) runs.get(cands[Math.floor(rand() * cands.length)].s.occ!)!.leaving = true;
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
            if (next) { next.slot = si; s.occ = next.it.id; next.bx = next.x = s.x; next.by = next.y = s.y; next.lastShown = t; }
            else s.occ = null;
          }
        }

        if (!showing && r.a < 0.012) { if (r.on) { r.on = false; r.el.classList.remove("is-on"); } continue; }

        // base position: slot anchor with a very slow orbit, parallaxed by depth
        const dep = r.it.depth;
        let bx = r.bx, by = r.by;
        if (r.slot >= 0) {
          const s = slots[r.slot];
          const drift = reduced ? 0 : 1;
          bx = s.x + (Math.cos(t * r.w1 + r.ph1) * r.ax + Math.sin(t * r.w2 + r.ph2) * r.ax * 0.5) * (0.4 + dep) * drift - smoothPar.x * 22 * dep;
          by = s.y + (Math.sin(t * r.w1 + r.ph1) * r.ay + Math.cos(t * r.w2 + r.ph2) * r.ay * 0.5) * (0.4 + dep) * drift - smoothPar.y * 14 * dep;
          r.bx = bx; r.by = by;
        }
        if (r.fpos) { bx += (r.fpos.x - bx) * smooth(r.fw, 0, 1); by += (r.fpos.y - by) * smooth(r.fw, 0, 1); }

        // cursor as a gravitational field: most things drift away, a few lean in; always with inertia
        let tx = 0, ty = 0, prox = 0;
        if (fieldOn && !inForm && !isActive) {
          const dx = r.x - P.x, dy = r.y - P.y, d = Math.hypot(dx, dy) || 1;
          const R = 340;
          if (d < R) {
            const f = (1 - d / R) ** 2;
            const push = r.rep > 0 ? 1 : (d > 70 ? -0.4 : 0);
            tx = (dx / d) * f * 48 * (0.35 + dep) * push * cur.k; ty = (dy / d) * f * 48 * (0.35 + dep) * push * cur.k;
          }
          prox = smooth(1 - d / 230, 0, 1) * cur.k;
        }
        const ik = 1 - Math.exp(-dt * 3.1);
        r.ox += (tx - r.ox) * ik; r.oy += (ty - r.oy) * ik;
        let x = bx + r.ox, y = by + r.oy;
        // related items lean toward the active one, so a relationship reads as a small cluster
        const pullT = isRel && !inForm ? 0.2 : 0;
        r.pull += (pullT - r.pull) * (1 - Math.exp(-dt * 2.2));
        if (r.pull > 0.002 && pullRun) {
          const dx = pullRun.x - x, dy = pullRun.y - y, d = Math.hypot(dx, dy) || 1;
          const k = Math.min(r.pull, Math.max(0, (d - 120) / d));
          x += dx * k; y += dy * k;
        }

        // never cover the central text
        const hw = r.w / 2 + 8, hh = r.h / 2 + 6;
        if (!inForm && x > core.l - hw && x < core.r + hw && y > core.t - hh && y < core.b + hh) {
          const dl = x - (core.l - hw), dr = core.r + hw - x, dtp = y - (core.t - hh), db = core.b + hh - y, m = Math.min(dl, dr, dtp, db);
          if (!fullWidth && m === dl) x = core.l - hw; else if (!fullWidth && m === dr) x = core.r + hw; else if (dtp <= db) y = core.t - hh; else y = core.b + hh;
        }
        const edge = r.w * 0.62 + 6;
        x = Math.min(W - edge, Math.max(edge, x));
        y = Math.min(H - r.h / 2 - 4, Math.max(r.h / 2 + 70, y));
        r.x = x; r.y = y;

        // opacity, scale, sharpness
        let tgt = baseAlpha(r) + prox * 0.45;
        if (r.leaving) tgt = 0;
        else if (isActive) tgt = 1;
        else if (isRel) tgt = Math.max(tgt, 0.92);
        else if (hasActive) tgt *= 0.5;
        if (formation && !inForm) tgt *= 0.38;
        if (formation && inForm) tgt = 1;
        const nearCore = x > core.l - 90 && x < core.r + 90 && y > core.t - 60 && y < core.b + 60;
        if (nearCore && !inForm && !isActive && !isRel) tgt *= 0.7;
        const up = tgt > r.a;
        r.a += (tgt - r.a) * (1 - Math.exp(-dt * (up ? (isActive || isRel ? 4.5 : 1.5) : 1.4)));
        const s = (0.8 + 0.3 * dep) * (1 + prox * 0.1 + (isActive ? 0.1 : isRel ? 0.04 : 0));
        const wantNear = isActive || isRel || prox > 0.45 || dep > 0.6 || (inForm && r.fw > 0.5);
        if (wantNear !== r.near) { r.near = wantNear; r.el.classList.toggle("is-near", wantNear); }
        const on = r.a > 0.012;
        if (on !== r.on) { r.on = on; r.el.classList.toggle("is-on", on); }
        r.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
        r.lab.style.transform = `scale(${s.toFixed(3)})`;
        r.el.style.opacity = r.a.toFixed(3);
      }

      drawCanvas(t, dt);
      moveCursor(dt, !!hot);
    }

    function drawCanvas(t: number, dt: number) {
      ctx!.clearRect(0, 0, W, H);

      // far-background technical fragments
      if (frags.length) {
        ctx!.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        for (const f of frags) {
          f.x += f.vx * dt; f.y += f.vy * dt;
          if (f.x < -90) f.x = W + 40; else if (f.x > W + 90) f.x = -40;
          if (f.y < 74) f.y = H - 20; else if (f.y > H - 8) f.y = 76;
          if (f.x > core.l - 30 && f.x < core.r + 30 && f.y > core.t - 20 && f.y < core.b + 20) continue;
          ctx!.fillStyle = `rgba(190,188,255,${f.a * (formation ? 0.4 : 1)})`;
          ctx!.fillText(f.t, f.x, f.y);
        }
      }

      // desired links: the active item to everything it connects to
      for (const l of links.values()) if (!l.formation) l.want = false;
      if (active) {
        const A = runs.get(active)!;
        const nearest = related(active)
          .map((rid) => runs.get(rid))
          .filter((r): r is Run => !!r && !r.el.hidden && (r.slot >= 0 || !!r.fpos))
          .sort((p, q) => Math.hypot(p.x - A.x, p.y - A.y) - Math.hypot(q.x - A.x, q.y - A.y))
          .slice(0, 8)
          .map((r) => r.it.id);
        nearest.forEach((rid, i) => {
          const r = runs.get(rid)!;
          const key = `${active}>${rid}`;
          let l = links.get(key);
          if (!l) { l = { a: active!, b: rid, p: 0, want: true, age: 0, delay: i * 0.06, seq: i, formation: false, bend: (hash(key) - 0.5) * 0.18 }; links.set(key, l); }
          l.want = true;
        });
      }
      // lines never run through the central text
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(0, 0, W, H);
      ctx!.rect(core.l - 14, core.t - 10, core.r - core.l + 28, core.b - core.t + 20);
      ctx!.clip("evenodd");
      let idx = 0;
      for (const [key, l] of links) {
        const A = runs.get(l.a), B = runs.get(l.b);
        if (!A || !B) { links.delete(key); continue; }
        if (l.want) { l.age += dt; const tp = Math.min(1, Math.max(0, (l.age - l.delay) * 2.4)); if (tp > l.p) l.p = tp; }
        else { l.age = 0; l.p -= dt * 0.85; if (l.p <= 0) { links.delete(key); continue; } }
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
        idx++;
      }
      ctx!.restore();
      void idx;
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

    /** Reduced motion: one static pass, redrawn only when focus or hover changes. */
    function renderStatic() {
      for (const r of list) {
        if (r.el.hidden) continue;
        const isActive = r.it.id === active, isRel = !!active && related(active).includes(r.it.id);
        const showing = r.slot >= 0;
        if (showing) { const s = slots[r.slot]; r.x = s.x; r.y = s.y; }
        let a = showing ? baseAlpha(r) : 0;
        if (isActive) a = 1; else if (isRel) a = 0.92; else if (active) a *= 0.55;
        r.a = a;
        r.on = a > 0.012; r.el.classList.toggle("is-on", r.on);
        r.el.classList.toggle("is-near", isActive || isRel || r.it.depth > 0.6);
        const sc = (0.8 + 0.3 * r.it.depth) * (isActive ? 1.1 : 1);
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
      ctx!.rect(core.l - 14, core.t - 10, core.r - core.l + 28, core.b - core.t + 20);
      ctx!.clip("evenodd");
      ctx!.strokeStyle = "rgba(138,133,255,0.55)"; ctx!.lineWidth = 1;
      for (const rid of related(active)) {
        const B = runs.get(rid);
        if (!B || B.el.hidden || B.slot < 0) continue;
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

