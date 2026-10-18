import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata, Viewport } from "next";
import { music, site } from "@/lib/site";
import { seo, siteUrl, personJsonLd } from "@/lib/seo";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SiteHeader } from "@/components/layout/site-header";
import { Preloader } from "@/components/layout/preloader";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingActions } from "@/components/layout/floating-actions";
import { INTRO_KEY } from "@/lib/intro";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Share images (opengraph-image.png, twitter-image.png) and icons (icon.png, apple-icon.png, favicon.ico)
// live in /app and are picked up automatically.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seo.title, template: "%s · Otuure" },
  description: seo.description,
  keywords: seo.keywords,
  applicationName: "Otuure",
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  category: "beauty",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "en_NG",
    url: "/",
    siteName: "Otuure",
    title: seo.title,
    description: seo.description,
    firstName: "Iyiola",
    lastName: "Oluwagbemisola",
    username: "_otuure",
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: "#1c1714",
  colorScheme: "light",
};

// Optional background music: the header shows a toggle only when the track file exists
const track = existsSync(path.join(process.cwd(), "public", music.src)) ? music : null;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        {/* Repeat visits this session skip the preloader; set before first paint so it never flashes */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.dataset.intro="seen"}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-paper font-body text-ink">
        <SmoothScroll>
          <Preloader />
          <SiteHeader music={track} />
          {children}
          <SiteFooter />
          <FloatingActions />
        </SmoothScroll>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <noscript>
          <style>{`.reveal{visibility:visible!important}[data-preloader]{display:none}`}</style>
        </noscript>
      </body>
    </html>
  );
}
