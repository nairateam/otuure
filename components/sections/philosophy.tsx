"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { photos } from "@/lib/photos";

/*
 * "As a creative": the philosophy section. Arched portrait on the left, her statement and
 * two promises (to brands, to her audience) on the right.
 *
 * 1280 and up: photo (up to 560 × 760) beside the text column.
 * Under 1280: photo on top (up to 560 wide), text underneath; the promises stack on phones.
 */

const photo = { ...photos.longCurls, position: "50% 35%" };

const promises = [
  {
    title: "To brands",
    text: "I advocate for every brand I partner with — conveying your values and vision with integrity, professionalism and creativity.",
  },
  {
    title: "To my audience",
    text: "Daily tips, honest product recommendations and style inspiration to help women express themselves through hair, fashion and lifestyle.",
  },
];

export function Philosophy() {
  const root = useRef<HTMLElement>(null);

  // Entrance, once at 20% visible: photo settles, rule draws, statement rises line by line, the rest fades up
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-phil-rule]"), { scaleX: 0 });

        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            const statement = q("[data-phil-statement]")[0];
            const split = SplitText.create(statement, { type: "lines", mask: "lines" });

            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .fromTo(q("[data-phil-photo]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reveal, ease: "none" }, 0)
              .fromTo(q("[data-phil-img]"), { scale: 1.08 }, { scale: 1, duration: 1.6 }, 0)
              .to(q("[data-phil-rule]"), { scaleX: 1, duration: duration.reveal }, 0.1)
              .fromTo(q("[data-phil-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.06 }, 0.1)
              .set(statement, { autoAlpha: 1 }, 0.2)
              .fromTo(
                split.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: duration.reveal, stagger: 0.08, onComplete: () => split.revert() },
                0.2
              )
              .fromTo(q("[data-phil-body]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.08 }, 0.5)
              .fromTo(q("[data-phil-tag]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: duration.standard }, 0.8);
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
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="flex flex-col gap-column bg-cream px-gutter py-section xl:flex-row xl:items-center"
    >
      <div data-phil-photo className="reveal relative aspect-[560/760] w-full max-w-[560px] xl:w-[44%] xl:shrink-0">
        <div className="arch absolute inset-0 overflow-hidden">
          <div data-phil-img className="absolute inset-0">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1280px) 560px, (min-width: 640px) 560px, 100vw"
              className="object-cover"
              style={{ objectPosition: photo.position }}
            />
          </div>
        </div>
        <p
          data-phil-tag
          className="reveal absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-[13px] font-semibold"
        >
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          Lagos, Nigeria
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-stack-xl">
        <div className="flex items-center gap-3">
          <span data-phil-head className="reveal label font-bold text-accent">
            05
          </span>
          <span data-phil-rule className="h-px w-10 origin-left bg-muted" aria-hidden />
          <h2 id="philosophy-heading" data-phil-head className="reveal label text-muted">
            As a creative
          </h2>
        </div>

        <p data-phil-statement className="reveal font-display text-statement tracking-[-0.03em]">
          Helping women — and the brands they love — embrace the beauty of natural hair.
        </p>

        <p data-phil-body className="reveal max-w-[680px] text-[17px] leading-[1.6] text-muted">
          In today’s beauty-driven space, it matters that people feel confident and informed while showing up as their
          authentic selves. Through my content and coaching, I inspire and educate on the journey to healthy, vibrant hair
          and self-care.
        </p>

        <ul data-phil-body className="reveal grid max-w-[680px] gap-stack-md border-t border-line pt-stack-md sm:grid-cols-2 sm:gap-stack-lg">
          {promises.map((p) => (
            <li key={p.title} className="flex flex-col gap-stack-xs">
              <h3 className="font-display text-[26px] leading-tight italic">{p.title}</h3>
              <p className="leading-[1.55] text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
