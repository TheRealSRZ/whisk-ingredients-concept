import { ShoppingBag, X } from "lucide-react";
import { useRef, useState } from "react";
import { DEMO_CONFIG } from "../data/config";
import { variantLabel } from "../data/products";
import { calculateTotals, maxQtyFor, resolveLines } from "../lib/cart";
import { formatRM } from "../lib/money";
import { href, navigate } from "../state/router";
import { useStore } from "../state/store";
import { Overlay } from "./Overlay";
import { ArtFrame } from "./ProductArt";
import { PromoField } from "./PromoField";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const { cart, cartOpen, closeCart, setQuantity, removeFromCart, announce } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lines = resolveLines(cart);
  const totals = calculateTotals(cart, { method: "estimate" });
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <Overlay open={cartOpen} onClose={closeCart} side="right" labelledBy="cart-title" initialFocus={closeRef}>
      <div className="panel-head">
        <h2 id="cart-title">
          Your cart <span className="muted small tnum">({totals.itemCount})</span>
        </h2>
        <button ref={closeRef} type="button" className="icon-btn" aria-label="Close cart" onClick={closeCart} data-testid="close-cart">
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="panel-body">
          <div className="empty-state" data-testid="cart-empty" style={{ border: 0, paddingTop: 48 }}>
            <ShoppingBag size={36} aria-hidden="true" />
            <h3 style={{ fontSize: "1.75rem" }}>Your cart is empty</h3>
            <p>Browse couverture, flours, tools and finishing touches. Everything here is demo stock.</p>
            <a
              className="btn"
              href="#shop"
              onClick={() => {
                closeCart();
              }}
            >
              Start shopping
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="panel-body">
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }} data-testid="cart-lines">
              {lines.map((line) => {
                const max = maxQtyFor(line.sku);
                return (
                  <li key={line.sku} className="cart-line" data-testid="cart-line" data-sku={line.sku} style={{ opacity: removing === line.sku ? 0.4 : 1 }}>
                    <a className="cart-line__art" href={href({ name: "product", id: line.product.id })} onClick={closeCart} tabIndex={-1} aria-hidden="true">
                      <ArtFrame art={line.product.art} title="" decorative />
                    </a>
                    <div>
                      <a className="cart-line__name" href={href({ name: "product", id: line.product.id })} onClick={closeCart}>
                        {line.product.name}
                      </a>
                      <div className="cart-line__variant">{variantLabel(line.variant)}</div>
                      <div className="cart-line__unit">{formatRM(line.unitPrice)} each</div>
                      <div className="cart-line__controls">
                        <QuantityStepper
                          id={`qty-${line.sku}`}
                          label={`Quantity for ${line.product.name}, ${variantLabel(line.variant)}`}
                          value={line.qty}
                          max={max}
                          size="sm"
                          onChange={(q) => {
                            setQuantity(line.sku, q);
                            announce(`Quantity updated to ${Math.min(q, max)}.`);
                          }}
                        />
                        <button
                          type="button"
                          className="linkish"
                          data-testid="remove-line"
                          onClick={() => {
                            setRemoving(line.sku);
                            removeFromCart(line.sku);
                            setRemoving(null);
                            announce(`${line.product.name} removed from your cart.`);
                            closeRef.current?.focus();
                          }}
                        >
                          Remove<span className="visually-hidden"> {line.product.name}</span>
                        </button>
                      </div>
                      {line.qty >= max && <p className="xs muted" style={{ marginTop: 6 }}>Maximum demo stock reached.</p>}
                    </div>
                    <div className="cart-line__total" data-testid="line-total">
                      {formatRM(line.lineTotal)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="panel-foot">
            <PromoField compact />
            <dl className="totals" data-testid="drawer-totals">
              <dt>Subtotal</dt>
              <dd data-testid="subtotal">{formatRM(totals.subtotal)}</dd>
              {totals.discount > 0 && (
                <>
                  <dt>Discount ({DEMO_CONFIG.promo.code}, demo)</dt>
                  <dd className="discount" data-testid="discount">
                    {formatRM(-totals.discount)}
                  </dd>
                </>
              )}
              <dt>{totals.deliveryLabel}</dt>
              <dd data-testid="delivery">{totals.delivery === 0 ? "Free" : formatRM(totals.delivery)}</dd>
              <dt className="grand">Estimated total</dt>
              <dd className="grand" data-testid="grand-total">
                {formatRM(totals.total)}
              </dd>
            </dl>
            <p className="progress-note">
              {totals.amountToFreeDelivery > 0
                ? `Add ${formatRM(totals.amountToFreeDelivery)} more for free Klang Valley delivery (demo rule). Store pickup is always free.`
                : "Store pickup is free. Final delivery cost is set at checkout. Demo rates only."}
            </p>
            <div className="drawer-actions">
              <button
                type="button"
                className="btn btn--block"
                data-testid="go-checkout"
                onClick={() => {
                  closeCart();
                  navigate("#checkout");
                }}
              >
                Proceed to checkout
              </button>
              <button type="button" className="btn btn--ghost btn--block" onClick={closeCart}>
                Continue shopping
              </button>
            </div>
          </div>
        </>
      )}
    </Overlay>
  );
}
