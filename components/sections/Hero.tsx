import { site } from "@/content/site";
import { bookingHref, emailHref, linkedinHref } from "@/lib/links";
import { MaskText } from "@/components/motion/MaskText";
import { Arrow } from "@/components/ui/Arrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { HeroBackdrop } from "./HeroBackdrop";

const chips = [
  { value: "5M+", label: "lead records worked", pos: "lg:-left-14 lg:top-[4%]", delay: "0s" },
  { value: "300+", label: "domains managed", pos: "lg:-right-24 lg:top-[56%]", delay: "-2s" },
  { value: "9+", label: "webinar systems", pos: "lg:-left-6 lg:bottom-[2%]", delay: "-4s" },
];

const roles = ["AI automation", "GTM systems", "Growth marketing"];

function PinIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>);
}
function MailIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>);
}
function InIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 8.6H2.4V21h2.8V8.6ZM3.8 3a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 3.8 3ZM21 14.2c0-3.4-1.8-5.8-4.8-5.8-1.4 0-2.5.7-3 1.5V8.6H10.4V21h2.8v-6.5c0-1.7.8-2.8 2.2-2.8 1.3 0 2 .9 2 2.7V21H21v-6.8Z" /></svg>);
}

export function Hero() {
  return (
    <section className="hero tone-ink" aria-labelledby="hero-title">
      <GlowBlob className="-left-1/3 -top-1/4" parallax={80} />
      <GlowBlob className="-right-1/4 top-1/3" parallax={-50} />
      <HeroBackdrop />
      <div className="wrap relative z-[1] flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ul className="hero-fade flex flex-wrap items-center gap-2" aria-label="Focus areas" style={{ "--d": "0.02s" } as React.CSSProperties}>
              {roles.map((r) => <li key={r} className="pill">{r}</li>)}
            </ul>

            <h1 id="hero-title" className="sr-only">{site.name}: {site.title}. {site.positioning}</h1>
            <MaskText as="p" hero className="display mt-7 fs-hi" text={`Hi, I'm ${site.name}.`} emphasis={["nelbin", "joseph"]} />
            <p className="hero-fade mt-5 max-w-[24ch] font-[family-name:var(--font-display)] fs-pos" style={{ "--d": "0.08s" } as React.CSSProperties}>
              {site.positioning}
            </p>
            <p className="hero-fade lead mt-6 max-w-[34em]" style={{ "--d": "0.12s" } as React.CSSProperties}>{site.growthLine}</p>

            <ul className="hero-fade mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[0.92rem] text-[var(--muted)]" style={{ "--d": "0.16s" } as React.CSSProperties}>
              <li className="inline-flex items-center gap-2"><PinIcon /> {site.location}</li>
              <li><a href={emailHref()} className="inline-flex items-center gap-2 hover:text-[var(--fg)]"><MailIcon /> {site.links.email}</a></li>
            </ul>

            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "0.2s" } as React.CSSProperties}>
              <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-primary">Book a call <Arrow /></a>
              <a href={linkedinHref()} target="_blank" rel="noopener" className="btn btn-outline"><InIcon /> Connect</a>
              <a href="#journey" className="btn btn-outline">The full story</a>
            </div>
          </div>

          <div className="hero-fade order-first lg:order-none lg:col-span-5" style={{ "--d": "0.04s" } as React.CSSProperties}>
            <div className="relative mx-auto w-[min(14.5rem,62vw)] lg:w-[min(24rem,100%)]">
              <div className="hero-portrait">
                <PhotoFrame aspect="1 / 1" position="50% 18%" sizes="(min-width: 1024px) 384px, 62vw" alt={`Portrait of ${site.name}`} priority />
              </div>
              <ul className="hidden lg:contents" aria-label="Scale at a glance">
                {chips.map((c) => (
                  <li key={c.label} className={`chip lg:absolute ${c.pos}`} style={{ "--fd": c.delay } as React.CSSProperties}>
                    <span className="chip-v grad-text">{c.value}</span>
                    <span className="chip-l">{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="hero-fade scroll-hint label mt-14 justify-center self-center pb-2" style={{ "--d": "0.35s" } as React.CSSProperties}>
          Scroll{" "}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </p>
      </div>
    </section>
  );
}
