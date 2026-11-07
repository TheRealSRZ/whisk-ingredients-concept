# Whisk Ingredients · Digital Flagship Concept

An **unofficial, interactive e-commerce prototype** showing how a premium online storefront could work for
**Whisk Ingredients @ Taman Melawati** (Kuala Lumpur). It is a portfolio piece and pitch demo.

> **Interactive concept website · Unofficial demonstration · No real orders or payments**
>
> Not affiliated with, endorsed by or operated by the business. The catalogue, prices, stock levels, delivery
> fees, promo code and payment methods are fictional demonstration data. Product imagery is original SVG
> illustration, not photographs of real stock.

## What works

- Cinematic homepage: GSAP hero timeline, pointer depth parallax, pinned ScrollTrigger story ("Melt. Temper. Set.")
- Catalogue: 26 demo products, 69 variants, 5 categories; search, category and price filters, 4 sort orders, clear-all, empty state
- Product pages: 3-view illustrated gallery, multi-option variants (e.g. Palette × Size), live price and SKU, demo stock, quantity limits
- Wishlist and cart (drawer) with merge-by-SKU, quantity steppers clamped to stock, remove, estimated delivery, `BAKE10` demo code
- Four-step simulated checkout: details → pickup/delivery → demo payment → review → fictional `DEMO-XXXXXXXX` confirmation
- Cart and wishlist persist in `localStorage` (validated on load); checkout details stay in memory only

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
npm run build:single   # one self-contained HTML file in dist-single/ (used for the hosted preview)
npm test               # Vitest unit tests (cart maths, validation, catalogue)
npm run test:e2e       # Playwright E2E against dist-single (needs Google Chrome; run build:single first)
```

Node 18+ (developed on Node 22). E2E uses the locally installed Chrome (`channel: "chrome"`); to use Playwright's
bundled Chromium instead, run `npx playwright install chromium` and remove `channel` from `playwright.config.ts`.

## Project structure

```
src/
  anim/        gsap.ts (plugin registration, reduced-motion helpers), useReveal.ts (ScrollTrigger.batch reveals)
  data/        types.ts, products.ts (demo catalogue + indexes), config.ts (verified store facts vs. demo config)
  lib/         money.ts (integer sen, RM formatting), cart.ts (pure cart/promo/delivery/order logic),
               validation.ts (Malaysian phone, postcode, email), catalogue.ts (search/filter/sort)
  state/       store.tsx (single source of truth: cart, wishlist, toasts, announcements), router.ts (hash router)
  components/  Header (nav, mobile menu, search), CartDrawer, Overlay (accessible animated dialog), ProductArt (SVG
               packshots), HomeArt, ProductCard, QuantityStepper, PromoField, Footer, Toasts
  pages/       Home, Shop, Product, Collections, Approach, Checkout, Confirmation, Misc (Wishlist, Policies, 404)
  styles/      fonts.css (self-hosted Cormorant Garamond + Inter), global.css (tokens + components)
tests/
  unit/        logic.test.ts (29 tests)
  e2e/         shop.spec.ts (25 tests: journeys A/B/C, failure cases, keyboard, motion, viewports, network)
docs/          BUSINESS_EVIDENCE.md, DESIGN_SYSTEM.md, QA_REPORT.md
```

## Architecture notes

- **Money** is always integer sen. `formatRM()` is the only place decimals appear. Discounts round half-up to the sen.
- **Cart rules** (`src/lib/cart.ts`): same SKU merges; different variants are separate lines; quantities clamp to
  `min(stock, 99)`; removing the last line clears the promo; persisted data is re-validated with `sanitiseCart()`.
- **Totals**: subtotal → `BAKE10` 10% off merchandise → delivery (pickup free; Klang Valley RM 12, free at RM 150
  after discount; Peninsular RM 18; Sabah/Sarawak/Labuan RM 28; all demo values) → total, never negative.
- **Routing** uses plain `#name` hashes because the hosted artifact frame only passes simple hashes through.
- **GSAP**: registered once in `src/anim/gsap.ts`; every animation runs inside `useGSAP` with a scope so it is reverted
  on unmount; `gsap.matchMedia()` gates motion on `prefers-reduced-motion` and viewport. Content is readable without
  animation, and no control waits for a tween to finish. Scroll reveals use opacity (not visibility) so hidden links stay focusable.
- **Accessibility**: skip link, one `h1` per view with focus moved to it on navigation, labelled dialogs with focus
  trap / Escape / focus return, error summaries linked to fields, `aria-invalid` + `aria-describedby`, a polite live
  region for cart updates, 44 px touch targets, visible focus rings, WCAG AA contrast on text tokens.

## Security and privacy (prototype scope)

- No backend, no network calls, no API keys, no analytics, no external scripts (fonts are bundled).
- No `dangerouslySetInnerHTML`, `innerHTML` or `eval`. All text renders through React.
- The payment step never shows card, CVV, banking password or PIN fields.
- `localStorage` holds only SKUs, quantities, the promo code and wishlisted product ids. No personal data is stored.
- This is a **client-side simulation** and has not been security-audited. It is not a production e-commerce system.

## Before any real launch

Owner permission and brand assets; real catalogue data (prices, stock, halal/allergen info); a licensed Malaysian
payment provider with server-side confirmation via verified webhooks; server-side validation, order storage, staff
tools and confirmation emails; rate limiting and abuse protection; PDPA-compliant privacy notice and real delivery,
pickup and returns policies; HTTPS and security headers; accessibility and performance testing on real devices.

## Licences

GSAP 3.13 (GreenSock standard no-charge licence), @gsap/react (MIT), React (MIT), Lucide (ISC),
Cormorant Garamond and Inter (SIL Open Font Licence via Fontsource). All illustrations are original to this concept.
