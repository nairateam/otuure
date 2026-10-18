import { contact, site, socials } from "@/lib/site";

// Where the site lives. Set NEXT_PUBLIC_SITE_URL once the custom domain is live;
// on Vercel it falls back to the production URL, locally to the dev server.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3100");

export const seo = {
  title: "Otuure · Hair, Beauty & Lifestyle Creator in Lagos",
  // ~155 characters: fits a Google result without being cut off
  description:
    "Iyiola A. Oluwagbemisola (Otuure) is a Lagos-based natural hair care specialist and creator. Brand partnerships, UGC, hair coaching and hair care eBooks.",
  keywords: [
    "Otuure",
    "Iyiola Oluwagbemisola",
    "natural hair care",
    "4C hair",
    "hair care specialist Lagos",
    "trichologist",
    "beauty content creator Nigeria",
    "UGC creator Lagos",
    "brand ambassador",
    "hair coaching",
    "natural hair eBook",
  ],
};

// Structured data so search engines know who the site is about and which profiles are hers
export const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: site.name,
      alternateName: "Otuure",
      jobTitle: "Content Creator & Hair Care Specialist",
      description: seo.description,
      url: siteUrl,
      image: `${siteUrl}/images/garden-chair.webp`,
      email: `mailto:${contact.email}`,
      telephone: "+2349139080159",
      address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
      knowsAbout: ["Natural hair care", "4C hair", "Trichology", "Beauty", "Lifestyle content"],
      sameAs: [socials.instagram, socials.tiktok, socials.youtube],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Otuure",
      publisher: { "@id": `${siteUrl}/#person` },
      inLanguage: "en",
    },
  ],
};
