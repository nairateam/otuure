import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// One page for now; add each new route here
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }];
}
