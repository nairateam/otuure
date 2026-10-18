"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease, REDUCED_MOTION } from "@/lib/motion";
import { platformLabel, type WorkItem } from "@/lib/work";
import { useLenis } from "@/components/providers/smooth-scroll";
import { ArrowUpRight, ChevronLeft, ChevronRight, CloseIcon, PlayIcon } from "@/components/ui/icons";

/*
 * Plays a Selected work video over the page so visitors stay on the site.
 * YouTube in a 16:9 player, TikTok and Instagram in a 9:16 one.
 * Esc / close / click outside closes; ← → step through the videos in the current filter.
 */

type Props = {
  items: WorkItem[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndex: (index: number) => void;
};

function embedSrc(item: WorkItem) {
  if (!item.embed) return null;
  switch (item.platform) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${item.embed}?autoplay=1&rel=0&playsinline=1`;
    case "tiktok":
      return `https://www.tiktok.com/player/v1/${item.embed}?autoplay=1&rel=0`;
    case "instagram":
      return `https://www.instagram.com/reel/${item.embed}/embed`;
  }
}

const control =
  "grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-[background-color,transform] duration-240 hover:bg-white/20 active:scale-[0.96] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function WorkLightbox({ items, index, open, onClose, onIndex }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const wasOpened = useRef(false);
  const lenis = useLenis();
  const item = items[index];
  const vertical = item.platform !== "youtube";
  const src = embedSrc(item);
  const many = items.length > 1;

  const step = (by: number) => onIndex((index + by + items.length) % items.length);

  // Open: scrim fades, player rises and settles. Close: quicker fade out.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const scrim = q("[data-lb-scrim]");
      const panel = q("[data-lb-panel]");
      const reduced = window.matchMedia(REDUCED_MOTION).matches;
      const hide = () => gsap.set(root.current, { autoAlpha: 0 });

      if (open) {
        wasOpened.current = true;
        gsap.set(root.current, { autoAlpha: 1 });
        if (reduced) {
          gsap.fromTo([scrim, panel], { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade, overwrite: true });
          return;
        }
        gsap
          .timeline()
          .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none", overwrite: true }, 0)
          .fromTo(
            panel,
            { autoAlpha: 0, y: 24, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: duration.standard, ease: ease.enter, overwrite: true },
            0.05
          );
        return;
      }

      if (!wasOpened.current) return;
      gsap
        .timeline({ onComplete: hide })
        .to(panel, { autoAlpha: 0, scale: reduced ? 1 : 0.97, duration: reduced ? duration.reducedFade : 0.24, ease: ease.screen, overwrite: true }, 0)
        .to(scrim, { autoAlpha: 0, duration: reduced ? duration.reducedFade : 0.3, ease: "none", overwrite: true }, 0);
    },
    { dependencies: [open], scope: root }
  );

  // Stepping to another video: a short crossfade
  const shownIndex = useRef(index);
  useGSAP(
    () => {
      if (!open || shownIndex.current === index) return;
      shownIndex.current = index;
      gsap.fromTo(
        gsap.utils.selector(root)("[data-lb-swap]"),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: duration.hover, ease: "none", overwrite: true }
      );
    },
    { dependencies: [index, open], scope: root }
  );

  // Page stays put underneath while open
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      lenis?.start();
      html.style.overflow = prev;
    };
  }, [open, lenis]);

  // Focus starts on Close (the section returns it to the card afterwards)
  useEffect(() => {
    if (open) root.current?.querySelector<HTMLElement>("[data-lb-close]")?.focus({ preventScroll: true });
  }, [open]);

  // Esc closes, ← → step, Tab stays inside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (many && e.key === "ArrowLeft") return step(-1);
      if (many && e.key === "ArrowRight") return step(1);
      if (e.key !== "Tab" || !root.current) return;
      const focusable = root.current.querySelectorAll<HTMLElement>("a[href], button, iframe");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const platform = platformLabel[item.platform];

  // Player box: as large as fits with room for the caption
  const playerSize = vertical
    ? "aspect-[9/16] h-[min(calc(100svh-220px),760px,calc((100vw-2rem)*16/9))]"
    : "aspect-video w-[min(calc(100vw-2rem),1100px,calc((100svh-220px)*16/9))]";

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title}, ${platform}`}
      inert={!open}
      data-lenis-prevent
      className="invisible fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div data-lb-scrim onClick={onClose} className="absolute inset-0 bg-ink/90 backdrop-blur-sm" aria-hidden />

      <button type="button" data-lb-close onClick={onClose} aria-label="Close video" className={`${control} absolute top-4 right-4 z-10`}>
        <CloseIcon className="size-5" />
      </button>

      <div data-lb-panel className="relative grid justify-items-center gap-4">
        <div data-lb-swap className={`relative overflow-hidden rounded-md bg-black ${playerSize}`}>
          {open && src ? (
            <iframe
              key={item.id}
              src={src}
              title={`${item.title} (${platform})`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            // No embed id yet: show the cover and send them to the platform
            <a href={item.url} target="_blank" rel="noreferrer" className="group absolute inset-0 outline-none">
              <Image
                src={item.thumb.src}
                alt=""
                fill
                sizes={vertical ? "430px" : "(min-width: 1100px) 1100px, 100vw"}
                className="object-cover opacity-70 transition-opacity duration-240 group-hover:opacity-85"
                style={{ objectPosition: item.thumb.position }}
              />
              <span className="absolute inset-0 grid place-content-center justify-items-center gap-3 text-white">
                <span className="glass grid size-[72px] place-items-center rounded-full transition-transform duration-240 group-hover:scale-110">
                  <PlayIcon className="size-6 translate-x-0.5" />
                </span>
                <span className="text-[14px] font-semibold">Play on {platform}</span>
              </span>
            </a>
          )}
        </div>

        {/* Caption: as wide as the player, never wider */}
        <div data-lb-swap className="flex w-0 min-w-full flex-wrap items-end justify-between gap-x-6 gap-y-3 text-white">
          <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
            <p className="font-display text-[clamp(1.25rem,1rem+0.8vw,1.75rem)] leading-tight font-light text-balance">
              {item.title}
            </p>
            <p className="text-[13px] text-white/70">
              {item.views} views
              {item.length && ` · ${item.length}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="link inline-flex items-center gap-1.5 text-[14px] font-semibold whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Watch on {platform} <ArrowUpRight className="size-4" />
            </a>
            {many && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => step(-1)} aria-label="Previous video" className={control}>
                  <ChevronLeft className="size-5" />
                </button>
                <span className="min-w-10 text-center text-[13px] text-white/70 tabular-nums" aria-live="polite">
                  <span className="sr-only">Video </span>
                  {index + 1} / {items.length}
                </span>
                <button type="button" onClick={() => step(1)} aria-label="Next video" className={control}>
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
