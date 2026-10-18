@AGENTS.md

# Otuure — premium portfolio

Next.js 16 (App Router, `cacheComponents` on), React 19, Tailwind v4 (CSS-first, tokens in `app/globals.css` `@theme`), GSAP 3 + `@gsap/react` (import from `@/lib/gsap`, which registers ScrollTrigger, SplitText, CustomEase and the `enter`/`screen` eases), Lenis smooth scroll on GSAP's ticker (`components/providers/smooth-scroll.tsx`, `useLenis()`). Motion tokens in `lib/motion.ts`.

Always use the tokens (`bg-ink`, `text-headline`, `px-gutter`, `py-section`, `rounded-md`, `ease-enter`…) rather than typed-in numbers, so global edits work.

## Colour

| Token | Value | Use |
|---|---|---|
| ink | #1C1714 | Main text, dark sections |
| night | #2A2A2B | Hero and eBook backgrounds (matches the studio backdrop) |
| cream | #EFE9E2 | Alternate light sections |
| paper | #F7F3EE | Page background |
| muted | #6E625A | Secondary text on light backgrounds |
| line | #D9CFC4 | Dividers and borders |
| accent | #A9472A | Buttons and calls to action only |
| accent-on-dark | #E07A55 | Section numbers and labels on dark backgrounds |
| white 60–85% | — | Secondary text on dark backgrounds |

## Type

`font-display` = Fraunces, `font-body` = Hanken Grotesk.

| Role | Utility | Size / weight | Line height / tracking |
|---|---|---|---|
| Display name | `text-display` | Fraunces 116–136 / 300 | 0.92 / −4 to −5 |
| Section headline | `text-headline` | Fraunces 64–76 / 300 | 1.0 / −2.5 |
| Statement | `text-statement` | Fraunces 44–52 / 300 | 1.1 |
| Big stat | `text-stat` | Fraunces 48–72 / 400 | 1.0 / −2 |
| Italic accent | `text-italic italic` | Fraunces Italic 26–34 / 300–400 | — |
| Discipline titles | `text-discipline uppercase` | Hanken 92–132 / 300 | 1.0 / −6 to −8 |
| Body | `text-body` / `text-body-lg` | Hanken 16–18 / 400 | 1.5–1.6 |
| Label | `label` | Hanken 12–13 / 600 uppercase | +1.6 to +2.4 |
| Button | `btn` | Hanken 15–16 / 600 | — |

Sizes are fluid (clamp) and hit the spec values on desktop.

## Spacing, radius, effects

- `gutter` 64, `section` 140 (vertical section padding), `column` gap 96, `card` gap 20, stacks `stack-xs/sm/md/lg/xl` = 12/24/32/40/48. Gutter/section/column shrink on tablet and mobile.
- Radius: `sm` 10, `md` 16, `lg` 24. Chat bubbles 24 with a 6 "tail" corner (`.bubble`, `.bubble-out`). Buttons are full pills. Philosophy photo has a 280 arch top (`.arch`).
- Frosted glass (`.glass`): white 8–12%, white 18–20% border, 24 blur. Book covers: `shadow-book` (y 24, blur 48, black 50%).

## Motion

- Durations: 120 press, 240 hover, 480 standard, 800 reveals, 1200 hero entrance.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` entering (`enter`); `cubic-bezier(0.65, 0, 0.35, 1)` screen-level (`screen`); linear for looping marquees.
- Stagger 60–80ms within a group.
- Only animate transform (position, scale) and opacity.
- **Page load:** dark screen with a Fraunces italic counter 0→100 (korty-eo "'089" intro), then wipes upward over 800ms to reveal the hero.
- **Page transitions:** 600ms ink-coloured wipe.

### Hero entrances

- **A:** photo settles 108%→100% scale over 1.6s. Name lines rise from behind a mask one after another, then intro text and buttons fade up 24px, frosted bar slides up last. On scroll the photo moves slower than the page and the name faster (depth).
- **B:** portrait strip reveals top to bottom. "IYIOLA A." slides in from the left, the surname from the right. The white copy of the surname must move exactly with the ink one or the colour switch breaks. Round button spins slowly (12s per turn) and grows slightly on hover.
- **C:** garden photo zooms very slowly (to 106% over 20s). Chat bubble shows a "typing…" indicator ~0.9s, then the message. Nav words fade in one after another.

### Scrolling

- Every section animates once at 20% visible: the short rule beside the section number draws in, headlines rise line by line, body fades up.
- Chat card: bubbles arrive one by one with a typing indicator, ~500ms apart.
- What I do: big titles drift ±40px sideways in opposite directions on scroll. On hover a title rolls up to a duplicate of itself (korty-eo).
- Reach cards: follower numbers count up over 1.2s on appear. Hover lifts 8px, photo zooms to 104%.
- Brand grid: hover turns a cell ink with light text (240ms).
- Values band: continuous loop, one pass per 40s, pauses on hover.
- Featured and eBooks: small inset portrait moves at a different scroll speed from the main image. Tilted book covers straighten on hover.
- Final CTA: the cutout of her rises in step with scroll.
- Footer: large wordmark letters rise one after another.

### Buttons, links, nav

- Button arrows nudge 4px on hover; buttons shrink to 98% on press. Link underlines draw in from the left.
- Nav is transparent over the hero; after ~80px scroll it becomes a frosted bar, hides on scroll down, returns on scroll up.

### Reduced motion

If `prefers-reduced-motion: reduce`: turn off depth scrolling, slow zoom, looping band and count-ups (Lenis is already off); keep only 200ms fades. Use `gsap.matchMedia()` with `FULL_MOTION` / `REDUCED_MOTION` from `lib/motion.ts`.
