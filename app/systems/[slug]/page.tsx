import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { ownershipDefinitions } from "@/content/ownership";
import { MaskText } from "@/components/motion/MaskText";
import { OwnershipTag } from "@/components/ui/OwnershipTag";
import { TiltCard } from "@/components/ui/TiltCard";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { Arrow } from "@/components/ui/Arrow";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { CaseSubnav } from "@/components/case-study/CaseSubnav";
import { bookingHref } from "@/lib/links";

export const dynamicParams = false;
export const generateStaticParams = () => caseStudies.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const cs = getCaseStudy((await params).slug);
  if (!cs) return {};
  return {
    title: cs.title,
    description: cs.seoDescription,
    alternates: { canonical: `/systems/${cs.slug}` },
    openGraph: { title: cs.title, description: cs.statement, url: `/systems/${cs.slug}`, type: "article" },
    twitter: { title: cs.title, description: cs.statement },
  };
}

const sections = [
  { id: "problem", label: "Problem" },
  { id: "approach", label: "Approach" },
  { id: "architecture", label: "Architecture" },
  { id: "ownership", label: "My ownership" },
  { id: "technologies", label: "Technologies" },
  { id: "results", label: "Results" },
];

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const cs = getCaseStudy((await params).slug);
  if (!cs) notFound();
  const o = cs.ownership;

  return (
    <article>
      {/* Header */}
      <header className="tone-ink relative overflow-clip pb-20 pt-[calc(var(--nav-h)+3rem)] md:pb-28">
        <GlowBlob className="-right-1/4 -top-1/3" parallax={60} />
        <div className="wrap relative z-[1]">
          <Link href="/#work" className="label inline-flex items-center gap-2 hover:text-[var(--fg)]">
            <span aria-hidden="true">←</span> Back to work
          </Link>
          <p className="label label-accent mt-14 hero-fade">{cs.eyebrow}</p>
          <h1 className="sr-only">{cs.title}: {cs.statement}</h1>
          <MaskText
            as="p"
            hero
            className="display mt-6 max-w-[17ch] fs-display [text-wrap:balance]"
            text={cs.statement}
            emphasis={["connected", "acquisition", "system."]}
          />
          <dl className="hero-fade mt-16 grid gap-x-10 gap-y-8 border-t border-[var(--line)] pt-8 sm:grid-cols-2 lg:grid-cols-4" style={{ "--d": "0.9s" } as React.CSSProperties}>
            {cs.facts.map((f) => (
              <div key={f.label}>
                <dt className="label">{f.label}</dt>
                <dd className="mt-2 text-[0.98rem]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <CaseSubnav items={sections} />

      {/* Problem */}
      <section id="problem" className="tone-deep section">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label label-accent" data-reveal>01 · Problem</p>
            <MaskText as="h2" className="h2 mt-6" text="Systems that did not talk to each other." emphasis={["talk"]} />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="lead !text-[var(--fg)]" data-reveal>{cs.problem.lead}</p>
            <ul className="mt-10">
              {cs.problem.points.map((p, i) => (
                <li key={p} className="flex gap-5 border-t border-[var(--line)] py-4" data-reveal>
                  <span className="label num pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="tone-deep pb-[var(--section-y)]" style={{ background: "var(--deep-2)" }}>
        <div className="wrap pt-[var(--section-y)]">
          <p className="label label-accent" data-reveal>02 · Approach</p>
          <MaskText as="h2" className="h2 mt-6 max-w-[16ch]" text="From the client's process to a system that runs." emphasis={["system"]} />
          <ol className="mt-16 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {cs.approach.map((a, i) => (
              <li key={a.step} className="border-t border-[var(--line)] py-6" data-reveal>
                <span className="label num label-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[1.1rem] font-medium leading-snug">{a.step}</h3>
                <p className="mt-2 text-[0.95rem] text-[var(--muted)]">{a.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="tone-ink section">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="label label-accent" data-reveal>03 · System architecture</p>
              <MaskText as="h2" className="h2 mt-6" text="One flow, from raw lead to CRM follow-up." emphasis={["one", "flow,"]} />
            </div>
            <p className="lead lg:col-span-5 lg:col-start-8 lg:self-end" data-reveal>{cs.architecture.intro}</p>
          </div>
          <div className="mt-16">
            <FlowDiagram nodes={cs.architecture.nodes} />
          </div>
          <p className="label mt-8" data-reveal>{cs.architecture.connectedWith}</p>
        </div>
      </section>

      {/* Ownership */}
      <section id="ownership" className="tone-deep section">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label label-accent" data-reveal>04 · My ownership</p>
            <MaskText as="h2" className="h2 mt-6" text="What was mine, and what was not." emphasis={["mine,"]} />
            <div className="mt-8" data-reveal>
              <OwnershipTag level={o.level} />
              <p className="mt-3 max-w-[34ch] text-[0.95rem] text-[var(--muted)]">
                <strong className="font-medium text-[var(--fg)]">{o.level}.</strong> {ownershipDefinitions[o.level]}
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="lead !text-[var(--fg)]" data-reveal>{o.statement}</p>
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <div data-reveal>
                <h3 className="label label-accent">I did</h3>
                <ul className="mt-4">
                  {o.did.map((d) => <li key={d} className="border-t border-[var(--line)] py-3 text-[0.97rem]">{d}</li>)}
                </ul>
              </div>
              <div data-reveal>
                <h3 className="label">I did not</h3>
                <ul className="mt-4">
                  {o.didNot.map((d) => <li key={d} className="border-t border-[var(--line)] py-3 text-[0.97rem] text-[var(--muted)]">{d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section id="technologies" className="tone-deep pb-[var(--section-y)]" style={{ background: "var(--deep-2)" }}>
        <div className="wrap pt-[var(--section-y)]">
          <p className="label label-accent" data-reveal>05 · Technologies</p>
          <MaskText as="h2" className="h2 mt-6" text="The tools, grouped by the job they do." emphasis={["tools,"]} />
          <div className="mt-16 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
            {cs.technologies.map((g) => (
              <div key={g.group} className="border-t border-[var(--line)] py-6" data-reveal>
                <h3 className="label label-accent">{g.group}</h3>
                <ul className="mt-5 space-y-2">
                  {g.items.map((t) => <li key={t} className="text-[1.05rem]">{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="results" className="tone-ink section overflow-clip">
        <GlowBlob className="-left-1/4 top-1/3" parallax={-60} />
        <div className="wrap relative z-[1]">
          <p className="label label-accent" data-reveal>06 · Results</p>
          <MaskText as="h2" className="h2 mt-6" text={cs.results.intro} emphasis={["different", "outcomes."]} />
          <p className="lead mt-8" data-reveal>{cs.results.caveat}</p>
          <ul className="mt-16 grid gap-6 lg:grid-cols-3">
            {cs.results.outcomes.map((r) => {
              const n = parseInt(r.value, 10);
              const suffix = r.value.replace(String(n), "");
              return (
                <li key={r.client} data-reveal>
                  <TiltCard as="article" className="sys-card !p-8" aria-label={r.client}>
                    <p className="label grad-text">{r.client}</p>
                    <p className="metric-value num mt-8" aria-label={r.value}>
                      <span data-counter data-to={n} data-suffix={suffix}>{r.value}</span>
                    </p>
                    <p className="mt-5 text-[1.1rem] leading-snug">{r.claim}</p>
                    {r.attribution ? <p className="label mt-4">{r.attribution}</p> : null}
                    <div className="mt-auto pt-10">
                      <div className="border-t border-[var(--line)] pt-6">
                        <OwnershipTag level={r.ownership} note={r.ownershipNote} />
                      </div>
                    </div>
                  </TiltCard>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Close: earned, not pushed */}
      <section className="tone-deep section">
        <div className="wrap flex flex-wrap items-end justify-between gap-10">
          <MaskText as="h2" className="h2 max-w-[18ch]" text="Have a process like this that still runs by hand?" emphasis={["by", "hand?"]} />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4" data-reveal>
            <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-primary">Book a call <Arrow /></a>
            <Link href="/#systems" className="btn btn-ghost">More systems <Arrow /></Link>
          </div>
        </div>
      </section>
    </article>
  );
}
