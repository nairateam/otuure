"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, REDUCED_MOTION } from "@/lib/motion";
import { INTRO_KEY, introSeen, revealPage } from "@/lib/intro";
import { useLenis } from "@/components/providers/smooth-scroll";
import { heroSlides, site } from "@/lib/site";

// Four portraits flicker behind the counter; the first is the hero framing it settles on.
// TODO: swap in four distinct portraits once they exist.
const flicker = heroSlides.slice(0, 4);

const COUNT_START = 0.3;
const COUNT_DURATION = 3;
/** How long "Otuure." holds before the curtain lifts */
const NAME_HOLD = 0.9;
const CURTAIN_DURATION = 1;
const FLICKER_MS = 200;
/** Never trap the visitor behind the curtain if an image hangs */
const LOAD_TIMEOUT_MS = 10_000;

const pad = (n: number) => `‘${String(Math.round(n)).padStart(3, "0")}`;

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();

  // Page stays put while the curtain is down
  useEffect(() => {
    if (gone || introSeen()) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [gone, lenis]);

  useGSAP(
    () => {
      if (introSeen()) {
        revealPage();
        return;
      }

      const q = gsap.utils.selector(root);
      const count = q("[data-pl-count]")[0];
      const word = q("[data-pl-word]")[0];
      const frames = q("[data-pl-frame]");
      const reduced = window.matchMedia(REDUCED_MOTION).matches;

      // Real loading: the hero photo plus the flicker portraits
      const images = [
        document.querySelector<HTMLImageElement>("[data-hero-image]"),
        ...q("[data-pl-frame] img"),
      ].filter(Boolean) as HTMLImageElement[];
      let loaded = 0;
      const total = Math.max(images.length, 1);
      const cleanups: (() => void)[] = [];
      const ready = new Promise<void>((resolve) => {
        const done = () => {
          loaded += 1;
          if (loaded >= total) resolve();
        };
        if (!images.length) resolve();
        images.forEach((img) => {
          if (img.complete) return done();
          const once = () => {
            img.removeEventListener("load", once);
            img.removeEventListener("error", once);
            done();
          };
          img.addEventListener("load", once);
          img.addEventListener("error", once);
          cleanups.push(once);
        });
        const timeout = setTimeout(() => {
          loaded = total;
          resolve();
        }, LOAD_TIMEOUT_MS);
        cleanups.push(() => clearTimeout(timeout));
      });

      const finish = () => {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
        setGone(true);
      };

      gsap.set(word, { xPercent: -50, yPercent: 110, autoAlpha: 1 });

      // Reduced motion: wordmark only, then a short fade once the hero photo is in
      if (reduced) {
        gsap.set(word, { yPercent: 0 });
        let cancelled = false;
        ready.then(() => {
          if (cancelled) return;
          revealPage();
          gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: finish });
        });
        return () => {
          cancelled = true;
          cleanups.forEach((c) => c());
        };
      }

      // 01 Black open: counter fades in
      gsap.fromTo(count, { autoAlpha: 0 }, { autoAlpha: 1, duration: COUNT_START, ease: "none" });

      // 02 Count + flicker. `time` is the scripted ease-out count; `cap` follows real loading,
      // holding near 90 until every first-screen image is in.
      const state = { time: 0, cap: 10, shown: 0 };
      gsap.to(state, { time: 100, duration: COUNT_DURATION, delay: COUNT_START, ease: "power2.out" });
      gsap.fromTo(q("[data-pl-photo]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay: COUNT_START });

      let frame = 0;
      const showFrame = (i: number) => gsap.set(frames, { autoAlpha: (j: number) => (j === i ? 1 : 0) });
      const flick = setInterval(() => showFrame((frame = (frame + 1) % frames.length)), FLICKER_MS);

      let outro: gsap.core.Timeline | null = null;
      const bar = q("[data-pl-bar]");
      const tick = () => {
        const target = loaded >= total ? 100 : 10 + (80 * loaded) / total;
        state.cap += (target - state.cap) * (1 - Math.pow(0.85, gsap.ticker.deltaRatio()));
        if (target - state.cap < 0.5) state.cap = target;
        state.shown = Math.min(state.time, state.cap);
        count.textContent = pad(state.shown);
        gsap.set(bar, { scaleX: state.shown / 100 });
        if (state.shown >= 100 && !outro) playOutro();
      };
      gsap.ticker.add(tick);

      // 03 Name: counter rolls out, wordmark rolls in, the photo settles on the hero portrait.
      // 04 Curtain: the whole panel lifts while the hero entrance plays underneath.
      const playOutro = () => {
        gsap.ticker.remove(tick);
        clearInterval(flick);
        showFrame(0);
        outro = gsap
          .timeline({ onComplete: finish })
          .to(count, { yPercent: -110, duration: 0.4, ease: ease.enter }, 0)
          .to(word, { yPercent: 0, duration: 0.5, ease: ease.enter }, 0.08)
          .to(q("[data-pl-photo]"), { scale: 1.35, y: "-6vh", duration: 0.6, ease: ease.enter }, 0)
          .to(q("[data-pl-slot]"), { y: "25vh", duration: 0.6, ease: ease.enter }, 0)
          .to(q("[data-pl-dim]"), { autoAlpha: 0, duration: 0.4 }, 0)
          .call(revealPage, [], NAME_HOLD)
          .to(root.current, { yPercent: -100, duration: CURTAIN_DURATION, ease: ease.screen }, NAME_HOLD);
      };

      return () => {
        gsap.ticker.remove(tick);
        clearInterval(flick);
        cleanups.forEach((c) => c());
      };
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div
      ref={root}
      data-preloader
      aria-hidden
      className="fixed inset-0 z-[100] overflow-hidden bg-ink text-white will-change-transform"
    >
      {/* Small, dimmed photo window that flips through portraits */}
      <div className="absolute inset-0 grid place-items-center">
        <div data-pl-photo className="relative aspect-[3/4] w-[clamp(150px,17vw,250px)] overflow-hidden opacity-0">
          {flicker.map((s, i) => (
            <div key={i} data-pl-frame className={`absolute inset-0 overflow-hidden ${i ? "invisible opacity-0" : ""}`}>
              <div className="absolute inset-0" style={{ transform: s.zoom ? `scale(${s.zoom})` : undefined }}>
                <Image
                  src={s.src}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 340px, 210px"
                  className="object-cover"
                  style={{ objectPosition: s.position }}
                />
              </div>
            </div>
          ))}
          <div data-pl-dim className="absolute inset-0 bg-ink/45" />
        </div>
      </div>

      {/* Counter, then the wordmark rolling up into its place */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          data-pl-slot
          className="relative overflow-y-clip pb-[0.1em] font-display text-[clamp(4rem,2.5rem+6vw,7.5rem)] leading-none italic"
        >
          <span data-pl-count className="block font-light tabular-nums opacity-0">
            {pad(0)}
          </span>
          <span data-pl-word className="absolute top-0 left-1/2 block font-medium whitespace-nowrap opacity-0">
            {site.wordmark}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-gutter pb-8 text-[11px] font-bold md:text-[12px]">
        <p className="label leading-snug">
          Iyiola
          <br />
          Oluwagbemisola
        </p>
        <p className="label text-white/45">Lagos, NG — 2026</p>
      </div>

      {/* Progress line along the bottom edge */}
      <div data-pl-bar className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-accent-on-dark" />
    </div>
  );
}
