import { method, principles } from "@/content/method";
import { MaskText } from "@/components/motion/MaskText";

export function Process() {
  return (
    <section id="process" className="tone-ink section" aria-labelledby="process-title">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label label-accent" data-reveal>Process</p>
            <MaskText as="h2" id="process-title" className="h2 mt-6" text="The same nine steps, on every system." emphasis={["nine", "steps,"]} />
          </div>
          <p className="lead lg:col-span-5 lg:self-end" data-reveal>
            Most of the value is in the first three steps, before anything is built.
          </p>
        </div>

        <ol className="mt-14 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {method.map((m, i) => (
            <li key={m.step} className="border-t border-[var(--line)] py-6" data-reveal>
              <span className="label num grad-text">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-[1.1rem] font-medium leading-snug">{m.step}</h3>
              <p className="mt-2 text-[0.93rem] text-[var(--muted)]">{m.note}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[14px] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Rules I hold myself to">
          {principles.map((p) => (
            <li key={p.title} className="bg-[var(--ink)] p-6" data-reveal>
              <h3 className="font-medium leading-snug">{p.title}</h3>
              <p className="mt-2 text-[0.9rem] text-[var(--muted)]">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
