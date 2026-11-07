import { Check, Heart, ShoppingBag } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { d, gsap, useGSAP } from "../anim/gsap";
import { useReveal } from "../anim/useReveal";
import { CATEGORY_BY_ID, defaultVariant, findVariant, PRODUCT_BY_ID, variantLabel } from "../data/products";
import type { Product as ProductT } from "../data/types";
import { maxQtyFor, qtyInCart } from "../lib/cart";
import { formatRM } from "../lib/money";
import { href } from "../state/router";
import { useStore } from "../state/store";
import { ArtFrame } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { QuantityStepper } from "../components/QuantityStepper";
import { useCartFeedback } from "../components/useCartFeedback";

const VIEWS = ["Packshot", "Detail", "Still life"] as const;

export function Product({ id }: { id: string }) {
  const product = PRODUCT_BY_ID.get(id)!;
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, [id]);
  const cat = CATEGORY_BY_ID.get(product.category)!;
  const related = product.related.map((r) => PRODUCT_BY_ID.get(r)).filter((p): p is ProductT => Boolean(p));

  return (
    <div ref={root}>
      <div className="container" style={{ paddingTop: 24 }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#shop">Shop</a>
            </li>
            <li>
              <a href={href({ name: "shop", category: cat.id })}>{cat.name}</a>
            </li>
            <li>
              <span aria-current="page">{product.name}</span>
            </li>
          </ol>
        </nav>
      </div>
      <div className="container pdp">
        <Gallery product={product} />
        <BuyBox product={product} />
      </div>

      <section className="section band--dark" aria-labelledby="editorial-title">
        <div className="container pdp-editorial">
          <div data-reveal>
            <span className="eyebrow">In the kitchen</span>
            <h2 id="editorial-title">{product.headline}</h2>
            <p>{product.description}</p>
            <p className="usage">{product.usage}</p>
          </div>
          <div data-reveal>
            <ArtFrame art={product.art} view={2} title={`Illustration: ${product.name} styled as a still life`} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="specs-title">
        <div className="container pdp-editorial" style={{ alignItems: "start" }}>
          <div data-reveal>
            <span className="eyebrow">Specifications</span>
            <h2 id="specs-title" style={{ color: "var(--ink)" }}>
              The details
            </h2>
            <p className="small muted">Specifications are illustrative demo values and must be replaced with supplier data.</p>
          </div>
          <dl className="specs" data-reveal>
            <dt>Category</dt>
            <dd>{cat.name}</dd>
            {product.attributes.map((a) => (
              <FragmentRow key={a.label} label={a.label} value={a.value} />
            ))}
            <dt>Options</dt>
            <dd>{product.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join(" · ")}</dd>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section band--cream" aria-labelledby="related-title">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Pairs well with</span>
                <h2 id="related-title">Related products</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FragmentRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function Gallery({ product }: { product: ProductT }) {
  const [view, setView] = useState<0 | 1 | 2>(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      gsap.fromTo(".gallery__frame", { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: d(0.6) });
    },
    { dependencies: [view], scope: mainRef },
  );

  return (
    <div className="gallery" data-testid="gallery">
      <div ref={mainRef} className="gallery__main">
        <div className="gallery__frame">
          <ArtFrame art={product.art} view={view} title={`Illustration of ${product.name}: ${VIEWS[view].toLowerCase()} view`} />
        </div>
      </div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "start" }}>
        <div className="gallery__thumbs" role="group" aria-label="Gallery views">
          {VIEWS.map((label, i) => (
            <button
              key={label}
              type="button"
              className="gallery__thumb"
              aria-pressed={view === i}
              aria-label={`Show ${label.toLowerCase()} view`}
              onClick={() => setView(i as 0 | 1 | 2)}
            >
              <ArtFrame art={product.art} view={i as 0 | 1 | 2} title="" decorative />
            </button>
          ))}
        </div>
        <p className="art-caption" style={{ maxWidth: "24ch", textAlign: "right" }}>
          Illustrative render, not a photograph of actual stock.
        </p>
      </div>
    </div>
  );
}

function BuyBox({ product }: { product: ProductT }) {
  const { cart, wishlist, toggleWishlist, announce } = useStore();
  const feedback = useCartFeedback();
  const initial = defaultVariant(product) ?? product.variants[0]!;
  const [selection, setSelection] = useState<Record<string, string>>(() => ({ ...initial.options }));
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const variant = useMemo(() => findVariant(product, selection), [product, selection]);
  const inCart = variant ? qtyInCart(cart, variant.sku) : 0;
  const available = variant ? Math.max(0, maxQtyFor(variant.sku) - inCart) : 0;
  const wished = wishlist.includes(product.id);
  const qtyValue = Math.min(qty, Math.max(1, available));

  useGSAP(
    () => {
      if (!variant) return;
      gsap.fromTo(".pdp__price", { y: -8, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: d(0.45) });
    },
    { dependencies: [variant?.sku], scope: boxRef },
  );

  const stock = !variant
    ? { cls: "stock--out", text: "Choose an option" }
    : variant.stock === 0
      ? { cls: "stock--out", text: "Out of stock (demo)" }
      : available === 0
        ? { cls: "stock--low", text: `All ${variant.stock} in demo stock are already in your cart` }
        : variant.stock <= 5
          ? { cls: "stock--low", text: `Only ${variant.stock} left in demo stock` }
          : inCart > 0
            ? { cls: "", text: `In demo stock · ${available} more available (${inCart} in your cart)` }
            : { cls: "", text: `In demo stock · ${variant.stock} available` };

  const onAdd = () => {
    if (!variant || available === 0) return;
    const ok = feedback(variant.sku, qtyValue, product, variant);
    if (ok) {
      setJustAdded(true);
      setQty(1);
      window.setTimeout(() => setJustAdded(false), 1800);
      const btn = boxRef.current?.querySelector(".add-btn");
      if (btn) gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: d(0.5), ease: "back.out(3)" });
    }
  };

  return (
    <div ref={boxRef} className="pdp__info" data-testid="buy-box">
      <div className="pdp__title">
        <span className="eyebrow">{CATEGORY_BY_ID.get(product.category)?.name}</span>
        <h1 id="page-title" tabIndex={-1}>
          {product.name}
        </h1>
        <p className="pdp__headline">{product.headline}</p>
      </div>

      <div className="pdp__price-row">
        <span className="pdp__price" data-testid="pdp-price">
          {variant ? formatRM(variant.price) : "Choose an option"}
        </span>
        <span className="demo-tag">Demo price</span>
      </div>
      <span className="pdp__sku" data-testid="pdp-sku">
        SKU {variant?.sku ?? "–"}
      </span>
      <p className="pdp__summary">{product.summary}</p>

      {product.options.map((opt) => (
        <fieldset key={opt.name} className="option-group">
          <legend>
            {opt.name}
            <b>{selection[opt.name]}</b>
          </legend>
          <div className="option-values">
            {opt.values.map((value) => {
              const candidate = findVariant(product, { ...selection, [opt.name]: value });
              const unavailable = !candidate || candidate.stock === 0;
              const inputId = `opt-${product.id}-${opt.name}-${value}`.replace(/[^a-zA-Z0-9-]/g, "");
              return (
                <label key={value} className={`option-pill ${unavailable ? "is-unavailable" : ""}`} htmlFor={inputId}>
                  <input
                    id={inputId}
                    type="radio"
                    name={`${product.id}-${opt.name}`}
                    value={value}
                    checked={selection[opt.name] === value}
                    onChange={() => {
                      setSelection((s) => ({ ...s, [opt.name]: value }));
                      setQty(1);
                      announce(`${opt.name} ${value} selected. ${candidate ? `${formatRM(candidate.price)}${candidate.stock === 0 ? ", out of stock" : ""}` : ""}`);
                    }}
                    data-testid={`option-${opt.name}-${value}`}
                  />
                  <span>
                    {value}
                    {unavailable && <span className="visually-hidden"> (out of stock)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <span className={`stock ${stock.cls}`} data-testid="stock" id="stock-status">
        {stock.text}
      </span>

      <div className="buy-row">
        <QuantityStepper
          id={`qty-${product.id}`}
          label="Quantity"
          value={qtyValue}
          max={Math.max(1, available)}
          onChange={setQty}
          describedBy="stock-status"
        />
        <button
          type="button"
          className="btn add-btn"
          onClick={onAdd}
          disabled={!variant || available === 0}
          data-testid="add-to-cart"
        >
          {justAdded ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
          {justAdded ? "Added" : variant && variant.stock === 0 ? "Out of stock" : `Add to cart · ${variant ? formatRM(variant.price * qtyValue) : ""}`}
        </button>
        <button
          type="button"
          className="btn btn--ghost wish-btn"
          aria-pressed={wished}
          onClick={() => {
            const added = toggleWishlist(product.id);
            announce(added ? `${product.name} saved to your wishlist.` : `${product.name} removed from your wishlist.`);
          }}
          data-testid="pdp-wishlist"
        >
          <Heart size={16} aria-hidden="true" fill={wished ? "currentColor" : "none"} />
          <span className="visually-hidden">{wished ? "Remove from wishlist" : "Save to wishlist"}</span>
          <span className="wish-label" aria-hidden="true">
            {wished ? "Saved to wishlist" : "Save to wishlist"}
          </span>
        </button>
      </div>
      {inCart > 0 && variant && (
        <p className="small muted" data-testid="in-cart-note">
          {inCart} × {variantLabel(variant)} already in your cart.
        </p>
      )}
    </div>
  );
}
