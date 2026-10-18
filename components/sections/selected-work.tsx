"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { useIntent } from "@/lib/intent";
import { socials } from "@/lib/site";
import {
  categoryLabel,
  collab,
  entriesFor,
  platformLabel,
  spokenLength,
  workFilters,
  type Platform,
  type WorkEntry,
  type WorkFilter,
  type WorkItem,
} from "@/lib/work";
import { useLenis } from "@/components/providers/smooth-scroll";
import { WorkLightbox } from "@/components/sections/work-lightbox";
import { ArrowUpRight, InstagramIcon, PlayIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";

/*
 * "Selected work": the proof section. A hand-picked grid of her best videos.
 *
 * 1200 and up: row A = feature (912) + tall TikTok (380), row B = four cards.
 * 768–1199: feature full width, then a two-column grid (TikToks 9:16, YouTube 16:9).
 * Under 768: feature, then a sideways swipe row; the brand tile and links stack after it.
 * The second entry and the brand tile are rendered twice (one copy per layout, the other
 * display:none) so each breakpoint gets its own arrangement without JS layout.
 */

const CARD_STAGGER = 0.08;
const PREVIEW_DELAY = 300;

const platformIcon: Record<Platform, (p: { className?: string }) => React.ReactNode> = {
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
};

const footerLinks = [
  { href: socials.youtube, label: "Watch all on YouTube", Icon: YouTubeIcon },
  { href: socials.tiktok, label: "Follow @otuure on TikTok", Icon: TikTokIcon },
  { href: socials.instagram, label: "See more on Instagram", Icon: InstagramIcon },
];

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

type Slot = "feature" | "tall" | "rest";

export function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRef(false);
  const fading = useRef(false);
  const latest = useRef<WorkFilter>("all");
  const opener = useRef<HTMLElement | null>(null);
  const lenis = useLenis();

  /** `selected` is the pill; `filter` is what the grid shows (it lags behind during the fade) */
  const [selected, setSelected] = useState<WorkFilter>("all");
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [announce, setAnnounce] = useState("");
  const [lightbox, setLightbox] = useState({ open: false, index: 0, mounted: false });

  // "Brand collabs" links elsewhere on the page arrive with a pre-selected filter
  const intent = useIntent();
  const [seenIntent, setSeenIntent] = useState(intent);
  if (intent !== seenIntent) {
    setSeenIntent(intent);
    if (intent.workFilter) {
      setSelected(intent.workFilter);
      setFilter(intent.workFilter);
    }
  }

  const entries = entriesFor(filter);
  const videos = entries.flatMap((e) => (e.kind === "video" ? [e.item] : []));
  const [lead, second] = entries;
  const rest = entries.slice(1);
  const tileInRest = rest.some((e) => e.kind === "collab");

  /** Cards in the current layout (skips the display:none copies) */
  const visibleCards = () =>
    gsap.utils.selector(root)("[data-work-card]").filter((el) => (el as HTMLElement).offsetParent !== null);

  // Entrance, once at 20% visible: rule draws, header fades up, cards scale in one after another
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        gsap.set(q("[data-work-rule]"), { scaleX: 0 });
        ScrollTrigger.create({
          ...start,
          // Built on enter so it picks up whichever cards the current filter shows
          onEnter: () => {
            revealed.current = true;
            const cards = visibleCards();
            gsap.set(q("[data-work-card]"), { autoAlpha: 1 });
            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .fromTo(q("[data-work-rule]"), { scaleX: 0 }, { scaleX: 1, duration: duration.reveal }, 0)
              .fromTo(q("[data-work-head]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal, stagger: 0.06 }, 0)
              .set(q("[data-work-grid]"), { autoAlpha: 1 }, 0.2)
              .fromTo(
                cards,
                { autoAlpha: 0, scale: 0.96 },
                { autoAlpha: 1, scale: 1, duration: duration.reveal, stagger: CARD_STAGGER },
                0.2
              )
              .fromTo(q("[data-work-foot]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: duration.standard }, "-=0.5");
          },
        });
      });

      // Reduced motion: one simple fade
      mm.add(REDUCED_MOTION, () => {
        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            revealed.current = true;
            gsap.fromTo(q(".reveal"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade });
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  // After a filter change the matching cards fade back in, in their new order (300ms)
  const firstRender = useRef(true);
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      if (!revealed.current) return;
      gsap.fromTo(
        visibleCards(),
        { autoAlpha: 0, scale: 1 },
        { autoAlpha: 1, duration: 0.3, ease: ease.enter, stagger: 0.04, overwrite: true }
      );
    },
    { dependencies: [filter], scope: root }
  );

  const show = (next: WorkFilter) => {
    const count = entriesFor(next).length;
    setFilter(next);
    setAnnounce(`${workFilters.find((f) => f.id === next)!.label}: showing ${count} ${count === 1 ? "piece" : "pieces"}`);
  };

  // The pill fills at once; cards fade out (200ms), then the new set renders. The latest click wins.
  const choose = (next: WorkFilter) => {
    if (next === selected) return;
    setSelected(next);
    latest.current = next;
    if (!revealed.current) return show(next);
    if (fading.current) return;
    fading.current = true;
    gsap.to(visibleCards(), {
      autoAlpha: 0,
      duration: 0.2,
      ease: "none",
      overwrite: true,
      onComplete: () => {
        fading.current = false;
        // Clicked back to the filter already showing: just bring the cards back
        if (latest.current === filter) gsap.to(visibleCards(), { autoAlpha: 1, duration: 0.3, overwrite: true });
        else show(latest.current);
      },
    });
  };

  const openVideo = (item: WorkItem, el: HTMLElement) => {
    opener.current = el;
    setLightbox({ open: true, index: videos.indexOf(item), mounted: true });
  };

  const closeVideo = () => {
    setLightbox((s) => ({ ...s, open: false }));
    opener.current?.focus({ preventScroll: true });
  };

  const goContact = () => {
    if (lenis) lenis.scrollTo("#contact", { offset: -24, duration: 1.2 });
    else document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderEntry = (entry: WorkEntry, slot: Slot, className = "") =>
    entry.kind === "video" ? (
      <VideoCard
        key={entry.item.id}
        item={entry.item}
        slot={slot}
        className={className}
        onOpen={openVideo}
      />
    ) : (
      <CollabTile
        key="collab"
        slot={slot}
        className={className}
        filter={filter}
        onFilter={() => choose("brand-collabs")}
        onContact={goContact}
      />
    );

  return (
    <section ref={root} id="work" aria-labelledby="work-heading" className="bg-cream px-gutter py-section">
      <div className="flex flex-col gap-stack-md lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-stack-sm">
          <div className="flex items-center gap-3">
            <span data-work-head className="reveal label font-bold text-accent">
              02
            </span>
            <span data-work-rule className="h-px w-10 origin-left bg-muted" aria-hidden />
            <span data-work-head className="reveal label text-muted">
              Selected work
            </span>
          </div>
          <h2 id="work-heading" data-work-head className="reveal font-display text-headline">
            Recent content.
          </h2>
        </div>

        {/* Filters: a toggle group; a sideways-scrolling row on phones */}
        <div
          data-work-head
          className="reveal -mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div role="group" aria-label="Filter content" className="flex w-max gap-2">
            {workFilters.map((f) => {
              const on = selected === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(f.id)}
                  className={`rounded-full border px-4 py-2.5 text-[13px] leading-none font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-240 active:scale-[0.98] ${focusRing} ${
                    on ? "border-ink bg-ink text-paper" : "border-ink/25 text-ink hover:border-ink"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      <div data-work-grid className="reveal mt-stack-xl flex flex-col gap-card">
        {/* Row A: feature, plus the tall second card on wide screens */}
        {lead && (
          <div className={`grid gap-card ${second ? "xl:grid-cols-[912fr_380fr]" : ""}`}>
            {renderEntry(lead, "feature")}
            {second && renderEntry(second, "tall", "max-xl:hidden")}
          </div>
        )}

        {/* Row B: swipe row on phones, two columns on tablets, four columns on wide screens */}
        {rest.length > 0 && (
          <div
            className={`-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-card overflow-x-auto px-gutter pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:items-start md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden ${
              rest.length === 1 ? "xl:hidden" : ""
            } ${rest.every((e) => e.kind === "collab") ? "max-md:hidden" : ""}`}
          >
            {rest.map((e, i) => renderEntry(e, "rest", `${i === 0 ? "xl:hidden" : ""} ${e.kind === "collab" ? "max-md:hidden" : ""}`))}
          </div>
        )}

        {/* Phones: the brand tile sits under the swipe row */}
        {tileInRest && (
          <CollabTile
            slot="rest"
            className="min-h-[260px] md:hidden"
            filter={filter}
            onFilter={() => choose("brand-collabs")}
            onContact={goContact}
          />
        )}
      </div>

      <ul data-work-foot className="reveal mt-stack-lg flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:gap-x-10">
        {footerLinks.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 border-b border-ink pb-1.5 text-[14px] font-semibold transition-colors duration-240 hover:border-accent hover:text-accent ${focusRing}`}
            >
              <Icon className="size-4" />
              {label}
            </a>
          </li>
        ))}
      </ul>

      {lightbox.mounted && (
        <WorkLightbox
          items={videos}
          index={Math.min(lightbox.index, videos.length - 1)}
          open={lightbox.open}
          onClose={closeVideo}
          onIndex={(index) => setLightbox((s) => ({ ...s, index }))}
        />
      )}
    </section>
  );
}

/* ───────── Cards ───────── */

const slotSize: Record<Slot, string> = {
  feature: "w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-video xl:aspect-auto xl:h-[600px]",
  tall: "w-full h-[600px]",
  rest: "w-[68vw] max-w-[300px] shrink-0 snap-start aspect-[9/16] md:w-auto md:max-w-none xl:aspect-auto xl:h-[440px]",
};

function VideoCard({
  item,
  slot,
  className,
  onOpen,
}: {
  item: WorkItem;
  slot: Slot;
  className: string;
  onOpen: (item: WorkItem, el: HTMLElement) => void;
}) {
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const Icon = platformIcon[item.platform];
  const youtube = item.platform === "youtube";
  const feature = slot === "feature";

  // Tablets show YouTube wide and TikTok tall in the two-column grid
  const tabletShape = slot === "rest" ? (youtube ? "md:aspect-video" : "md:aspect-[9/16]") : "";

  const label = [`Play: ${item.title}`, platformLabel[item.platform], item.length && spokenLength(item.length)]
    .filter(Boolean)
    .join(", ");

  // A short muted clip after ~300ms of hovering (mouse only, full motion only)
  const startPreview = (e: React.PointerEvent) => {
    if (!item.preview || e.pointerType !== "mouse" || window.matchMedia(REDUCED_MOTION).matches) return;
    timer.current = window.setTimeout(() => setPreviewing(true), PREVIEW_DELAY);
  };
  const stopPreview = () => {
    window.clearTimeout(timer.current);
    setPreviewing(false);
  };

  return (
    <button
      type="button"
      data-work-card
      aria-label={label}
      onClick={(e) => onOpen(item, e.currentTarget)}
      onPointerEnter={startPreview}
      onPointerLeave={stopPreview}
      className={`group relative isolate block overflow-hidden rounded-md bg-ink text-left text-white ${focusRing} ${slotSize[slot]} ${tabletShape} ${className}`}
    >
      {/* Photo (and hover clip) zoom to 104% */}
      <span className="absolute inset-0 transition-transform duration-800 ease-enter motion-safe:group-hover:scale-[1.04]">
        <Image
          src={item.thumb.src}
          alt=""
          fill
          sizes={feature ? "(min-width: 1200px) 912px, 100vw" : slot === "tall" ? "380px" : "(min-width: 1200px) 320px, (min-width: 768px) 50vw, 300px"}
          className="object-cover"
          style={{ objectPosition: item.thumb.position }}
        />
        {previewing && item.preview && (
          <video
            src={item.preview}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition: item.thumb.position }}
          />
        )}
      </span>

      {/* Bottom gradient keeps white titles readable; darkens a touch on hover */}
      <span className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/85 via-ink/30 to-transparent" aria-hidden />
      <span
        className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-ink/45 to-transparent opacity-0 transition-opacity duration-240 group-hover:opacity-100"
        aria-hidden
      />

      <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4" aria-hidden>
        <Tag>
          <Icon className="size-3.5" />
          {platformLabel[item.platform]}
        </Tag>
        {item.length ? <Tag>{item.length}</Tag> : item.pinned && <Tag caps>Pinned</Tag>}
      </span>

      {feature && (
        <span
          className="glass absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-full transition-transform duration-240 ease-enter group-hover:scale-110 sm:size-[72px]"
          aria-hidden
        >
          <PlayIcon className="size-6 translate-x-0.5" />
        </span>
      )}

      <span
        className={`absolute inset-x-4 bottom-4 flex flex-col gap-1.5 ${feature ? "sm:inset-x-6 sm:bottom-6 sm:gap-2.5" : ""}`}
        aria-hidden
      >
        <span
          className={`font-display leading-[1.12] font-light tracking-[-0.01em] ${
            feature
              ? "max-w-[860px] text-[clamp(1.5rem,0.9rem+1.8vw,2.5rem)]"
              : slot === "tall"
                ? "text-[24px]"
                : "text-[20px] xl:text-[22px]"
          }`}
        >
          {item.title}
        </span>
        <span className="text-[12px] font-medium text-white/75">
          {item.views} views
          {youtube && ` · ${categoryLabel[item.category]}`}
        </span>
      </span>
    </button>
  );
}

function Tag({ children, caps }: { children: React.ReactNode; caps?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/45 px-3 py-[7px] text-[11px] leading-none font-semibold text-white backdrop-blur-md ${
        caps ? "tracking-[0.12em] uppercase" : ""
      }`}
    >
      {children}
    </span>
  );
}

/** The plain dark tile that speaks to brands; opens the collab reel (or the brand filter until there is one) */
function CollabTile({
  slot,
  className,
  filter,
  onFilter,
  onContact,
}: {
  slot: Slot;
  className: string;
  filter: WorkFilter;
  onFilter: () => void;
  onContact: () => void;
}) {
  const feature = slot === "feature";
  const sizes: Record<Slot, string> = {
    feature: "min-h-[320px] md:min-h-[400px] xl:h-[600px]",
    tall: "w-full h-[600px]",
    rest: "md:aspect-square xl:aspect-auto xl:h-[440px]",
  };
  // Stretched over the whole tile so any click lands
  const cta = `link inline-flex w-fit items-center gap-1.5 border-b border-white/40 pb-1 text-[14px] font-semibold after:absolute after:inset-0 after:rounded-md ${focusRing} focus-visible:outline-white`;

  return (
    <div
      data-work-card
      className={`relative flex flex-col justify-between gap-8 rounded-md bg-ink p-6 text-white transition-colors duration-240 hover:bg-[#2a221d] ${
        feature ? "sm:p-8" : ""
      } ${sizes[slot]} ${className}`}
    >
      <p className="label text-accent-on-dark">Brand collabs</p>
      <div className="flex flex-col gap-5">
        <p
          className={`font-display leading-[1.15] font-light ${
            feature ? "max-w-[640px] text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)]" : "text-[26px]"
          }`}
        >
          {collab.title}
        </p>
        {collab.reel ? (
          <a href={collab.reel} target="_blank" rel="noreferrer" className={cta}>
            View collab reel <ArrowUpRight className="size-4" />
          </a>
        ) : filter !== "brand-collabs" ? (
          <button type="button" onClick={onFilter} className={cta}>
            See brand collabs <ArrowUpRight className="size-4" />
          </button>
        ) : (
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onContact();
            }}
            className={cta}
          >
            Partner with me <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}
