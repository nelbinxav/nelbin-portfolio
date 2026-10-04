import { story, now, timeline } from "@/content/experience";
import { MaskText } from "@/components/motion/MaskText";
import { GlowBlob } from "@/components/ui/GlowBlob";

export function Journey() {
  return (
    <section id="journey" className="tone-deep section overflow-clip" aria-labelledby="journey-title">
      <GlowBlob className="-right-1/3 top-1/4" parallax={-60} />
      <div className="wrap relative z-[1] grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <p className="label label-accent" data-reveal>About</p>
          <MaskText as="h2" id="journey-title" className="h2 mt-6" text="From running the process to building the system." emphasis={["building", "system."]} />
          <div className="mt-8 space-y-4 text-[var(--muted)]" data-reveal>
            {story.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="mt-10 border-t border-[var(--line)] pt-6" data-reveal>
            <h3 className="label label-accent">Right now</h3>
            <ul className="mt-4 space-y-3">
              {now.map((n) => (
                <li key={n} className="flex gap-3 text-[0.95rem]">
                  <span className="strip-dot mt-[0.55rem] shrink-0" aria-hidden="true" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ol className="timeline lg:col-span-7">
          {timeline.map((t) => (
            <li key={t.title + t.dates} className="timeline-item" data-reveal>
              <span className="timeline-dot" data-now={t.now ?? false} aria-hidden="true" />
              <p className={`label ${t.now ? "label-accent" : ""}`}>{t.dates}</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight">{t.title}</h3>
              <p className="mt-1 text-[0.95rem]">{t.org}</p>
              <p className="mt-3 max-w-[52ch] text-[0.95rem] text-[var(--muted)]">{t.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
