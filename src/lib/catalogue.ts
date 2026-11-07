import { CATEGORY_BY_ID, lowestPrice, PRODUCTS } from "../data/products";
import type { CategoryId, Product } from "../data/types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";
export type PriceBand = "any" | "under-20" | "20-50" | "50-100" | "over-100";

export const PRICE_BANDS: { id: PriceBand; label: string; min: number; max: number }[] = [
  { id: "any", label: "Any price", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "under-20", label: "Under RM 20", min: 0, max: 1999 },
  { id: "20-50", label: "RM 20 – RM 50", min: 2000, max: 5000 },
  { id: "50-100", label: "RM 50 – RM 100", min: 5001, max: 10000 },
  { id: "over-100", label: "Over RM 100", min: 10001, max: Number.POSITIVE_INFINITY },
];

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name: A to Z" },
];

export interface CatalogueQuery {
  query: string;
  category: CategoryId | "all";
  price: PriceBand;
  sort: SortKey;
}

export const DEFAULT_QUERY: CatalogueQuery = { query: "", category: "all", price: "any", sort: "featured" };

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function searchText(p: Product): string {
  return normalise(
    [
      p.name,
      p.summary,
      p.description,
      CATEGORY_BY_ID.get(p.category)?.name ?? "",
      ...p.options.flatMap((o) => o.values),
    ].join(" "),
  );
}

const SEARCH_INDEX = new Map(PRODUCTS.map((p) => [p.id, searchText(p)]));

export function matchesSearch(p: Product, query: string): boolean {
  const tokens = normalise(query).split(/\s+/).filter(Boolean).slice(0, 8);
  if (tokens.length === 0) return true;
  const haystack = SEARCH_INDEX.get(p.id) ?? searchText(p);
  return tokens.every((t) => haystack.includes(t));
}

export function matchesPrice(p: Product, band: PriceBand): boolean {
  const def = PRICE_BANDS.find((b) => b.id === band);
  if (!def || band === "any") return true;
  return p.variants.some((v) => v.price >= def.min && v.price <= def.max);
}

export function queryCatalogue(q: CatalogueQuery, products: Product[] = PRODUCTS): Product[] {
  const filtered = products.filter(
    (p) => (q.category === "all" || p.category === q.category) && matchesPrice(p, q.price) && matchesSearch(p, q.query),
  );
  const sorted = [...filtered];
  switch (q.sort) {
    case "price-asc":
      sorted.sort((a, b) => lowestPrice(a) - lowestPrice(b) || a.name.localeCompare(b.name));
      break;
    case "price-desc":
      sorted.sort((a, b) => lowestPrice(b) - lowestPrice(a) || a.name.localeCompare(b.name));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }
  return sorted;
}
