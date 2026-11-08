import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { d, gsap, useGSAP } from "../anim/gsap";

/*
 * Accessible modal panel (drawer / menu / search) with a GSAP entrance and exit.
 * - role="dialog" + aria-modal, labelled by the panel heading
 * - focus moves in on open, is trapped while open, and returns to the trigger on close
 * - Escape and backdrop click close it; body scroll is locked while visible
 * - controls inside are usable immediately; the animation never gates interaction
 */

type Side = "right" | "left" | "top";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  side: Side;
  labelledBy: string;
  initialFocus?: RefObject<HTMLElement>;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Overlay({ open, onClose, side, labelledBy, initialFocus, className = "", children }: OverlayProps) {
  const [mounted, setMounted] = useState(open);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setMounted(true);
    } else if (returnFocus.current) {
      const target = returnFocus.current;
      returnFocus.current = null;
      if (document.contains(target)) target.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.add("is-locked");
    return () => document.body.classList.remove("is-locked");
  }, [mounted]);

  useEffect(() => {
    if (!open || !mounted) return;
    const target = initialFocus?.current ?? panel.current;
    target?.focus({ preventScroll: true });
  }, [open, mounted, initialFocus]);

  useGSAP(
    () => {
      if (!mounted || !panel.current || !backdrop.current) return;
      const hidden = side === "right" ? { xPercent: 100 } : side === "left" ? { xPercent: -100 } : { yPercent: -100 };
      tl.current?.kill();
      if (open) {
        tl.current = gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: d(0.35) }, 0)
          .fromTo(panel.current, hidden, { xPercent: 0, yPercent: 0, duration: d(0.6), ease: "expo.out" }, 0)
          .from(panel.current.querySelectorAll("[data-stagger]"), { y: 16, autoAlpha: 0, stagger: 0.05, duration: d(0.4) }, d(0.18));
      } else {
        tl.current = gsap
          .timeline({ defaults: { ease: "power3.in" }, onComplete: () => setMounted(false) })
          .to(panel.current, { ...hidden, duration: d(0.35) }, 0)
          .to(backdrop.current, { autoAlpha: 0, duration: d(0.3) }, 0);
      }
    },
    { dependencies: [open, mounted], scope: root },
  );

  if (!mounted) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div ref={root} className={`overlay overlay--${side} ${className}`} onKeyDown={onKeyDown}>
      <div ref={backdrop} className="overlay__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        className="overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-state={open ? "open" : "closing"}
      >
        {children}
      </div>
    </div>
  );
}
