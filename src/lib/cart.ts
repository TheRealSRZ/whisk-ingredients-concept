import { DEMO_CONFIG, zoneForState, type FulfilmentMethod, type PaymentMethod } from "../data/config";
import { SKU_INDEX } from "../data/products";
import type { Product, Variant } from "../data/types";
import { percentOf } from "./money";

/*
 * Pure, testable shopping-cart logic. The React store wraps these functions;
 * nothing here touches the DOM, storage or the network.
 */

export interface CartLine {
  sku: string;
  qty: number;
}

export interface CartState {
  lines: CartLine[];
  promoCode: string | null;
}

export const EMPTY_CART: CartState = { lines: [], promoCode: null };

export type AddStatus = "added" | "clamped" | "out-of-stock" | "limit-reached" | "unknown-sku" | "invalid-qty";

export interface AddResult {
  state: CartState;
  status: AddStatus;
  /** Units actually added. */
  added: number;
}

export function isValidQty(qty: unknown): qty is number {
  return typeof qty === "number" && Number.isInteger(qty) && qty >= 1;
}

/** Highest quantity allowed for one cart line of this SKU (demo stock and a sanity cap). */
export function maxQtyFor(sku: string): number {
  const entry = SKU_INDEX.get(sku);
  if (!entry) return 0;
  return Math.max(0, Math.min(entry.variant.stock, DEMO_CONFIG.maxLineQuantity));
}

export function qtyInCart(state: CartState, sku: string): number {
  return state.lines.find((l) => l.sku === sku)?.qty ?? 0;
}

/** Adds units of a SKU, merging with an existing line and clamping to demo stock. */
export function addItem(state: CartState, sku: string, qty: number): AddResult {
  if (!SKU_INDEX.has(sku)) return { state, status: "unknown-sku", added: 0 };
  if (!isValidQty(qty)) return { state, status: "invalid-qty", added: 0 };
  const max = maxQtyFor(sku);
  if (max === 0) return { state, status: "out-of-stock", added: 0 };
  const current = qtyInCart(state, sku);
  if (current >= max) return { state, status: "limit-reached", added: 0 };
  const next = Math.min(current + qty, max);
  const added = next - current;
  const lines =
    current > 0
      ? state.lines.map((l) => (l.sku === sku ? { ...l, qty: next } : l))
      : [...state.lines, { sku, qty: next }];
  return { state: { ...state, lines }, status: added < qty ? "clamped" : "added", added };
}

/** Sets an exact quantity, clamped to 1..max. Non-integers and unknown SKUs leave the cart unchanged. */
export function setQuantity(state: CartState, sku: string, qty: number): CartState {
  if (!Number.isFinite(qty) || !state.lines.some((l) => l.sku === sku)) return state;
  const max = maxQtyFor(sku);
  const clamped = Math.min(Math.max(1, Math.trunc(qty)), Math.max(1, max));
  return { ...state, lines: state.lines.map((l) => (l.sku === sku ? { ...l, qty: clamped } : l)) };
}

export function removeItem(state: CartState, sku: string): CartState {
  const lines = state.lines.filter((l) => l.sku !== sku);
  return { lines, promoCode: lines.length === 0 ? null : state.promoCode };
}

export function clearCart(): CartState {
  return { lines: [], promoCode: null };
}

export function cartCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.qty, 0);
}

export type PromoStatus = "applied" | "already-applied" | "invalid" | "empty-code" | "empty-cart";

export function normalisePromo(code: string): string {
  return code.trim().toUpperCase();
}

export function applyPromo(state: CartState, code: string): { state: CartState; status: PromoStatus } {
  const normalised = normalisePromo(code);
  if (!normalised) return { state, status: "empty-code" };
  if (state.lines.length === 0) return { state, status: "empty-cart" };
  if (normalised !== DEMO_CONFIG.promo.code) return { state, status: "invalid" };
  if (state.promoCode === normalised) return { state, status: "already-applied" };
  return { state: { ...state, promoCode: normalised }, status: "applied" };
}

export function removePromo(state: CartState): CartState {
  return { ...state, promoCode: null };
}

export interface ResolvedLine {
  sku: string;
  qty: number;
  product: Product;
  variant: Variant;
  unitPrice: number;
  lineTotal: number;
}

export function resolveLines(state: CartState): ResolvedLine[] {
  return state.lines.flatMap((line) => {
    const entry = SKU_INDEX.get(line.sku);
    if (!entry) return [];
    return [
      {
        sku: line.sku,
        qty: line.qty,
        product: entry.product,
        variant: entry.variant,
        unitPrice: entry.variant.price,
        lineTotal: entry.variant.price * line.qty,
      },
    ];
  });
}

export type FulfilmentQuote =
  | { method: "pickup" }
  | { method: "delivery"; state: string }
  /** Cart drawer estimate before an address is known: assumes Klang Valley delivery. */
  | { method: "estimate" };

export interface Totals {
  itemCount: number;
  subtotal: number;
  discount: number;
  merchandiseAfterDiscount: number;
  delivery: number;
  deliveryLabel: string;
  freeDeliveryApplied: boolean;
  /** How much more merchandise unlocks free Klang Valley delivery (0 if already free or N/A). */
  amountToFreeDelivery: number;
  total: number;
}

export function calculateSubtotal(state: CartState): number {
  return resolveLines(state).reduce((sum, l) => sum + l.lineTotal, 0);
}

export function calculateDiscount(subtotal: number, promoCode: string | null): number {
  if (promoCode !== DEMO_CONFIG.promo.code || subtotal <= 0) return 0;
  return Math.min(subtotal, percentOf(subtotal, DEMO_CONFIG.promo.percentOff));
}

export function calculateDelivery(
  merchandiseAfterDiscount: number,
  quote: FulfilmentQuote,
): { amount: number; label: string; free: boolean; toFree: number } {
  const { rates, freeThresholdKlangValley, zoneLabels } = DEMO_CONFIG.delivery;
  if (merchandiseAfterDiscount <= 0) return { amount: 0, label: "Delivery", free: false, toFree: 0 };
  if (quote.method === "pickup") return { amount: 0, label: "Store pickup (demo)", free: true, toFree: 0 };
  const zone = quote.method === "estimate" ? "klang-valley" : zoneForState(quote.state);
  const label =
    quote.method === "estimate" ? "Delivery estimate (Klang Valley)" : `Delivery: ${zoneLabels[zone]}`;
  if (zone === "klang-valley") {
    if (merchandiseAfterDiscount >= freeThresholdKlangValley) return { amount: 0, label, free: true, toFree: 0 };
    return { amount: rates[zone], label, free: false, toFree: freeThresholdKlangValley - merchandiseAfterDiscount };
  }
  return { amount: rates[zone], label, free: false, toFree: 0 };
}

export function calculateTotals(state: CartState, quote: FulfilmentQuote): Totals {
  const subtotal = calculateSubtotal(state);
  const discount = calculateDiscount(subtotal, state.promoCode);
  const merchandiseAfterDiscount = subtotal - discount;
  const delivery = calculateDelivery(merchandiseAfterDiscount, quote);
  const total = Math.max(0, merchandiseAfterDiscount + delivery.amount);
  return {
    itemCount: cartCount(state),
    subtotal,
    discount,
    merchandiseAfterDiscount,
    delivery: delivery.amount,
    deliveryLabel: delivery.label,
    freeDeliveryApplied: delivery.free,
    amountToFreeDelivery: delivery.toFree,
    total,
  };
}

/**
 * Validates untrusted persisted data (localStorage) back into a safe cart:
 * unknown SKUs are dropped, quantities are clamped to stock, duplicates merge.
 */
export function sanitiseCart(raw: unknown): CartState {
  if (!raw || typeof raw !== "object") return EMPTY_CART;
  const candidate = raw as { lines?: unknown; promoCode?: unknown };
  let state: CartState = EMPTY_CART;
  if (Array.isArray(candidate.lines)) {
    for (const item of candidate.lines.slice(0, 100)) {
      if (!item || typeof item !== "object") continue;
      const { sku, qty } = item as { sku?: unknown; qty?: unknown };
      if (typeof sku !== "string" || !isValidQty(qty)) continue;
      state = addItem(state, sku, qty).state;
    }
  }
  if (typeof candidate.promoCode === "string" && state.lines.length > 0) {
    state = applyPromo(state, candidate.promoCode).state;
  }
  return state;
}

// ───────────────────────── Simulated order ─────────────────────────

export interface DemoOrder {
  reference: string;
  createdAt: string;
  lines: { sku: string; name: string; variant: string; qty: number; unitPrice: number; lineTotal: number }[];
  totals: Totals;
  promoCode: string | null;
  fulfilment: FulfilmentMethod;
  payment: PaymentMethod;
  customerFirstName: string;
  status: "Simulated: received by demo only";
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderReference(randomInt: (max: number) => number = secureRandomInt): string {
  let ref = "";
  for (let i = 0; i < 8; i += 1) ref += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `DEMO-${ref}`;
}

function secureRandomInt(max: number): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return (buf[0] ?? 0) % max;
}
