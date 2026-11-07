import { useCallback } from "react";
import { variantLabel } from "../data/products";
import type { Product, Variant } from "../data/types";
import { useStore } from "../state/store";

/** Adds to cart and gives consistent visible + screen-reader feedback for every outcome. */
export function useCartFeedback() {
  const { addToCart, notify, announce, openCart } = useStore();
  return useCallback(
    (sku: string, qty: number, product: Product, variant: Variant): boolean => {
      const label = product.variants.length > 1 ? `${product.name} (${variantLabel(variant)})` : product.name;
      const result = addToCart(sku, qty);
      let message = "";
      switch (result.status) {
        case "added":
          message = `Added ${result.added} × ${label} to your cart.`;
          notify(message, "info", { label: "View cart", onClick: openCart });
          break;
        case "clamped":
          message = `Only ${result.added} more of ${label} could be added: that is all the demo stock.`;
          notify(message, "info", { label: "View cart", onClick: openCart });
          break;
        case "limit-reached":
          message = `Your cart already holds all available demo stock of ${label}.`;
          notify(message, "error");
          break;
        case "out-of-stock":
          message = `${label} is out of stock in this demo.`;
          notify(message, "error");
          break;
        default:
          message = "That item could not be added. Please choose an option and try again.";
          notify(message, "error");
      }
      announce(message);
      return result.added > 0;
    },
    [addToCart, notify, announce, openCart],
  );
}
