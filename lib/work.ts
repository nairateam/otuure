import { socials } from "@/lib/site";
import { photos } from "@/lib/photos";

// "Selected work": a hand-picked set (~6 pieces), not a feed. Each entry mirrors the CMS
// fields in the spec. Array order is grid order; the `feature` item takes the big slot.
//
// TODO: every thumbnail is one of her portraits as a stand-in — swap in the real video covers.
// TODO: real video links + embed ids (the lightbox plays `embed`; without one it links out).
// TODO: the two TikTok captions are placeholder wording — use her real captions.

export type Platform = "youtube" | "tiktok" | "instagram";
export type Category = "hair" | "lifestyle" | "brand";

export type WorkItem = {
  id: string;
  platform: Platform;
  title: string;
  /** Display string, updated by hand (e.g. "2.9K") */
  views: string;
  /** YouTube only, "mm:ss" */
  length?: string;
  category: Category;
  /** Takes the large card when "All" is selected */
  feature?: boolean;
  /** Shows the "Pinned" tag (TikTok) */
  pinned?: boolean;
  /** The video on its platform, for "Watch on …" */
  url: string;
  /** YouTube video id or TikTok video id, for the lightbox player */
  embed?: string;
  thumb: { src: string; position: string };
  /** Short muted clip played on hover; the zoom alone is fine without one */
  preview?: string;
};

export const workItems: WorkItem[] = [
  {
    id: "texturize-day",
    platform: "youtube",
    title: "The amazing technique to achieve a natural hair look — my texturize day routine",
    views: "4.8K",
    length: "16:45",
    category: "hair",
    feature: true,
    url: socials.youtube,
    thumb: { src: photos.gardenChair.src, position: "55% 35%" },
  },
  {
    id: "low-maintenance-4c",
    platform: "tiktok",
    title: "Low-maintenance styling for 4C hair",
    views: "73.9K",
    category: "hair",
    pinned: true,
    url: socials.tiktok,
    thumb: { src: photos.afroPuff.src, position: "50% 30%" },
  },
  {
    id: "detangle-waist-length",
    platform: "youtube",
    title: "How I detangle my waist-length 4C hair",
    views: "2.9K",
    length: "22:00",
    category: "hair",
    url: socials.youtube,
    thumb: { src: photos.longCurls.src, position: "50% 30%" },
  },
  {
    id: "half-up-half-down",
    platform: "tiktok",
    title: "Half up, half down",
    views: "28.1K",
    category: "lifestyle",
    pinned: true,
    url: socials.tiktok,
    thumb: { src: photos.studioGlasses.src, position: "50% 30%" },
  },
  {
    id: "everyday-look",
    platform: "tiktok",
    title: "Everyday look, start to finish",
    views: "21.7K",
    category: "lifestyle",
    pinned: true,
    url: socials.tiktok,
    thumb: { src: photos.redTop.src, position: "40% 35%" },
  },
];

// The dark text tile that speaks to brands. TODO: set `reel` once she has a collab
// compilation or Instagram highlight; until then the tile filters the gallery instead.
export const collab = {
  title: "UGC for Cantu, L’Oréal, Advanced Clinicals & more.",
  reel: undefined as string | undefined,
};

export const workFilters = [
  { id: "all", label: "All" },
  { id: "hair-tutorials", label: "Hair tutorials" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "brand-collabs", label: "Brand collabs" },
] as const;

export type WorkFilter = (typeof workFilters)[number]["id"];

const filterCategory: Record<Exclude<WorkFilter, "all">, Category> = {
  "hair-tutorials": "hair",
  lifestyle: "lifestyle",
  "brand-collabs": "brand",
};

export const categoryLabel: Record<Category, string> = {
  hair: "Hair tutorial",
  lifestyle: "Lifestyle",
  brand: "Brand collab",
};

export const platformLabel: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

/** Grid entries for a filter: the matching videos (feature first), plus the brand tile where it belongs */
export type WorkEntry = { kind: "video"; item: WorkItem } | { kind: "collab" };

export function entriesFor(filter: WorkFilter): WorkEntry[] {
  const videos = workItems
    .filter((v) => filter === "all" || v.category === filterCategory[filter])
    .sort((a, b) => Number(!!b.feature) - Number(!!a.feature))
    .map((item) => ({ kind: "video" as const, item }));
  const withTile = filter === "all" || filter === "brand-collabs";
  return withTile ? [...videos, { kind: "collab" }] : videos;
}

/** "16:45" → "16 minutes 45 seconds", for screen readers */
export function spokenLength(length: string) {
  const [m, s] = length.split(":").map(Number);
  const mins = `${m} minute${m === 1 ? "" : "s"}`;
  return s ? `${mins} ${s} second${s === 1 ? "" : "s"}` : mins;
}
