import { CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../anim/gsap";
import { DEMO_CONFIG, STORE_FACTS } from "../data/config";
import { formatRM } from "../lib/money";
import { useStore } from "../state/store";

export function Confirmation() {
  const { lastOrder } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".confirm > *", { autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.7 });
        gsap.from(".confirm__icon", { scale: 0.4, rotation: -30, duration: 0.9, ease: "back.out(2.5)" });
      });
    },
    { scope: ref },
  );

  if (!lastOrder) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h1 id="page-title" tabIndex={-1} style={{ fontSize: "var(--fs-xl)" }}>
            No demo order to show
          </h1>
          <p>Demo orders live in memory only, so they disappear after a refresh. Place a new demo order to see a confirmation.</p>
          <a className="btn" href="#shop">
            Return to shop
          </a>
        </div>
      </div>
    );
  }

  const o = lastOrder;
  const paymentLabel = DEMO_CONFIG.payments.find((p) => p.id === o.payment)?.label ?? "Demo payment";

  return (
    <div ref={ref} className="container">
      <div className="confirm" data-testid="confirmation">
        <CheckCircle2 className="confirm__icon" size={44} strokeWidth={1.4} aria-hidden="true" color="var(--olive)" />
        <div>
          <span className="eyebrow">Demo order complete</span>
          <h1 id="page-title" tabIndex={-1} style={{ marginTop: 12 }}>
            Thank you{o.customerFirstName ? `, ${o.customerFirstName}` : ""}.
          </h1>
          <p className="lede" style={{ marginTop: 16 }}>
            Your simulated order went through the full checkout flow. Nothing was sent to {STORE_FACTS.name}, no payment was taken, and no
            email was sent.
          </p>
        </div>
        <div className="confirm__ref">
          <span className="xs" style={{ letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted-dark)" }}>
            Fictional reference
          </span>
          <strong data-testid="order-ref">{o.reference}</strong>
          <span className="demo-tag" style={{ color: "var(--copper-light)" }}>
            {o.status}
          </span>
        </div>

        <section aria-labelledby="ord-summary">
          <h2 id="ord-summary" style={{ fontSize: "var(--fs-lg)", marginBottom: 16 }}>
            Order summary
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack-3" data-testid="confirm-lines">
            {o.lines.map((l) => (
              <li key={l.sku} className="row" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
                <span>
                  {l.qty} × {l.name} <span className="muted">({l.variant})</span>
                </span>
                <span className="tnum">{formatRM(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals" style={{ marginTop: 16, maxWidth: 420, marginLeft: "auto" }} data-testid="confirm-totals">
            <dt>Subtotal</dt>
            <dd>{formatRM(o.totals.subtotal)}</dd>
            {o.totals.discount > 0 && (
              <>
                <dt>Discount ({o.promoCode}, demo)</dt>
                <dd className="discount">{formatRM(-o.totals.discount)}</dd>
              </>
            )}
            <dt>{o.totals.deliveryLabel}</dt>
            <dd>{o.totals.delivery === 0 ? "Free" : formatRM(o.totals.delivery)}</dd>
            <dt className="grand">Total (demo)</dt>
            <dd className="grand" data-testid="confirm-total">
              {formatRM(o.totals.total)}
            </dd>
          </dl>
        </section>

        <dl className="specs">
          <dt>Fulfilment</dt>
          <dd>{o.fulfilment === "pickup" ? "Store pickup (simulated)" : "Local delivery (simulated)"}</dd>
          <dt>Payment</dt>
          <dd>{paymentLabel} (no money moved)</dd>
          <dt>Placed</dt>
          <dd>{new Date(o.createdAt).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" })}</dd>
        </dl>

        <div className="row">
          <a className="btn" href="#shop" data-testid="return-to-shop">
            Return to shop
          </a>
          <a className="btn btn--ghost" href="#visit">
            Visit the shop
          </a>
        </div>
      </div>
    </div>
  );
}
