<div align="center">

# Whisk · Ingredients Concept

**A premium, fully interactive e-commerce prototype for a baking-supply shop in Taman Melawati, Kuala Lumpur.**

Boutique fragrance-house presentation, applied to flour, couverture and cake boards.

![React](https://img.shields.io/badge/React-18.3-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.13-0AE448?logo=greensock&logoColor=black)
![Tests](https://img.shields.io/badge/tests-32%20unit%20%C2%B7%2029%20e2e-2E7D32)
![Status](https://img.shields.io/badge/status-concept%20%2F%20demo-A77953)

</div>

> [!IMPORTANT]
> **Interactive concept website · Unofficial demonstration · No real orders or payments.**
> This project is an independent design proposal. It is **not affiliated with, endorsed by or operated by**
> Whisk Ingredients. All products, prices, stock, delivery fees, promo codes and payment methods are fictional
> demonstration data. Product imagery is original SVG illustration, not photographs of real stock.

---

## Contents

- [Highlights](#highlights)
- [Quick start](#quick-start)
- [Try the demo](#try-the-demo)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Security and privacy](#security-and-privacy)
- [Roadmap to production](#roadmap-to-production)
- [Credits and licences](#credits-and-licences)

## Highlights

| | |
|---|---|
| 🎬 **Cinematic homepage** | GSAP hero timeline, arched clip-path reveal, self-drawing line art, pointer depth parallax, a pinned ScrollTrigger story ("Melt. Temper. Set.") |
| ✨ **Motion details** | GSAP Flip filtering, fly-to-cart, elastic cart badge, scroll-revealed editorial frames |
| 🛍️ **Real catalogue behaviour** | 26 demo products, 69 variants, 5 collections, search, category and price filters, 4 sort orders |
| 🎛️ **Multi-option variants** | e.g. Palette × Size, with live price, SKU and demo stock |
| 🛒 **Working cart** | Drawer, merge by SKU, stock-clamped quantities, `BAKE10` demo code, delivery estimate |
| 💳 **Simulated checkout** | Details → pickup/delivery → demo payment → review → `DEMO-XXXXXXXX` confirmation |
| 🇲🇾 **Malaysian conventions** | RM formatting, +60 phone validation, 5-digit postcodes, 16 states and territories |
| ♿ **Accessible** | Keyboard and screen-reader friendly, reduced-motion support, WCAG AA contrast |

## Quick start

**Requirements:** Node.js 18+ and npm.

```bash
git clone https://github.com/TheRealSRZ/whisk-ingredients-concept.git
cd whisk-ingredients-concept
npm install
npm run dev
```

Open <http://localhost:5173>.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run build:single` | Build one self-contained `index.html` to `dist-single/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest unit tests |
| `npm run test:e2e` | Run the Playwright tests (run `npm run build:single` first; uses installed Chrome) |

## Try the demo

1. **Browse:** open a collection from the homepage, or search for `vanilla`, `couverture` or `spatula`.
2. **Choose options:** open *Sprinkle Medley* and switch palette and size. Price and SKU update.
3. **Hit a limit:** *Double-Acting Baking Powder 500 g* has 4 in demo stock. Try ordering 10.
4. **Apply a code:** open the cart and enter `BAKE10` for 10% off merchandise.
5. **Check out:** complete the four steps. Try an invalid postcode or phone number to see validation.

> [!NOTE]
> Demo delivery rules: store pickup free · Klang Valley RM 12 (free from RM 150 after discount) ·
> Peninsular RM 18 · Sabah, Sarawak and Labuan RM 28. None of these are the shop's real terms.

## Tech stack

- **[React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)** (strict mode)
- **[Vite 5](https://vitejs.dev)**, with [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile) for a portable one-file build
- **[GSAP 3.13](https://gsap.com)** with ScrollTrigger and [`@gsap/react`](https://gsap.com/resources/React)
- **[Lucide](https://lucide.dev)** icons
- **Cormorant Garamond + Inter + Italianno**, self-hosted via Fontsource
- **[Vitest](https://vitest.dev)** and **[Playwright](https://playwright.dev)** for testing

## Project structure

```text
src/
├── anim/         GSAP registration, reduced-motion helpers, scroll reveals
├── components/   Header, CartDrawer, Overlay (accessible dialog), ProductArt (SVG packshots), …
├── data/         Demo catalogue, verified store facts vs. demo config, types
├── lib/          Money (integer sen), cart, validation, catalogue search/filter/sort
├── pages/        Home, Shop, Product, Collections, Visit, Checkout, Confirmation, …
├── state/        Store (single source of truth) and hash router
└── styles/       Design tokens and component styles
tests/
├── unit/         Business logic tests
└── e2e/          Browser journeys, failure cases, keyboard, motion, viewports
docs/
├── BUSINESS_EVIDENCE.md   What is verified, assumed or fictional
├── DESIGN_SYSTEM.md       Colours, type, spacing, components, motion
└── QA_REPORT.md           Tests run, bugs fixed, what remains untested
```

## How it works

- **Money is integer sen.** No floating-point arithmetic; `formatRM()` is the only place decimals appear.
- **Pure cart logic** in `src/lib/cart.ts`: the same SKU merges, different variants stay separate, quantities clamp to demo stock, totals can never go negative.
- **One store** (`src/state/store.tsx`) holds cart, wishlist and UI state. Cart and wishlist persist in `localStorage` and are re-validated on load. Checkout details stay in memory only.
- **Hash routing** (`#shop`, `#product-<id>`, `#checkout`, …) keeps the build portable to static hosts and sandboxed previews.
- **Motion is progressive.** Every animation runs inside `useGSAP` scopes with automatic cleanup. `gsap.matchMedia()` disables pinning and parallax for reduced motion and small screens, and no control waits on an animation.

## Testing

```bash
npm test             # 29 unit tests
npm run build:single
npm run test:e2e     # 27 end-to-end tests in Chrome
```

The end-to-end suite covers the three shopping journeys, invalid coupons and form data, an empty cart, stock limits, back-navigation and editing, refresh persistence, tampered storage, keyboard-only use, reduced motion, mobile checkout, five viewport widths, and a check that no external network requests are made. Full results are in [`docs/QA_REPORT.md`](docs/QA_REPORT.md).

## Accessibility

Skip link · one `h1` per view, with focus moved on navigation · labelled dialogs with focus trap, Escape and focus return · error summaries linked to fields · `aria-invalid` and descriptive errors · live-region announcements for cart updates · 44 px touch targets · visible focus rings · AA contrast on all text tokens · `prefers-reduced-motion` support.

## Security and privacy

- No backend, network calls, API keys, analytics or third-party scripts.
- No `dangerouslySetInnerHTML`, `innerHTML` or `eval`.
- The payment step never asks for card numbers, CVVs, banking passwords or PINs.
- `localStorage` stores only SKUs, quantities, the promo code and wishlisted product ids.

> [!WARNING]
> This is a client-side simulation and has not been security-audited. It is not a production e-commerce system.

## Roadmap to production

- [ ] Owner permission, brand assets and product photography
- [ ] Real catalogue, prices, stock, halal and allergen data
- [ ] Licensed Malaysian payment gateway with server-side webhook confirmation
- [ ] Server-side validation, order storage, staff tools and order emails
- [ ] Rate limiting, abuse protection, security headers
- [ ] PDPA privacy notice and real delivery, pickup and returns policies
- [ ] Measured Lighthouse, Core Web Vitals and screen-reader audits on real devices

## Credits and licences

- Design, code and illustrations: original to this concept.
- [GSAP](https://gsap.com/licensing/): GreenSock standard no-charge licence · [@gsap/react](https://github.com/greensock/react): MIT
- [React](https://github.com/facebook/react): MIT · [Lucide](https://lucide.dev/license): ISC
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) and [Inter](https://fonts.google.com/specimen/Inter): SIL Open Font Licence

"Whisk Ingredients" is referenced only to identify the business this concept was made for. All rights in that name belong to its owner.

<div align="center"><sub>Concept prototype · 2026 · Not a real shop · No real orders or payments</sub></div>
