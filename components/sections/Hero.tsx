import { site } from "@/content/site";
import { bookingHref } from "@/lib/links";
import { MaskText } from "@/components/motion/MaskText";
import { Arrow } from "@/components/ui/Arrow";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { UniverseGate } from "@/components/universe/UniverseGate";

/**
 * The identity sits dead centre and never moves; the Systems Universe floats around it (components/universe).
 * Everything inside [data-hero-core] is text the animation must never cover.
 */
export function Hero() {
  return (
    <section className="hero hero-universe tone-ink" aria-labelledby="hero-title">
      <GlowBlob className="-left-1/3 -top-1/4" parallax={80} />
      <GlowBlob className="-right-1/4 top-1/3" parallax={-50} />
      <div className="wrap hero-center">
        <div className="hero-core" data-hero-core>
          <h1 id="hero-title" className="sr-only">{site.name}: {site.title}. {site.positioning}</h1>
          <MaskText as="p" hero className="display hero-name fs-hi" text={site.name} emphasis={["nelbin", "joseph"]} />
          <p className="hero-fade label label-accent hero-role" style={{ "--d": "0.1s" } as React.CSSProperties}>{site.title}</p>
          <p className="hero-fade lead hero-line" style={{ "--d": "0.16s" } as React.CSSProperties}>{site.positioning}</p>
          <div className="hero-fade hero-actions" style={{ "--d": "0.22s" } as React.CSSProperties}>
            <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-primary">Book a call <Arrow /></a>
            <a href="#work" className="btn btn-outline">See how it works <Arrow /></a>
          </div>
        </div>
      </div>
      <UniverseGate />
    </section>
  );
}
