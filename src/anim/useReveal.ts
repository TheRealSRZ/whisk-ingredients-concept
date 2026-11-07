import type { RefObject } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Gentle scroll reveals for [data-reveal] elements inside `scope`.
 * Only elements that start below the fold are faded, so the first frame is
 * complete at rest; reduced-motion users get no hiding at all (matchMedia).
 * Uses opacity (not visibility/autoAlpha) so links inside stay focusable:
 * tabbing to one scrolls it into view, which triggers the reveal.
 */
export function useReveal(scope: RefObject<HTMLElement>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        const fold = window.innerHeight * 0.92;
        const below = els.filter((el) => el.getBoundingClientRect().top > fold);
        if (below.length === 0) return;
        gsap.set(below, { opacity: 0, y: 36 });
        ScrollTrigger.batch(below, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, overwrite: true }),
        });
      });
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
