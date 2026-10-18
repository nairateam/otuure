"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { ebooks, ebooksNote, type Ebook } from "@/lib/ebooks";
import { socials } from "@/lib/site";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";

/*
 * "Now available": her two hair care eBooks. Dark night section after Featured.
 *
 * 1280 and up: covers panel (620 × 640) beside the text column.
 * Under 1280: covers panel on top (up to 620 wide, keeps its proportions), text underneath.
 * Hovering or focusing a book row lifts its cover in the panel.
 */

// Cover boxes as a share of the 620 × 640 panel, so they scale with it
const coverBoxes = [
  "left-[11.3%] top-[14.1%] w-[47.7%] h-[72.2%] rotate-[-4deg] origin-top-left z-0",
  "left-[48.4%] top-[17.2%] w-[43.5%] h-[71.25%] z-10",
];

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export function Ebooks() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // Entrance, once at 20% visible: covers rise and settle, rule draws, headline rises line by line, the rest fades up
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-ebook-rule]"), { scaleX: 0 });

        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            const headline = q("[data-ebook-headline]")[0];
            const split = SplitText.create(headline, { type: "lines", mask: "lines" });

            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .fromTo(q("[data-ebook-panel]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reveal, ease: "none" }, 0)
              .fromTo(q("[data-ebook-cover]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: duration.hero, stagger: 0.15 }, 0.15)
              .to(q("[data-ebook-rule]"), { scaleX: 1, duration: duration.reveal }, 0.1)
              .fromTo(q("[data-ebook-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.06 }, 0.1)
              .set(headline, { autoAlpha: 1 }, 0.2)
              .fromTo(
                split.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: duration.reveal, stagger: 0.08, onComplete: () => split.revert() },
                0.2
              )
              .fromTo(q("[data-ebook-body]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.08 }, 0.45);
          },
        });
      });

      // Reduced motion: one short fade
      mm.add(REDUCED_MOTION, () => {
        ScrollTrigger.create({
          ...start,
          onEnter: () => gsap.fromTo(q(".reveal"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade }),
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="ebook"
      aria-labelledby="ebook-heading"
      className="flex flex-col gap-column bg-night px-gutter py-section text-white xl:flex-row xl:items-center"
    >
      {/* Covers panel: decorative, the books are listed as links in the text column */}
      <div
        data-ebook-panel
        aria-hidden
        className="reveal relative aspect-[620/640] w-full max-w-[620px] overflow-hidden rounded-lg bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,#4a3a30_0%,var(--color-night)_100%)] xl:w-[44%] xl:shrink-0"
      >
        {ebooks.map((b, i) => (
          <div key={b.title} className={`absolute ${coverBoxes[i]}`}>
            <div
              data-ebook-cover
              className={`reveal @container size-full transition-[translate] duration-480 ease-enter ${active === i ? "motion-safe:-translate-y-3" : ""}`}
            >
              <Cover book={b} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-stack-lg">
        <div className="flex items-center gap-3">
          <span data-ebook-head className="reveal label font-bold text-accent-on-dark">
            07
          </span>
          <span data-ebook-rule className="h-px w-10 origin-left bg-white/40" aria-hidden />
          <span data-ebook-head className="reveal label text-white/65">
            Now available
          </span>
        </div>

        <h2 id="ebook-heading" data-ebook-headline className="reveal font-display text-headline">
          My exclusive hair care eBooks.
        </h2>

        <p data-ebook-body className="reveal max-w-[640px] text-[17px] leading-[1.6] text-white/70">
          Everything I’ve learned about growing and caring for natural, relaxed and texturized hair — distilled into simple,
          practical guides you can follow at home.
        </p>

        <ul data-ebook-body className="reveal max-w-[640px]">
          {ebooks.map((b, i) => (
            <li key={b.title} className="border-t border-white/15">
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${b.title}: ${b.subtitle}, opens Instagram in a new tab`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`group flex items-center justify-between gap-6 py-[22px] ${focusRing}`}
              >
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-display text-[22px] leading-tight italic md:text-[26px]">{b.title}</span>
                  <span className="text-[15px] text-white/60">{b.subtitle}</span>
                </span>
                <ArrowUpRight className="size-[22px] shrink-0 transition-transform duration-240 ease-enter group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </li>
          ))}
        </ul>

        <div data-ebook-body className="reveal flex flex-col items-start gap-stack-xs sm:flex-row sm:items-center sm:gap-5">
          <a
            href={socials.instagram}
            target="_blank"
            rel="noreferrer"
            className={`btn bg-accent text-white hover:bg-accent-on-dark ${focusRing}`}
          >
            Get the eBook
            <span data-arrow>
              <ArrowRight className="size-[18px]" />
            </span>
          </a>
          <p className="text-[14px] text-white/60">{ebooksNote}</p>
        </div>
      </div>
    </section>
  );
}

// TODO: replace with the real cover art (the design's covers are embedded images, not in /public yet).
function Cover({ book }: { book: Ebook }) {
  const { background, text, accent } = book.cover;
  return (
    <div
      className={`flex size-full flex-col justify-between rounded-[6px] p-[9cqw] shadow-book ${background} ${text}`}
    >
      <span className={`text-[4.2cqw] font-semibold tracking-[0.2em] uppercase ${accent}`}>eBook</span>
      <span className="font-display text-[13cqw] leading-[0.98] font-light tracking-[-0.02em] text-balance">{book.title}</span>
      <span className={`font-display text-[6cqw] italic ${accent}`}>Otuure.</span>
    </div>
  );
}
