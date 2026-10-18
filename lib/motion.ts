// Motion tokens. Mirrors the CSS variables in app/globals.css.
// GSAP takes seconds, so durations are in seconds here.

export const duration = {
  press: 0.12,
  hover: 0.24,
  standard: 0.48,
  reveal: 0.8,
  hero: 1.2,
  pageWipe: 0.6,
  loaderWipe: 0.8,
  reducedFade: 0.2,
} as const;

// Registered as CustomEase names in lib/gsap.ts
export const ease = {
  enter: "enter", // cubic-bezier(0.16, 1, 0.3, 1)
  screen: "screen", // cubic-bezier(0.65, 0, 0.35, 1)
  loop: "none",
} as const;

// 60–80ms between items in a group
export const stagger = 0.07;

// Sections animate once when 20% is on screen
export const revealStart = "top 80%";

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";
