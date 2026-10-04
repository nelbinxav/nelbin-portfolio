import { tools } from "@/content/tools";

/** Slow marquee of tools. Static and wrapped when motion is reduced. */
export function ToolsStrip() {
  const row = (hidden?: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {tools.map((t) => (
        <li key={t} className="marquee-item">{t}</li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Tools I work with" className="tone-ink border-y border-[var(--line)]">
      <p className="sr-only">Tools: {tools.join(", ")}.</p>
      <p className="label pt-7 text-center" aria-hidden="true">Tools I work with</p>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {row()}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
