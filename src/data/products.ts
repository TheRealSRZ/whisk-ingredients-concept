import type { Category, CategoryId, Product, ProductArt, Variant } from "./types";

/*
 * DEMONSTRATION CATALOGUE — ENTIRELY FICTIONAL.
 * Product names, descriptions, prices (in sen), variants and stock levels are
 * invented for this unofficial concept. They are NOT Whisk Ingredients' real
 * inventory, pricing or availability. No brand names are used on purpose.
 */

const BACKDROP = {
  cream: "#EDE5D8",
  sand: "#E4D7C5",
  stone: "#DCD1C2",
  mist: "#D5D8CB",
  clay: "#E7D6CA",
  espresso: "#2C221E",
  cocoa: "#3B2C25",
} as const;

const art = (a: ProductArt): ProductArt => a;
const v = (sku: string, options: Record<string, string>, price: number, stock: number): Variant => ({
  sku,
  options,
  price,
  stock,
});

export const CATEGORIES: Category[] = [
  {
    id: "essentials",
    name: "Baking Essentials",
    short: "Essentials",
    intro: "Flours, sugars and leaveners: the quiet foundation of every crumb and crust.",
    art: art({ shape: "bag", backdrop: BACKDROP.sand, body: "#F4EEE4", accent: "#694B3B", label: "FLOUR", prop: "dust" }),
  },
  {
    id: "chocolate",
    name: "Chocolate & Flavours",
    short: "Chocolate",
    intro: "Couverture, cocoa and aromatics for ganache, glazes and deeper flavour.",
    art: art({ shape: "bar", backdrop: BACKDROP.espresso, body: "#3A2419", accent: "#A77953", label: "70%", prop: "callets" }),
  },
  {
    id: "decorating",
    name: "Cake Decorating",
    short: "Decorating",
    intro: "Sprinkles, pearls, colours and fondant for the finishing details.",
    art: art({ shape: "jar", backdrop: BACKDROP.clay, body: "#F3E7DD", accent: "#B3836A", label: "PEARLS", prop: "pearls" }),
  },
  {
    id: "tools",
    name: "Baking Tools",
    short: "Tools",
    intro: "Spatulas, whisks, moulds and scales: precise instruments for steady hands.",
    art: art({ shape: "whisk", backdrop: BACKDROP.mist, body: "#B9BDB6", accent: "#596453", label: "WHISK", prop: "none" }),
  },
  {
    id: "packaging",
    name: "Packaging & Presentation",
    short: "Packaging",
    intro: "Boards, boxes, cups and ribbon to present and carry each bake.",
    art: art({ shape: "box", backdrop: BACKDROP.stone, body: "#C8A27E", accent: "#694B3B", label: "PATISSERIE", prop: "none" }),
  },
];

export const PRODUCTS: Product[] = [
  // ───────────────────────── Baking Essentials ─────────────────────────
  {
    id: "superfine-cake-flour",
    name: "Superfine Cake Flour",
    category: "essentials",
    headline: "For crumb as soft as a whisper.",
    summary: "Low-protein, finely milled flour for chiffon, sponge and butter cakes.",
    description:
      "A finely milled, low-protein wheat flour suited to tender, even-textured cakes. Sift once before folding to keep batters light and airy.",
    usage: "Use in chiffon, genoise and butter cakes. Store sealed in a cool, dry cupboard.",
    attributes: [
      { label: "Protein (demo spec)", value: "Approx. 8%" },
      { label: "Best for", value: "Sponge, chiffon, butter cakes" },
      { label: "Storage", value: "Cool, dry, sealed" },
    ],
    options: [{ name: "Size", values: ["1 kg", "5 kg"] }],
    variants: [
      v("ESS-CAKEFL-1KG", { Size: "1 kg" }, 690, 40),
      v("ESS-CAKEFL-5KG", { Size: "5 kg" }, 2990, 12),
    ],
    featured: true,
    related: ["fine-caster-sugar", "double-acting-baking-powder", "balloon-whisk"],
    art: art({ shape: "bag", backdrop: BACKDROP.sand, body: "#F5F0E8", accent: "#694B3B", label: "CAKE FLOUR", prop: "dust" }),
  },
  {
    id: "unbleached-bread-flour",
    name: "Unbleached Bread Flour",
    category: "essentials",
    headline: "Structure, stretch and a crackling crust.",
    summary: "High-protein flour for open-crumb loaves, buns and enriched doughs.",
    description:
      "An unbleached, high-protein flour that develops strong gluten for chewy, well-risen breads. Pairs well with long, cool fermentation.",
    usage: "Use for loaves, burger buns, brioche and pizza bases.",
    attributes: [
      { label: "Protein (demo spec)", value: "Approx. 12.5%" },
      { label: "Best for", value: "Breads and enriched doughs" },
      { label: "Storage", value: "Cool, dry, sealed" },
    ],
    options: [{ name: "Size", values: ["1 kg", "5 kg"] }],
    variants: [
      v("ESS-BREADFL-1KG", { Size: "1 kg" }, 750, 35),
      v("ESS-BREADFL-5KG", { Size: "5 kg" }, 3290, 9),
    ],
    featured: false,
    related: ["superfine-cake-flour", "digital-kitchen-scale", "fine-caster-sugar"],
    art: art({ shape: "bag", backdrop: BACKDROP.stone, body: "#EFE6D6", accent: "#596453", label: "BREAD FLOUR", prop: "dust" }),
  },
  {
    id: "fine-caster-sugar",
    name: "Fine Caster Sugar",
    category: "essentials",
    headline: "Dissolves fast. Whips glossy.",
    summary: "Fine-grain sugar for meringues, sponges and smooth creaming.",
    description:
      "Smaller crystals dissolve quickly, making caster sugar ideal for meringues, macarons and creamed butter cakes where texture matters.",
    usage: "Add gradually when whipping egg whites for a stable, glossy meringue.",
    attributes: [
      { label: "Grain", value: "Fine" },
      { label: "Best for", value: "Meringue, sponge, creaming" },
      { label: "Storage", value: "Airtight, away from moisture" },
    ],
    options: [{ name: "Size", values: ["1 kg", "3 kg"] }],
    variants: [
      v("ESS-CASTER-1KG", { Size: "1 kg" }, 590, 50),
      v("ESS-CASTER-3KG", { Size: "3 kg" }, 1650, 18),
    ],
    featured: false,
    related: ["icing-sugar", "superfine-cake-flour", "balloon-whisk"],
    art: art({ shape: "pouch", backdrop: BACKDROP.cream, body: "#FBF8F2", accent: "#A77953", label: "CASTER", prop: "dust" }),
  },
  {
    id: "icing-sugar",
    name: "Sifted Icing Sugar",
    category: "essentials",
    headline: "A snowfall for buttercream and glaze.",
    summary: "Powdered sugar for buttercream, royal icing and finishing dust.",
    description:
      "Powdered sugar for silky buttercreams, glazes and royal icing, or a final dusting over a cooled tart.",
    usage: "Sift before use. Dust through a fine sieve just before serving.",
    attributes: [
      { label: "Texture", value: "Powdered" },
      { label: "Best for", value: "Buttercream, royal icing, dusting" },
      { label: "Storage", value: "Airtight" },
    ],
    options: [{ name: "Size", values: ["500 g", "1 kg"] }],
    variants: [
      v("ESS-ICING-500G", { Size: "500 g" }, 490, 30),
      v("ESS-ICING-1KG", { Size: "1 kg" }, 890, 22),
    ],
    featured: false,
    related: ["fine-caster-sugar", "angled-offset-spatula", "gel-food-colour"],
    art: art({ shape: "pouch", backdrop: BACKDROP.clay, body: "#FFFDF9", accent: "#694B3B", label: "ICING", prop: "dust" }),
  },
  {
    id: "double-acting-baking-powder",
    name: "Double-Acting Baking Powder",
    category: "essentials",
    headline: "Lift, twice over.",
    summary: "Reacts once in the bowl and again in the oven for a reliable rise.",
    description:
      "A double-acting leavener that releases gas when mixed and again with heat, giving muffins, scones and cakes a dependable rise.",
    usage: "Whisk evenly into dry ingredients. Keep the lid tightly closed.",
    attributes: [
      { label: "Type", value: "Double-acting" },
      { label: "Best for", value: "Cakes, scones, muffins" },
      { label: "Storage", value: "Tightly sealed tin" },
    ],
    options: [{ name: "Size", values: ["100 g", "500 g"] }],
    variants: [
      v("ESS-BKPWD-100G", { Size: "100 g" }, 650, 25),
      v("ESS-BKPWD-500G", { Size: "500 g" }, 2490, 4),
    ],
    featured: false,
    related: ["superfine-cake-flour", "digital-kitchen-scale", "fine-caster-sugar"],
    art: art({ shape: "tin", backdrop: BACKDROP.mist, body: "#596453", accent: "#F5F0E8", label: "RISE", prop: "none" }),
  },
  {
    id: "blanched-almond-flour",
    name: "Blanched Almond Flour",
    category: "essentials",
    headline: "The secret of a smooth macaron shell.",
    summary: "Finely ground blanched almonds for macarons, frangipane and financiers.",
    description:
      "Skinless almonds ground fine for smooth macaron shells, rich frangipane and buttery financiers.",
    usage: "Sift with icing sugar for macarons. Refrigerate after opening.",
    attributes: [
      { label: "Grind", value: "Extra fine" },
      { label: "Best for", value: "Macarons, frangipane, financiers" },
      { label: "Storage", value: "Refrigerate after opening" },
    ],
    options: [{ name: "Size", values: ["250 g", "1 kg"] }],
    variants: [
      v("ESS-ALMOND-250G", { Size: "250 g" }, 1890, 16),
      v("ESS-ALMOND-1KG", { Size: "1 kg" }, 6490, 3),
    ],
    featured: true,
    related: ["icing-sugar", "silicone-mould", "gel-food-colour"],
    art: art({ shape: "pouch", backdrop: BACKDROP.sand, body: "#E9D9C2", accent: "#694B3B", label: "ALMOND", prop: "dust" }),
  },

  // ───────────────────────── Chocolate & Flavours ─────────────────────────
  {
    id: "dark-couverture-callets",
    name: "Dark Couverture Callets 70%",
    category: "chocolate",
    headline: "Deep, glossy, made to temper.",
    summary: "Bittersweet couverture drops for tempering, ganache and baking.",
    description:
      "Bittersweet couverture in easy-melt drops with a high cocoa butter content for a fluid, glossy temper. Suits ganache, bonbons and rich brownies.",
    usage: "Temper by seeding: melt to 45–50°C, cool to 27°C, rework to 31–32°C.",
    attributes: [
      { label: "Cocoa (demo spec)", value: "70%" },
      { label: "Format", value: "Callets / drops" },
      { label: "Best for", value: "Tempering, ganache, baking" },
    ],
    options: [{ name: "Size", values: ["1 kg", "2.5 kg"] }],
    variants: [
      v("CHO-DARK70-1KG", { Size: "1 kg" }, 7990, 14),
      v("CHO-DARK70-2KG5", { Size: "2.5 kg" }, 18900, 5),
    ],
    featured: true,
    related: ["dutch-cocoa-powder", "vanilla-bean-paste", "silicone-mould"],
    art: art({ shape: "pouch", backdrop: BACKDROP.espresso, body: "#3A2419", accent: "#A77953", label: "DARK 70", prop: "callets" }),
  },
  {
    id: "milk-couverture-callets",
    name: "Milk Couverture Callets 35%",
    category: "chocolate",
    headline: "Caramel-warm and generous.",
    summary: "Creamy milk couverture for mousses, fillings and enrobing.",
    description:
      "A creamy milk couverture with caramel notes. Melts evenly for mousses, cookie fillings and enrobing.",
    usage: "Temper: melt to 45°C, cool to 26°C, rework to 29–30°C.",
    attributes: [
      { label: "Cocoa (demo spec)", value: "35%" },
      { label: "Format", value: "Callets / drops" },
      { label: "Best for", value: "Mousse, fillings, enrobing" },
    ],
    options: [{ name: "Size", values: ["1 kg"] }],
    variants: [v("CHO-MILK35-1KG", { Size: "1 kg" }, 6990, 11)],
    featured: false,
    related: ["dark-couverture-callets", "white-couverture-callets", "silicone-mould"],
    art: art({ shape: "pouch", backdrop: BACKDROP.cocoa, body: "#7A5236", accent: "#EBE2D5", label: "MILK 35", prop: "callets" }),
  },
  {
    id: "white-couverture-callets",
    name: "White Couverture Callets 28%",
    category: "chocolate",
    headline: "Ivory-smooth, vanilla-soft.",
    summary: "White couverture for ganache, colouring and drips.",
    description:
      "A smooth white couverture with gentle vanilla notes, easy to colour with oil-based colours for drips and decorations.",
    usage: "Melt gently below 45°C. Colour with fat-soluble colours only.",
    attributes: [
      { label: "Cocoa butter (demo spec)", value: "28%" },
      { label: "Format", value: "Callets / drops" },
      { label: "Best for", value: "Ganache, drips, colouring" },
    ],
    options: [{ name: "Size", values: ["1 kg"] }],
    variants: [v("CHO-WHITE28-1KG", { Size: "1 kg" }, 7290, 0)],
    featured: false,
    related: ["milk-couverture-callets", "gel-food-colour", "dark-couverture-callets"],
    art: art({ shape: "pouch", backdrop: BACKDROP.cream, body: "#F6EEDF", accent: "#A77953", label: "WHITE 28", prop: "callets" }),
  },
  {
    id: "dutch-cocoa-powder",
    name: "Dutch-Processed Cocoa Powder",
    category: "chocolate",
    headline: "Dark as espresso, round as velvet.",
    summary: "Alkalised cocoa for deep colour and mellow chocolate flavour.",
    description:
      "Alkalised cocoa powder with a deep reddish-brown colour and smooth, mellow flavour. Gives cakes, brownies and drinks a rich finish.",
    usage: "Sift before use. Bloom in hot liquid for the fullest flavour.",
    attributes: [
      { label: "Fat (demo spec)", value: "22–24%" },
      { label: "Process", value: "Alkalised" },
      { label: "Best for", value: "Cakes, brownies, drinks" },
    ],
    options: [{ name: "Size", values: ["250 g", "1 kg"] }],
    variants: [
      v("CHO-COCOA-250G", { Size: "250 g" }, 1590, 28),
      v("CHO-COCOA-1KG", { Size: "1 kg" }, 5290, 8),
    ],
    featured: true,
    related: ["dark-couverture-callets", "superfine-cake-flour", "vanilla-bean-paste"],
    art: art({ shape: "tin", backdrop: BACKDROP.cocoa, body: "#2A1B15", accent: "#A77953", label: "COCOA", prop: "dust" }),
  },
  {
    id: "vanilla-bean-paste",
    name: "Vanilla Bean Paste",
    category: "chocolate",
    headline: "Every seed, suspended in amber.",
    summary: "Thick vanilla paste with visible seeds for custards and creams.",
    description:
      "A thick, aromatic paste flecked with vanilla seeds. Use it like extract, with the speckled look of a scraped pod.",
    usage: "Substitute 1 tsp paste for 1 tsp extract or one vanilla pod.",
    attributes: [
      { label: "Format", value: "Paste with seeds" },
      { label: "Best for", value: "Custards, ice cream, frosting" },
      { label: "Storage", value: "Room temperature, sealed" },
    ],
    options: [{ name: "Size", values: ["65 ml", "200 ml"] }],
    variants: [
      v("FLV-VANPASTE-65ML", { Size: "65 ml" }, 3290, 20),
      v("FLV-VANPASTE-200ML", { Size: "200 ml" }, 8990, 6),
    ],
    featured: true,
    related: ["dark-couverture-callets", "fine-caster-sugar", "dutch-cocoa-powder"],
    art: art({ shape: "bottle", backdrop: BACKDROP.sand, body: "#5A3A22", accent: "#F5F0E8", label: "VANILLA", prop: "pod" }),
  },
  {
    id: "matcha-baking-powder",
    name: "Matcha Baking Powder",
    category: "chocolate",
    headline: "Grassy, bright, unmistakably green.",
    summary: "Culinary-grade green tea powder for baking and lattes.",
    description:
      "A culinary-grade matcha with a vivid colour that holds through baking. Lovely in chiffon, cookies, white chocolate ganache and lattes.",
    usage: "Sift to remove lumps. Whisk with a little warm water before adding to batters.",
    attributes: [
      { label: "Grade", value: "Culinary (demo)" },
      { label: "Best for", value: "Chiffon, cookies, lattes" },
      { label: "Storage", value: "Airtight, away from light" },
    ],
    options: [{ name: "Size", values: ["100 g", "250 g"] }],
    variants: [
      v("FLV-MATCHA-100G", { Size: "100 g" }, 2890, 15),
      v("FLV-MATCHA-250G", { Size: "250 g" }, 6290, 2),
    ],
    featured: false,
    related: ["white-couverture-callets", "superfine-cake-flour", "balloon-whisk"],
    art: art({ shape: "tin", backdrop: BACKDROP.mist, body: "#6E7F55", accent: "#F5F0E8", label: "MATCHA", prop: "dust" }),
  },

  // ───────────────────────── Cake Decorating ─────────────────────────
  {
    id: "sprinkle-medley",
    name: "Sprinkle Medley",
    category: "decorating",
    headline: "A celebration in every pinch.",
    summary: "Hand-blended sprinkle mixes in three palettes.",
    description:
      "A blend of jimmies, quins and nonpareils in curated palettes. Scatter over buttercream or press around a cake's base.",
    usage: "Apply to fresh buttercream or ganache before it sets.",
    attributes: [
      { label: "Mix", value: "Jimmies, quins, nonpareils" },
      { label: "Best for", value: "Cakes, cupcakes, cookies" },
      { label: "Storage", value: "Cool and dry" },
    ],
    options: [
      { name: "Palette", values: ["Pastel", "Rainbow", "Gold & Ivory"] },
      { name: "Size", values: ["100 g", "500 g"] },
    ],
    variants: [
      v("DEC-SPRINK-PAS-100", { Palette: "Pastel", Size: "100 g" }, 790, 24),
      v("DEC-SPRINK-PAS-500", { Palette: "Pastel", Size: "500 g" }, 2990, 6),
      v("DEC-SPRINK-RBW-100", { Palette: "Rainbow", Size: "100 g" }, 790, 30),
      v("DEC-SPRINK-RBW-500", { Palette: "Rainbow", Size: "500 g" }, 2990, 0),
      v("DEC-SPRINK-GLD-100", { Palette: "Gold & Ivory", Size: "100 g" }, 990, 12),
      v("DEC-SPRINK-GLD-500", { Palette: "Gold & Ivory", Size: "500 g" }, 3490, 3),
    ],
    featured: true,
    related: ["sugar-pearls", "gel-food-colour", "cake-boards"],
    art: art({ shape: "jar", backdrop: BACKDROP.clay, body: "#F4EAE2", accent: "#B3836A", label: "SPRINKLES", prop: "sprinkles" }),
  },
  {
    id: "sugar-pearls",
    name: "Sugar Pearls",
    category: "decorating",
    headline: "Lustre, one pearl at a time.",
    summary: "Shimmering sugar pearls in two sizes and two finishes.",
    description:
      "Crisp sugar pearls with a soft shimmer for elegant borders, cascading designs and cupcake toppers.",
    usage: "Place with tweezers onto soft icing, or adhere with a dot of piping gel.",
    attributes: [
      { label: "Finish", value: "Shimmer" },
      { label: "Best for", value: "Borders, cascades, toppers" },
      { label: "Storage", value: "Cool and dry, away from humidity" },
    ],
    options: [
      { name: "Finish", values: ["Pearl White", "Champagne Gold"] },
      { name: "Size", values: ["4 mm", "6 mm"] },
    ],
    variants: [
      v("DEC-PEARL-WHT-4", { Finish: "Pearl White", Size: "4 mm" }, 990, 18),
      v("DEC-PEARL-WHT-6", { Finish: "Pearl White", Size: "6 mm" }, 1090, 14),
      v("DEC-PEARL-GLD-4", { Finish: "Champagne Gold", Size: "4 mm" }, 1290, 9),
      v("DEC-PEARL-GLD-6", { Finish: "Champagne Gold", Size: "6 mm" }, 1390, 5),
    ],
    featured: false,
    related: ["sprinkle-medley", "edible-gold-flakes", "fondant-ready-to-roll"],
    art: art({ shape: "jar", backdrop: BACKDROP.cream, body: "#F7F1EA", accent: "#A77953", label: "PEARLS", prop: "pearls" }),
  },
  {
    id: "gel-food-colour",
    name: "Concentrated Gel Colour",
    category: "decorating",
    headline: "Saturated colour, a drop at a time.",
    summary: "Highly concentrated gel colours for buttercream and fondant.",
    description:
      "Concentrated gel colour that tints without thinning your icing. Build shades gradually with a toothpick.",
    usage: "Add with a toothpick, mix fully, and let colours deepen for 30 minutes.",
    attributes: [
      { label: "Format", value: "20 g gel bottle" },
      { label: "Best for", value: "Buttercream, fondant, batters" },
      { label: "Storage", value: "Room temperature" },
    ],
    options: [{ name: "Colour", values: ["Cocoa", "Rose", "Sage", "Sky", "Noir"] }],
    variants: [
      v("DEC-GEL-COCOA", { Colour: "Cocoa" }, 690, 20),
      v("DEC-GEL-ROSE", { Colour: "Rose" }, 690, 26),
      v("DEC-GEL-SAGE", { Colour: "Sage" }, 690, 10),
      v("DEC-GEL-SKY", { Colour: "Sky" }, 690, 0),
      v("DEC-GEL-NOIR", { Colour: "Noir" }, 790, 7),
    ],
    featured: false,
    related: ["fondant-ready-to-roll", "icing-sugar", "angled-offset-spatula"],
    art: art({ shape: "bottle", backdrop: BACKDROP.clay, body: "#B5676A", accent: "#F5F0E8", label: "GEL", prop: "none" }),
  },
  {
    id: "edible-gold-flakes",
    name: "Gold Leaf Flakes",
    category: "decorating",
    headline: "A flicker of light on dark ganache.",
    summary: "Delicate metallic flakes for finishing chocolates and cakes.",
    description:
      "Fine metallic flakes for a final flourish on truffles, tarts and drip cakes. A small pot goes a long way.",
    usage: "Lift with dry tweezers or a soft brush; avoid touching with fingers.",
    attributes: [
      { label: "Format", value: "Flakes in glass pot" },
      { label: "Best for", value: "Chocolates, tarts, cakes" },
      { label: "Note", value: "Demo item: verify food-grade status" },
    ],
    options: [{ name: "Size", values: ["0.1 g", "0.3 g"] }],
    variants: [
      v("DEC-GOLDLEAF-01", { Size: "0.1 g" }, 2490, 10),
      v("DEC-GOLDLEAF-03", { Size: "0.3 g" }, 5990, 4),
    ],
    featured: true,
    related: ["dark-couverture-callets", "sugar-pearls", "cake-boards"],
    art: art({ shape: "leaf", backdrop: BACKDROP.espresso, body: "#1F1916", accent: "#C99A5B", label: "GOLD", prop: "leaf" }),
  },
  {
    id: "fondant-ready-to-roll",
    name: "Ready-to-Roll Fondant",
    category: "decorating",
    headline: "A clean canvas for sharp edges.",
    summary: "Smooth, pliable fondant for covering and modelling.",
    description:
      "A soft, elastic fondant that rolls thin without tearing. Covers cakes cleanly and takes colour evenly.",
    usage: "Knead until pliable. Roll to 3–4 mm on a surface dusted with icing sugar.",
    attributes: [
      { label: "Texture", value: "Soft, elastic" },
      { label: "Best for", value: "Covering, modelling" },
      { label: "Storage", value: "Wrapped, room temperature" },
    ],
    options: [
      { name: "Shade", values: ["Ivory", "Bright White"] },
      { name: "Size", values: ["500 g", "1 kg"] },
    ],
    variants: [
      v("DEC-FONDANT-IVY-500", { Shade: "Ivory", Size: "500 g" }, 1490, 15),
      v("DEC-FONDANT-IVY-1K", { Shade: "Ivory", Size: "1 kg" }, 2690, 7),
      v("DEC-FONDANT-WHT-500", { Shade: "Bright White", Size: "500 g" }, 1490, 19),
      v("DEC-FONDANT-WHT-1K", { Shade: "Bright White", Size: "1 kg" }, 2690, 9),
    ],
    featured: false,
    related: ["gel-food-colour", "cake-turntable", "cake-boards"],
    art: art({ shape: "block", backdrop: BACKDROP.cream, body: "#FAF5EC", accent: "#596453", label: "FONDANT", prop: "none" }),
  },

  // ───────────────────────── Baking Tools ─────────────────────────
  {
    id: "angled-offset-spatula",
    name: "Angled Offset Spatula",
    category: "tools",
    headline: "The tool behind every smooth side.",
    summary: "Flexible stainless blade with a balanced wooden handle.",
    description:
      "A flexible stainless steel blade set at an angle to keep knuckles clear while smoothing buttercream, spreading batter or lifting tarts.",
    usage: "Hand wash and dry immediately to protect the handle.",
    attributes: [
      { label: "Blade", value: "Stainless steel" },
      { label: "Handle", value: "Hardwood" },
      { label: "Care", value: "Hand wash" },
    ],
    options: [{ name: "Blade", values: ["15 cm", "23 cm", "30 cm"] }],
    variants: [
      v("TLS-OFFSET-15", { Blade: "15 cm" }, 1890, 22),
      v("TLS-OFFSET-23", { Blade: "23 cm" }, 2490, 13),
      v("TLS-OFFSET-30", { Blade: "30 cm" }, 3290, 6),
    ],
    featured: true,
    related: ["cake-turntable", "fondant-ready-to-roll", "icing-sugar"],
    art: art({ shape: "spatula", backdrop: BACKDROP.mist, body: "#C9CCC6", accent: "#6B4A33", label: "", prop: "none" }),
  },
  {
    id: "silicone-mould",
    name: "Silicone Entremet Mould",
    category: "tools",
    headline: "Precise shapes, clean release.",
    summary: "Flexible food-grade silicone for mousses, inserts and financiers.",
    description:
      "A flexible silicone mould that releases frozen mousses and baked financiers cleanly. Choose your cavity shape.",
    usage: "Place on a flat tray before filling. Freeze mousses fully before unmoulding.",
    attributes: [
      { label: "Material", value: "Silicone (demo spec)" },
      { label: "Temperature", value: "-40°C to 230°C (demo spec)" },
      { label: "Care", value: "Dishwasher safe" },
    ],
    options: [{ name: "Shape", values: ["Hemisphere ×6", "Financier ×8", "Mini Tart ×12"] }],
    variants: [
      v("TLS-MOULD-HEMI6", { Shape: "Hemisphere ×6" }, 2990, 9),
      v("TLS-MOULD-FIN8", { Shape: "Financier ×8" }, 3490, 7),
      v("TLS-MOULD-TART12", { Shape: "Mini Tart ×12" }, 3990, 3),
    ],
    featured: false,
    related: ["dark-couverture-callets", "blanched-almond-flour", "balloon-whisk"],
    art: art({ shape: "mould", backdrop: BACKDROP.stone, body: "#3E3A36", accent: "#A77953", label: "", prop: "none" }),
  },
  {
    id: "balloon-whisk",
    name: "Stainless Balloon Whisk",
    category: "tools",
    headline: "More air, fewer strokes.",
    summary: "Balanced balloon whisk with flexible wires for aerating.",
    description:
      "Flexible stainless wires in a wide balloon shape whip air into creams and egg whites quickly and evenly.",
    usage: "Hold at a slight angle and whisk in loops, lifting to incorporate air.",
    attributes: [
      { label: "Material", value: "Stainless steel" },
      { label: "Wires", value: "12 (demo spec)" },
      { label: "Care", value: "Dishwasher safe" },
    ],
    options: [{ name: "Length", values: ["25 cm", "30 cm"] }],
    variants: [
      v("TLS-WHISK-25", { Length: "25 cm" }, 2190, 17),
      v("TLS-WHISK-30", { Length: "30 cm" }, 2690, 11),
    ],
    featured: false,
    related: ["fine-caster-sugar", "angled-offset-spatula", "digital-kitchen-scale"],
    art: art({ shape: "whisk", backdrop: BACKDROP.mist, body: "#B9BDB6", accent: "#596453", label: "", prop: "none" }),
  },
  {
    id: "cake-turntable",
    name: "Aluminium Cake Turntable",
    category: "tools",
    headline: "Turn slowly. Finish sharply.",
    summary: "Heavy, smooth-turning stand for icing and piping.",
    description:
      "A weighted aluminium turntable on smooth bearings, steady enough for sharp buttercream edges and even piping.",
    usage: "Use with an offset spatula and bench scraper for smooth sides.",
    attributes: [
      { label: "Diameter", value: "30 cm" },
      { label: "Material", value: "Aluminium" },
      { label: "Care", value: "Wipe clean" },
    ],
    options: [{ name: "Size", values: ["30 cm"] }],
    variants: [v("TLS-TURNTABLE-30", { Size: "30 cm" }, 8900, 5)],
    featured: true,
    related: ["angled-offset-spatula", "cake-boards", "fondant-ready-to-roll"],
    art: art({ shape: "turntable", backdrop: BACKDROP.sand, body: "#C7C3BC", accent: "#694B3B", label: "", prop: "none" }),
  },
  {
    id: "digital-kitchen-scale",
    name: "Precision Kitchen Scale",
    category: "tools",
    headline: "Baking is chemistry. Weigh it.",
    summary: "Slim digital scale reading to 1 g, up to 5 kg.",
    description:
      "A slim digital scale with tare function, accurate to 1 g. Weighing beats cups for consistent results.",
    usage: "Place bowl, press tare, then add each ingredient in turn.",
    attributes: [
      { label: "Capacity", value: "5 kg × 1 g (demo spec)" },
      { label: "Power", value: "2 × AAA batteries" },
      { label: "Surface", value: "Tempered glass" },
    ],
    options: [{ name: "Finish", values: ["Espresso", "Ivory"] }],
    variants: [
      v("TLS-SCALE-ESP", { Finish: "Espresso" }, 5990, 8),
      v("TLS-SCALE-IVY", { Finish: "Ivory" }, 5990, 12),
    ],
    featured: false,
    related: ["superfine-cake-flour", "unbleached-bread-flour", "balloon-whisk"],
    art: art({ shape: "scale", backdrop: BACKDROP.stone, body: "#2C221E", accent: "#A77953", label: "", prop: "none" }),
  },

  // ───────────────────────── Packaging & Presentation ─────────────────────────
  {
    id: "cake-boards",
    name: "Round Cake Boards",
    category: "packaging",
    headline: "A firm foundation, beautifully finished.",
    summary: "Rigid round boards in gold or white, pack of 5.",
    description:
      "Grease-resistant rigid boards with a foil finish. A sturdy base for layer cakes, tarts and displays.",
    usage: "Choose a board 5 cm wider than your cake for a clean border.",
    attributes: [
      { label: "Pack", value: "5 boards" },
      { label: "Thickness", value: "3 mm (demo spec)" },
      { label: "Finish", value: "Foil-laminated" },
    ],
    options: [
      { name: "Finish", values: ["Gold", "White"] },
      { name: "Diameter", values: ["15 cm", "20 cm", "25 cm"] },
    ],
    variants: [
      v("PKG-BOARD-GLD-15", { Finish: "Gold", Diameter: "15 cm" }, 990, 25),
      v("PKG-BOARD-GLD-20", { Finish: "Gold", Diameter: "20 cm" }, 1290, 20),
      v("PKG-BOARD-GLD-25", { Finish: "Gold", Diameter: "25 cm" }, 1590, 10),
      v("PKG-BOARD-WHT-15", { Finish: "White", Diameter: "15 cm" }, 890, 30),
      v("PKG-BOARD-WHT-20", { Finish: "White", Diameter: "20 cm" }, 1190, 18),
      v("PKG-BOARD-WHT-25", { Finish: "White", Diameter: "25 cm" }, 1490, 0),
    ],
    featured: false,
    related: ["kraft-pastry-boxes", "cake-turntable", "satin-ribbon"],
    art: art({ shape: "board", backdrop: BACKDROP.cocoa, body: "#C99A5B", accent: "#EBD3A6", label: "", prop: "none" }),
  },
  {
    id: "kraft-pastry-boxes",
    name: "Windowed Kraft Pastry Boxes",
    category: "packaging",
    headline: "Show it off. Carry it home.",
    summary: "Fold-flat kraft boxes with a clear window, pack of 10.",
    description:
      "Sturdy kraft boxes with a clear window to frame cakes and pastries. Fold flat for storage and assemble in seconds.",
    usage: "Pair with a cake board one size smaller than the box base.",
    attributes: [
      { label: "Pack", value: "10 boxes" },
      { label: "Material", value: "Kraft board, clear window" },
      { label: "Assembly", value: "Fold-and-lock" },
    ],
    options: [{ name: "Size", values: ["10 cm", "15 cm", "20 cm"] }],
    variants: [
      v("PKG-BOX-10", { Size: "10 cm" }, 1590, 20),
      v("PKG-BOX-15", { Size: "15 cm" }, 2190, 14),
      v("PKG-BOX-20", { Size: "20 cm" }, 2790, 8),
    ],
    featured: true,
    related: ["cake-boards", "satin-ribbon", "dessert-cups"],
    art: art({ shape: "box", backdrop: BACKDROP.stone, body: "#C8A27E", accent: "#694B3B", label: "", prop: "none" }),
  },
  {
    id: "dessert-cups",
    name: "Clear Dessert Cups with Lids",
    category: "packaging",
    headline: "Layers deserve to be seen.",
    summary: "Crystal-clear cups for trifles, mousses and parfaits, pack of 25.",
    description:
      "Clear cups with snap-on lids that show off every layer of trifles, mousse cups and puddings.",
    usage: "Chill filled cups before lidding to avoid condensation.",
    attributes: [
      { label: "Pack", value: "25 cups with lids" },
      { label: "Material", value: "Clear PET (demo spec)" },
      { label: "Best for", value: "Mousse, trifle, parfait" },
    ],
    options: [{ name: "Capacity", values: ["120 ml", "200 ml"] }],
    variants: [
      v("PKG-CUP-120", { Capacity: "120 ml" }, 1990, 16),
      v("PKG-CUP-200", { Capacity: "200 ml" }, 2490, 10),
    ],
    featured: false,
    related: ["kraft-pastry-boxes", "dark-couverture-callets", "satin-ribbon"],
    art: art({ shape: "cup", backdrop: BACKDROP.clay, body: "#FFFFFF", accent: "#694B3B", label: "", prop: "none" }),
  },
  {
    id: "satin-ribbon",
    name: "Satin Ribbon, 10 mm",
    category: "packaging",
    headline: "The final, finishing loop.",
    summary: "Double-faced satin ribbon, 20 m spool.",
    description:
      "A soft, double-faced satin ribbon for tying boxes, wrapping boards and finishing gifts.",
    usage: "Cut at an angle to prevent fraying.",
    attributes: [
      { label: "Width", value: "10 mm" },
      { label: "Length", value: "20 m spool" },
      { label: "Type", value: "Double-faced satin" },
    ],
    options: [{ name: "Colour", values: ["Ivory", "Cocoa", "Olive", "Copper"] }],
    variants: [
      v("PKG-RIBBON-IVY", { Colour: "Ivory" }, 890, 14),
      v("PKG-RIBBON-COC", { Colour: "Cocoa" }, 890, 9),
      v("PKG-RIBBON-OLV", { Colour: "Olive" }, 890, 6),
      v("PKG-RIBBON-COP", { Colour: "Copper" }, 990, 4),
    ],
    featured: false,
    related: ["kraft-pastry-boxes", "cake-boards", "dessert-cups"],
    art: art({ shape: "ribbon", backdrop: BACKDROP.sand, body: "#A77953", accent: "#694B3B", label: "", prop: "none" }),
  },
];

// ───────────────────────── Indexes & lookups ─────────────────────────

export const PRODUCT_BY_ID: ReadonlyMap<string, Product> = new Map(PRODUCTS.map((p) => [p.id, p]));

export const SKU_INDEX: ReadonlyMap<string, { product: Product; variant: Variant }> = new Map(
  PRODUCTS.flatMap((product) => product.variants.map((variant) => [variant.sku, { product, variant }] as const)),
);

export const CATEGORY_BY_ID: ReadonlyMap<CategoryId, Category> = new Map(CATEGORIES.map((c) => [c.id, c]));

export function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function hasPriceRange(product: Product): boolean {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1;
}

/** First in-stock variant, used for quick-add from product cards. */
export function defaultVariant(product: Product): Variant | undefined {
  return product.variants.find((v) => v.stock > 0);
}

export function variantLabel(variant: Variant): string {
  return Object.values(variant.options).join(" · ");
}

export function findVariant(product: Product, selection: Record<string, string>): Variant | undefined {
  return product.variants.find((v) => product.options.every((o) => v.options[o.name] === selection[o.name]));
}

export function productsInCategory(id: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === id);
}
