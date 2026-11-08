# Design System: Whisk Ingredients Concept

Direction: the presentation of a boutique fragrance house applied to baking supplies. Dark "espresso" stages for
cinematic moments, warm ivory pages for shopping, every product shown on a tonal plate like a studio packshot.

## Colour

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--espresso` | #241B18 | Hero, story, footer, primary buttons | Ivory on espresso 14.9:1 |
| `--ivory` | #F5F0E8 | Page background | Ink on ivory 16:1+ |
| `--cream` | #EBE2D5 | Bands, order summary | Ink on cream 13.4:1 |
| `--cocoa` | #694B3B | Hover state, headlines accent | |
| `--copper` | #A77953 | Decorative accent, badges (large/non-text) | 3.4:1 on ivory (decor only) |
| `--copper-ink` | #8A5D3B | Copper text on light | 5.0:1 on ivory |
| `--copper-light` | #C49A72 | Copper text on espresso | 6.6:1 |
| `--olive` | #596453 | In-stock dot, success accents | 5.5:1 on ivory |
| `--ink` | #1D1B19 | Body text | |
| `--muted` | #6B5F57 | Secondary text on light | 5.45:1 on ivory |
| `--muted-dark` | #B9AA9C | Secondary text on espresso | 7.5:1 |
| `--error` | #A23B2A | Errors | 5.8:1 on ivory |

Single theme by choice: one visual world, colours set explicitly, `color-scheme: light`.

## Typography

- Display: **Cormorant Garamond** 500/600 + italic, for headlines, product names, editorial accents.
- Script accent: **Italianno**, only for the one-line tagline "Bake something beautiful." (hero and footer).
- UI and body: **Inter** (variable), for navigation, labels, prices, forms. Prices use tabular numerals.
- Scale: 12 / 14 / 16 / 18 / 24–32 / 32–52 / 42–80 / hero 44–86 px (fluid `clamp()`).
- Eyebrows: 12 px, 600, 0.18em tracking, uppercase. Buttons: 13 px, 600, 0.12em tracking, uppercase.
- Body text 16 px / 1.6. Lines held near 60 characters. Headlines use `text-wrap: balance`.

## Space, shape, layout

- 8-pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Side gutter `clamp(16px, 4vw, 56px)`; max width 1360 px.
- Radius 2 px for controls (crisp, editorial); 18 px for product media, 24 px for frames and cards; arches (999 px top) for hero and editorial imagery; pills for tags and chips. Shadows only on lifted elements (drawer, packshot cards).
- Breakpoints: ≤420 (small phones), ≤560 (phones: 2-col grid), ≤900/960 (tablet: stacked layouts, menu button), desktop above.

## Components

Header (demo notice strip + transparent-over-hero bar), mobile menu, search overlay, product card (packshot, wishlist,
quick add, category, name, price, options), collection tile, carousel, option pills, quantity stepper, stock indicator,
cart drawer, promo field, totals list, checkout steps, choice cards, text fields with hint/error, error summary,
simulation banner, review blocks, confirmation reference block, toasts, empty states, evidence table.

## Imagery

Original SVG "packshots" (17 shapes: bag, pouch, tin, jar, bottle, slab, spatula, whisk, mould, turntable, scale,
board, box, cup, ribbon, gold pot, block) with warm studio shading, a contact shadow and ingredient props. Each
product has three views: packshot, detail crop, styled still life. Always captioned as illustrative.

## Motion (GSAP)

| Moment | Technique | Purpose |
|---|---|---|
| Hero intro | Timeline: masked headline lines, slab rise, shards fall, callets scatter, copy fades in | Orientation, brand tone |
| Hero depth | `quickTo` pointer parallax by layer depth (fine pointer, desktop only) | Tactility |
| Hero scroll | Scrubbed `yPercent` parallax | Depth |
| Story | Pinned, scrubbed timeline: texture → temper (sheen sweep) → set (callets drop, headline) → product card → CTA, with progress bar | Narrative leading to a collection |
| Reveals | `ScrollTrigger.batch` opacity/y on below-fold items only | Pacing |
| Drawer / menu / search | Timeline enter/exit, staggered contents | Spatial continuity |
| Line art | Whisk and wheat-sprig strokes draw on (`strokeDashoffset`) and drift on scroll | Craft, hand-made feel |
| Frames | Arched / rounded `clip-path` reveals with an inner parallax layer (hero, intro, collections, product still life) | Editorial pacing |
| Shop filters | GSAP Flip: cards glide to new positions on filter, search and sort | Spatial continuity |
| Add to cart | Copper dot arcs to the header cart; badge springs (`elastic.out`) | Confirmation |
| Feedback | Button pop, price flash on variant change, gallery crossfade, quick-add "+" rotates on hover | Confirmation |

Rules: transform and opacity only; all tweens in `useGSAP` scopes (auto cleanup); `gsap.matchMedia()` removes pinning
and parallax for reduced motion and below 900 px; durations collapse to 0 under reduced motion; no interaction
waits for an animation.
