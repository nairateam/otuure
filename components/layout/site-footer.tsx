import { contact, site, socials } from "@/lib/site";
import { CurrentYear } from "@/components/ui/current-year";
import { ArrowUpRight, EnvelopeIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";

/*
 * Footer: quote and contact details, the giant "Otuure." wordmark on a continuous loop, then the bottom bar.
 *
 * 1280 and up: quote beside the three contact columns. Under 1280 they stack.
 * The wordmark runs edge to edge: the track holds the words twice and slides left by half its width,
 * so the second copy lands where the first began (same technique as the values band).
 * It stands still with reduced motion.
 */

// Site credit in the footer signature
const credit = { name: "Oluwafemi O.", url: "https://temp-femi.vercel.app/" };

const socialLinks = [
  { href: socials.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: socials.tiktok, label: "TikTok", Icon: TikTokIcon },
  { href: socials.youtube, label: "YouTube", Icon: YouTubeIcon },
  { href: `mailto:${contact.email}`, label: "Email", Icon: EnvelopeIcon },
];

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

// Three words per copy keeps each copy wider than the widest screen
function Wordmarks() {
  return (
    <div className="flex shrink-0">
      {[0, 1, 2].map((i) => (
        <span key={i} className="shrink-0 pr-[0.25em] whitespace-nowrap">
          {site.wordmark}
        </span>
      ))}
    </div>
  );
}

export function SiteFooter() {
  const [user, domain] = contact.email.split("@");

  return (
    <footer className="flex flex-col gap-[80px] overflow-hidden bg-ink px-gutter pt-[120px] pb-10 text-white max-md:gap-stack-xl max-md:pt-section">
      <div className="flex flex-col gap-stack-xl xl:flex-row xl:gap-column">
        <figure className="flex flex-1 flex-col gap-5">
          <blockquote className="font-display text-statement font-light tracking-[-0.02em] italic">
            “Beauty begins the moment you decide to be yourself.”
          </blockquote>
          <figcaption className="text-[15px] font-semibold tracking-[0.06em] text-white/60">— Coco Chanel</figcaption>
        </figure>

        <dl className="grid gap-stack-md sm:grid-cols-3 sm:gap-stack-xl xl:w-[620px] xl:shrink-0">
          <div className="flex flex-col gap-3">
            <dt className="label font-bold text-accent-on-dark">Address</dt>
            <dd className="leading-[1.55] text-white/85">
              {contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex flex-col gap-3">
            <dt className="label font-bold text-accent-on-dark">Phone</dt>
            <dd className="leading-[1.55] text-white/85">
              <a href={contact.phoneHref} className={`link ${focusRing}`}>
                {contact.phone}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-3">
            <dt className="label font-bold text-accent-on-dark">Email</dt>
            <dd className="leading-[1.55] text-white/85">
              {/* Breaks before the @ like the design, so the address never overflows its column */}
              <a href={`mailto:${contact.email}`} className={`link ${focusRing}`}>
                {user}
                <wbr />@{domain}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* Decorative: the name is in the bottom bar */}
      <div aria-hidden className="-mx-gutter overflow-hidden">
        <div className="flex w-max animate-marquee font-display text-[clamp(7.5rem,2rem+19vw,21.25rem)] leading-[0.9] font-light tracking-[-0.04em] text-paper italic motion-reduce:animate-none">
          <Wordmarks />
          <Wordmarks />
        </div>
      </div>

      <div data-footer-dock className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-[14px] border border-white/15 bg-white/[0.06] px-6 py-[18px] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-[15px]">
            <span className="font-bold">{site.name}</span>
            <span className="text-white/60">
              © <CurrentYear /> · All rights reserved
            </span>
          </p>
          <ul className="flex items-center gap-[22px]">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  aria-label={label}
                  className={`block transition-colors duration-240 hover:text-accent-on-dark ${focusRing}`}
                >
                  <Icon className="size-[22px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Signature, left-aligned so the floating buttons on the right never cover it */}
        <p className="px-6 text-[13px] tracking-[0.02em] text-white/45">
          Designed &amp; built by{" "}
          <a
            href={credit.url}
            target="_blank"
            rel="noreferrer"
            className={`group inline-flex items-center gap-1 font-display text-[15px] text-white/80 italic transition-colors duration-240 hover:text-accent-on-dark ${focusRing}`}
          >
            <span className="link">{credit.name}</span>
            <ArrowUpRight className="size-3.5 transition-transform duration-240 ease-enter group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </p>
      </div>
    </footer>
  );
}
