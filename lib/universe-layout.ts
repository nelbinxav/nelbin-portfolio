/**
 * Pure layout helpers for the hero universe: no DOM, no React. Positions are in pixels inside the hero.
 */
export interface Box { x: number; y: number; w: number; h: number } // centre + size
export interface Rect { l: number; t: number; r: number; b: number }

/** Small seeded PRNG so a given screen size always lays out the same way. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

export interface SlotRequest {
  w: number;
  h: number;
  /** Seed in px, or undefined for a random start. */
  seed?: { x: number; y: number };
  /** Heavier slots (systems) move less when the layout is relaxed. */
  weight: number;
}

/**
 * Spreads boxes over the hero without overlapping each other or the central text.
 * Simple iterative relaxation: push overlapping pairs apart, push out of the exclusion rect, pull seeds back.
 */
export interface Keep { rect: Rect; vertical: boolean }

export function relax(reqs: SlotRequest[], bounds: Rect, keeps: Keep[], seed = 7): { x: number; y: number }[] {
  const rand = rng(seed);
  const pts = reqs.map((r) => {
    if (r.seed) return { x: r.seed.x, y: r.seed.y };
    // random start outside the exclusion rect
    for (let k = 0; k < 20; k++) {
      const x = bounds.l + rand() * (bounds.r - bounds.l);
      const y = bounds.t + rand() * (bounds.b - bounds.t);
      if (!keeps.some((k) => x > k.rect.l && x < k.rect.r && y > k.rect.t && y < k.rect.b)) return { x, y };
    }
    return { x: bounds.l, y: bounds.t };
  });
  const padX = 46;
  const padY = 26;
  for (let iter = 0; iter < 180; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], ra = reqs[i], rb = reqs[j];
        const ox = (ra.w + rb.w) / 2 + padX - Math.abs(a.x - b.x);
        const oy = (ra.h + rb.h) / 2 + padY - Math.abs(a.y - b.y);
        if (ox <= 0 || oy <= 0) continue;
        const wa = rb.weight / (ra.weight + rb.weight);
        const wb = 1 - wa;
        if (ox < oy) {
          const s = a.x < b.x ? -1 : 1;
          a.x += s * ox * wa; b.x -= s * ox * wb;
        } else {
          const s = a.y < b.y ? -1 : 1;
          a.y += s * oy * wa; b.y -= s * oy * wb;
        }
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], r = reqs[i];
      // keep the text and the portrait clear
      for (const k of keeps) {
        const ex = k.rect;
        const el = ex.l - r.w / 2, er = ex.r + r.w / 2, et = ex.t - r.h / 2, eb = ex.b + r.h / 2;
        if (p.x > el && p.x < er && p.y > et && p.y < eb) {
          const dl = p.x - el, dr = er - p.x, dt = p.y - et, db = eb - p.y;
          const m = k.vertical ? Math.min(dt, db) : Math.min(dl, dr, dt, db);
          if (!k.vertical && m === dl) p.x = el; else if (!k.vertical && m === dr) p.x = er; else if (m === dt) p.y = et; else p.y = eb;
        }
      }
      // pull seeded (system) slots back toward where they were meant to be
      if (r.seed) { p.x += (r.seed.x - p.x) * 0.02; p.y += (r.seed.y - p.y) * 0.02; }
      p.x = Math.min(bounds.r - r.w / 2, Math.max(bounds.l + r.w / 2, p.x));
      p.y = Math.min(bounds.b - r.h / 2, Math.max(bounds.t + r.h / 2, p.y));
    }
  }
  return pts;
}

/** Evenly spaces boxes of the given widths along a gentle curve; null if they do not fit. */
export function formationRow(widths: number[], L: number, R: number, y: number, amp: number): { x: number; y: number }[] | null {
  const total = widths.reduce((a, b) => a + b, 0);
  const span = (R - L) * 0.92;
  const gap = (span - total) / Math.max(1, widths.length - 1);
  if (gap < 22) return null;
  let x = L + ((R - L) - span) / 2;
  return widths.map((w, i) => {
    const cx = x + w / 2;
    x += w + gap;
    return { x: cx, y: y + Math.sin(i * 1.15) * amp };
  });
}

export const smooth = (v: number, lo: number, hi: number) => {
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
};

/** How many cells of the area are free of every keep-out: a cheap way to size the pool to the space available. */
export function freeArea(bounds: Rect, keeps: Keep[], pad = 20): number {
  const step = 24;
  let n = 0;
  for (let y = bounds.t; y < bounds.b; y += step)
    for (let x = bounds.l; x < bounds.r; x += step)
      if (!keeps.some((k) => x > k.rect.l - pad && x < k.rect.r + pad && y > k.rect.t - pad && y < k.rect.b + pad)) n++;
  return n * step * step;
}
