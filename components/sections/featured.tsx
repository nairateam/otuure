"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { photos } from "@/lib/photos";

/*
 * "Featured in": the Miss Natural Beauty Africa magazine feature.
 *
 * 1280 and up: text column beside the image stack (620 × 660: main image + inset portrait).
 * Under 1280: text on top, image stack underneath (scales down, keeps its proportions).
 * The inset portrait drifts at a different scroll speed from the main image (depth).
 */

// TODO: swap the main image for the magazine cover / feature spread when it is available.
const feature = { ...photos.ankaraDress, position: "50% 40%" };
const inset = { ...photos.studioGlasses, position: "50% 30%" };

const stats = [
  { value: "19,423", label: "Engagements & impressions reached" },
  { value: "Honoree", label: "“Embracing Your True Worth” social media challenge" },
];

export function Featured() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-feat-rule]"), { scaleX: 0 });

        // Entrance, once at 20% visible: rule draws, headline rises line by line, the rest fades up, images settle
        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            const headline = q("[data-feat-headline]")[0];
            const split = SplitText.create(headline, { type: "lines", mask: "lines" });

            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .to(q("[data-feat-rule]"), { scaleX: 1, duration: duration.reveal }, 0)
              .fromTo(q("[data-feat-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal }, 0)
              .set(headline, { autoAlpha: 1 }, 0.1)
              .fromTo(
                split.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: duration.reveal, stagger: 0.08, onComplete: () => split.revert() },
                0.1
              )
              .fromTo(q("[data-feat-body]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.08 }, 0.35)
              .fromTo(q("[data-feat-main]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reveal, ease: "none" }, 0.1)
              .fromTo(q("[data-feat-main-img]"), { scale: 1.08 }, { scale: 1, duration: 1.6 }, 0.1)
              .fromTo(q("[data-feat-inset]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.standard, ease: "none" }, 0.5);
          },
        });

        // Depth: the inset drifts upward faster than the page as the section scrolls past
        gsap.fromTo(
          q("[data-feat-inset-drift]"),
          { yPercent: 18 },
          {
            yPercent: -18,
            ease: "none",
            scrollTrigger: { trigger: q("[data-feat-stack]")[0], start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      // Reduced motion: no depth, one short fade
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
      id="featured"
      aria-labelledby="featured-heading"
      className="flex flex-col gap-column bg-paper px-gutter py-section xl:flex-row xl:items-center"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-stack-lg">
        <div className="flex items-center gap-3">
          <span data-feat-head className="reveal label font-bold text-accent">
            06
          </span>
          <span data-feat-rule className="h-px w-10 origin-left bg-muted" aria-hidden />
          <span data-feat-head className="reveal label text-muted">
            Featured in
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <h2 id="featured-heading" data-feat-headline className="reveal font-display text-headline">
            Miss Natural Beauty Africa
          </h2>
          <p data-feat-body className="reveal font-display text-italic font-light text-accent italic">
            2024 / 2025 Magazine Edition
          </p>
        </div>

        <p data-feat-body className="reveal max-w-[640px] text-[17px] leading-[1.6] text-muted">
          Recognised for my commitment to adding value to the natural hair and beauty community — a feature celebrating the
          essence of natural beauty and inspiring others to rediscover their authentic selves.
        </p>

        <dl data-feat-body className="reveal grid max-w-[640px] gap-stack-md border-t border-line pt-stack-md sm:grid-cols-2 sm:gap-stack-lg">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-2">
              <dt className="text-[15px] leading-[1.4] text-muted">{s.label}</dt>
              <dd className="font-display text-[clamp(2.25rem,1.8rem+1.2vw,3rem)] leading-none tracking-[-0.03em]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Image stack: 620 × 660 at full size, scaled down as one block on smaller screens */}
      <div data-feat-stack className="relative aspect-[620/660] w-full max-w-[620px] xl:w-[44%] xl:shrink-0">
        <div data-feat-main className="reveal absolute top-0 left-0 h-[83%] w-[90.3%] overflow-hidden rounded-md">
          <div data-feat-main-img className="absolute inset-0">
            <Image
              src={feature.src}
              alt={feature.alt}
              fill
              sizes="(min-width: 1280px) 560px, 90vw"
              className="object-cover"
              style={{ objectPosition: feature.position }}
            />
          </div>
        </div>
        <div data-feat-inset-drift className="absolute top-[57.6%] left-[64.5%] h-[42.4%] w-[35.5%]">
          <div data-feat-inset className="reveal relative size-full overflow-hidden rounded-[12px] outline-8 outline-paper">
            <Image
              src={inset.src}
              alt={inset.alt}
              fill
              sizes="(min-width: 1280px) 220px, 36vw"
              className="object-cover"
              style={{ objectPosition: inset.position }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
