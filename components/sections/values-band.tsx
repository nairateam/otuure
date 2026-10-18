import { AsteriskIcon } from "@/components/ui/icons";

/*
 * Values band: her values on a continuous loop between Philosophy and Featured.
 * One pass per 40s, pauses on hover, stands still with reduced motion.
 *
 * The track holds the list twice and slides left by half its width, so the second copy
 * lands exactly where the first began. Each copy repeats the values twice so it is always
 * wider than the screen. Spacing is padding on each item (not flex gap) to keep the halves equal.
 */

const values = ["Empowerment", "Style", "Self-confidence", "Education", "Community", "Sustainability"];

function Copy({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0" aria-hidden={hidden} aria-label={hidden ? undefined : "My values"}>
      {[...values, ...values].map((v, i) => (
        <li
          key={i}
          // The repeat inside a copy is decoration too
          aria-hidden={i >= values.length || undefined}
          className="flex shrink-0 items-center gap-10 pr-10"
        >
          <span className="font-display text-italic font-light whitespace-nowrap italic">{v}</span>
          <AsteriskIcon className="size-[22px] text-accent-on-dark" />
        </li>
      ))}
    </ul>
  );
}

export function ValuesBand() {
  return (
    <section aria-label="Values" className="overflow-hidden bg-ink py-9 text-white">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        <Copy />
        <Copy hidden />
      </div>
    </section>
  );
}
