import type { ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words to set in the accent italic. */
  emphasis?: string[];
  /** Hero text animates with CSS only, so first paint never waits on JS. */
  hero?: boolean;
  id?: string;
}

/** Splits text into words, each in a clipping mask, so lines can rise into view. */
export function MaskText({ text, as: Tag = "span", className = "", emphasis = [], hero, id }: Props) {
  const em = new Set(emphasis.map((w) => w.toLowerCase()));
  const words = text.split(" ");
  const attrs = hero ? {} : { "data-mask": "" };
  return (
    <Tag id={id} className={`${className} ${hero ? "hero-mask" : ""}`} {...attrs}>
      {words.map((word, i) => {
        const bare = word.replace(/[.,;:!?]/g, "").toLowerCase();
        return (
          <span key={i}>
            <span className="mask-w">
              <span
                className={`mask-i ${em.has(bare) ? "em" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
