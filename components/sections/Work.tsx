import Link from "next/link";
import { categories, systems } from "@/content/systems";
import { MaskText } from "@/components/motion/MaskText";
import { TiltCard } from "@/components/ui/TiltCard";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { Arrow } from "@/components/ui/Arrow";
import { FlowStrip } from "./FlowStrip";

const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Technology and context">
      {items.map((c) => <li key={c} className="pill">{c}</li>)}
    </ul>
  );
}

function Prs({ s }: { s: (typeof systems)[number] }) {
  return (
    <dl className="grid gap-5 text-[0.95rem]">
      <div>
        <dt className="label">The need</dt>
        <dd className="mt-1.5 text-[var(--muted)]">{s.problem}</dd>
      </div>
      <div>
        <dt className="label">What I can build</dt>
        <dd className="mt-1.5">{s.did}</dd>
      </div>
      <div>
        <dt className="label label-accent">Example</dt>
        <dd className="mt-1.5 font-medium">{s.result}</dd>
      </div>
    </dl>
  );
}

export function Work() {
  const feature = systems.find((s) => s.tier === "feature")!;
  const cards = systems.filter((s) => s.tier === "card");
  const list = systems.filter((s) => s.tier === "list");

  return (
    <section id="work" className="tone-ink section overflow-clip" aria-labelledby="work-title">
      <GlowBlob className="-right-1/4 top-1/4" parallax={-60} />
      <div className="wrap relative z-[1]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label label-accent" data-reveal>Selected work</p>
            <MaskText as="h2" id="work-title" className="h2 mt-6" text="Business systems I can build, not websites." emphasis={["systems"]} />
          </div>
          <p className="lead lg:col-span-5 lg:self-end" data-reveal>
            Each one is a manual process I can replace with something connected and repeatable. Here is the need, what I can build, and an example of what came out of it.
          </p>
        </div>

        {/* Feature: the webinar case study */}
        <article className="work-feature mt-14" data-reveal aria-labelledby="feat-title">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <p className="label grad-text">Featured case study · {catName(feature.category)}</p>
              <h3 id="feat-title" className="display mt-5 fs-feature [text-wrap:balance]">
                Turning fragmented webinar operations into <span className="em">one connected acquisition system.</span>
              </h3>
              <div className="mt-8"><Chips items={feature.context} /></div>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href={`/systems/${feature.caseStudy}`} className="btn btn-primary">Read the case study <Arrow /></Link>
              </div>
            </div>
            <div className="lg:col-span-6"><Prs s={feature} /></div>
          </div>
          <div className="mt-12 border-t border-[var(--line)] pt-8"><FlowStrip /></div>
        </article>

        {/* Three more, same shape */}
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {cards.map((s) => (
            <li key={s.slug} data-reveal>
              <TiltCard as="article" className="sys-card" aria-label={s.name}>
                <p className="label grad-text">{catName(s.category)}</p>
                <h3 className="sys-name mt-4">{s.name}</h3>
                <div className="mt-6"><Prs s={s} /></div>
                <div className="mt-auto pt-7">
                  <Chips items={s.context} />
                </div>
              </TiltCard>
            </li>
          ))}
        </ul>

        {/* The rest, tucked away */}
        <details className="more mt-10">
          <summary className="btn btn-quiet">Show {list.length} more systems</summary>
          <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
            {list.map((s) => (
              <li key={s.slug} className="more-row">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-[family-name:var(--font-display)] text-[1.35rem] leading-tight">{s.name}</h3>
                </div>
                <p className="mt-2 text-[0.95rem] text-[var(--muted)]">{s.summary}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
