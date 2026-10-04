/** Soft violet/blue glow behind a section. Static and GPU-composited; `parallax` drifts it on scroll. */
export function GlowBlob({ className = "", parallax }: { className?: string; parallax?: number }) {
  return (
    <div aria-hidden="true" className={`glow ${className}`} data-parallax={parallax}>
      <div className="glow-core" />
    </div>
  );
}
