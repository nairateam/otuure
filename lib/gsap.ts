"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

CustomEase.create("enter", "0.16, 1, 0.3, 1");
CustomEase.create("screen", "0.65, 0, 0.35, 1");

gsap.defaults({ ease: "enter", duration: 0.48 });

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
