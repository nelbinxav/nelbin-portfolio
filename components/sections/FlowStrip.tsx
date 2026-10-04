import { webinarAutomation as cs } from "@/content/case-studies/webinar-automation";

/** The eleven stages grouped into four phases, as a quiet teaser of the full interactive diagram. */
const phases = [
  { name: "Source & clean", span: 2 },
  { name: "Reach & register", span: 2 },
  { name: "Run the event", span: 5 },
  { name: "Follow up", span: 2 },
];

export function FlowStrip() {
  const stages = cs.architecture.nodes;
  const cols = { gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` };
  return (
    <>
      <div className="hidden md:block" aria-hidden="true">
        <div className="grid gap-1" style={cols}>
          {phases.map((p) => (
            <p key={p.name} className="label pb-3" style={{ gridColumn: `span ${p.span}` }}>{p.name}</p>
          ))}
        </div>
        <div className="relative">
          <div className="strip-line" data-line />
          <div className="absolute inset-x-0 top-1/2 grid -translate-y-1/2" style={cols}>
            {stages.map((s) => <span key={s.id} className="strip-dot" data-reveal />)}
          </div>
        </div>
        <div className="mt-3 grid" style={cols}>
          {stages.map((s, i) => (
            <p key={s.id} className="label num !text-[0.62rem] !tracking-[0.06em]">{String(i + 1).padStart(2, "0")}</p>
          ))}
        </div>
      </div>
      <ol className="md:hidden" aria-label="Stages of the system">
        {phases.map((p, pi) => {
          const start = phases.slice(0, pi).reduce((n, x) => n + x.span, 0);
          return (
            <li key={p.name} className="border-t border-[var(--line)] py-3">
              <p className="label label-accent">{p.name}</p>
              <p className="mt-1 text-[0.9rem] text-[var(--muted)]">{stages.slice(start, start + p.span).map((s) => s.label).join(" → ")}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
