"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease, REDUCED_MOTION } from "@/lib/motion";
import { contact, menuLinks, site, socials } from "@/lib/site";
import { ArrowRight, ArrowUpRight, CloseIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
};

const ROW_STAGGER = 0.06;

// Live Lagos time for the fine print; empty on the server so hydration matches
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: contact.timeZone,
});
const subscribeClock = (onChange: () => void) => {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
};
function useLocalTime() {
  return useSyncExternalStore(subscribeClock, () => timeFormat.format(new Date()), () => "");
}

export function SiteMenu({ open, onClose, onNavigate }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const wasOpened = useRef(false);
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const [hovered, setHovered] = useState(0);
  const time = useLocalTime();

  // Hover preview trails the cursor, kept just left of the panel (full motion only)
  useGSAP(
    () => {
      if (window.matchMedia(REDUCED_MOTION).matches) return;
      gsap.set(preview.current, { xPercent: -100, yPercent: -50, rotate: -4, autoAlpha: 0, scale: 0.92 });
      follow.current = {
        x: gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" }),
        y: gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" }),
      };
    },
    { scope: root }
  );

  // Open: scrim fades in, panel slides in from the right, rows rise one after another.
  // Close: the same in reverse, quicker (~400ms).
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const scrim = q("[data-menu-scrim]");
      const rows = q("[data-menu-row]");
      const reduced = window.matchMedia(REDUCED_MOTION).matches;
      const hide = () => gsap.set(root.current, { autoAlpha: 0 });

      if (open) {
        wasOpened.current = true;
        gsap.set(root.current, { autoAlpha: 1 });
        if (reduced) {
          gsap.set(rows, { autoAlpha: 1, y: 0 });
          gsap.set(panel.current, { xPercent: 0 });
          gsap.fromTo([scrim, panel.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade, overwrite: true });
          return;
        }
        gsap
          .timeline()
          .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none", overwrite: true }, 0)
          .fromTo(
            panel.current,
            { xPercent: 105, autoAlpha: 1 },
            { xPercent: 0, duration: duration.pageWipe, ease: ease.enter, overwrite: true },
            0
          )
          .fromTo(
            rows,
            { autoAlpha: 0, y: 32 },
            { autoAlpha: 1, y: 0, duration: duration.standard, ease: ease.enter, stagger: ROW_STAGGER, overwrite: true },
            0.18
          );
        return;
      }

      if (!wasOpened.current) return;
      gsap.to(preview.current, { autoAlpha: 0, duration: duration.hover, overwrite: "auto" });
      if (reduced) {
        gsap.to([scrim, panel.current], { autoAlpha: 0, duration: duration.reducedFade, overwrite: true, onComplete: hide });
        return;
      }
      gsap
        .timeline({ onComplete: hide })
        .to(rows, { autoAlpha: 0, y: 16, duration: 0.2, ease: ease.screen, stagger: { each: 0.02, from: "end" }, overwrite: true }, 0)
        .to(panel.current, { xPercent: 105, duration: 0.4, ease: ease.screen, overwrite: true }, 0)
        .to(scrim, { autoAlpha: 0, duration: 0.3, ease: "none", overwrite: true }, 0.1);
    },
    { dependencies: [open], scope: root }
  );

  // Escape closes; Tab stays inside the panel; focus returns to the Menu button afterwards
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("[data-menu-close]")?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.querySelector<HTMLElement>('[aria-controls="site-menu"]')?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  const showPreview = (i: number, on: boolean) => {
    if (!follow.current) return; // reduced motion: no preview
    if (on) setHovered(i);
    gsap.to(preview.current, {
      autoAlpha: on ? 1 : 0,
      scale: on ? 1 : 0.92,
      duration: on ? duration.standard : duration.hover,
      ease: ease.enter,
      overwrite: "auto",
    });
  };

  const trackPointer = (e: React.MouseEvent) => {
    if (!follow.current || !panel.current) return;
    const left = panel.current.getBoundingClientRect().left;
    follow.current.x(left - 32 + (e.clientX - left) * 0.08);
    follow.current.y(e.clientY);
  };

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className="invisible fixed inset-0 z-[60]"
    >
      {/* Dimmed, lightly blurred hero; clicking it closes the menu */}
      <div data-menu-scrim onClick={onClose} className="absolute inset-0 bg-ink/65 backdrop-blur-[3px]" aria-hidden />

      {/* Section photo that floats beside the panel on hover */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 hidden h-[320px] w-[240px] overflow-hidden rounded-[12px] shadow-[0_30px_60px_#00000080] lg:block"
      >
        {menuLinks.map((l, i) => (
          <div
            key={l.href}
            className={`absolute inset-0 transition-opacity duration-240 ${i === hovered ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0" style={{ transform: l.preview.zoom ? `scale(${l.preview.zoom})` : undefined }}>
              <Image
                src={l.preview.src}
                alt=""
                fill
                sizes="240px"
                className="object-cover"
                style={{ objectPosition: l.preview.position }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        ref={panel}
        data-lenis-prevent
        className="absolute inset-2 flex flex-col justify-between gap-8 overflow-y-auto rounded-[20px] bg-paper px-6 py-6 text-ink shadow-[0_30px_80px_#00000066] sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[min(620px,calc(100%-1.5rem))] lg:inset-y-5 lg:right-5 lg:px-10 lg:pt-7 lg:pb-9"
      >
        <div className="flex items-center justify-between">
          <a href="#top" onClick={go("#top")} className="font-display text-[26px] leading-none font-medium italic lg:text-[30px]">
            {site.wordmark}
          </a>
          <button
            type="button"
            data-menu-close
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-full border border-line px-5 py-3 text-[14px] font-semibold transition-[background-color,transform] duration-120 hover:bg-cream active:scale-[0.98]"
          >
            Close <CloseIcon className="size-[18px]" />
          </button>
        </div>

        <nav aria-label="Main" onMouseMove={trackPointer} onMouseLeave={() => showPreview(hovered, false)}>
          <ul>
            {menuLinks.map((l, i) => (
              <li key={l.href} data-menu-row>
                <a
                  href={l.href}
                  onClick={go(l.href)}
                  onMouseEnter={() => showPreview(i, true)}
                  className="group flex items-center gap-4 border-b border-line py-3.5 outline-none sm:gap-5"
                >
                  <span className="label w-6 font-body text-[13px] font-bold text-muted transition-colors duration-240 group-hover:text-accent group-focus-visible:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-display text-[clamp(2rem,1.1rem+2.4vw,3.125rem)] leading-none font-light tracking-[-0.03em] group-hover:italic group-focus-visible:italic">
                    {l.label}
                  </span>
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-muted transition-colors duration-240 group-hover:text-ink group-focus-visible:text-ink sm:text-[14px]">
                    {l.meta}
                    <ArrowUpRight className="size-[18px] -translate-x-2 opacity-0 transition-[opacity,transform] duration-240 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-row className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a
              href="#contact"
              onClick={go("#contact")}
              className="btn rounded-full bg-accent px-[26px] py-4 text-[15px] whitespace-nowrap text-paper"
            >
              Partner with me <ArrowRight className="size-[18px]" data-arrow />
            </a>
            <div className="flex items-center gap-2.5">
              {[
                { href: socials.instagram, label: "Instagram", Icon: InstagramIcon },
                { href: socials.tiktok, label: "TikTok", Icon: TikTokIcon },
                { href: socials.youtube, label: "YouTube", Icon: YouTubeIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-line transition-colors duration-240 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-[14px] text-muted">
            <a href={`mailto:${contact.email}`} className="link">
              {contact.email}
            </a>
            <p>
              {contact.location}
              {time && ` · ${time} ${contact.zoneLabel}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
