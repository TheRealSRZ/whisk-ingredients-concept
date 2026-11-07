import { Heart, Menu, Search, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { d, gsap, useGSAP } from "../anim/gsap";
import { DEMO_NOTICE, STORE_FACTS } from "../data/config";
import { CATEGORY_BY_ID, hasPriceRange, lowestPrice, PRODUCTS } from "../data/products";
import { cartCount } from "../lib/cart";
import { DEFAULT_QUERY, queryCatalogue } from "../lib/catalogue";
import { formatRM } from "../lib/money";
import { href, navigate, type Route } from "../state/router";
import { useStore } from "../state/store";
import { Overlay } from "./Overlay";
import { ArtFrame } from "./ProductArt";

const NAV: { label: string; to: string; match: Route["name"][] }[] = [
  { label: "Home", to: "#home", match: ["home"] },
  { label: "Shop", to: "#shop", match: ["shop", "product"] },
  { label: "Collections", to: "#collections", match: ["collections"] },
  { label: "Our Approach", to: "#approach", match: ["approach"] },
];

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > threshold));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);
  return scrolled;
}

export function Header({ route }: { route: Route }) {
  const { cart, wishlist, openCart, cartBump } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolled = useScrolled();
  const count = cartCount(cart);
  const overlay = route.name === "home" && !scrolled && !menuOpen;
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Publish the fixed header's real height (the demo notice wraps on small screens).
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--chrome-h", `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close menus whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [route]);

  useGSAP(
    () => {
      if (cartBump === 0 || !badgeRef.current) return;
      gsap.fromTo(badgeRef.current, { scale: 1.7 }, { scale: 1, duration: d(0.6), ease: "back.out(3)" });
    },
    { dependencies: [cartBump], scope: headerRef },
  );

  const isCurrent = (match: Route["name"][]) => match.includes(route.name);

  return (
    <header ref={headerRef} className={`site-header ${overlay ? "is-overlay" : ""}`}>
      <div className="demo-notice" data-testid="demo-notice">
        <span>{DEMO_NOTICE}</span>
        <a href="#approach">About this concept</a>
      </div>
      <div className="header-bar">
        <div className="container header-inner">
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-menu" : undefined}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          <a className="wordmark" href="#home" aria-label="Whisk Ingredients concept, home">
            <span className="wordmark__main">Whisk</span>
            <span className="wordmark__sub">Ingredients · Concept</span>
          </a>
          <nav className="main-nav" aria-label="Main">
            <ul>
              {NAV.map((item) => (
                <li key={item.label}>
                  <a href={item.to} aria-current={isCurrent(item.match) ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <button type="button" className="icon-btn" aria-label="Search products" onClick={() => setSearchOpen(true)} data-testid="open-search">
              <Search size={20} aria-hidden="true" />
            </button>
            <a className="icon-btn hide-xs" href="#wishlist" aria-label={`Wishlist, ${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`} data-testid="wishlist-link">
              <Heart size={20} aria-hidden="true" />
              {wishlist.length > 0 && (
                <span className="count-badge" data-testid="wishlist-count" aria-hidden="true">
                  {wishlist.length}
                </span>
              )}
            </a>
            <button type="button" className="icon-btn" onClick={openCart} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} data-testid="open-cart">
              <ShoppingBag size={20} aria-hidden="true" />
              {count > 0 && (
                <span ref={badgeRef} className="count-badge" data-testid="cart-count" aria-hidden="true">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} route={route} wishlistCount={wishlist.length} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose, route, wishlistCount }: { open: boolean; onClose: () => void; route: Route; wishlistCount: number }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <Overlay open={open} onClose={onClose} side="left" labelledBy="mobile-menu-title" initialFocus={closeRef} className="mobile-menu">
      <div className="panel-head" id="mobile-menu">
        <h2 id="mobile-menu-title" className="serif-italic">Menu</h2>
        <button ref={closeRef} type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="panel-body">
        <nav aria-label="Mobile">
          <ul>
            {NAV.map((item) => (
              <li key={item.label} data-stagger>
                <a href={item.to} aria-current={item.match.includes(route.name) ? "page" : undefined} onClick={onClose}>
                  {item.label}
                </a>
              </li>
            ))}
            <li data-stagger>
              <a href="#wishlist" onClick={onClose}>
                Wishlist ({wishlistCount})
              </a>
            </li>
          </ul>
        </nav>
        <div className="mobile-menu__meta" data-stagger>
          <span className="demo-tag">Concept · Demo</span>
          <span>{STORE_FACTS.name}</span>
          <span>Tel {STORE_FACTS.phoneDisplay}</span>
        </div>
      </div>
    </Overlay>
  );
}

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setShopQuery } = useStore();
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => (term.trim() ? queryCatalogue({ ...DEFAULT_QUERY, query: term }) : []), [term]);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const seeAll = (q: string) => {
    setShopQuery({ ...DEFAULT_QUERY, query: q });
    onClose();
    navigate("#shop");
  };

  return (
    <Overlay open={open} onClose={onClose} side="top" labelledBy="search-title" initialFocus={inputRef} className="search-panel">
      <div className="container">
        <div className="panel-head" style={{ paddingInline: 0 }}>
          <h2 id="search-title" className="eyebrow" style={{ fontSize: "0.75rem" }}>
            Search the demo catalogue
          </h2>
          <button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="panel-body" style={{ paddingInline: 0 }}>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              seeAll(term);
            }}
          >
            <div className="search-field">
              <Search size={24} aria-hidden="true" />
              <label htmlFor="global-search" className="visually-hidden">
                Search products
              </label>
              <input
                ref={inputRef}
                id="global-search"
                type="search"
                autoComplete="off"
                placeholder="Couverture, vanilla, spatula…"
                value={term}
                onChange={(e) => setTerm(e.target.value.slice(0, 80))}
                aria-describedby="search-status"
              />
              <button type="submit" className="btn btn--sm">
                See all
              </button>
            </div>
          </form>
          <p id="search-status" className="small muted" role="status" style={{ marginTop: 12 }}>
            {term.trim() === ""
              ? `Start typing to search ${PRODUCTS.length} demo products.`
              : results.length === 0
                ? `No demo products match “${term.trim()}”. Try “chocolate”, “flour” or “box”.`
                : `${results.length} ${results.length === 1 ? "product matches" : "products match"} “${term.trim()}”.`}
          </p>
          {term.trim() === "" && (
            <div className="search-hints">
              {["Couverture", "Vanilla", "Matcha", "Spatula", "Pastry box"].map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setTerm(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {results.length > 0 && (
            <ul className="search-results">
              {results.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <a className="search-result" href={href({ name: "product", id: p.id })} onClick={onClose}>
                    <span className="search-result__art">
                      <ArtFrame art={p.art} title="" decorative />
                    </span>
                    <span>
                      <span className="search-result__name">{p.name}</span>
                      <br />
                      <span className="search-result__meta">
                        {CATEGORY_BY_ID.get(p.category)?.short} · {hasPriceRange(p) ? "from " : ""}
                        {formatRM(lowestPrice(p))}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {results.length > 6 && (
            <button type="button" className="text-link" style={{ marginTop: 24 }} onClick={() => seeAll(term)}>
              See all {results.length} results <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}
