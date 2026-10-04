import { metrics, miniStats } from "@/content/metrics";
import { MaskText } from "@/components/motion/MaskText";
import { GlowBlob } from "@/components/ui/GlowBlob";

export function Proof() {
  return (
    <section id="proof" className="tone-deep section overflow-clip" aria-labelledby="proof-title">
      <GlowBlob className="-right-1/3 -top-1/4" parallax={50} />
      <div className="wrap relative z-[1]">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label label-accent" data-reveal>Proof</p>
            <MaskText as="h2" id="proof-title" className="h2 mt-6" text="The scale behind the systems." emphasis={["scale"]} />
          </div>
          <p className="lead lg:col-span-5 lg:col-start-8 lg:self-end" data-reveal>
            Each number comes from different work and measures something different, so read the line under each one before comparing them.
          </p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[14px] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((m) => (
            <li key={m.id} className="flex flex-col bg-[var(--deep)] p-6 lg:p-7" data-reveal>
              <p className="metric-value num" aria-label={`${m.value}${m.suffix}`}>
                <span data-counter data-to={m.value} data-suffix={m.suffix}>{m.value}{m.suffix}</span>
              </p>
              <h3 className="mt-5 text-[1rem] font-medium leading-snug">{m.label}</h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--muted)]">{m.measures}</p>
              <p className="metric-scope mt-auto pt-5">{m.scope}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-6 grid gap-x-8 gap-y-5 border-t border-[var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-5" aria-label="Smaller facts">
          {miniStats.map((m) => (
            <li key={m.label} data-reveal>
              <p className="grad-text font-[family-name:var(--font-display)] text-[1.6rem] leading-none whitespace-nowrap">{m.value}</p>
              <p className="mt-2 text-[0.85rem] leading-snug text-[var(--muted)]">{m.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
