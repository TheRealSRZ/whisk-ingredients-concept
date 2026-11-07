import { describe, expect, it } from "vitest";
import { CATEGORIES, PRODUCTS, SKU_INDEX } from "../../src/data/products";
import {
  addItem,
  applyPromo,
  calculateTotals,
  cartCount,
  EMPTY_CART,
  generateOrderReference,
  maxQtyFor,
  removeItem,
  removePromo,
  sanitiseCart,
  setQuantity,
} from "../../src/lib/cart";
import { queryCatalogue, DEFAULT_QUERY } from "../../src/lib/catalogue";
import { formatRM, percentOf } from "../../src/lib/money";
import {
  isValidMyPhone,
  isValidPostcode,
  validateCustomer,
  validateDelivery,
} from "../../src/lib/validation";

describe("catalogue data integrity", () => {
  it("has at least 20 products across at least 5 categories", () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(PRODUCTS.map((p) => p.category)).size).toBeGreaterThanOrEqual(5);
    expect(CATEGORIES.length).toBe(5);
  });
  it("uses unique product ids and SKUs, integer prices and stock", () => {
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(PRODUCTS.length);
    const skus = PRODUCTS.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
    for (const p of PRODUCTS)
      for (const v of p.variants) {
        expect(Number.isInteger(v.price)).toBe(true);
        expect(v.price).toBeGreaterThan(0);
        expect(Number.isInteger(v.stock)).toBe(true);
      }
  });
  it("every variant defines every option and related ids exist", () => {
    const ids = new Set(PRODUCTS.map((p) => p.id));
    for (const p of PRODUCTS) {
      for (const v of p.variants) for (const o of p.options) expect(o.values).toContain(v.options[o.name]);
      for (const r of p.related) expect(ids.has(r)).toBe(true);
    }
  });
});

describe("money", () => {
  it("formats integer sen as RM", () => {
    expect(formatRM(12990)).toBe("RM 129.90");
    expect(formatRM(5)).toBe("RM 0.05");
    expect(formatRM(123456789)).toBe("RM 1,234,567.89");
    expect(formatRM(-1200)).toBe("−RM 12.00");
  });
  it("rejects non-integer sen", () => {
    expect(() => formatRM(1.5)).toThrow();
  });
  it("rounds percentages half-up to the sen", () => {
    expect(percentOf(1995, 10)).toBe(200); // 199.5 -> 200
    expect(percentOf(1994, 10)).toBe(199);
    expect(percentOf(0, 10)).toBe(0);
  });
});

describe("cart", () => {
  const sku = "ESS-CAKEFL-1KG"; // RM 6.90, stock 40
  const sku2 = "ESS-CAKEFL-5KG"; // RM 29.90, stock 12

  it("adds and merges the same SKU", () => {
    let s = addItem(EMPTY_CART, sku, 2).state;
    s = addItem(s, sku, 3).state;
    expect(s.lines).toEqual([{ sku, qty: 5 }]);
  });
  it("keeps different variants as distinct lines", () => {
    let s = addItem(EMPTY_CART, sku, 1).state;
    s = addItem(s, sku2, 1).state;
    expect(s.lines.length).toBe(2);
    expect(cartCount(s)).toBe(2);
  });
  it("clamps to demo stock and reports it", () => {
    const r = addItem(EMPTY_CART, "ESS-BKPWD-500G", 10); // stock 4
    expect(r.status).toBe("clamped");
    expect(r.state.lines[0]?.qty).toBe(4);
    const again = addItem(r.state, "ESS-BKPWD-500G", 1);
    expect(again.status).toBe("limit-reached");
    expect(again.state.lines[0]?.qty).toBe(4);
  });
  it("refuses out-of-stock, unknown SKUs and invalid quantities", () => {
    expect(addItem(EMPTY_CART, "CHO-WHITE28-1KG", 1).status).toBe("out-of-stock");
    expect(addItem(EMPTY_CART, "NOPE", 1).status).toBe("unknown-sku");
    expect(addItem(EMPTY_CART, sku, 0).status).toBe("invalid-qty");
    expect(addItem(EMPTY_CART, sku, -2).status).toBe("invalid-qty");
    expect(addItem(EMPTY_CART, sku, 1.5).status).toBe("invalid-qty");
  });
  it("setQuantity clamps between 1 and stock, never negative", () => {
    let s = addItem(EMPTY_CART, sku2, 2).state;
    s = setQuantity(s, sku2, -5);
    expect(s.lines[0]?.qty).toBe(1);
    s = setQuantity(s, sku2, 999);
    expect(s.lines[0]?.qty).toBe(maxQtyFor(sku2));
    expect(setQuantity(s, sku2, Number.NaN)).toBe(s);
  });
  it("removing the last item also clears the promo", () => {
    let s = addItem(EMPTY_CART, sku, 1).state;
    s = applyPromo(s, "bake10").state;
    expect(s.promoCode).toBe("BAKE10");
    s = removeItem(s, sku);
    expect(s).toEqual({ lines: [], promoCode: null });
  });
});

describe("promo code BAKE10", () => {
  const base = addItem(addItem(EMPTY_CART, "CHO-DARK70-1KG", 1).state, "ESS-CAKEFL-1KG", 2).state; // 7990 + 1380 = 9370
  it("applies 10% to merchandise, case-insensitively", () => {
    const r = applyPromo(base, "  bake10 ");
    expect(r.status).toBe("applied");
    const t = calculateTotals(r.state, { method: "pickup" });
    expect(t.subtotal).toBe(9370);
    expect(t.discount).toBe(937);
    expect(t.total).toBe(8433);
  });
  it("prevents duplicate application", () => {
    const once = applyPromo(base, "BAKE10").state;
    const twice = applyPromo(once, "BAKE10");
    expect(twice.status).toBe("already-applied");
    expect(calculateTotals(twice.state, { method: "pickup" }).discount).toBe(937);
  });
  it("rejects invalid codes, empty codes and empty carts", () => {
    expect(applyPromo(base, "BAKE20").status).toBe("invalid");
    expect(applyPromo(base, "   ").status).toBe("empty-code");
    expect(applyPromo(EMPTY_CART, "BAKE10").status).toBe("empty-cart");
  });
  it("can be removed", () => {
    const s = removePromo(applyPromo(base, "BAKE10").state);
    expect(calculateTotals(s, { method: "pickup" }).discount).toBe(0);
  });
});

describe("delivery and totals", () => {
  it("pickup is free", () => {
    const s = addItem(EMPTY_CART, "ESS-CAKEFL-1KG", 1).state;
    expect(calculateTotals(s, { method: "pickup" }).delivery).toBe(0);
  });
  it("charges by zone and frees Klang Valley delivery at RM 150 after discount", () => {
    const small = addItem(EMPTY_CART, "ESS-CAKEFL-1KG", 1).state; // 690
    expect(calculateTotals(small, { method: "delivery", state: "W.P. Kuala Lumpur" }).delivery).toBe(1200);
    expect(calculateTotals(small, { method: "delivery", state: "Johor" }).delivery).toBe(1800);
    expect(calculateTotals(small, { method: "delivery", state: "Sabah" }).delivery).toBe(2800);

    const big = addItem(EMPTY_CART, "CHO-DARK70-2KG5", 1).state; // 18900
    const kv = calculateTotals(big, { method: "delivery", state: "Selangor" });
    expect(kv.delivery).toBe(0);
    expect(kv.freeDeliveryApplied).toBe(true);
    // 16000 subtotal, with BAKE10 -> 14400 < 15000 so delivery is charged again
    const edge = applyPromo(addItem(addItem(EMPTY_CART, "CHO-DARK70-1KG", 2).state, "ESS-ICING-1KG", 0).state, "BAKE10").state;
    const t = calculateTotals(edge, { method: "delivery", state: "Selangor" });
    expect(t.subtotal).toBe(15980);
    expect(t.discount).toBe(1598);
    expect(t.delivery).toBe(1200);
    expect(t.total).toBe(15980 - 1598 + 1200);
    expect(t.amountToFreeDelivery).toBe(15000 - (15980 - 1598));
  });
  it("empty cart totals are all zero", () => {
    const t = calculateTotals(EMPTY_CART, { method: "delivery", state: "Sabah" });
    expect(t).toMatchObject({ subtotal: 0, discount: 0, delivery: 0, total: 0, itemCount: 0 });
  });
});

describe("persistence sanitising", () => {
  it("drops unknown SKUs, invalid quantities and clamps to stock", () => {
    const s = sanitiseCart({
      lines: [
        { sku: "ESS-BKPWD-500G", qty: 50 },
        { sku: "FAKE", qty: 1 },
        { sku: "ESS-CAKEFL-1KG", qty: -3 },
        { sku: "ESS-CAKEFL-1KG", qty: 2 },
        "garbage",
      ],
      promoCode: "BAKE10",
    });
    expect(s.lines).toEqual([
      { sku: "ESS-BKPWD-500G", qty: 4 },
      { sku: "ESS-CAKEFL-1KG", qty: 2 },
    ]);
    expect(s.promoCode).toBe("BAKE10");
    expect(sanitiseCart("nonsense")).toEqual(EMPTY_CART);
    expect(sanitiseCart({ lines: [], promoCode: "BAKE10" })).toEqual(EMPTY_CART);
  });
});

describe("order reference", () => {
  it("is DEMO- plus 8 unambiguous characters", () => {
    const ref = generateOrderReference();
    expect(ref).toMatch(/^DEMO-[A-HJ-NP-Z2-9]{8}$/);
  });
});

describe("validation", () => {
  it("accepts common Malaysian phone formats", () => {
    for (const n of ["012-345 6789", "+6012-3456789", "60123456789", "011-1114 8332", "03-4162 3300", "(03) 4162 3300", "04-123 4567"])
      expect(isValidMyPhone(n), n).toBe(true);
  });
  it("rejects invalid phone numbers", () => {
    for (const n of ["12345", "015-123 4567", "0123", "+44 20 7946 0958", "abc", "012-345 67890"])
      expect(isValidMyPhone(n), n).toBe(false);
  });
  it("validates postcodes", () => {
    expect(isValidPostcode("53100")).toBe(true);
    expect(isValidPostcode("5310")).toBe(false);
    expect(isValidPostcode("00000")).toBe(false);
    expect(isValidPostcode("5310a")).toBe(false);
  });
  it("reports customer errors", () => {
    expect(validateCustomer({ name: "", email: "", phone: "" })).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
    });
    expect(validateCustomer({ name: "Nur Aisyah binti Ahmad", email: "a@b.my", phone: "0123456789" })).toEqual({});
    expect(validateCustomer({ name: "Raj a/l Kumar", email: "raj@example.com", phone: "03-4162 3300" })).toEqual({});
    expect(validateCustomer({ name: "X", email: "bad@", phone: "1" })).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
    });
  });
  it("reports delivery errors", () => {
    const ok = { address: "12 Jalan Bandar 12", city: "Kuala Lumpur", state: "W.P. Kuala Lumpur", postcode: "53100", notes: "" };
    expect(validateDelivery(ok)).toEqual({});
    expect(validateDelivery({ ...ok, postcode: "531" }).postcode).toBeTruthy();
    expect(validateDelivery({ ...ok, state: "Atlantis" }).state).toBeTruthy();
    expect(validateDelivery({ ...ok, address: "" }).address).toBeTruthy();
  });
});

describe("catalogue query", () => {
  it("searches name and description", () => {
    const r = queryCatalogue({ ...DEFAULT_QUERY, query: "couverture" });
    expect(r.length).toBe(3);
    expect(queryCatalogue({ ...DEFAULT_QUERY, query: "zzzz" })).toEqual([]);
  });
  it("filters by category and price, sorts by price", () => {
    const r = queryCatalogue({ ...DEFAULT_QUERY, category: "tools", sort: "price-asc" });
    expect(r.every((p) => p.category === "tools")).toBe(true);
    const lows = r.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect([...lows].sort((a, b) => a - b)).toEqual(lows);
    const cheap = queryCatalogue({ ...DEFAULT_QUERY, price: "over-100" });
    expect(cheap.map((p) => p.id)).toEqual(["dark-couverture-callets"]);
  });
  it("every SKU in the index resolves", () => {
    expect(SKU_INDEX.size).toBe(PRODUCTS.reduce((n, p) => n + p.variants.length, 0));
  });
});
