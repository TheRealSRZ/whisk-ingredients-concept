import { useEffect, useState } from "react";
import { CATEGORIES, PRODUCT_BY_ID } from "../data/products";
import type { CategoryId } from "../data/types";

/*
 * Tiny hash router. Route names are plain "#name" values (ASCII letters,
 * digits, hyphens) because the hosted artifact frame only passes simple
 * hashes through. Filters and search terms live in app state, not the URL.
 */

export type Route =
  | { name: "home" }
  | { name: "shop"; category: CategoryId | "all" }
  | { name: "product"; id: string }
  | { name: "collections" }
  | { name: "approach" }
  | { name: "wishlist" }
  | { name: "checkout" }
  | { name: "order" }
  | { name: "policies" }
  | { name: "not-found"; hash: string };

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function parseHash(raw: string): Route {
  const hash = raw.replace(/^#/, "").trim().toLowerCase();
  if (hash === "" || hash === "home" || hash === "top") return { name: "home" };
  if (hash === "shop") return { name: "shop", category: "all" };
  if (hash.startsWith("shop-")) {
    const cat = hash.slice(5);
    return CATEGORY_IDS.has(cat) ? { name: "shop", category: cat as CategoryId } : { name: "not-found", hash };
  }
  if (hash.startsWith("product-")) {
    const id = hash.slice(8);
    return PRODUCT_BY_ID.has(id) ? { name: "product", id } : { name: "not-found", hash };
  }
  switch (hash) {
    case "collections":
    case "approach":
    case "wishlist":
    case "checkout":
    case "policies":
      return { name: hash };
    case "order-confirmed":
      return { name: "order" };
    default:
      return { name: "not-found", hash };
  }
}

export function href(route: Exclude<Route, { name: "not-found" }>): string {
  switch (route.name) {
    case "home":
      return "#home";
    case "shop":
      return route.category === "all" ? "#shop" : `#shop-${route.category}`;
    case "product":
      return `#product-${route.id}`;
    case "order":
      return "#order-confirmed";
    default:
      return `#${route.name}`;
  }
}

export function navigate(target: string): void {
  if (window.location.hash === target) {
    // Re-selecting the current route: still notify listeners (e.g. reset scroll).
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = target;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
