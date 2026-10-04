import { site } from "@/content/site";
import { bookingHref, emailHref, linkedinHref, githubHref } from "@/lib/links";
import { Arrow } from "@/components/ui/Arrow";
import { GlowBlob } from "@/components/ui/GlowBlob";
import { MaskText } from "@/components/motion/MaskText";

export function SiteFooter() {
  return (
    <footer id="contact" className="tone-deep section scroll-mt-[var(--nav-h)] overflow-clip">
      <GlowBlob className="left-1/4 -bottom-1/2" parallax={-40} />
      <div className="wrap relative z-[1]">
        <p className="label label-accent" data-reveal>Contact</p>
        <MaskText
          as="h2"
          className="display mt-6 max-w-[22ch] fs-h2"
          text="If a process still runs on copy and paste, it can probably run itself."
          emphasis={["run", "itself."]}
        />
        <p className="lead mt-8" data-reveal>
          Tell me what your team repeats every week. I will tell you honestly whether it is worth automating, and how I would build it.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5" data-reveal>
          <a href={bookingHref()} target="_blank" rel="noopener" className="btn btn-primary">Book a call <Arrow /></a>
          <a href={emailHref()} className="btn btn-ghost">{site.links.email} <Arrow /></a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3" data-reveal>
          <li><a href={linkedinHref()} target="_blank" rel="noopener" className="label hover:text-[var(--fg)]">LinkedIn ↗</a></li>
          <li><a href={githubHref()} target="_blank" rel="noopener" className="label hover:text-[var(--fg)]">GitHub ↗</a></li>
        </ul>
        <div className="mt-24 flex flex-wrap justify-between gap-4 border-t border-[var(--line)] pt-6 text-[0.85rem] text-[var(--muted)]">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>{site.currentRole}, {site.org}</span>
        </div>
      </div>
    </footer>
  );
}
