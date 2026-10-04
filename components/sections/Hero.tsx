import { site } from "@/content/site";
import { bookingHref, emailHref, linkedinHref } from "@/lib/links";
import { MaskText } from "@/components/motion/MaskText";
import { Arrow } from "@/components/ui/Arrow";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { UniverseGate } from "@/components/universe/UniverseGate";

/**
 * Text on the left, portrait on the right. The Systems Universe floats in the free space around the portrait;
 * anything marked data-keepout is something the animation must never cover.
 */
const roles = ["AI automation", "GTM systems", "Systems engineering"];

function PinIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" /></svg>);
}
function MailIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>);
}
function InIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.5 2h15A2.5 2.5 0 0 1 22 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2ZM8.3 9.6H5.5V18h2.8V9.6ZM6.9 5.6a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM18.5 13.3c0-2.3-1.2-3.9-3.3-3.9-1 0-1.8.5-2.2 1.1V9.6h-2.7V18H13v-4.5c0-1.2.6-1.9 1.5-1.9s1.4.6 1.4 1.8V18h2.6v-4.7Z" /></svg>);
}

export function Hero() {
  return (
    <section className="hero tone-ink" aria-labelledby="hero-title">
      <GlowBlob className="-left-1/3 -top-1/4" parallax={80} />
      <GlowBlob className="-right-1/4 top-1/3" parallax={-50} />
      <div className="wrap relative z-[2] flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="hero-text" data-keepout="text">
              <ul className="hero-fade flex flex-wrap items-center gap-2" aria-label="Focus areas" style={{ "--d": "0.02s" } as React.CSSProperties}>
                {roles.map((r) => <li key={r} className="pill">{r}</li>)}
              </ul>

              <h1 id="hero-title" className="sr-only">{site.name}: {site.title}. {site.positioning}</h1>
              <MaskText as="p" hero className="display hero-name mt-7" text={`Hi, I'm ${site.name}.`} emphasis={["nelbin", "joseph"]} />
              <p className="hero-fade mt-5 font-[family-name:var(--font-display)] fs-pos" style={{ "--d": "0.08s" } as React.CSSProperties}>
                {site.positioning}
              </p>
              <p className="hero-fade lead hero-lead mt-6" style={{ "--d": "0.12s" } as React.CSSProperties}>{site.growthLine}</p>

              <ul className="hero-fade mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[0.92rem] text-[var(--muted)]" style={{ "--d": "0.16s" } as React.CSSProperties}>
                <li className="inline-flex items-center gap-2"><PinIcon /> {site.location}</li>
                <li><a href={emailHref()} className="inline-flex items-center gap-2 hover:text-[var(--fg)]"><MailIcon /> {site.links.email}</a></li>
              </ul>

              <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "0.2s" } as React.CSSProperties}>
                <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-primary">Book a call <Arrow /></a>
                <a href={linkedinHref()} target="_blank" rel="noopener" className="btn btn-outline"><InIcon /> LinkedIn <Arrow /></a>
                <a href="#work" className="btn btn-outline">Explore my work <Arrow /></a>
              </div>
            </div>
          </div>

          <div className="hero-fade order-first max-lg:py-24 lg:order-none lg:col-span-5" style={{ "--d": "0.04s" } as React.CSSProperties}>
            <div className="relative mx-auto w-[min(14.5rem,62vw)] lg:w-[min(21rem,100%)]">
              <div className="hero-portrait" data-keepout data-orbit>
                <PhotoFrame aspect="4 / 5" position="50% 14%" sizes="(min-width: 1024px) 336px, 62vw" alt={`Portrait of ${site.name}`} priority />
              </div>
            </div>
          </div>
        </div>
      </div>
      <UniverseGate />
    </section>
  );
}
