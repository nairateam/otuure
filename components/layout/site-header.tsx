"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, stagger, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { useLenis } from "@/components/providers/smooth-scroll";
import { SiteMenu } from "@/components/layout/site-menu";
import { MusicToggle } from "@/components/layout/music-toggle";
import { site } from "@/lib/site";
import { onReveal } from "@/lib/intro";
import { headerHeld, onHeaderHold } from "@/lib/header-hold";
import { MenuIcon } from "@/components/ui/icons";

const FROST_AFTER = 80;

// music: the background track, or null when there isn’t one (the toggle stays hidden)
export function SiteHeader({ music = null }: { music?: { src: string; title: string; artist: string } | null }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  // Transparent over the hero → frosted bar after 80px; hides on scroll down, returns on scroll up.
  useGSAP(
    () => {
      const header = bar.current!;
      gsap.set(backdrop.current, { autoAlpha: 0 });

      // Intro: header items fade in alongside the hero entrance, once the preloader lifts
      const items = gsap.utils.toArray<HTMLElement>("[data-header-item]", header);
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const intro = gsap.fromTo(
          items,
          { autoAlpha: 0, y: -12 },
          { autoAlpha: 1, y: 0, duration: duration.reveal, ease: ease.enter, stagger, delay: 0.4, paused: true },
        );
        return onReveal(() => intro.play());
      });
      mm.add(REDUCED_MOTION, () => {
        const fade = gsap.fromTo(
          items,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: duration.reducedFade, paused: true },
        );
        return onReveal(() => fade.play());
      });

      // A section can hold the header away (e.g. "What I do" while pinned); otherwise the
      // last scroll direction decides
      let scrollHide = false;
      const place = () =>
        gsap.to(header, {
          yPercent: scrollHide || headerHeld() ? -110 : 0,
          duration: duration.standard,
          ease: ease.enter,
          overwrite: "auto",
        });

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          gsap.to(backdrop.current, {
            autoAlpha: y > FROST_AFTER ? 1 : 0,
            duration: duration.hover,
            overwrite: "auto",
          });
          scrollHide = self.direction === 1 && y > FROST_AFTER * 2;
          place();
        },
      });
      const offHold = onHeaderHold(place);

      return () => {
        st.kill();
        offHold();
        mm.revert();
      };
    },
    { scope: root },
  );

  // Lock page scroll while the menu is open
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  const scrollTo = useCallback((href: string) => lenis?.scrollTo(href, { offset: -24, duration: 1.2 }), [lenis]);
  const closeMenu = useCallback(() => setOpen(false), []);
  // Close the menu first, then glide to the section once the panel is away
  const navigateFromMenu = useCallback(
    (href: string) => {
      setOpen(false);
      gsap.delayedCall(0.35, () => scrollTo(href));
    },
    [scrollTo],
  );

  return (
    <div ref={root}>
      <header ref={bar} className="fixed inset-x-0 top-0 z-50">
        {/* Frosted bar, faded in after scrolling */}
        <div
          ref={backdrop}
          className="glass invisible absolute inset-0 border-x-0 border-t-0 bg-night/60"
          aria-hidden
        />

        <div className="relative flex items-center justify-between px-gutter py-5 lg:py-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#top");
            }}
            className="reveal font-display text-[28px] leading-none font-medium italic text-white md:text-[34px]"
            data-header-item
          >
            {site.wordmark}
          </a>

          <div className="flex items-center gap-2.5">
            {music && (
              <span className="reveal" data-header-item>
                <MusicToggle src={music.src} track={`${music.title} by ${music.artist}`} />
              </span>
            )}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-haspopup="dialog"
              className="reveal glass relative z-10 flex items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-semibold text-white transition-transform duration-120 active:scale-[0.98]"
              data-header-item
            >
              Menu
              <MenuIcon className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Side-panel menu — outside the header so its transform doesn't trap `fixed` */}
      <SiteMenu open={open} onClose={closeMenu} onNavigate={navigateFromMenu} />
    </div>
  );
}
