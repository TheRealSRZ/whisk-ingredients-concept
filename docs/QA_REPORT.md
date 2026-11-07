# QA Report: Whisk Ingredients Concept Prototype

Date: 7 November 2026. Build: `dist-single/index.html` (≈712 KB, fonts, JS, CSS and art inlined).
Environment: Node 22, Vitest 2.1.8, Playwright 1.49.1 driving Google Chrome (headless). Desktop 1440×900 unless noted.

## How the work was checked

1. **Unit tests** (`npm test`): 29 tests on the pure logic: catalogue integrity, sen-based money, cart merge/clamp,
   BAKE10 rules, delivery zones and threshold, persistence sanitising, order reference format, validators, search/filter/sort.
2. **End-to-end tests** (`npm run test:e2e`): 27 tests in real Chrome. The final suite passed **27/27 on three consecutive runs**.
3. **Independent review**: a separate agent that did not write the code re-ran both suites, wrote its own adversarial
   scripts (20,000 random carts; tampered storage; double-submit; focus-trap stress; contrast from computed styles;
   one-h1 and accessible-name sweeps on 12 routes) and reviewed the source. Its findings and fixes are below.

## Required scenarios

| Scenario | Result | Evidence |
|---|---|---|
| Journey A: home → collection → product → variant → qty 2 → cart subtotal → continue shopping | PASS | 2 × Dark Couverture 2.5 kg = RM 378.00; SKU updates |
| Journey B: search → category filter → sort → wishlist → add → remove → counts | PASS | badge counts update; empty cart state shown |
| Journey C: multiple items → BAKE10 → pickup → details → demo payment → review → confirm | PASS | RM 58.70 − RM 5.87 = RM 52.83 on review, button and confirmation |
| Invalid coupon | PASS | error shown, `aria-invalid`, no discount |
| Duplicate coupon | PASS (unit) | `already-applied`; UI hides the field once applied |
| Checkout with empty cart | PASS | empty state with link to shop |
| Invalid customer information | PASS | error summary (3 problems), field errors, summary links focus fields |
| Invalid delivery information | PASS | address, state and postcode errors |
| Quantity above demo stock | PASS | 10 typed → clamped to 4; further adds disabled; cart stepper capped |
| Out-of-stock variant | PASS | add button disabled |
| Navigating backwards | PASS | Back keeps entered data in every step |
| Edit fulfilment from review | PASS | switch to Selangor delivery → total RM 70.70 (+RM 12 demo fee) |
| Payment attempted with incomplete checkout | PASS | payment step blocks; placing an order re-validates all steps and returns to the broken one |
| Refresh persistence | PASS | cart and wishlist restored; checkout details not stored |
| Tampered localStorage | PASS | quantities capped, unknown SKUs dropped, no errors |
| Keyboard only | PASS | skip link, dialog focus trap, Escape returns focus, keyboard add-to-cart, visible focus |
| Reduced motion | PASS | no pin, no hero transforms, all story steps visible |
| Mobile navigation and checkout (390 px) | PASS | menu → shop → filter → add → full checkout → confirmation |
| No horizontal overflow at 360 / 390 / 768 / 1024 / 1440 px | PASS | 7 pages each |
| GSAP and ScrollTrigger run in the preview | PASS | hero tweens applied; story pinned (`pin-spacer` present) |
| No external network requests, no console errors, no card fields | PASS | request log empty; no `cc-*`, CVV or password inputs |
| Leaving during simulated payment | PASS (after fix) | order cancelled, cart kept |

## Failures found and fixed

| Severity | Issue | Fix |
|---|---|---|
| Major | Leaving checkout during the 1.4 s simulated payment still completed the order and cleared the whole cart (found by the independent reviewer) | Timer cleared on unmount; only the ordered lines are removed; regression test added |
| Major | Scroll reveals used `visibility: hidden`, so keyboard users skipped below-fold links | Reveals use opacity only; links stay focusable |
| Minor | Category radio briefly showed the old value until the hash route updated | Optimistic selection |
| Minor | Mobile: content hidden under the fixed header when the demo notice wrapped; 23–27 px horizontal overflow | Header height measured into `--chrome-h`; grid tracks `minmax(0,1fr)` |
| Minor | `aria-labelledby` ids with spaces on Policies | Slugified ids |
| Minor | Typing `1.5` in a quantity field became 15 | Non-integers revert |
| Minor | Address shown as plainly "found" although the unit number conflicts | Source note now says owner to confirm |
| Nit | Error summary heading level; `aria-controls` pointing at a closed menu; stock text ignored cart quantity; `tel:` link to the real shop from a demo; favicon 404 | All fixed |

## Not tested

- Real screen readers (NVDA, VoiceOver, TalkBack); real iOS Safari and Android devices (only Chrome emulation).
- Firefox and WebKit.
- Lighthouse and Core Web Vitals: no scores were measured, so none are claimed.
- Behaviour with localStorage disabled or full (code falls back gracefully; not exercised).
- Live cross-tab sync via the `storage` event (code path exists; not exercised).
- Contrast of text over gradients and in hover states (base colours measured only).

## Known limitations

- Client-side simulation only: no server validation, no orders stored, no payment provider, no emails.
- Product images are SVG illustrations, not photographs.
- Typing `0` in the cart quantity sets it to 1; removal uses the Remove link.
- The single-file build includes both woff and woff2 of Cormorant (about 80 KB that could be trimmed).

## Production work still required

Owner permission and assets; real catalogue and stock; licensed Malaysian payment gateway with server-side
confirmation via verified webhooks; server-side validation and order storage; staff tools; transactional email;
rate limiting and abuse protection; PDPA privacy notice and real policies; security headers and HTTPS;
measured performance and accessibility audits on real devices.
