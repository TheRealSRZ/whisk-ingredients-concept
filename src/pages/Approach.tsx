import { useRef } from "react";
import { useReveal } from "../anim/useReveal";
import { STORE_FACTS } from "../data/config";
import { PRODUCTS } from "../data/products";

const VARIANT_COUNT = PRODUCTS.reduce((n, p) => n + p.variants.length, 0);

type Status = "verified" | "assumed" | "demo";

const REGISTER: { item: string; detail: string; status: Status; source: string }[] = [
  { item: "Business name", detail: STORE_FACTS.name, status: "verified", source: "Research spreadsheet; matches public map listing" },
  { item: "Category", detail: "Shops", status: "verified", source: "Research spreadsheet" },
  { item: "Telephone", detail: STORE_FACTS.phoneDisplay, status: "verified", source: "Spreadsheet; matches two public listings" },
  { item: "Address", detail: STORE_FACTS.addressLines.join(", "), status: "verified", source: "Public map and directory listings; unit number differs, owner to confirm" },
  { item: "Opening hours", detail: "Mon–Sat 9am–7pm, Sun 9am–5pm", status: "assumed", source: "Crowd-sourced listing; unconfirmed" },
  { item: "Sells baking supplies", detail: "Baking ingredients retail / wholesale", status: "verified", source: "Directory listings" },
  { item: "Decorating, tools, packaging ranges", detail: "Used as collection structure", status: "assumed", source: "Design assumption; not confirmed by any source found" },
  { item: "Products, prices, stock", detail: `${PRODUCTS.length} products, ${VARIANT_COUNT} variants`, status: "demo", source: "Invented for this prototype" },
  { item: "Delivery fees, pickup, payment methods", detail: "Illustrative rules only", status: "demo", source: "Invented for this prototype" },
  { item: "Promo code BAKE10", detail: "10% off merchandise", status: "demo", source: "Invented for this prototype" },
  { item: "Logo and imagery", detail: "Concept wordmark and SVG illustrations", status: "demo", source: "Original to this concept; no official assets used" },
];

const LABEL: Record<Status, string> = { verified: "Found in sources", assumed: "Unconfirmed / assumption", demo: "Demo only" };

export function Approach() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <div ref={root}>
      <div className="container page-head">
        <span className="eyebrow">Our approach</span>
        <h1 id="page-title" tabIndex={-1}>
          A proposal, built to be tried.
        </h1>
        <p className="lede">
          This is an unofficial, interactive concept showing how a premium online storefront could work for {STORE_FACTS.name}. It is
          not affiliated with, endorsed by or operated by the business, and no real orders or payments can be made.
        </p>
      </div>

      <section className="section band--dark" aria-labelledby="principles-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Design principles</span>
              <h2 id="principles-title">What the concept is trying to prove.</h2>
            </div>
          </div>
          <ul className="principles">
            <li data-reveal>
              <h3>Clarity</h3>
              <p>Every size, price and stock level is visible before it reaches the cart, so bakers buy with confidence.</p>
            </li>
            <li data-reveal>
              <h3>Craft</h3>
              <p>Editorial typography and calm pacing treat everyday ingredients with the care of a boutique product.</p>
            </li>
            <li data-reveal>
              <h3>Honesty</h3>
              <p>Demo data is labelled as demo data. Facts about the shop are shown only where a source supports them.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="register-title">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Evidence register</span>
              <h2 id="register-title">What's real and what's demo.</h2>
            </div>
          </div>
          <div className="table-wrap" data-reveal>
            <table className="evidence-table" data-testid="evidence-table">
              <caption className="visually-hidden">Business facts, assumptions and demonstration data used in this concept</caption>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Used in concept</th>
                  <th scope="col">Status</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {REGISTER.map((r) => (
                  <tr key={r.item}>
                    <th scope="row" style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0, color: "var(--ink)", fontSize: "var(--fs-sm)" }}>
                      {r.item}
                    </th>
                    <td>{r.detail}</td>
                    <td>
                      <span className={`status-pill status-pill--${r.status}`}>{LABEL[r.status]}</span>
                    </td>
                    <td className="muted">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section band--cream" aria-labelledby="next-title">
        <div className="container prose">
          <span className="eyebrow">Toward an official site</span>
          <h2 id="next-title" style={{ fontSize: "var(--fs-xl)", marginTop: 0 }}>
            What a real launch would need
          </h2>
          <ul>
            <li>The owner's permission, brand assets and real product photography.</li>
            <li>Real catalogue data: products, prices, stock and halal or allergen information from the business.</li>
            <li>A licensed Malaysian payment provider, with payment confirmed server-side.</li>
            <li>Server-side validation, order storage, staff tools and confirmation emails.</li>
            <li>Delivery, pickup, returns and privacy policies written with the business, including PDPA obligations.</li>
            <li>Accessibility and performance testing on real devices before launch.</li>
          </ul>
          <p className="small muted">
            Every interaction in this prototype runs in your browser. Your cart and wishlist may be saved in this browser's local storage so
            they survive a refresh. Checkout details are kept in memory only and are discarded when you leave the page.
          </p>
        </div>
      </section>
    </div>
  );
}
