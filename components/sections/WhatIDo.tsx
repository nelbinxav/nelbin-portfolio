import { pillars, type PillarIcon } from "@/content/pillars";
import { lanes } from "@/content/capabilities";
import { MaskText } from "@/components/motion/MaskText";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { HeroSystem } from "./HeroSystem";

const glyph: Record<PillarIcon, React.ReactNode> = {
  growth: <path d="M4 17l5-5 4 4 7-8M15 8h5v5" />,
  automation: <><circle cx="6" cy="6" r="2.3" /><circle cx="18" cy="12" r="2.3" /><circle cx="6" cy="18" r="2.3" /><path d="M8.2 7l7.6 4M8.2 17l7.6-4" /></>,
  build: <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />,
};

export function WhatIDo() {
  return (
    <section id="services" className="tone-deep section overflow-clip" aria-labelledby="do-title">
      <GlowBlob className="-left-1/3 top-0" parallax={60} />
      <div className="wrap relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label label-accent" data-reveal>What I do</p>
            <MaskText as="h2" id="do-title" className="h2 mt-6" text="Growth marketing at the core, with the build skills to back it." emphasis={["growth", "marketing", "build"]} />
            <p className="lead mt-8" data-reveal>
              I started in growth marketing and kept building the tools growth work needed. Today that spans three areas, and they feed each other.
            </p>
          </div>
          <div className="lg:col-span-6" data-reveal>
            <HeroSystem />
          </div>
        </div>

        <ul className="mt-20 grid gap-px overflow-hidden rounded-[14px] bg-[var(--line)] lg:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.name} className="bg-[var(--deep)] p-8 lg:p-9" data-reveal>
              <span className="icon-tile" data-i={i} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{glyph[p.icon]}</svg>
              </span>
              <h3 className="h3 mt-6">{p.name}</h3>
              <p className="mt-3 text-[var(--muted)]">{p.promise}</p>
              <ul className="mt-7 space-y-3">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-[0.95rem]">
                    <span className="strip-dot mt-[0.55rem] shrink-0" aria-hidden="true" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <details className="more mt-10">
          <summary className="btn btn-quiet">Everything I work with</summary>
          <p className="mt-6 max-w-[56ch] text-[var(--muted)]">
            The full range. The main list is what I do routinely; &ldquo;Also&rdquo; is what I have worked with at lighter depth.
          </p>
          <div className="mt-6">
            {lanes.map((lane) => (
              <div key={lane.id} className="lane">
                <div className="lane-head">
                  <h3 className="h3">{lane.name}</h3>
                  <p className="mt-2 max-w-[26ch] text-[0.95rem] text-[var(--muted)]">{lane.tagline}</p>
                </div>
                <div>
                  <ul className="lane-list">{lane.core.map((c) => <li key={c}>{c}</li>)}</ul>
                  {lane.also.length ? (
                    <p className="tags mt-5"><span className="label label-accent mr-3">Also</span>{lane.also.join(" · ")}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
