import { DEMO_NOTICE, STORE_FACTS } from "../data/config";
import { CATEGORIES } from "../data/products";
import { href } from "../state/router";

export function Footer() {
  return (
    <footer className="site-footer" data-testid="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="wordmark">
              <span className="wordmark__main">Whisk</span>
              <span className="wordmark__sub">Ingredients · Concept</span>
            </span>
            <p>
              An unofficial design proposal showing how a premium online storefront could work for {STORE_FACTS.name}. It is not
              affiliated with or endorsed by the business. Catalogue, prices, stock and policies are demonstration data.
            </p>
            <div className="footer-contact" style={{ marginTop: 24 }}>
              <strong>Visit the shop</strong>
              <span>{STORE_FACTS.addressLines.join(", ")}</span>
              <span>
                Tel: {STORE_FACTS.phoneDisplay}
              </span>
              <span>{STORE_FACTS.hoursNote}</span>
              <span className="xs">Contact details come from the research spreadsheet and public listings. Please confirm with the store.</span>
            </div>
          </div>
          <div>
            <h2>Shop</h2>
            <ul>
              <li>
                <a href="#shop">All products</a>
              </li>
              <li>
                <a href="#wishlist">Wishlist</a>
              </li>
              <li>
                <a href="#checkout">Checkout (demo)</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>Collections</h2>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a href={href({ name: "shop", category: c.id })}>{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Concept</h2>
            <ul>
              <li>
                <a href="#approach">Our approach</a>
              </li>
              <li>
                <a href="#policies">Delivery policy (placeholder)</a>
              </li>
              <li>
                <a href="#policies">Returns policy (placeholder)</a>
              </li>
              <li>
                <a href="#policies">Privacy notice (placeholder)</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-legal">
          <span>{DEMO_NOTICE}</span>
          <span>Concept design 2026 · Product imagery is illustrative, not photographs of real stock.</span>
        </div>
      </div>
    </footer>
  );
}
