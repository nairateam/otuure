"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/motion";

// The active Lenis instance, shared through a tiny external store.
let current: Lenis | null = null;
const listeners = new Set<() => void>();

function setCurrent(next: Lenis | null) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// null on the server, before mount, and when the visitor prefers reduced motion
export function useLenis() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

// Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll share one clock.
// Turned off entirely when the visitor prefers reduced motion.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setCurrent(lenis);

    // Stopping Lenis clips <html>, which hides the scrollbar; starting it brings the
    // scrollbar back. The window doesn't resize, so ScrollTrigger keeps pins sized for
    // the old width and the page overflows sideways. Re-measure when the width changes.
    let width = document.documentElement.clientWidth;
    const widthWatch = new ResizeObserver(() => {
      const next = document.documentElement.clientWidth;
      if (next === width) return;
      width = next;
      ScrollTrigger.refresh();
    });
    widthWatch.observe(document.documentElement);

    return () => {
      widthWatch.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setCurrent(null);
    };
  }, []);

  return children;
}
