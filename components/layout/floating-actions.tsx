"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/lib/site";
import { REDUCED_MOTION } from "@/lib/motion";
import { useLenis } from "@/components/providers/smooth-scroll";
import { ArrowUp, WhatsAppIcon } from "@/components/ui/icons";

/*
 * Floating actions, bottom right, on every page: back to top above WhatsApp.
 *
 * Back to top: appears after one screen of scrolling. A ring around it fills with scroll progress
 * (set straight on the SVG, so scrolling never re-renders React). Glides up with Lenis.
 * WhatsApp: a dark glass pill whose label slides out on hover or keyboard focus; opens a chat
 * with a greeting already typed. Both sit under the menu (z-60) and the preloader (z-100),
 * and ride up above the footer's bottom bar ([data-footer-dock]) when it scrolls into view.
 */

const RING = 2 * Math.PI * 25; // circumference of the r=25 progress ring
const greeting = "Hi Iyiola, I found you through your website and I’d love to talk about working together.";
const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(greeting)}`;

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const surface =
  "border border-white/15 bg-ink/85 text-white shadow-[0_12px_32px_-12px_rgb(28_23_20/0.55)] backdrop-blur-md";

export function FloatingActions() {
  const lenis = useLenis();
  const dock = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      ring.current?.style.setProperty("stroke-dashoffset", String(RING * (1 - progress)));
      setShowTop(window.scrollY > window.innerHeight);

      // Ride up with the footer's bottom bar so the buttons always sit 16px above it, never on it
      const el = dock.current;
      const bar = document.querySelector("[data-footer-dock]");
      if (el && bar) {
        const gap = parseFloat(getComputedStyle(el).bottom);
        const lift = Math.max(0, window.innerHeight - gap - bar.getBoundingClientRect().top + 16);
        el.style.transform = lift ? `translateY(${-lift}px)` : "";
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function toTop() {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia(REDUCED_MOTION).matches ? "auto" : "smooth",
      });
  }

  return (
    <div ref={dock} className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6">
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={`group relative grid size-[52px] place-items-center rounded-full transition-[opacity,translate,scale] duration-480 ease-enter active:scale-95 ${surface} ${focusRing} ${
          showTop ? "pointer-events-auto opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle
            cx="28"
            cy="28"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/15"
          />
          <circle
            ref={ring}
            cx="28"
            cy="28"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING}
            className="text-accent-on-dark"
          />
        </svg>
        <ArrowUp className="size-[18px] transition-transform duration-240 ease-enter group-hover:-translate-y-0.5" />
      </button>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Iyiola on WhatsApp (opens in a new tab)"
        className={`group pointer-events-auto flex h-14 animate-[float-in_600ms_var(--ease-enter)_1.2s_both] items-center rounded-full pr-[7px] pl-[7px] transition-[padding] duration-480 ease-enter hover:pl-5 focus-visible:pl-5 motion-reduce:animate-none ${surface} ${focusRing}`}
      >
        <span className="grid max-w-0 overflow-hidden text-[14px] font-semibold whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-480 ease-enter group-hover:mr-3 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:mr-3 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
          Chat on WhatsApp
        </span>
        <span className="relative grid size-[42px] shrink-0 place-items-center rounded-full bg-[#25d366] text-white">
          <WhatsAppIcon className="size-[22px]" />
          {/* Small "online" dot */}
          <span
            className="absolute top-0.5 right-0.5 size-2.5 rounded-full border-2 border-ink bg-[#b9f6ca]"
            aria-hidden
          />
        </span>
      </a>
    </div>
  );
}
