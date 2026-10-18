import { socials } from "@/lib/site";
import type { Platform } from "@/lib/work";
import { photos } from "@/lib/photos";

// "Audience & reach": the numbers brands check before booking. Updated by hand each month —
// out-of-date counts hurt credibility, so bump `updated` whenever the figures change.
//
// TODO: confirm current figures with her before launch. Her sources disagree:
//  - Instagram followers: 48.5K (her screenshot) vs 46K (Canva site)
//  - Instagram "380K monthly profile views" is from the Canva text; her screenshot shows
//    427.8K views in the last 30 days (a different measure)
//  - YouTube subscribers: 820+ (Canva text) vs 796 (her screenshot)
// TODO: the TikTok photo repeats the hero two sections up — swap for a still from one of her TikToks.
// TODO: set `mediaKit` to the PDF once she has one; until then the link opens the contact form.

export type ReachStat = { value: string; label: string };

export type ReachCard = {
  platform: Platform;
  /** As shown on the card (no @) */
  handle: string;
  url: string;
  /** The big number, split so it can count up: 48.5 + "K" → "48.5K" */
  count: { value: number; decimals: number; suffix: string };
  unit: string;
  stats: [ReachStat, ReachStat];
  photo: { src: string; position: string };
};

// Instagram first (largest audience), TikTok in the middle (its engagement is the selling point)
export const reachCards: ReachCard[] = [
  {
    platform: "instagram",
    handle: "_otuure",
    url: socials.instagram,
    count: { value: 48.5, decimals: 1, suffix: "K" },
    unit: "followers",
    stats: [
      { value: "3.5–4%", label: "Engagement" },
      { value: "380K", label: "Monthly profile views" },
    ],
    photo: { src: photos.mirrorSelfie.src, position: "34% 45%" },
  },
  {
    platform: "tiktok",
    handle: "otuure",
    url: socials.tiktok,
    count: { value: 3.4, decimals: 1, suffix: "K" },
    unit: "followers",
    stats: [
      { value: "8–10%", label: "Engagement" },
      { value: "26K", label: "Total likes" },
    ],
    photo: { src: photos.gardenKiss.src, position: "50% 55%" },
  },
  {
    platform: "youtube",
    handle: "ThatgirlOtuure",
    url: socials.youtube,
    count: { value: 820, decimals: 0, suffix: "+" },
    unit: "subscribers",
    stats: [
      { value: "~1,000", label: "Avg. views / video" },
      { value: "5–7%", label: "Engagement" },
    ],
    photo: { src: photos.booksAndGlasses.src, position: "40% 40%" },
  },
];

export const reach = {
  blurb:
    "A loyal, highly engaged community of women learning to love and care for their natural hair — across Instagram, TikTok and YouTube.",
  updated: "Oct 2026",
  mediaKit: undefined as string | undefined,
};

export function formatCount(value: number, decimals: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function countLabel(card: ReachCard) {
  return `${formatCount(card.count.value, card.count.decimals)}${card.count.suffix}`;
}
