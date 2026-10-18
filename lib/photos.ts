// Every photo on the site, in one place. All WebP (quality 90) in /public/images.
//
// Placement rule: a photo never appears twice in one section or in two neighbouring sections.
// The small round profile avatar (studioGlasses) is the exception: it is her profile picture everywhere.
//
// Resolution: gardenKiss is 1200px wide; studioGlasses, terracottaWall, booksAndGlasses and mirrorSelfie
// are 600–650px, so they only go in small spots (cards, thumbnails, previews). Every other photo is
// 1440px or wider and can go anywhere, including the full-screen hero.

export type Photo = { src: string; alt: string };

export const photos = {
  gardenKiss: { src: "/images/garden-kiss.webp", alt: "Iyiola sitting on a white sheet in a garden, blowing a kiss" },
  studioGlasses: { src: "/images/studio-glasses.webp", alt: "Studio portrait of Iyiola in glasses with a white flower in her hair" },
  terracottaWall: { src: "/images/terracotta-wall.webp", alt: "Iyiola seated on a wooden stool against a terracotta wall full of plants" },
  booksAndGlasses: { src: "/images/books-and-glasses.webp", alt: "Iyiola in glasses and a black turtleneck, sitting cross-legged with her books" },
  mirrorSelfie: { src: "/images/mirror-selfie.webp", alt: "Iyiola taking a mirror selfie in a black dress, hair in a high bun" },
  gardenChair: { src: "/images/garden-chair.webp", alt: "Iyiola smiling on a carved chair among plants, afro out, in a black jumper with a white collar" },
  sleekBun: { src: "/images/sleek-bun.webp", alt: "Iyiola in profile with a sleek bun and two loose braids, in a black ribbed top" },
  afroPuff: { src: "/images/afro-puff.webp", alt: "Iyiola facing the camera with a curly afro puff and a gold necklace" },
  redTop: { src: "/images/red-top.webp", alt: "Iyiola smiling in a red strapless top and gold earrings" },
  ankaraDress: { src: "/images/ankara-dress.webp", alt: "Iyiola in a yellow ankara print dress, seated in a rattan chair beside palms" },
  longCurls: { src: "/images/long-curls.webp", alt: "Iyiola facing the camera with long, defined natural curls past her shoulders" },
  curlyFlower: { src: "/images/curly-flower.webp", alt: "Iyiola with a curly twist-out and a flower clip, in a black strapless top" },
} satisfies Record<string, Photo>;
