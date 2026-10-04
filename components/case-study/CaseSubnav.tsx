"use client";

import { useEffect, useState } from "react";

export function CaseSubnav({ items }: { items: { id: string; label: string }[] }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="subnav tone-ink" aria-label="Case study sections">
      <div className="wrap">
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={current === i.id}>{i.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
