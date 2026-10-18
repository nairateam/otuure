import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { WhatIDo } from "@/components/sections/what-i-do";
import { SelectedWork } from "@/components/sections/selected-work";
import { Reach } from "@/components/sections/reach";
import { Brands } from "@/components/sections/brands";
import { Philosophy } from "@/components/sections/philosophy";
import { ValuesBand } from "@/components/sections/values-band";
import { Featured } from "@/components/sections/featured";
import { Ebooks } from "@/components/sections/ebooks";
import { FinalCta } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <WhatIDo />
      <SelectedWork />
      <Reach />
      <Brands />
      <Philosophy />
      <ValuesBand />
      <Featured />
      <Ebooks />
      <FinalCta />
    </main>
  );
}
