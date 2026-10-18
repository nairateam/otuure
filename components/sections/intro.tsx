"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { useLenis } from "@/components/providers/smooth-scroll";
import { PinIcon } from "@/components/ui/icons";
import { photos } from "@/lib/photos";

const messages = [
  "So, a little about me ✨",
  "I’m Iyiola — Otuure to my community. A hair, beauty & lifestyle creator based in Lagos, specialising in natural hair care and an authentic, unfiltered lifestyle.",
  "As a hair care specialist and trichologist-in-training, I guide women to healthy, thriving hair — and help brands tell that story with integrity. 🌿",
];

/** How long "typing…" shows before each message lands (~500ms apart per the spec) */
const TYPING = 0.5;

export function Intro() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Once at 20% visible: rule draws in, card rises, then each message is "typed" in turn
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const scrollTrigger = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        const tl = gsap.timeline({ scrollTrigger, defaults: { ease: ease.enter } });
        tl.fromTo(q("[data-intro-rule]"), { scaleX: 0 }, { scaleX: 1, duration: duration.reveal }, 0)
          .fromTo(q("[data-intro-label]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: duration.reveal }, 0)
          .fromTo(q("[data-intro-card]"), { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: duration.reveal }, 0.15);

        q("[data-intro-message]").forEach((slot, i) => {
          const typing = slot.querySelector("[data-typing]");
          const bubble = slot.querySelector("[data-bubble]");
          const at = 0.55 + i * (TYPING + 0.35);
          tl.fromTo(typing, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.24 }, at)
            .to(typing, { autoAlpha: 0, duration: 0.16 }, at + TYPING)
            .fromTo(
              bubble,
              { autoAlpha: 0, y: 12, scale: 0.98 },
              { autoAlpha: 1, y: 0, scale: 1, duration: duration.standard },
              at + TYPING
            );
        });

        tl.fromTo(q("[data-intro-footer]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: duration.standard }, "-=0.2");
      });

      // Reduced motion: everything simply fades in together
      mm.add(REDUCED_MOTION, () => {
        gsap.set(q("[data-typing]"), { autoAlpha: 0 });
        gsap.fromTo(q(".reveal"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade, scrollTrigger });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  const goTo = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(href, { offset: -24, duration: 1.2 });
  };

  return (
    <section
      ref={root}
      id="info"
      className="flex flex-col items-center gap-stack-xl bg-cream px-gutter py-section"
    >
      <div className="flex items-center gap-3">
        <span data-intro-label className="reveal label font-bold text-accent">
          01
        </span>
        <span data-intro-rule className="h-px w-10 origin-left bg-muted" aria-hidden />
        <h2 data-intro-label className="reveal label text-muted">
          Say hello
        </h2>
      </div>

      <div
        data-intro-card
        className="reveal w-full max-w-[880px] overflow-hidden rounded-lg border border-line bg-card"
      >
        <ul className="flex flex-col items-start gap-[18px] px-5 py-8 sm:px-10 sm:py-12 lg:px-column lg:py-14">
          {messages.map((text, i) => (
            <li key={i} data-intro-message className={`relative ${i === 0 ? "w-fit" : "w-full"}`}>
              {/* "Typing…" sits where the message will land, so the card never jumps */}
              <span
                data-typing
                className="bubble invisible absolute top-0 left-0 bg-cream px-5 py-4 text-body opacity-0 sm:px-7 sm:py-[22px] sm:text-body-lg"
                aria-hidden
              >
                {/* One line tall, same as a short message */}
                <span className="flex h-[1lh] items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </span>
              <p
                data-bubble
                className="reveal bubble bg-cream px-5 py-4 text-body font-medium text-ink sm:px-7 sm:py-[22px] sm:text-body-lg"
              >
                {text}
              </p>
            </li>
          ))}
        </ul>

        <div
          data-intro-footer
          className="reveal flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-5 sm:px-7"
        >
          <div className="flex items-center gap-3.5">
            <Image src={photos.studioGlasses.src} alt="Iyiola" width={48} height={48} className="size-12 rounded-full object-cover" />
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-[22px] leading-tight font-semibold">Otuure</span>
              <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                <PinIcon className="size-3.5" />
                Pinned
              </span>
            </div>
          </div>

          <div className="flex overflow-hidden rounded-full border border-line text-button">
            <a
              href="#content"
              onClick={goTo("#content")}
              className="px-6 py-3.5 transition-colors duration-240 hover:bg-cream"
            >
              Learn more
            </a>
            <a
              href="#contact"
              onClick={goTo("#contact")}
              className="bg-ink px-6 py-3.5 text-white transition-colors duration-240 hover:bg-accent"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
