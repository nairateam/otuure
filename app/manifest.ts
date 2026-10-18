import type { MetadataRoute } from "next";
import { seo } from "@/lib/seo";

// Name, colours and icon used when the site is saved to a phone's home screen
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Otuure",
    short_name: "Otuure",
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ee",
    theme_color: "#1c1714",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
