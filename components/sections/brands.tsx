"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { setIntent } from "@/lib/intent";
import { brands, brandsBlurb, education, type Brand } from "@/lib/brands";
import { useLenis } from "@/components/providers/smooth-scroll";
import { ArrowUpRight } from "@/components/ui/icons";

/*
 * "Brands & credentials": the trust section. Type and lines only, no photos — a rest for the
 * eye between the dark, photo-heavy Reach above and Philosophy below.
 *
 * 1200 and up: header row, 4 × 2 brand grid (170px cells), education beside its label.
 * 768–1199: header stacks, grid stays 4 × 2 at 140px.
 * Under 768: 2 × 4 grid at 110px; the label sits above the education rows.
 *
 * Grid lines are drawn as overlays (not cell borders) so they can draw in on entrance.
 * The same set serves both layouts: the 25% / 75% lines swap direction at 768.
 */

const NAME_STAGGER = 0.05;

const focusRing = "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink";

// Horizontal lines: rows at 50% (both layouts), plus 25% / 75% on the phone's four rows
const hLines = [
  { at: "top-0", className: "" },
  { at: "top-1/4", className: "md:hidden" },
  { at: "top-1/2", className: "" },
  { at: "top-3/4", className: "md:hidden" },
  { at: "bottom-0", className: "" },
];
// Vertical lines: columns at 50% (both layouts), plus 25% / 75% for four columns
const vLines = [
  { at: "left-0", className: "" },
  { at: "left-1/4", className: "max-md:hidden" },
  { at: "left-1/2", className: "" },
  { at: "left-3/4", className: "max-md:hidden" },
  { at: "right-0", className: "" },
];

export function Brands() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Entrance, once at 20% visible: header fades up, grid lines draw, names fade in diagonally, education slides up
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-brand-rule], [data-brand-hline]"), { scaleX: 0 });
        gsap.set(q("[data-brand-vline]"), { scaleY: 0 });

        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            // Diagonal from the top-left: delay by row + column in whichever grid is showing
            const cols = window.matchMedia("(min-width: 768px)").matches ? 4 : 2;
            const diagonal = (i: number) => (Math.floor(i / cols) + (i % cols)) * NAME_STAGGER;

            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .to(q("[data-brand-rule]"), { scaleX: 1, duration: duration.reveal }, 0)
              .fromTo(q("[data-brand-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.06 }, 0)
              .to(q("[data-brand-hline]"), { scaleX: 1, duration: 0.6, ease: ease.screen, stagger: 0.04 }, 0.2)
              .to(q("[data-brand-vline]"), { scaleY: 1, duration: 0.6, ease: ease.screen, stagger: 0.04 }, 0.3)
              .fromTo(q("[data-brand-name]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: duration.standard, stagger: diagonal }, 0.6)
              .fromTo(q("[data-brand-edu]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.08 }, 0.9);
          },
        });
      });

      // Reduced motion: no drawing or stagger, one short fade
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

  // A brand with content opens Selected work on the brand collabs
  const openCollab = () => {
    setIntent({ workFilter: "brand-collabs" });
    if (lenis) lenis.scrollTo("#work", { offset: -24, duration: 1.2 });
    else document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="brands" aria-labelledby="brands-heading" ref={root} className="bg-paper px-gutter py-section">
      <div className="flex flex-col gap-stack-md xl:flex-row xl:items-end xl:justify-between xl:gap-column">
        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center gap-3">
            <span data-brand-head className="reveal label font-bold text-accent">
              04
            </span>
            <span data-brand-rule className="h-px w-10 origin-left bg-muted" aria-hidden />
            <span data-brand-head className="reveal label text-muted">
              I’ve worked with
            </span>
          </div>
          <h2 id="brands-heading" data-brand-head className="reveal font-display text-headline">
            Brands that trust
            <br /> my voice.
          </h2>
        </div>
        <p data-brand-head className="reveal max-w-[400px] text-[15px] leading-relaxed text-muted xl:max-w-[340px]">
          {brandsBlurb}
        </p>
      </div>

      {/* Brand grid: a stockist list, names typeset rather than logos */}
      <div className="relative mt-stack-xl">
        <ul aria-label="Brands I’ve worked with" className="grid grid-cols-2 md:grid-cols-4">
          {brands.map((b) => (
            <li key={b.name} className="h-[110px] md:h-[140px] xl:h-[170px]">
              <BrandCell brand={b} onOpen={openCollab} />
            </li>
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {hLines.map((l) => (
            <span key={l.at} data-brand-hline className={`absolute inset-x-0 h-px origin-left bg-line ${l.at} ${l.className}`} />
          ))}
          {vLines.map((l) => (
            <span key={l.at} data-brand-vline className={`absolute inset-y-0 w-px origin-top bg-line ${l.at} ${l.className}`} />
          ))}
        </div>
      </div>

      {/* Education: the training behind the hair advice */}
      <div className="mt-column flex flex-col gap-stack-xs md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] md:gap-column">
        <p data-brand-edu className="reveal font-display text-[26px] leading-tight font-light italic md:pt-4">
          I’ve learned from
        </p>
        <ul>
          {education.map((c) => (
            <li
              key={c.school}
              data-brand-edu
              className="reveal grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-1 border-b border-line py-5 md:grid-cols-[auto_auto_minmax(0,1fr)]"
            >
              <span className="text-[13px] font-semibold text-accent tabular-nums">{c.year}</span>
              <span className="text-[18px] font-medium">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer" className={`link ${focusRing} focus-visible:outline-offset-4`}>
                    {c.school}
                  </a>
                ) : (
                  c.school
                )}
              </span>
              <span className="col-start-2 text-[13px] text-muted md:col-start-auto md:justify-self-end md:text-right">{c.course}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BrandCell({ brand, onOpen }: { brand: Brand; onOpen: () => void }) {
  const name = (
    <span
      data-brand-name
      className={`reveal font-display text-[22px] leading-tight text-balance md:text-[28px] xl:text-[34px] ${brand.style}`}
    >
      {brand.name}
    </span>
  );
  const cell = "flex size-full flex-col items-center justify-center gap-1.5 px-3 text-center";

  // No content yet: a plain name with a faint tint on hover, not a link
  if (!brand.collab) {
    return <div className={`${cell} transition-colors duration-240 hover:bg-cream`}>{name}</div>;
  }

  // Content to show: fills ink on hover, with the note underneath (always in the label for keyboard and screen readers)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${brand.name} collaboration, ${brand.collab.note}`}
      className={`group relative ${cell} transition-colors duration-240 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper ${focusRing}`}
    >
      {name}
      <span className="flex items-center gap-1 text-[12px] font-medium opacity-0 transition-opacity duration-240 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:hidden">
        {brand.collab.note} — View <ArrowUpRight className="size-3.5" />
      </span>
      {/* Touch screens get no hover, so clickable brands show a small arrow all the time */}
      <ArrowUpRight className="absolute top-3 right-3 hidden size-4 text-muted pointer-coarse:block" />
    </button>
  );
}
