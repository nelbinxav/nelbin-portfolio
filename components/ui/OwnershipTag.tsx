import type { OwnershipLevel } from "@/content/ownership";

export function OwnershipTag({ level, note }: { level: OwnershipLevel; note?: string }) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span className="own" data-level={level}>
        {level}
      </span>
      {note ? <span className="text-[0.8rem] leading-snug text-[var(--muted)]">{note}</span> : null}
    </span>
  );
}
