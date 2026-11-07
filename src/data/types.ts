// Shared domain types. Every price is an integer number of sen (RM 1 = 100 sen)
// so money never passes through floating-point arithmetic.

export type CategoryId = "essentials" | "chocolate" | "decorating" | "tools" | "packaging";

export type ArtShape =
  | "bag"
  | "pouch"
  | "tin"
  | "jar"
  | "bottle"
  | "bar"
  | "spatula"
  | "whisk"
  | "mould"
  | "turntable"
  | "scale"
  | "board"
  | "box"
  | "cup"
  | "ribbon"
  | "leaf"
  | "block";

export type ArtProp = "callets" | "dust" | "sprinkles" | "pearls" | "pod" | "leaf" | "none";

export interface ProductArt {
  shape: ArtShape;
  /** Backdrop tone behind the packshot. */
  backdrop: string;
  /** Main product / packaging colour. */
  body: string;
  /** Accent used on labels, lids, details. */
  accent: string;
  /** Label line printed on the illustrated pack. */
  label: string;
  prop: ArtProp;
}

export interface Variant {
  sku: string;
  /** Option values keyed by option name, e.g. { Size: "1 kg" }. */
  options: Record<string, string>;
  price: number; // sen
  /** Simulated demo stock on hand. */
  stock: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  headline: string;
  summary: string;
  description: string;
  usage: string;
  attributes: { label: string; value: string }[];
  options: ProductOption[];
  variants: Variant[];
  featured: boolean;
  related: string[];
  art: ProductArt;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  intro: string;
  art: ProductArt;
}
