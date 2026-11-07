import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PRODUCT_BY_ID } from "../data/products";
import {
  addItem as addItemPure,
  applyPromo as applyPromoPure,
  clearCart,
  EMPTY_CART,
  removeItem as removeItemPure,
  removePromo as removePromoPure,
  sanitiseCart,
  setQuantity as setQuantityPure,
  type AddResult,
  type CartState,
  type DemoOrder,
  type PromoStatus,
} from "../lib/cart";
import { DEFAULT_QUERY, type CatalogueQuery } from "../lib/catalogue";

/*
 * One source of truth for shopping state. Cart and wishlist persist to
 * localStorage when the browser allows it. Checkout details and the demo
 * order are kept in memory only and are never written to storage.
 */

const STORAGE_KEY = "whisk-concept:v1";

interface PersistedShape {
  cart: CartState;
  wishlist: string[];
}

function readStorage(): { data: PersistedShape; available: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: { cart: EMPTY_CART, wishlist: [] }, available: true };
    const parsed: unknown = JSON.parse(raw);
    const obj = (parsed && typeof parsed === "object" ? parsed : {}) as { cart?: unknown; wishlist?: unknown };
    const wishlist = Array.isArray(obj.wishlist)
      ? [...new Set(obj.wishlist.filter((id): id is string => typeof id === "string" && PRODUCT_BY_ID.has(id)))]
      : [];
    return { data: { cart: sanitiseCart(obj.cart), wishlist }, available: true };
  } catch {
    return { data: { cart: EMPTY_CART, wishlist: [] }, available: false };
  }
}

export interface Toast {
  id: number;
  message: string;
  tone: "info" | "error";
  action?: { label: string; onClick: () => void };
}

interface StoreValue {
  cart: CartState;
  wishlist: string[];
  persistence: "available" | "unavailable";
  addToCart: (sku: string, qty: number) => AddResult;
  setQuantity: (sku: string, qty: number) => void;
  removeFromCart: (sku: string) => void;
  applyPromo: (code: string) => PromoStatus;
  removePromo: () => void;
  resetCart: () => void;
  toggleWishlist: (productId: string) => boolean;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"], action?: Toast["action"]) => void;
  dismissToast: (id: number) => void;
  announcement: string;
  announce: (message: string) => void;
  lastOrder: DemoOrder | null;
  setLastOrder: (order: DemoOrder | null) => void;
  shopQuery: CatalogueQuery;
  setShopQuery: (update: Partial<CatalogueQuery>) => void;
  cartBump: number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef(readStorage());
  const [cart, setCart] = useState<CartState>(initial.current.data.cart);
  const [wishlist, setWishlist] = useState<string[]>(initial.current.data.wishlist);
  const [persistence, setPersistence] = useState<"available" | "unavailable">(
    initial.current.available ? "available" : "unavailable",
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [lastOrder, setLastOrder] = useState<DemoOrder | null>(null);
  const [shopQuery, setShopQueryState] = useState<CatalogueQuery>(DEFAULT_QUERY);
  const [cartBump, setCartBump] = useState(0);

  // Mirror for synchronous reads inside callbacks (so add/apply can return a status).
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const toastId = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist } satisfies PersistedShape));
    } catch {
      setPersistence("unavailable");
    }
  }, [cart, wishlist]);

  // Keep tabs in sync if the cart changes in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const { data } = readStorage();
      setCart(data.cart);
      setWishlist(data.wishlist);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: CartState) => {
    cartRef.current = next;
    setCart(next);
  }, []);

  const announce = useCallback((message: string) => {
    // Clear first so repeated identical messages are re-announced.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 30);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback<StoreValue["notify"]>(
    (message, tone = "info", action) => {
      toastId.current += 1;
      const id = toastId.current;
      setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const addToCart = useCallback(
    (sku: string, qty: number) => {
      const result = addItemPure(cartRef.current, sku, qty);
      if (result.added > 0) {
        commit(result.state);
        setCartBump((n) => n + 1);
      }
      return result;
    },
    [commit],
  );

  const setQuantity = useCallback((sku: string, qty: number) => commit(setQuantityPure(cartRef.current, sku, qty)), [commit]);
  const removeFromCart = useCallback((sku: string) => commit(removeItemPure(cartRef.current, sku)), [commit]);
  const removePromo = useCallback(() => commit(removePromoPure(cartRef.current)), [commit]);
  const resetCart = useCallback(() => commit(clearCart()), [commit]);

  const applyPromo = useCallback(
    (code: string) => {
      const { state, status } = applyPromoPure(cartRef.current, code);
      if (status === "applied") commit(state);
      return status;
    },
    [commit],
  );

  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;
  /** Returns true when the product was added, false when removed. */
  const toggleWishlist = useCallback((productId: string) => {
    const has = wishlistRef.current.includes(productId);
    const next = has ? wishlistRef.current.filter((id) => id !== productId) : [...wishlistRef.current, productId];
    wishlistRef.current = next;
    setWishlist(next);
    return !has;
  }, []);

  const setShopQuery = useCallback(
    (update: Partial<CatalogueQuery>) => setShopQueryState((q) => ({ ...q, ...update })),
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      persistence,
      addToCart,
      setQuantity,
      removeFromCart,
      applyPromo,
      removePromo,
      resetCart,
      toggleWishlist,
      cartOpen,
      openCart: () => {
        setToasts([]); // toasts would otherwise sit over the drawer's actions on small screens
        setCartOpen(true);
      },
      closeCart: () => setCartOpen(false),
      toasts,
      notify,
      dismissToast,
      announcement,
      announce,
      lastOrder,
      setLastOrder,
      shopQuery,
      setShopQuery,
      cartBump,
    }),
    [
      cart,
      wishlist,
      persistence,
      addToCart,
      setQuantity,
      removeFromCart,
      applyPromo,
      removePromo,
      resetCart,
      toggleWishlist,
      cartOpen,
      toasts,
      notify,
      dismissToast,
      announcement,
      announce,
      lastOrder,
      shopQuery,
      setShopQuery,
      cartBump,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
