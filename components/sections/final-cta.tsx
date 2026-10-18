"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { duration, ease, revealStart, FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";
import { contact } from "@/lib/site";
import { ArrowRight } from "@/components/ui/icons";
import { photos } from "@/lib/photos";

/*
 * Final call to action ("What can I create for your brand?"), the #contact section.
 * Centred on cream: eyebrow, headline, two buttons, then a portrait that sits on the bottom edge.
 * "Get in touch" opens an email; the outlined email button copies the address.
 */

const services = "Sponsorships · Ambassadorships · UGC · Hair Coaching";

// TODO: swap for the background-removed cutout portrait from the design (embedded image, not in /public yet).
const portrait = { ...photos.redTop, position: "40% 30%" };

const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: fall back to opening the email
      window.location.href = `mailto:${contact.email}`;
    }
  }

  // Entrance, once at 20% visible: eyebrow fades up, headline rises line by line, buttons fade up, portrait rises from the bottom edge
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      const start = { trigger: root.current, start: revealStart, once: true };

      mm.add(FULL_MOTION, () => {
        ScrollTrigger.create({
          ...start,
          onEnter: () => {
            const headline = q("[data-cta-headline]")[0];
            const split = SplitText.create(headline, { type: "lines", mask: "lines" });

            gsap
              .timeline({ defaults: { ease: ease.enter } })
              .fromTo(q("[data-cta-eyebrow]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal }, 0)
              .set(headline, { autoAlpha: 1 }, 0.1)
              .fromTo(
                split.lines,
                { yPercent: 100 },
                { yPercent: 0, duration: duration.reveal, stagger: 0.1, onComplete: () => split.revert() },
                0.1
              )
              .fromTo(q("[data-cta-actions]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: duration.reveal }, 0.4)
              .fromTo(q("[data-cta-portrait]"), { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: duration.hero }, 0.3);
          },
        });
      });

      // Reduced motion: one short fade
      mm.add(REDUCED_MOTION, () => {
        ScrollTrigger.create({
          ...start,
          onEnter: () => gsap.fromTo(q(".reveal"), { autoAlpha: 0 }, { autoAlpha: 1, duration: duration.reducedFade }),
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="contact"
      aria-labelledby="contact-heading"
      className="flex flex-col items-center gap-stack-md overflow-hidden bg-cream px-gutter pt-section text-center"
    >
      <p data-cta-eyebrow className="reveal text-[15px] font-semibold text-balance">
        {services}
      </p>

      <h2 id="contact-heading" data-cta-headline className="reveal font-display text-hero text-balance">
        What can I create <br className="max-sm:hidden" />
        for your brand?
      </h2>

      <div data-cta-actions className="reveal flex flex-col items-center gap-3 pt-2 sm:flex-row">
        <a
          href={`mailto:${contact.email}?subject=${encodeURIComponent("Working together")}`}
          className={`btn bg-accent text-white hover:bg-ink ${focusRing}`}
        >
          Get in touch
          <span data-arrow>
            <ArrowRight className="size-[18px]" />
          </span>
        </a>
        <button
          type="button"
          onClick={copyEmail}
          aria-label={`Copy email address ${contact.email}`}
          className={`btn max-w-full border border-ink break-all hover:bg-ink hover:text-cream ${focusRing}`}
        >
          {copied ? "Email copied" : contact.email}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email address copied" : ""}
        </span>
      </div>

      {/* Portrait sits flush on the section's bottom edge: 520 × 640 at full size */}
      <div data-cta-portrait className="reveal relative mt-stack-sm aspect-[520/640] w-full max-w-[520px]">
        <div className="arch absolute inset-0 overflow-hidden">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(min-width: 640px) 520px, 90vw"
            className="object-cover"
            style={{ objectPosition: portrait.position }}
          />
        </div>
      </div>
    </section>
  );
}
