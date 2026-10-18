import { socials } from "@/lib/site";

export type Ebook = {
  title: string;
  subtitle: string;
  /** Where the book is sold. TODO: per-book store links; both point at Instagram for now. */
  url: string;
  /** Typeset stand-in cover until the real cover art is in /public */
  cover: { background: string; text: string; accent: string };
};

export const ebooks: Ebook[] = [
  {
    title: "One Step to Healthy Fro",
    subtitle: "A beginner’s path to a thriving afro",
    url: socials.instagram,
    cover: { background: "bg-accent", text: "text-paper", accent: "text-paper/70" },
  },
  {
    title: "The Afro Hair Play Book",
    subtitle: "Winning tips for natural, relaxed & texturized hair",
    url: socials.instagram,
    cover: { background: "bg-cream", text: "text-ink", accent: "text-accent" },
  },
];

export const ebooksNote = "Link on IG @_otuure · For personal use only";
