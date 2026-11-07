import { Heart } from "lucide-react";
import { useRef } from "react";
import { useReveal } from "../anim/useReveal";
import { PRODUCT_BY_ID } from "../data/products";
import type { Product } from "../data/types";
import { ProductCard } from "../components/ProductCard";
import { useStore } from "../state/store";

export function Wishlist() {
  const { wishlist } = useStore();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, [wishlist.length]);
  const items = wishlist.map((id) => PRODUCT_BY_ID.get(id)).filter((p): p is Product => Boolean(p));
  return (
    <div ref={root}>
      <div className="container page-head">
        <span className="eyebrow">Saved for later</span>
        <h1 id="page-title" tabIndex={-1}>
          Wishlist
        </h1>
        <p className="lede">
          {items.length === 0 ? "Nothing saved yet." : `${items.length} saved ${items.length === 1 ? "product" : "products"}.`} Saved in this
          browser only.
        </p>
      </div>
      <div className="container section--tight">
        {items.length === 0 ? (
          <div className="empty-state" data-testid="wishlist-empty">
            <Heart size={32} aria-hidden="true" />
            <h2>Your wishlist is empty</h2>
            <p>Tap the heart on any product to keep it here while you plan your next bake.</p>
            <a className="btn" href="#shop">
              Browse the shop
            </a>
          </div>
        ) : (
          <div className="product-grid" data-testid="wishlist-grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} headingLevel={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Policies() {
  const sections = [
    {
      title: "Delivery policy",
      body: "Placeholder. The concept uses illustrative delivery fees by zone (Klang Valley, Peninsular Malaysia, Sabah, Sarawak and Labuan) and a free-delivery threshold. These are not the shop's terms. A real policy must come from the business.",
    },
    {
      title: "Store pickup",
      body: "Placeholder. Pickup in Taman Melawati is simulated. Real collection times, ID checks and holding periods must be confirmed with the business.",
    },
    {
      title: "Returns and refunds",
      body: "Placeholder. No real returns policy is stated. Food items often have special rules; the business must define them.",
    },
    {
      title: "Privacy notice",
      body: "Placeholder. This prototype sends nothing to any server. Cart and wishlist may be stored in your browser's local storage. Checkout details stay in memory and are discarded. A live site would need a PDPA-compliant privacy notice written with the business.",
    },
  ];
  return (
    <div>
      <div className="container page-head">
        <span className="demo-tag">Demo placeholder</span>
        <h1 id="page-title" tabIndex={-1}>
          Policies
        </h1>
        <p className="lede">These are placeholders that show where policies would sit. They are not the business's real terms.</p>
      </div>
      <div className="container section--tight">
        <div className="prose">
          {sections.map((s) => (
            <section key={s.title} aria-labelledby={`pol-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
              <h2 id={`pol-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {s.title} <span className="demo-tag" style={{ verticalAlign: "middle" }}>Placeholder</span>
              </h2>
              <p style={{ marginTop: 8 }}>{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="container section">
      <div className="empty-state">
        <h1 id="page-title" tabIndex={-1} style={{ fontSize: "var(--fs-xl)" }}>
          This page isn't part of the concept
        </h1>
        <p>The link may be mistyped, or the product may not exist in the demo catalogue.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <a className="btn" href="#shop">
            Go to the shop
          </a>
          <a className="btn btn--ghost" href="#home">
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
