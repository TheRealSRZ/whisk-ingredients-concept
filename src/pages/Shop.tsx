import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { d, gsap, useGSAP } from "../anim/gsap";
import { CATEGORIES, CATEGORY_BY_ID, PRODUCTS } from "../data/products";
import type { CategoryId } from "../data/types";
import { matchesPrice, matchesSearch, PRICE_BANDS, queryCatalogue, SORT_OPTIONS, type PriceBand, type SortKey } from "../lib/catalogue";
import { ProductCard } from "../components/ProductCard";
import { useStore } from "../state/store";
import { navigate } from "../state/router";

export function Shop({ category: routeCategory }: { category: CategoryId | "all" }) {
  const { shopQuery, setShopQuery } = useStore();
  // Optimistic selection: the radio reflects a click immediately, before the hash route catches up.
  const [pending, setPending] = useState<CategoryId | "all" | null>(null);
  useEffect(() => setPending(null), [routeCategory]);
  const category = pending ?? routeCategory;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // The route owns the category; mirror it into store state.
  useEffect(() => {
    setShopQuery({ category: routeCategory });
  }, [routeCategory, setShopQuery]);

  const query = { ...shopQuery, category };
  const results = useMemo(() => queryCatalogue(query), [query.query, query.category, query.price, query.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const resultKey = results.map((p) => p.id).join(",");

  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      const cards = gsap.utils.toArray<HTMLElement>(".card", gridRef.current).slice(0, 12);
      gsap.fromTo(cards, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: d(0.45), stagger: d(0.03), overwrite: true });
    },
    { dependencies: [resultKey], scope: gridRef },
  );

  const categoryCounts = useMemo(() => {
    const base = PRODUCTS.filter((p) => matchesSearch(p, query.query) && matchesPrice(p, query.price));
    const counts = new Map<string, number>([["all", base.length]]);
    for (const c of CATEGORIES) counts.set(c.id, base.filter((p) => p.category === c.id).length);
    return counts;
  }, [query.query, query.price]);

  const setCategory = (id: CategoryId | "all") => {
    setPending(id);
    navigate(id === "all" ? "#shop" : `#shop-${id}`);
  };
  const hasFilters = query.query.trim() !== "" || category !== "all" || query.price !== "any";
  const clearAll = () => {
    setShopQuery({ query: "", price: "any", sort: "featured" });
    if (category !== "all") setCategory("all");
  };
  const cat = category === "all" ? null : CATEGORY_BY_ID.get(category);

  return (
    <div>
      <div className="container page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>{cat ? <a href="#shop">Shop</a> : <span aria-current="page">Shop</span>}</li>
            {cat && (
              <li>
                <span aria-current="page">{cat.name}</span>
              </li>
            )}
          </ol>
        </nav>
        <h1 id="page-title" tabIndex={-1}>
          {cat ? cat.name : "The Shop"}
        </h1>
        <p className="lede">{cat ? cat.intro : "Ingredients, tools and finishing touches, all in one considered catalogue."}</p>
        <p className="xs muted" style={{ marginTop: 12 }}>
          <span className="demo-tag">Demo catalogue</span> Products, prices and stock are fictional examples, not the shop's real inventory.
        </p>
      </div>

      <div className="container shop-layout">
        <aside aria-label="Product filters">
          <button
            type="button"
            className="btn btn--ghost btn--block filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="filters-panel"
            onClick={() => setFiltersOpen((o) => !o)}
            style={{ marginBottom: 16 }}
          >
            <SlidersHorizontal size={16} aria-hidden="true" /> {filtersOpen ? "Hide filters" : "Show filters"}
          </button>
          <div id="filters-panel" className="filters" data-open={filtersOpen}>
            <fieldset>
              <legend>Category</legend>
              {[{ id: "all" as const, name: "All products" }, ...CATEGORIES].map((c) => (
                <label key={c.id} className="radio-row">
                  <input type="radio" name="category" value={c.id} checked={category === c.id} onChange={() => setCategory(c.id)} data-testid={`filter-cat-${c.id}`} />
                  <span>{c.name}</span>
                  <span className="count">{categoryCounts.get(c.id) ?? 0}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Price</legend>
              {PRICE_BANDS.map((b) => (
                <label key={b.id} className="radio-row">
                  <input type="radio" name="price" value={b.id} checked={query.price === b.id} onChange={() => setShopQuery({ price: b.id as PriceBand })} data-testid={`filter-price-${b.id}`} />
                  <span>{b.label}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll} disabled={!hasFilters} data-testid="clear-filters">
              Clear all filters
            </button>
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="visually-hidden">
            Products
          </h2>
          <div className="shop-toolbar">
            <form role="search" className="shop-search" onSubmit={(e) => e.preventDefault()}>
              <Search size={18} aria-hidden="true" />
              <label htmlFor="shop-search" className="visually-hidden">
                Search products by name or description
              </label>
              <input
                id="shop-search"
                type="search"
                placeholder="Search products"
                value={query.query}
                onChange={(e) => setShopQuery({ query: e.target.value.slice(0, 80) })}
                data-testid="shop-search"
              />
              {query.query && (
                <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} aria-label="Clear search" onClick={() => setShopQuery({ query: "" })}>
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </form>
            <div className="field-inline">
              <label htmlFor="sort" className="muted">
                Sort
              </label>
              <select id="sort" className="select" value={query.sort} onChange={(e) => setShopQuery({ sort: e.target.value as SortKey })} data-testid="sort">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="result-count" role="status" aria-live="polite" data-testid="result-count" style={{ marginBottom: 16 }}>
            Showing {results.length} of {PRODUCTS.length} products
          </p>

          {hasFilters && (
            <div className="active-filters">
              {query.query.trim() && (
                <button type="button" className="chip is-active" onClick={() => setShopQuery({ query: "" })}>
                  “{query.query.trim()}” <X size={14} aria-hidden="true" />
                  <span className="visually-hidden">Remove search filter</span>
                </button>
              )}
              {cat && (
                <button type="button" className="chip is-active" onClick={() => setCategory("all")}>
                  {cat.short} <X size={14} aria-hidden="true" />
                  <span className="visually-hidden">Remove category filter</span>
                </button>
              )}
              {query.price !== "any" && (
                <button type="button" className="chip is-active" onClick={() => setShopQuery({ price: "any" })}>
                  {PRICE_BANDS.find((b) => b.id === query.price)?.label} <X size={14} aria-hidden="true" />
                  <span className="visually-hidden">Remove price filter</span>
                </button>
              )}
            </div>
          )}

          <div ref={gridRef}>
            {results.length > 0 ? (
              <div className="product-grid" data-testid="product-grid">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state" data-testid="empty-results">
                <h2>No products match those filters</h2>
                <p>Try a broader search such as “chocolate” or “flour”, or clear the filters to see the full demo catalogue.</p>
                <button type="button" className="btn" onClick={clearAll}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
