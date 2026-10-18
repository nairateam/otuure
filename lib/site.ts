// Site-wide content shared by the header, hero and footer.

import { photos, type Photo } from "@/lib/photos";

export const site = {
  name: "Iyiola A. Oluwagbemisola",
  role: "Content Creator & Trichologist · Lagos",
  wordmark: "Otuure.",
};

export const sections = [
  { label: "Info", href: "#info" },
  { label: "Content", href: "#content" },
  { label: "Reach", href: "#reach" },
  { label: "Brands", href: "#brands" },
  { label: "eBook", href: "#ebook" },
  { label: "Contact", href: "#contact" },
];

export type HeroSlide = {
  src: string;
  alt: string;
  /** CSS object-position for the crop */
  position: string;
  /** Extra zoom for a tighter framing (1 = none) */
  zoom?: number;
};

const slide = (photo: Photo, position: string, zoom?: number): HeroSlide => ({ ...photo, position, zoom });

// One hero background per section, in the same order as `sections`.
// Full-screen, so only high-resolution photos (1440px+); a different one for each section.
export const heroSlides: HeroSlide[] = [
  slide(photos.gardenChair, "55% 45%"), // Info
  slide(photos.curlyFlower, "50% 35%"), // Content
  slide(photos.afroPuff, "50% 30%"), // Reach
  slide(photos.ankaraDress, "50% 38%"), // Brands
  slide(photos.longCurls, "50% 30%"), // eBook: her hair, for the hair care guides
  slide(photos.redTop, "40% 35%"), // Contact
];

export const contact = {
  email: "iyiolaoluwagbemisola@gmail.com",
  phone: "(+234) 913 908 0159",
  phoneHref: "tel:+2349139080159",
  /** WhatsApp number in international format, digits only (for wa.me links) */
  whatsapp: "2349139080159",
  address: ["Block 20, The Secretariat,", "Obafemi Awolowo Way,", "Alausa, Ikeja, Lagos"],
  location: "Lagos, NG",
  timeZone: "Africa/Lagos",
  zoneLabel: "WAT",
};

export type MenuLink = {
  label: string;
  href: string;
  /** Short note shown on the right of the menu row */
  meta: string;
  /** Photo that floats beside the menu on hover */
  preview: HeroSlide;
};

// Main menu, in page order. Each link previews a different photo, matching its section where it can.
export const menuLinks: MenuLink[] = [
  { label: "About", href: "#info", meta: "Say hello", preview: slide(photos.gardenKiss, "50% 58%") },
  { label: "What I do", href: "#content", meta: "3 disciplines", preview: slide(photos.terracottaWall, "55% 45%") },
  { label: "Work", href: "#work", meta: "Recent content", preview: slide(photos.afroPuff, "50% 35%") },
  { label: "Reach", href: "#reach", meta: "48.5K on IG", preview: slide(photos.mirrorSelfie, "34% 45%") },
  { label: "Brands", href: "#brands", meta: "8 partners", preview: slide(photos.studioGlasses, "50% 30%") },
  { label: "Featured", href: "#featured", meta: "MNBA ’24/25", preview: slide(photos.ankaraDress, "50% 38%") },
  { label: "eBooks", href: "#ebook", meta: "2 guides", preview: slide(photos.booksAndGlasses, "50% 35%") },
  { label: "Contact", href: "#contact", meta: "Let’s talk", preview: slide(photos.redTop, "40% 35%") },
];

// Her profiles (YouTube channel name: "ThatgirlOtuure")
export const socials = {
  instagram: "https://www.instagram.com/_otuure",
  tiktok: "https://www.tiktok.com/@otuure",
  youtube: "https://www.youtube.com/@otuure",
};

// Optional background music (header toggle). Free under the Pixabay Content License; credit not required.
export const music = {
  src: "/audio/elegant-piano.mp3",
  title: "Elegant Piano Music",
  artist: "Tunetank",
  source: "https://pixabay.com/music/classical-piano-elegant-piano-music-350061/",
};
