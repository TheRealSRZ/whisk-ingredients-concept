import type { RefObject } from "react";
import { gsap, MOTION_OK, primeDraw, useGSAP } from "./gsap";

/**
 * Editorial frame reveals and line-art drawing inside `scope`:
 * - [data-frame]: clip-path opens from an inset rounded window to full, then the
 *   frame's [data-frame-inner] drifts with scroll (parallax).
 * - svg.line-art .draw: strokes draw themselves in when scrolled into view.
 * Only runs when motion is allowed; at rest everything is fully visible.
 */
export function useFrames(scope: RefObject<HTMLElement>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-frame]", scope.current).forEach((frame, i) => {
          const radius = frame.dataset.frame === "arch" ? "999px 999px 24px 24px" : "24px";
          gsap.from(frame, {
            clipPath: `inset(16% 16% 16% 16% round ${radius})`,
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: frame, start: "top 88%" },
          });
          const inner = frame.querySelector("[data-frame-inner]");
          if (inner)
            gsap.fromTo(
              inner,
              { yPercent: -7 },
              { yPercent: 7, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 + (i % 3) * 0.3 } },
            );
        });
        gsap.utils.toArray<SVGSVGElement>("svg.line-art[data-scroll-draw]", scope.current).forEach((svg) => {
          const paths = gsap.utils.toArray<SVGPathElement>(".draw", svg);
          primeDraw(paths);
          gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 2.2,
            stagger: 0.06,
            ease: "power2.inOut",
            scrollTrigger: { trigger: svg, start: "top 85%" },
          });
          gsap.to(svg, {
            yPercent: -18,
            rotation: 6,
            ease: "none",
            scrollTrigger: { trigger: svg, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
