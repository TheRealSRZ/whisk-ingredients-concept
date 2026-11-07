import { Heart, Plus } from "lucide-react";
import { useRef } from "react";
import { d, gsap } from "../anim/gsap";
import { CATEGORY_BY_ID, defaultVariant, hasPriceRange, lowestPrice, variantLabel } from "../data/products";
import type { Product } from "../data/types";
import { formatRM } from "../lib/money";
import { href } from "../state/router";
import { useStore } from "../state/store";
import { ArtFrame } from "./ProductArt";
import { useCartFeedback } from "./useCartFeedback";

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const { wishlist, toggleWishlist, announce } = useStore();
  const feedback = useCartFeedback();
  const quickRef = useRef<HTMLButtonElement>(null);
  const wished = wishlist.includes(product.id);
  const def = defaultVariant(product);
  const link = href({ name: "product", id: product.id });
  const optionPreview = product.options.map((o) => o.values.join(" · ")).join("  /  ");
  const H = headingLevel === 2 ? "h2" : "h3";
  const singleVariant = product.variants.length === 1;

  const onQuickAdd = () => {
    if (!def) return;
    const ok = feedback(def.sku, 1, product, def);
    if (ok && quickRef.current) {
      gsap.fromTo(quickRef.current, { scale: 0.86 }, { scale: 1, duration: d(0.5), ease: "back.out(3)" });
    }
  };

  return (
    <article className="card" data-reveal data-testid="product-card" data-product-id={product.id}>
      <div className="card__media">
        <a href={link} tabIndex={-1} aria-hidden="true">
          <ArtFrame art={product.art} title={`Illustration: ${product.name}`} decorative />
        </a>
        <button
          type="button"
          className="icon-btn card__wish"
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={() => {
            const added = toggleWishlist(product.id);
            announce(added ? `${product.name} saved to your wishlist.` : `${product.name} removed from your wishlist.`);
          }}
        >
          <Heart size={18} aria-hidden="true" />
        </button>
        <button
          ref={quickRef}
          type="button"
          className="card__quick"
          onClick={onQuickAdd}
          disabled={!def}
          aria-label={
            def
              ? `Add ${product.name}${singleVariant ? "" : `, ${variantLabel(def)}`} to cart`
              : `${product.name} is out of stock`
          }
        >
          <Plus size={16} aria-hidden="true" />
          <span className="card__quick-label">{def ? (singleVariant ? "Add" : `Add ${variantLabel(def)}`) : "Sold out"}</span>
        </button>
      </div>
      <div className="card__body">
        <span className="card__cat">{CATEGORY_BY_ID.get(product.category)?.short}</span>
        <H style={{ margin: 0, font: "inherit" }}>
          <a className="card__name" href={link}>
            {product.name}
          </a>
        </H>
        <span className="card__price">
          {hasPriceRange(product) ? "From " : ""}
          {formatRM(lowestPrice(product))}
        </span>
        <span className="card__variants">{optionPreview}</span>
      </div>
    </article>
  );
}
