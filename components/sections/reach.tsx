"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { setIntent } from "@/lib/intent";
import { countLabel, formatCount, reach, reachCards, type ReachCard } from "@/lib/reach";
import { platformLabel, type Platform } from "@/lib/work";
import { useLenis } from "@/components/providers/smooth-scroll";
import { ArrowUpRight, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";
import { photos } from "@/lib/photos";

/*
 * "Audience & reach": the numbers section, aimed at brands. Three platform cards in the
 * korty.tv style — full photo, handle on top, follower count at the bottom.
 *
 * 1200 and up: header row, three 640px cards in a row.
 * 768–1199: header stacks, cards stay three across at 520px, the two small stats stack.
 * Under 768: sideways swipe row (85vw cards, next one peeking in) with dots underneath.
 *
 * The final numbers are in the markup; the count-up only rewrites the text once on screen.
 */

const CARD_STAGGER = 0.1;
const COUNT_DURATION = 1.2;

const platformIcon: Record<Platform, (p: { className?: string }) => React.ReactNode> = {
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
};

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export function Reach() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const lenis = useLenis();
  const [current, setCurrent] = useState(0);

  // Entrance, once at 20% visible: header fades up, cards rise 100ms apart, numbers count up, stats follow
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const counts = q("[data-reach-count]") as HTMLElement[];
      const final = (el: HTMLElement) => formatCount(Number(el.dataset.value), Number(el.dataset.decimals));
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-reach-rule]"), { scaleX: 0 });
        counts.forEach((el) => (el.textContent = formatCount(0, Number(el.dataset.decimals))));

        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            const tl = gsap
              .timeline({ defaults: { ease: ease.enter } })
              .fromTo(q("[data-reach-rule]"), { scaleX: 0 }, { scaleX: 1, duration: duration.reveal }, 0)
              .fromTo(q("[data-reach-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.06 }, 0)
              .fromTo(
                q("[data-reach-card]"),
                { autoAlpha: 0, y: 48 },
                { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: CARD_STAGGER },
                0.2
              );

            counts.forEach((el, i) => {
              const n = { v: 0 };
              tl.to(
                n,
                {
                  v: Number(el.dataset.value),
                  duration: COUNT_DURATION,
                  ease: "power3.out",
                  onUpdate: () => (el.textContent = formatCount(n.v, Number(el.dataset.decimals))),
                },
                0.3 + i * CARD_STAGGER
              );
            });

            tl.fromTo(
              q("[data-reach-stat]"),
              { autoAlpha: 0, y: 8 },
              { autoAlpha: 1, y: 0, duration: duration.standard, stagger: 0.05 },
              0.3 + COUNT_DURATION * 0.6
            ).fromTo(q("[data-reach-foot]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.standard }, "<0.2");
          },
        });

        // Leaving full motion mid-count: put the real numbers back
        return () => counts.forEach((el) => (el.textContent = final(el)));
      });

      // Reduced motion: numbers appear at their final value, one short fade
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

  const requestKit = (e: React.MouseEvent) => {
    if (reach.mediaKit) return;
    e.preventDefault();
    setIntent({ enquiry: "media-kit" });
    if (lenis) lenis.scrollTo("#contact", { offset: -24, duration: 1.2 });
    else document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  // Phones: which card the swipe row is on, for the dots
  const onScroll = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setCurrent(Math.min(reachCards.length - 1, Math.round(el.scrollLeft / step)));
  };

  const goTo = (i: number) => {
    const card = track.current?.children[i] as HTMLElement | undefined;
    if (!card || !track.current) return;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    track.current.scrollTo({ left: card.offsetLeft - track.current.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section ref={root} id="reach" aria-labelledby="reach-heading" className="bg-ink px-gutter py-section text-white">
      <div className="flex flex-col gap-stack-md xl:flex-row xl:items-end xl:justify-between xl:gap-column">
        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center gap-3">
            <span data-reach-head className="reveal label font-bold text-accent-on-dark">
              03
            </span>
            <span data-reach-rule className="h-px w-10 origin-left bg-white/40" aria-hidden />
            <span data-reach-head className="reveal label text-white/60">
              Audience &amp; Reach
            </span>
          </div>
          <h2 id="reach-heading" data-reach-head className="reveal font-display text-headline">
            I’m everywhere —<br /> find me.
          </h2>
        </div>

        <div data-reach-head className="reveal flex max-w-[400px] flex-col items-start gap-stack-sm xl:max-w-[340px]">
          <p className="text-[15px] leading-relaxed text-white/70">{reach.blurb}</p>
          <a
            href={reach.mediaKit ?? "#contact"}
            {...(reach.mediaKit ? { download: true, target: "_blank", rel: "noreferrer" } : {})}
            onClick={requestKit}
            className={`group inline-flex items-center gap-1.5 border-b border-white/40 pb-1.5 text-[14px] font-semibold transition-colors duration-240 hover:border-accent-on-dark hover:text-accent-on-dark ${focusRing}`}
          >
            Request media kit
            <ArrowUpRight className="size-4 transition-transform duration-240 ease-enter group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={onScroll}
        aria-label="Platforms"
        className="-mx-gutter mt-stack-xl flex snap-x snap-mandatory scroll-px-gutter gap-card overflow-x-auto px-gutter pt-2 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {reachCards.map((card) => (
          <li key={card.platform} data-reach-card className="reveal w-[85vw] max-w-[424px] shrink-0 snap-start md:w-auto md:max-w-none">
            <PlatformCard card={card} />
          </li>
        ))}
      </ul>

      {/* Phones: which card you're on */}
      <div className="mt-stack-sm flex justify-center gap-2 md:hidden">
        {reachCards.map((card, i) => (
          <button
            key={card.platform}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${platformLabel[card.platform]}`}
            aria-current={i === current}
            className="grid size-6 place-items-center outline-none focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className={`size-1.5 rounded-full transition-colors duration-240 ${i === current ? "bg-white" : "bg-white/30"}`} />
          </button>
        ))}
      </div>

      <p data-reach-foot className="reveal mt-stack-sm text-[12px] text-white/50 md:mt-stack-md">
        Figures updated {reach.updated}
      </p>
    </section>
  );
}

function PlatformCard({ card }: { card: ReachCard }) {
  const Icon = platformIcon[card.platform];
  const platform = platformLabel[card.platform];
  const handle = card.platform === "youtube" ? card.handle : `@${card.handle}`;

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${platform}: ${handle}, ${countLabel(card)} ${card.unit}, opens in new tab`}
      className={`group relative isolate flex h-[480px] flex-col justify-between overflow-hidden rounded-md bg-night p-5 transition-transform duration-480 ease-enter motion-safe:hover:-translate-y-2 md:h-[520px] xl:h-[640px] xl:p-6 ${focusRing}`}
    >
      {/* Photo zooms to 104% on hover */}
      <span className="absolute inset-0 -z-10 transition-transform duration-800 ease-enter motion-safe:group-hover:scale-[1.04]" aria-hidden>
        <Image
          src={card.photo.src}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 85vw"
          className="object-cover"
          style={{ objectPosition: card.photo.position }}
        />
      </span>

      {/* Top and bottom shade so white text reads over any photo */}
      <span className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-linear-to-b from-ink/60 to-transparent" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-linear-to-t from-ink/90 via-ink/50 to-transparent" aria-hidden />

      <span className="flex items-center justify-between gap-3" aria-hidden>
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
            <Image src={photos.studioGlasses.src} alt="" fill sizes="36px" className="object-cover" style={{ objectPosition: "50% 25%" }} />
          </span>
          <span className="truncate text-[14px] font-semibold">{card.handle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1 text-[12px] font-semibold opacity-0 xl:flex transition-opacity duration-240 group-hover:opacity-100 group-focus-visible:opacity-100">
            Visit profile <ArrowUpRight className="size-3.5" />
          </span>
          <Icon className="size-5" />
        </span>
      </span>

      <span className="flex flex-col" aria-hidden>
        <span className="flex items-end gap-2.5">
          <span className="font-display text-stat whitespace-nowrap tabular-nums">
            <span data-reach-count data-value={card.count.value} data-decimals={card.count.decimals}>
              {formatCount(card.count.value, card.count.decimals)}
            </span>
            {card.count.suffix}
          </span>
          <span className="pb-[0.35em] text-[13px] text-white/75">{card.unit}</span>
        </span>
        <span className="mt-4 h-px bg-white/25 xl:mt-5" />
        <span className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:max-xl:grid-cols-1 xl:mt-5">
          {card.stats.map((s) => (
            <span key={s.label} data-reach-stat className="reveal flex flex-col gap-0.5">
              <span className="text-[16px] font-semibold xl:text-[17px]">{s.value}</span>
              <span className="text-[12px] text-white/65">{s.label}</span>
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}
