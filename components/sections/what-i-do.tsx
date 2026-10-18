"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart } from "@/lib/motion";
import { setIntent, type Intent } from "@/lib/intent";
import { holdHeader } from "@/lib/header-hold";
import { useLenis } from "@/components/providers/smooth-scroll";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { photos } from "@/lib/photos";

/*
 * "What I do": three disciplines set as huge titles that zig-zag across one centre photo.
 *
 * Desktop and tablet: the section pins when it reaches the top of the screen and the next
 * ~3 screens of scrolling step it through 01 → 02 → 03 (snapping at each third), then it
 * releases into Selected work. The canvas is drawn at 1440 × 920 and scaled to fit the
 * screen (positions in %, type in cqw).
 * Phones and reduced motion: no pinning — a plain list, one discipline after another.
 */

type Photo = { src: string; position: string };

type Discipline = {
  title: string;
  /** Short note; 01 uses the lead copy instead */
  desc?: string;
  /** The step's own call to action, shown while it's active */
  cta: { label: string; at: [number, number] };
  href: string;
  intent?: Intent;
  photo: Photo;
  /** Photo is dark, so title letters over it turn white */
  dark: boolean;
  /** Design position of the title row (1440 × 920 canvas) */
  at: [number, number];
};

const LEAD = "Based in Lagos, Nigeria. Iyiola creates across three disciplines —";

const disciplines: Discipline[] = [
  {
    title: "Content creation",
    cta: { label: "See my content", at: [180, 322] },
    href: "#work",
    photo: { src: photos.curlyFlower.src, position: "50% 35%" },
    dark: true,
    at: [560, 230],
  },
  {
    title: "Hair coaching",
    desc: "Routines and guidance for natural, relaxed and texturized hair — rooted in trichology, built for real life.",
    cta: { label: "Book a consultation", at: [980, 526] },
    href: "#contact",
    intent: { enquiry: "hair-coaching" },
    photo: { src: photos.sleekBun.src, position: "40% 35%" },
    dark: true,
    at: [190, 420],
  },
  {
    // TODO: swap for a real brand-product shot when available
    title: "Partnerships",
    desc: "Authentic UGC and storytelling for beauty & haircare brands across West Africa.",
    cta: { label: "Partner with me", at: [180, 720] },
    href: "#contact",
    photo: { src: photos.ankaraDress.src, position: "50% 40%" },
    dark: false,
    at: [580, 610],
  },
];

const W = 1440;
const H = 920;
/** Place an element on the design canvas */
const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });
const wide = (w: number) => `${(w / W) * 100}%`;
const tall = (h: number) => `${(h / H) * 100}%`;

const num = (i: number) => String(i + 1).padStart(2, "0");

/** Lead copy and descriptions on the canvas: 16px at 1440, never under 13px */
const copyClass = "reveal absolute text-[max(13px,1.111cqw)] leading-normal text-ink";
const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-ink";

/** Pinned on tablet and up, and only when motion is welcome */
const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
/** Screens of scrolling per discipline while pinned */
const SCREENS_PER_STEP = 1;

export function WhatIDo() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const pin = useRef<ScrollTrigger | null>(null);
  const spin = useRef<gsap.core.Tween | null>(null);
  const badgeHover = useRef(false);
  const lenis = useLenis();
  const ringId = useId();

  /** The discipline in the spotlight: drives the roll, photo, colours, dimming and stepper */
  const [active, setActive] = useState(0);
  const copyDark = disciplines[active].dark;

  const go = (href: string, intent?: Intent) => {
    if (intent) setIntent(intent);
    if (lenis) lenis.scrollTo(href, { offset: -24, duration: 0.9 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  /** Scroll to the middle of step i's third of the pinned stretch */
  const goToStep = (i: number) => {
    const st = pin.current;
    if (!st) return;
    const y = st.start + ((st.end - st.start) * (i + 0.5)) / disciplines.length;
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const once = { trigger: root.current, start: revealStart, once: true };

      mm.add(PINNED, () => {
        // Pin first so the triggers below measure with the pin spacing in place
        let last = 0;
        pin.current = ScrollTrigger.create({
          trigger: stage.current,
          start: "top top",
          end: () => `+=${window.innerHeight * SCREENS_PER_STEP * disciplines.length}`,
          pin: true,
          invalidateOnRefresh: true,
          // Keep the site header out of the way while pinned (it would sit over the profile chip)
          onToggle: (self) => holdHeader("what-i-do", self.isActive),
          // Steps change at each third rather than following the scroll; the photo
          // crossfade and title roll then finish on their own (CSS transitions)
          onUpdate: (self) => {
            const step = Math.min(disciplines.length - 1, Math.floor(self.progress * disciplines.length));
            if (step !== last) setActive((last = step));
          },
        });

        // Each title's white/ink copy is clipped to wherever the photo sits on screen
        const copies = q("[data-wid-copy]") as HTMLElement[];
        const clip = () => {
          const p = photoRef.current?.getBoundingClientRect();
          if (!p || !p.width) return;
          for (const el of copies) {
            const r = el.getBoundingClientRect();
            const t = Math.max(0, p.top - r.top);
            const rt = Math.max(0, r.right - p.right);
            const b = Math.max(0, r.bottom - p.bottom);
            const l = Math.max(0, p.left - r.left);
            el.style.clipPath = `inset(${t}px ${rt}px ${b}px ${l}px)`;
          }
        };
        clip();
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? gsap.ticker.add(clip) : gsap.ticker.remove(clip)),
        });

        // Entrance, once at 20% visible
        const titles = disciplines.map((_, i) => q(`[data-wid-title="${i}"]`)[0]);
        const rise = (i: number) => q(`[data-wid-title="${i}"] [data-wid-rise]`);
        const fadeUp = { autoAlpha: 1, y: 0, duration: 0.5, ease: ease.enter };
        gsap
          .timeline({ scrollTrigger: once, defaults: { ease: ease.enter } })
          .set(photoRef.current, { autoAlpha: 1 }, 0)
          .fromTo(photoRef.current, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: duration.reveal }, 0)
          .set(titles[0], { autoAlpha: 1 }, 0.2)
          .fromTo(rise(0), { yPercent: 100 }, { yPercent: 0, duration: 0.7 }, 0.2)
          .fromTo(q("[data-wid-lead]"), { autoAlpha: 0, y: 24 }, fadeUp, 0.4)
          .set(titles[1], { autoAlpha: 1 }, 0.32)
          .fromTo(rise(1), { yPercent: 100 }, { yPercent: 0, duration: 0.7 }, 0.32)
          .fromTo(q("[data-wid-desc='1']"), { autoAlpha: 0, y: 24 }, fadeUp, 0.52)
          .set(titles[2], { autoAlpha: 1 }, 0.44)
          .fromTo(rise(2), { yPercent: 100 }, { yPercent: 0, duration: 0.7 }, 0.44)
          .fromTo(q("[data-wid-desc='2']"), { autoAlpha: 0, y: 24 }, fadeUp, 0.64)
          .fromTo(q("[data-wid-late]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.8);

        // "View work" turns once every 12s, 20% faster while scrolling, half speed on hover
        spin.current = gsap.to(q("[data-wid-ring]"), { rotation: 360, duration: 12, ease: "none", repeat: -1 });
        let idle: gsap.core.Tween | null = null;
        const speed = (s: number) => spin.current?.timeScale(badgeHover.current ? 0.5 : s);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: () => {
            speed(1.2);
            idle?.kill();
            idle = gsap.delayedCall(0.2, () => speed(1));
          },
        });

        return () => {
          gsap.ticker.remove(clip);
          idle?.kill();
          holdHeader("what-i-do", false);
          pin.current = null;
          spin.current = null;
        };
      });

      // Phones: each discipline rises in as it scrolls into view
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        q("[data-wid-item]").forEach((item) => {
          gsap.fromTo(
            item.querySelectorAll("[data-wid-up]"),
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: duration.reveal,
              ease: ease.enter,
              stagger: 0.08,
              scrollTrigger: { trigger: item, start: "top 85%", once: true },
            }
          );
        });
      });

      // Reduced motion: the list, each discipline simply fading in
      mm.add("(prefers-reduced-motion: reduce)", () => {
        q("[data-wid-item]").forEach((item) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: duration.reducedFade,
              scrollTrigger: { trigger: item, start: "top 85%", once: true },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  /** Everything not in the spotlight drops to 35% */
  const dim = (group: number) => (group === active ? "opacity-100" : "opacity-35");

  return (
    <section ref={root} id="content" className="bg-paper">
      <h2 className="sr-only">What I do</h2>

      {/* ───────── Tablet and up: pinned stage ───────── */}
      <div ref={stage} className="hidden h-svh items-center justify-center overflow-hidden md:motion-safe:flex">
        <div className="@container relative aspect-[1440/920] w-[min(100%,1440px,calc(100svh*1440/920))]">
          {/* Centre photo: crossfades to the active discipline */}
          <div
            ref={photoRef}
            className="reveal absolute overflow-hidden"
            style={{ ...at(540, 100), width: wide(400), height: tall(720) }}
          >
            {disciplines.map((d, i) => (
              <Image
                key={d.photo.src}
                src={d.photo.src}
                alt=""
                fill
                sizes="(min-width: 1440px) 400px, 28vw"
                className={`object-cover transition-opacity duration-400 ease-enter ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectPosition: d.photo.position }}
              />
            ))}
          </div>

          <ProfileChip className="absolute" style={at(64, 64)} />

          {/* GSAP fades the outer element in; the inner span carries the spotlight dimming */}
          <p data-wid-lead className={copyClass} style={{ ...at(180, 258), width: wide(300) }}>
            <span className={`block transition-opacity duration-240 ${dim(0)}`}>{LEAD}</span>
          </p>
          <StepLink d={disciplines[0]} on={active === 0} onGo={go} />

          {disciplines.map((d, i) => (
            <Title
              key={d.title}
              i={i}
              d={d}
              on={active === i}
              copyDark={copyDark}
              dimClass={dim(i)}
              onClick={(e) => {
                e.preventDefault();
                go(d.href, d.intent);
              }}
              // Tabbing onto a title brings its step into the spotlight
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) goToStep(i);
              }}
            />
          ))}

          <p data-wid-desc="1" className={copyClass} style={{ ...at(980, 438), width: wide(290) }}>
            <span className={`block transition-opacity duration-240 ${dim(1)}`}>{disciplines[1].desc}</span>
          </p>
          <StepLink d={disciplines[1]} on={active === 1} onGo={go} />

          <p data-wid-desc="2" className={copyClass} style={{ ...at(180, 632), width: wide(240) }}>
            <span className={`block transition-opacity duration-240 ${dim(2)}`}>{disciplines[2].desc}</span>
          </p>
          <StepLink d={disciplines[2]} on={active === 2} onGo={go} />

          {/* "View work": top-right, clear of the coaching description */}
          <a
            href="#work"
            data-wid-late
            data-track="what-i-do:view-work"
            onClick={(e) => {
              e.preventDefault();
              go("#work");
            }}
            onPointerEnter={() => {
              badgeHover.current = true;
              spin.current?.timeScale(0.5);
            }}
            onPointerLeave={() => {
              badgeHover.current = false;
              spin.current?.timeScale(1);
            }}
            className={`reveal group absolute grid aspect-square place-items-center rounded-full border border-ink text-ink transition-colors duration-240 hover:bg-ink hover:text-white ${focusRing}`}
            style={{ ...at(1220, 84), width: wide(128) }}
          >
            <svg data-wid-ring viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
              <defs>
                <path id={ringId} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" fill="none" />
              </defs>
              <text className="fill-current text-[9.4px] font-semibold tracking-[0.18em] uppercase">
                <textPath href={`#${ringId}`} textLength={238.7} lengthAdjust="spacing">
                  View work · Selected work ·
                </textPath>
              </text>
            </svg>
            <ArrowRight className="size-[1.667cqw] -rotate-45 transition-transform duration-240 ease-enter group-hover:translate-x-1 group-hover:-translate-y-1" />
            <span className="sr-only">View work</span>
          </a>

          {/* Thumbnail next to 03: opens the "Brand collabs" filter in the gallery */}
          <a
            href="#work"
            data-wid-desc="2"
            data-track="what-i-do:brand-collabs"
            onClick={(e) => {
              e.preventDefault();
              go("#work", { workFilter: "brand-collabs" });
            }}
            className={`reveal absolute aspect-square ${focusRing}`}
            style={{ ...at(440, 620), width: wide(96) }}
          >
            <span className={`absolute inset-0 overflow-hidden transition-opacity duration-240 ${dim(2)}`}>
              <Image src={photos.gardenKiss.src} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: "50% 40%" }} />
            </span>
            <span className="sr-only">Brand collaborations</span>
          </a>

          {/* Progress stepper: completed and current parts fill with ink; click to jump */}
          <nav
            aria-label="What I do steps"
            data-wid-late
            className="reveal absolute flex gap-[0.833cqw]"
            style={{ ...at(64, 848), width: wide(1312) }}
          >
            {disciplines.map((d, i) => (
              <button
                key={d.title}
                type="button"
                aria-current={i === active ? "step" : undefined}
                onClick={() => goToStep(i)}
                className={`flex flex-1 flex-col gap-[0.833cqw] text-left ${focusRing}`}
              >
                <span
                  className={`h-0.5 w-full transition-colors duration-400 ${i <= active ? "bg-ink" : "bg-line"}`}
                  aria-hidden
                />
                <span className="flex items-center gap-[0.556cqw] text-[max(10px,0.833cqw)] leading-none uppercase">
                  <span
                    className={`font-bold tracking-[0.1em] transition-colors duration-240 ${
                      i === active ? "text-accent" : "text-muted"
                    }`}
                  >
                    {num(i)}
                  </span>
                  <span
                    className={`font-semibold tracking-[0.133em] transition-colors duration-240 ${
                      i === active ? "text-ink" : "text-muted"
                    }`}
                  >
                    {d.title}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ───────── Phones and reduced motion: one discipline after another ───────── */}
      <div className="flex flex-col gap-stack-xl px-gutter py-section md:mx-auto md:max-w-[1200px] md:motion-safe:hidden">
        <div data-wid-item>
          <ProfileChip mobile />
        </div>
        {disciplines.map((d, i) => (
          <article
            key={d.title}
            data-wid-item
            className="flex flex-col gap-4 md:grid md:grid-cols-[5fr_7fr] md:items-center md:gap-x-column"
          >
            <div data-wid-up className="relative aspect-[4/5] overflow-hidden rounded-md">
              <Image
                src={d.photo.src}
                alt=""
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
                style={{ objectPosition: d.photo.position }}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h3 data-wid-up className="flex items-start gap-2 text-ink">
                <span className="pt-1 text-[14px] font-medium text-accent">{num(i)}</span>
                <span className="text-[clamp(40px,11vw,44px)] leading-none font-light tracking-[-0.06em] uppercase md:text-[56px]">
                  {d.title}
                </span>
              </h3>
              <p data-wid-up className="text-body text-ink md:max-w-[420px]">
                {d.desc ?? LEAD}
              </p>
              <a
                data-wid-up
                href={d.href}
                data-track={`what-i-do:${num(i)}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(d.href, d.intent);
                }}
                className="link flex w-fit items-center gap-2 text-button"
              >
                {d.cta.label} <ArrowRight className="size-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type StepLinkProps = { d: Discipline; on: boolean; onGo: (href: string, intent?: Intent) => void };

/** The active step's call to action; hidden and unfocusable while its step is off */
function StepLink({ d, on, onGo }: StepLinkProps) {
  return (
    <a
      href={d.href}
      inert={!on}
      data-track={`what-i-do:cta:${d.title.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={(e) => {
        e.preventDefault();
        onGo(d.href, d.intent);
      }}
      className={`absolute flex items-center gap-2 border-b border-ink pb-1 text-[max(13px,1.042cqw)] leading-none font-semibold text-ink transition-[opacity,translate] duration-240 ease-enter ${focusRing} ${
        on ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
      style={at(...d.cta.at)}
    >
      {d.cta.label}
      <ArrowUpRight className="size-[max(14px,1.111cqw)]" />
    </a>
  );
}

type ChipProps = { className?: string; style?: React.CSSProperties; mobile?: boolean };

function ProfileChip({ className = "", style, mobile = false }: ChipProps) {
  // On the stage it fades in with the entrance; in the list it rises with the items
  const motion = mobile ? { "data-wid-up": true } : { "data-wid-late": true };
  return (
    <div
      {...motion}
      className={`flex items-center gap-[max(14px,1.389cqw)] ${mobile ? "" : "reveal"} ${className}`}
      style={style}
    >
      <Image
        src={photos.studioGlasses.src}
        alt="Iyiola"
        width={88}
        height={88}
        className="size-[max(64px,6.111cqw)] rounded-full object-cover"
      />
      <div className="flex flex-col gap-1.5 text-ink">
        <span className="text-[max(24px,2.083cqw)] leading-none font-semibold tracking-[-0.02em]">_otuure</span>
        <span className="text-[max(11px,0.903cqw)] leading-[1.3] font-medium tracking-[0.08em] uppercase">
          Creator &amp;
          <br />
          Hair care specialist
        </span>
      </div>
    </div>
  );
}

type TitleProps = {
  i: number;
  d: Discipline;
  on: boolean;
  copyDark: boolean;
  dimClass: string;
  onClick: (e: React.MouseEvent) => void;
  onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => void;
};

/**
 * A title is drawn twice: the ink version is the real link; an identical copy sits on top,
 * clipped to the photo, and turns white whenever the photo behind it is dark.
 */
function Title({ i, d, on, copyDark, dimClass, onClick, onFocus }: TitleProps) {
  const face = (copy: boolean) => (
    <span className="flex items-start gap-[0.417cqw]">
      <span
        className={`mt-[0.2em] text-[max(12px,1.389cqw)] leading-none font-medium transition-colors duration-240 ${
          on ? (copy && copyDark ? "text-accent-on-dark" : "text-accent") : ""
        }`}
      >
        {num(i)}
      </span>
      {/* Mask for the entrance rise */}
      <span className="block overflow-hidden">
        <span data-wid-rise className="block">
          {/* Roll: slides up to an identical copy when the step becomes active */}
          <span
            className={`relative block text-[6.389cqw] leading-none font-light tracking-[-0.065em] whitespace-nowrap uppercase transition-transform duration-240 ease-enter ${
              on ? "-translate-y-full" : ""
            }`}
          >
            <span className="block">{d.title}</span>
            <span className="absolute top-full left-0 block" aria-hidden>
              {d.title}
            </span>
          </span>
        </span>
      </span>
    </span>
  );

  // h3: entrance (GSAP). Inner div: spotlight dimming (CSS), kept apart so they don't fight.
  return (
    <h3 data-wid-title={i} className="reveal absolute" style={at(...d.at)}>
      <div className={`relative transition-opacity duration-240 ${dimClass}`}>
        <a
          href={d.href}
          data-track={`what-i-do:${num(i)}`}
          onClick={onClick}
          onFocus={onFocus}
          className={`block text-ink ${focusRing}`}
        >
          {face(false)}
        </a>
        <span
          data-wid-copy
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-colors duration-240 ${
            copyDark ? "text-white" : "text-ink"
          }`}
        >
          {face(true)}
        </span>
      </div>
    </h3>
  );
}
