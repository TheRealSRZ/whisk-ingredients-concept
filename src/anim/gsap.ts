import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/*
 * Single place where GSAP plugins are registered. Everything that animates
 * imports from here so registration happens once, before any useGSAP call.
 * The shop never depends on an animation finishing: every control works while
 * tweens run, and content is readable without JavaScript animation.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.8 });

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const REDUCED = "(prefers-reduced-motion: reduce)";
export const DESKTOP_MOTION = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.(REDUCED).matches === true;
}

/** Duration helper: collapses to 0 when the user prefers reduced motion. */
export function d(seconds: number): number {
  return prefersReducedMotion() ? 0 : seconds;
}

export { gsap, ScrollTrigger, useGSAP };
