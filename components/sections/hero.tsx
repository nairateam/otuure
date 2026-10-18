"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, stagger, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { useLenis } from "@/components/providers/smooth-scroll";
import { heroSlides, sections, site, socials } from "@/lib/site";
import { onReveal } from "@/lib/intro";
import { ArrowRight, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";
import { photos } from "@/lib/photos";

const headline = ["Natural hair,", "honestly told."];

/** How long each background stays before moving to the next section */
const SLIDE_SECONDS = 4;
/** Crossfade between backgrounds */
const CROSSFADE_SECONDS = 0.8;
/** First slide waits for the hero entrance to finish */
const FIRST_SLIDE_DELAY = 1.2;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [typing, setTyping] = useState(true);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  // Slideshow bookkeeping: the running progress tween, the slide we came from,
  // and the reasons the timer is held (hovering the nav, hero scrolled out of view).
  const progress = useRef<gsap.core.Tween | null>(null);
  const previous = useRef(0);
  // Starts held for the preloader; released when the curtain lifts.
  const holds = useRef(new Set<string>(["intro"]));

  const setHold = (reason: string, on: boolean) => {
    if (on) holds.current.add(reason);
    else holds.current.delete(reason);
    if (holds.current.size) progress.current?.pause();
    else progress.current?.resume();
  };

  // Crossfade to the active slide and run its progress bar; when the bar fills, move on.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const layers = q("[data-slide]");
      const bars = q("[data-slide-bar]");
      const from = previous.current;
      const reduced = window.matchMedia(REDUCED_MOTION).matches;
      previous.current = active;

      if (from !== active) {
        const hideOthers = () =>
          gsap.set(layers.filter((_, i) => i !== active), { autoAlpha: 0 });
        gsap.set(layers, { zIndex: (i: number) => (i === active ? 2 : i === from ? 1 : 0) });
        if (reduced) {
          gsap.fromTo(layers[active], { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade, onComplete: hideOthers });
        } else {
          gsap.fromTo(
            layers[active],
            { autoAlpha: 0, scale: 1.06 },
            { autoAlpha: 1, scale: 1, duration: CROSSFADE_SECONDS, ease: ease.enter, overwrite: true, onComplete: hideOthers }
          );
        }
      }

      gsap.set(bars, { scaleX: 0 });
      // Reduced motion: no auto-advance, the active bar is simply shown full
      if (reduced) {
        gsap.set(bars[active], { scaleX: 1 });
        return;
      }

      const tween = gsap.fromTo(
        bars[active],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: SLIDE_SECONDS,
          ease: "none",
          delay: from === active ? FIRST_SLIDE_DELAY : 0,
          onComplete: () => setActive((a) => (a + 1) % heroSlides.length),
        }
      );
      if (holds.current.size) tween.pause();
      progress.current = tween;
      return () => tween.kill();
    },
    { dependencies: [active], scope: root }
  );

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Hero A: photo settles, name lines rise from a mask, copy fades up, frosted bar last
      mm.add(FULL_MOTION, () => {
        // Waits under the preloader curtain and plays as it lifts
        const tl = gsap.timeline({ paused: true, defaults: { ease: ease.enter } });
        const hidden = { autoAlpha: 0, y: 24 };
        const shown = { autoAlpha: 1, y: 0, duration: duration.reveal };
        tl.fromTo(q("[data-hero-photo]"), { scale: 1.08 }, { scale: 1, duration: 1.6 }, 0)
          .fromTo(
            q("[data-hero-line]"),
            { yPercent: 110, autoAlpha: 1 },
            { yPercent: 0, duration: duration.hero, stagger },
            0.2
          )
          .fromTo(q("[data-hero-fade]"), hidden, { ...shown, stagger }, 0.7)
          .fromTo(q("[data-hero-bubble]"), { ...hidden, scale: 0.96 }, { ...shown, scale: 1 }, 0.9)
          .call(() => setTyping(false), [], 0.9 + 0.9)
          .fromTo(q("[data-hero-bar]"), { autoAlpha: 0, y: 40 }, shown, 1.0);

        // Depth on scroll: photo moves slower than the page, the name faster
        const scroll = () => ({ trigger: root.current, start: "top top", end: "bottom top", scrub: true });
        gsap.to(q("[data-hero-photo-wrap]"), { yPercent: 18, ease: "none", scrollTrigger: scroll() });
        gsap.to(q("[data-hero-name]"), { y: -120, ease: "none", scrollTrigger: scroll() });

        return onReveal(() => tl.play());
      });

      // Reduced motion: short fades only, no depth or zoom
      mm.add(REDUCED_MOTION, () => {
        const fade = gsap.fromTo(q(".reveal"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade, paused: true });
        setTyping(false);
        return onReveal(() => fade.play());
      });

      const offIntro = onReveal(() => setHold("intro", false));

      // Hold the slideshow while the hero is out of view
      const visibility = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setHold("offscreen", !self.isActive),
      });

      return () => {
        mm.revert();
        visibility.kill();
        offIntro();
      };
    },
    { scope: root }
  );

  const goTo = (href: string) => lenis?.scrollTo(href, { offset: -24, duration: 1.2 });

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-night px-gutter pt-32 pb-10 text-white"
    >
      {/* Background slides (one per section) + scrim */}
      <div data-hero-photo-wrap className="absolute inset-0">
        <div data-hero-photo className="absolute inset-0 will-change-transform">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              data-slide
              className={`absolute inset-0 overflow-hidden ${i === 0 ? "" : "invisible opacity-0"}`}
              aria-hidden={i !== active}
            >
              <div className="absolute inset-0" style={{ transform: slide.zoom ? `scale(${slide.zoom})` : undefined }}>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  preload={i === 0}
                  data-hero-image={i === 0 ? true : undefined}
                  loading={i === 0 ? undefined : "eager"}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: slide.position }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,#1C171480_0%,#1C171400_30%,#1C171499_60%,#1C1714F2_100%)]"
        aria-hidden
      />

      {/* Chat bubble: "typing…" for ~0.9s, then the message */}
      <div
        data-hero-bubble
        className="reveal bubble absolute top-[24%] right-gutter z-10 hidden max-w-[420px] items-center gap-2.5 bg-white/92 px-[22px] py-4 text-ink md:flex xl:right-auto xl:left-[62%] xl:max-w-none xl:whitespace-nowrap"
        aria-live="polite"
      >
        <Image src={photos.studioGlasses.src} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full object-cover" />
        {typing ? (
          <span className="flex h-[22px] items-center gap-1 px-1" aria-label="Iyiola is typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        ) : (
          <p className="text-body font-semibold">Hey, I’m Iyiola — welcome to my world of healthy hair 🌿</p>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-stack-md">
        <div className="flex flex-col gap-7">
          <h1 data-hero-name className="font-display text-hero">
            {headline.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="reveal block">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <nav
            aria-label="Sections"
            data-hero-fade
            className="reveal grid grid-cols-3 gap-y-4 border-t border-white/20 pt-5 md:flex md:justify-between"
            onMouseLeave={() => setHold("hover", false)}
            onBlur={() => setHold("hover", false)}
          >
            {/* Each label is tied to a background; the active one is lit with a progress line */}
            {sections.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(s.href);
                }}
                onMouseEnter={() => {
                  setHold("hover", true);
                  setActive(i);
                }}
                onFocus={() => {
                  setHold("hover", true);
                  setActive(i);
                }}
                aria-current={i === active ? "true" : undefined}
                className={`label relative w-fit text-[13px] font-bold text-white transition-opacity duration-240 md:text-[14px] ${
                  i === active ? "opacity-100" : "opacity-55 hover:opacity-100"
                }`}
              >
                {s.label}
                <span
                  data-slide-bar
                  aria-hidden
                  className="absolute right-0 -bottom-1.5 left-0 h-px origin-left scale-x-0 bg-white md:top-[-21px] md:bottom-auto"
                />
              </a>
            ))}
          </nav>
        </div>

        {/* Frosted bar */}
        <div
          data-hero-bar
          className="reveal glass flex flex-col gap-4 rounded-[14px] p-4 sm:flex-row sm:items-center sm:justify-between sm:py-3.5 sm:pr-3.5 sm:pl-6"
        >
          <p className="flex flex-col gap-0.5 text-[15px] lg:flex-row lg:gap-3">
            <span className="font-bold">{site.name}</span>
            <span className="text-white/70">{site.role}</span>
          </p>

          <div className="flex items-center justify-between gap-6 sm:justify-start">
            <div className="flex items-center gap-6">
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-opacity duration-240 hover:opacity-70">
                <InstagramIcon className="size-[22px]" />
              </a>
              <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="transition-opacity duration-240 hover:opacity-70">
                <TikTokIcon className="size-[22px]" />
              </a>
              <a href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="transition-opacity duration-240 hover:opacity-70">
                <YouTubeIcon className="size-[22px]" />
              </a>
            </div>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                goTo("#contact");
              }}
              className="btn rounded-sm bg-accent whitespace-nowrap px-[22px] py-3.5 text-paper"
            >
              Partner with me <ArrowRight className="size-4" data-arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
