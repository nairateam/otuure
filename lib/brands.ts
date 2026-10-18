// "Brands & credentials": who has trusted her, and the training behind her hair advice.
//
// TODO: confirm which brands are real partnerships before launch. Her written list names only
// Cantu, Fairy Favourites, Native Child and L’Oréal; As I Am, Mielle, Advanced Clinicals and
// Uncover come from the brand collage images and may have been gifted PR or product reviews.
// If some weren't paid, remove them or retitle the section ("Brands I’ve created with").
// TODO: add `collab` to a brand once its content is in Selected work. Only brands with real
// content become links; the rest stay plain names.

export type Brand = {
  name: string;
  /** Typeset in Fraunces, each with its own character */
  style: string;
  /** Set when there's content to show: the hover line and where the click goes */
  collab?: { note: string };
};

// Array order is grid order (4 × 2 on tablet and up, 2 × 4 on phones)
export const brands: Brand[] = [
  { name: "Cantu", style: "font-bold" },
  { name: "L’Oréal", style: "font-medium uppercase tracking-[0.08em]" },
  { name: "Native Child", style: "font-semibold italic" },
  { name: "Fairy Favourites", style: "font-light italic" },
  { name: "As I Am", style: "font-normal" },
  { name: "Mielle", style: "font-bold uppercase tracking-[0.12em]" },
  { name: "Advanced Clinicals", style: "font-light" },
  { name: "Uncover", style: "font-bold italic" },
];

export type Course = {
  year: string;
  school: string;
  course: string;
  /** The institution's site, if she wants it linked */
  url?: string;
};

// TODO: "in view" is her phrase for Capelli; "In progress — completing 2026" reads clearer. Confirm with her.
export const education: Course[] = [
  { year: "2024", school: "Lagos Creates", course: "Certificate Course in Content Creation & Design" },
  { year: "2026", school: "Capelli Institute of Trichology", course: "Trichology certification — in progress" },
];

export const brandsBlurb =
  "From global haircare houses to homegrown Nigerian labels — every partnership told with honesty, flair and real results.";
