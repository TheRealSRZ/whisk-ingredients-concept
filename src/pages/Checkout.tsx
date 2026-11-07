import { AlertCircle, ArrowLeft, ArrowRight, Info, Lock, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { d, gsap, useGSAP } from "../anim/gsap";
import { DEMO_CONFIG, MY_STATES, STORE_FACTS, zoneForState, type FulfilmentMethod, type PaymentMethod } from "../data/config";
import { variantLabel } from "../data/products";
import { calculateTotals, generateOrderReference, resolveLines, type DemoOrder, type FulfilmentQuote } from "../lib/cart";
import { formatRM } from "../lib/money";
import { hasErrors, validateCustomer, validateDelivery, type CustomerInfo, type DeliveryInfo } from "../lib/validation";
import { navigate } from "../state/router";
import { useStore } from "../state/store";
import { ArtFrame } from "../components/ProductArt";
import { PromoField } from "../components/PromoField";

type Step = 1 | 2 | 3 | 4;
const STEP_LABELS: Record<Step, string> = { 1: "Details", 2: "Fulfilment", 3: "Payment", 4: "Review" };

interface Draft {
  customer: CustomerInfo;
  fulfilment: FulfilmentMethod | "";
  delivery: DeliveryInfo;
  payment: PaymentMethod | "";
  acknowledged: boolean;
}
const EMPTY_DRAFT: Draft = {
  customer: { name: "", email: "", phone: "" },
  fulfilment: "",
  delivery: { address: "", city: "", state: "", postcode: "", notes: "" },
  payment: "",
  acknowledged: false,
};

// In-memory only: survives moving between pages, never written to storage, gone on refresh.
let memoryDraft: Draft = EMPTY_DRAFT;

type Errors = Record<string, string>;

function stepErrors(step: Step, draft: Draft): Errors {
  const out: Errors = {};
  if (step === 1) Object.assign(out, validateCustomer(draft.customer));
  if (step === 2) {
    if (!draft.fulfilment) out.fulfilment = "Choose store pickup or local delivery.";
    if (draft.fulfilment === "delivery") Object.assign(out, validateDelivery(draft.delivery));
  }
  if (step === 3) {
    if (!draft.payment) out.payment = "Choose a demo payment method.";
    if (!draft.acknowledged) out.acknowledged = "Confirm that you understand this is a simulation.";
  }
  for (const k of Object.keys(out)) if (!out[k]) delete out[k];
  return out;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email",
  phone: "Phone number",
  fulfilment: "Fulfilment method",
  address: "Street address",
  city: "City",
  state: "State",
  postcode: "Postcode",
  notes: "Delivery notes",
  payment: "Payment method",
  acknowledged: "Simulation acknowledgement",
};

export function Checkout() {
  const { cart, setLastOrder, removeFromCart, removePromo, announce } = useStore();
  const [draft, setDraftState] = useState<Draft>(memoryDraft);
  const [step, setStep] = useState<Step>(1);
  const [maxReached, setMaxReached] = useState<Step>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState<Partial<Record<Step, boolean>>>({});
  const [processing, setProcessing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const firstStepRender = useRef(true);
  const paymentTimer = useRef<number | null>(null);

  // Leaving checkout during the simulated payment cancels it: nothing is "ordered" and the cart is untouched.
  useEffect(
    () => () => {
      if (paymentTimer.current !== null) window.clearTimeout(paymentTimer.current);
    },
    [],
  );

  const setDraft = (update: (d: Draft) => Draft) =>
    setDraftState((prev) => {
      const next = update(prev);
      memoryDraft = next;
      return next;
    });

  // Live re-validation once a step has been attempted.
  useEffect(() => {
    if (attempted[step]) setErrors(stepErrors(step, draft));
  }, [draft, step, attempted]);

  useGSAP(
    () => {
      if (firstStepRender.current) {
        firstStepRender.current = false;
        return;
      }
      gsap.fromTo(".form-step", { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: d(0.45) });
    },
    { dependencies: [step], scope: formRef },
  );

  const lines = resolveLines(cart);
  const quote: FulfilmentQuote = useMemo(() => {
    if (draft.fulfilment === "pickup") return { method: "pickup" };
    if (draft.fulfilment === "delivery" && draft.delivery.state) return { method: "delivery", state: draft.delivery.state };
    return { method: "estimate" };
  }, [draft.fulfilment, draft.delivery.state]);
  const totals = calculateTotals(cart, quote);

  const goTo = (target: Step) => {
    setStep(target);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => document.getElementById("step-heading")?.focus({ preventScroll: true }), 30);
  };

  const focusSummary = () => window.setTimeout(() => summaryRef.current?.focus(), 30);

  const next = () => {
    const errs = stepErrors(step, draft);
    setAttempted((a) => ({ ...a, [step]: true }));
    setErrors(errs);
    if (hasErrors(errs)) {
      announce(`There ${Object.keys(errs).length === 1 ? "is 1 problem" : `are ${Object.keys(errs).length} problems`} to fix.`);
      focusSummary();
      return;
    }
    const target = (step + 1) as Step;
    setMaxReached((m) => (target > m ? target : m));
    goTo(target);
  };

  const placeOrder = () => {
    if (lines.length === 0 || paymentTimer.current !== null) return;
    // Guard: every step must still be valid (e.g. after edits or another tab).
    for (const s of [1, 2, 3] as Step[]) {
      const errs = stepErrors(s, draft);
      if (hasErrors(errs)) {
        setAttempted((a) => ({ ...a, [s]: true }));
        goTo(s);
        window.setTimeout(() => {
          setErrors(errs);
          focusSummary();
        }, 40);
        announce("Some details need attention before the demo order can be placed.");
        return;
      }
    }
    setProcessing(true);
    announce("Simulating payment. No money is moving.");
    const snapshotLines = lines.map((l) => ({
      sku: l.sku,
      name: l.product.name,
      variant: variantLabel(l.variant),
      qty: l.qty,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    }));
    const order: DemoOrder = {
      reference: generateOrderReference(),
      createdAt: new Date().toISOString(),
      lines: snapshotLines,
      totals,
      promoCode: cart.promoCode,
      fulfilment: draft.fulfilment as FulfilmentMethod,
      payment: draft.payment as PaymentMethod,
      customerFirstName: draft.customer.name.trim().split(/\s+/)[0] ?? "",
      status: "Simulated: received by demo only",
    };
    paymentTimer.current = window.setTimeout(() => {
      paymentTimer.current = null;
      setLastOrder(order);
      // Remove only the lines that were ordered.
      for (const l of snapshotLines) removeFromCart(l.sku);
      removePromo();
      memoryDraft = EMPTY_DRAFT;
      navigate("#order-confirmed");
    }, 1400);
  };

  if (processing) {
    return (
      <div className="container">
        <div className="processing" role="status" aria-live="polite" data-testid="processing">
          <div className="spinner" aria-hidden="true" />
          <h1 id="page-title" tabIndex={-1} style={{ fontSize: "var(--fs-xl)" }}>
            Simulating payment…
          </h1>
          <p className="muted">No bank, wallet or card is contacted, and no order is sent to the shop.</p>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state" data-testid="checkout-empty">
          <ShoppingBag size={32} aria-hidden="true" />
          <h1 id="page-title" tabIndex={-1} style={{ fontSize: "var(--fs-xl)" }}>
            Your cart is empty
          </h1>
          <p>Checkout needs at least one item. Add something from the demo catalogue first.</p>
          <a className="btn" href="#shop">
            Browse the shop
          </a>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors);

  return (
    <div className="container checkout">
      <div ref={formRef}>
        <h1 id="page-title" className="visually-hidden" tabIndex={-1}>
          Demo checkout
        </h1>
        <div className="sim-banner" data-testid="sim-banner">
          <Info size={18} aria-hidden="true" />
          <div>
            <strong>Simulated checkout.</strong> Nothing you enter leaves this browser. No order reaches {STORE_FACTS.name}, no payment is
            taken and no email is sent.
          </div>
        </div>

        <ol className="steps" aria-label="Checkout progress">
          {([1, 2, 3, 4] as Step[]).map((s) => {
            const state = s === step ? "current" : s < step || s <= maxReached ? "done" : "todo";
            return (
              <li key={s} data-state={state} aria-current={s === step ? "step" : undefined}>
                {s !== step && s <= maxReached ? (
                  <button type="button" onClick={() => goTo(s)}>
                    {STEP_LABELS[s]}
                  </button>
                ) : (
                  STEP_LABELS[s]
                )}
              </li>
            );
          })}
        </ol>

        <form
          className="form-step"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) next();
            else placeOrder();
          }}
          data-testid={`step-${step}`}
        >
          {errorList.length > 0 && (
            <div className="error-summary" ref={summaryRef} tabIndex={-1} role="alert" data-testid="error-summary">
              <p className="error-summary__title">
                {errorList.length === 1 ? "There is 1 problem" : `There are ${errorList.length} problems`} with this step
              </p>
              <ul>
                {errorList.map(([field, msg]) => (
                  <li key={field}>
                    <a
                      href={`#field-${field}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`field-${field}`)?.focus();
                      }}
                    >
                      {FIELD_LABELS[field] ?? field}: {msg}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <>
              <h2 id="step-heading" tabIndex={-1}>
                Your details
              </h2>
              <div className="form-grid">
                <TextField className="full" id="name" label="Full name" autoComplete="name" value={draft.customer.name} error={errors.name} onChange={(v) => setDraft((d) => ({ ...d, customer: { ...d.customer, name: v } }))} />
                <TextField id="email" label="Email" type="email" autoComplete="email" inputMode="email" value={draft.customer.email} error={errors.email} hint="Used for the demo only. Nothing is sent." onChange={(v) => setDraft((d) => ({ ...d, customer: { ...d.customer, email: v } }))} />
                <TextField id="phone" label="Malaysian phone number" type="tel" autoComplete="tel" inputMode="tel" value={draft.customer.phone} error={errors.phone} hint="e.g. 012-345 6789 or +60 12-345 6789" onChange={(v) => setDraft((d) => ({ ...d, customer: { ...d.customer, phone: v } }))} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 id="step-heading" tabIndex={-1}>
                Pickup or delivery
              </h2>
              <fieldset className="choice-list" aria-describedby={errors.fulfilment ? "err-fulfilment" : undefined}>
                <legend id="field-fulfilment" tabIndex={-1}>
                  How would you like to receive this demo order?
                </legend>
                <Choice name="fulfilment" value="pickup" checked={draft.fulfilment === "pickup"} onChange={() => setDraft((d) => ({ ...d, fulfilment: "pickup" }))} title={DEMO_CONFIG.pickup.label} detail={`${DEMO_CONFIG.pickup.detail} ${STORE_FACTS.addressLines.join(", ")}.`} price="Free" testId="fulfil-pickup" />
                <Choice
                  name="fulfilment"
                  value="delivery"
                  checked={draft.fulfilment === "delivery"}
                  onChange={() => setDraft((d) => ({ ...d, fulfilment: "delivery" }))}
                  title="Local delivery (demo)"
                  detail={`Illustrative rates: Klang Valley ${formatRM(DEMO_CONFIG.delivery.rates["klang-valley"])} (free over ${formatRM(DEMO_CONFIG.delivery.freeThresholdKlangValley)}), Peninsular ${formatRM(DEMO_CONFIG.delivery.rates.peninsular)}, Sabah/Sarawak/Labuan ${formatRM(DEMO_CONFIG.delivery.rates["east-malaysia"])}.`}
                  price={draft.fulfilment === "delivery" && draft.delivery.state ? (totals.delivery === 0 ? "Free" : formatRM(totals.delivery)) : "Rate set by state"}
                  testId="fulfil-delivery"
                />
              </fieldset>
              {errors.fulfilment && <FieldError id="err-fulfilment" message={errors.fulfilment} />}

              {draft.fulfilment === "delivery" && (
                <div className="form-grid" style={{ marginTop: 32 }} data-testid="delivery-fields">
                  <TextField className="full" id="address" label="Street address" autoComplete="street-address" value={draft.delivery.address} error={errors.address} onChange={(v) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, address: v } }))} />
                  <TextField id="city" label="City / town" autoComplete="address-level2" value={draft.delivery.city} error={errors.city} onChange={(v) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, city: v } }))} />
                  <div className="field">
                    <label htmlFor="field-state">State</label>
                    <select
                      id="field-state"
                      autoComplete="address-level1"
                      value={draft.delivery.state}
                      aria-invalid={errors.state ? true : undefined}
                      aria-describedby={errors.state ? "err-state" : "hint-state"}
                      onChange={(e) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, state: e.target.value } }))}
                    >
                      <option value="">Choose a state</option>
                      {MY_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state ? (
                      <FieldError id="err-state" message={errors.state} />
                    ) : (
                      <span id="hint-state" className="field-hint">
                        {draft.delivery.state ? `Zone: ${DEMO_CONFIG.delivery.zoneLabels[zoneForState(draft.delivery.state)]} (demo rate)` : "Sets the demo delivery rate."}
                      </span>
                    )}
                  </div>
                  <TextField id="postcode" label="Postcode" autoComplete="postal-code" inputMode="numeric" maxLength={5} value={draft.delivery.postcode} error={errors.postcode} onChange={(v) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, postcode: v.replace(/[^\d]/g, "") } }))} />
                  <div className="field full">
                    <label htmlFor="field-notes">
                      Delivery notes <span className="optional">(optional)</span>
                    </label>
                    <textarea
                      id="field-notes"
                      maxLength={200}
                      value={draft.delivery.notes}
                      aria-invalid={errors.notes ? true : undefined}
                      aria-describedby="hint-notes"
                      onChange={(e) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, notes: e.target.value } }))}
                    />
                    <span id="hint-notes" className="field-hint">
                      {200 - draft.delivery.notes.length} characters left
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 id="step-heading" tabIndex={-1}>
                Payment <span className="demo-tag" style={{ verticalAlign: "middle" }}>Simulation</span>
              </h2>
              <p className="muted small" style={{ marginBottom: 24, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Lock size={16} aria-hidden="true" style={{ flex: "none", marginTop: 3 }} />
                Choose how the demo should pretend to pay. This prototype never asks for card numbers, CVVs, banking passwords or wallet PINs.
              </p>
              <fieldset className="choice-list" aria-describedby={errors.payment ? "err-payment" : undefined}>
                <legend id="field-payment" tabIndex={-1}>
                  Demo payment method
                </legend>
                {DEMO_CONFIG.payments.map((p) => (
                  <Choice key={p.id} name="payment" value={p.id} checked={draft.payment === p.id} onChange={() => setDraft((d) => ({ ...d, payment: p.id }))} title={p.label} detail={p.detail} testId={`pay-${p.id}`} />
                ))}
              </fieldset>
              {errors.payment && <FieldError id="err-payment" message={errors.payment} />}
              <div className="field" style={{ marginTop: 24 }}>
                <label className="choice" style={{ gridTemplateColumns: "auto 1fr" }} htmlFor="field-acknowledged">
                  <input
                    id="field-acknowledged"
                    type="checkbox"
                    checked={draft.acknowledged}
                    aria-invalid={errors.acknowledged ? true : undefined}
                    aria-describedby={errors.acknowledged ? "err-acknowledged" : undefined}
                    onChange={(e) => setDraft((d) => ({ ...d, acknowledged: e.target.checked }))}
                    data-testid="ack"
                  />
                  <span>
                    <span className="choice__title">I understand this is a simulation</span>
                    <br />
                    <span className="choice__detail">No money will move and no real order will be created.</span>
                  </span>
                </label>
                {errors.acknowledged && <FieldError id="err-acknowledged" message={errors.acknowledged} />}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 id="step-heading" tabIndex={-1}>
                Review your demo order
              </h2>
              <ReviewBlock title="Contact" onEdit={() => goTo(1)}>
                {draft.customer.name}
                <br />
                {draft.customer.email} · {draft.customer.phone}
              </ReviewBlock>
              <ReviewBlock title="Fulfilment" onEdit={() => goTo(2)}>
                {draft.fulfilment === "pickup" ? (
                  <>
                    Store pickup (demo) at {STORE_FACTS.addressLines.join(", ")}
                  </>
                ) : (
                  <>
                    Local delivery (demo) to {draft.delivery.address}, {draft.delivery.postcode} {draft.delivery.city}, {draft.delivery.state}
                    {draft.delivery.notes && (
                      <>
                        <br />
                        Notes: {draft.delivery.notes}
                      </>
                    )}
                  </>
                )}
              </ReviewBlock>
              <ReviewBlock title="Payment" onEdit={() => goTo(3)}>
                {DEMO_CONFIG.payments.find((p) => p.id === draft.payment)?.label ?? "Not chosen"} (simulated)
              </ReviewBlock>
              <ReviewBlock title={`Items (${totals.itemCount})`} onEdit={() => navigate("#shop")} editLabel="Add more">
                <span className="stack-2" data-testid="review-items">
                  {lines.map((l) => (
                    <span key={l.sku} className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                      <span>
                        {l.qty} × {l.product.name} <span className="muted">({variantLabel(l.variant)})</span>
                      </span>
                      <span className="tnum">{formatRM(l.lineTotal)}</span>
                    </span>
                  ))}
                </span>
              </ReviewBlock>
              <dl className="totals" data-testid="review-totals" style={{ marginTop: 16 }}>
                <dt>Subtotal</dt>
                <dd>{formatRM(totals.subtotal)}</dd>
                {totals.discount > 0 && (
                  <>
                    <dt>Discount ({cart.promoCode}, demo)</dt>
                    <dd className="discount">{formatRM(-totals.discount)}</dd>
                  </>
                )}
                <dt>{totals.deliveryLabel}</dt>
                <dd>{totals.delivery === 0 ? "Free" : formatRM(totals.delivery)}</dd>
                <dt className="grand">Total (demo)</dt>
                <dd className="grand" data-testid="review-total">
                  {formatRM(totals.total)}
                </dd>
              </dl>
            </>
          )}

          <div className="form-actions">
            {step > 1 ? (
              <button type="button" className="btn btn--ghost" onClick={() => goTo((step - 1) as Step)} data-testid="step-back">
                <ArrowLeft size={16} aria-hidden="true" /> Back
              </button>
            ) : (
              <a className="btn btn--ghost" href="#shop">
                <ArrowLeft size={16} aria-hidden="true" /> Continue shopping
              </a>
            )}
            <button type="submit" className="btn" data-testid="step-next">
              {step === 1 && (
                <>
                  Continue to fulfilment <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
              {step === 2 && (
                <>
                  Continue to payment <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
              {step === 3 && (
                <>
                  Review order <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
              {step === 4 && <>Place demo order · {formatRM(totals.total)}</>}
            </button>
          </div>
        </form>
      </div>

      <aside className="checkout__summary" aria-labelledby="summary-title" data-testid="checkout-summary">
        <h2 id="summary-title">Order summary</h2>
        <ul className="summary-lines">
          {lines.map((l) => (
            <li key={l.sku} className="summary-line">
              <span className="summary-line__art">
                <ArtFrame art={l.product.art} title="" decorative />
                <span className="summary-line__qty" aria-hidden="true">
                  {l.qty}
                </span>
              </span>
              <span>
                <span className="summary-line__name">{l.product.name}</span>
                <br />
                <span className="summary-line__variant">
                  {variantLabel(l.variant)} · Qty {l.qty} · {formatRM(l.unitPrice)} each
                </span>
              </span>
              <span className="tnum">{formatRM(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <PromoField />
        <dl className="totals" data-testid="summary-totals">
          <dt>Subtotal</dt>
          <dd data-testid="sum-subtotal">{formatRM(totals.subtotal)}</dd>
          {totals.discount > 0 && (
            <>
              <dt>Discount ({cart.promoCode}, demo)</dt>
              <dd className="discount" data-testid="sum-discount">
                {formatRM(-totals.discount)}
              </dd>
            </>
          )}
          <dt>{totals.deliveryLabel}</dt>
          <dd data-testid="sum-delivery">{totals.delivery === 0 ? "Free" : formatRM(totals.delivery)}</dd>
          <dt className="grand">Total</dt>
          <dd className="grand" data-testid="sum-total">
            {formatRM(totals.total)}
          </dd>
        </dl>
        <p className="progress-note">All amounts are demonstration values in Malaysian Ringgit.</p>
      </aside>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  className = "",
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  const fieldId = `field-${id}`;
  const describedBy = [error ? `err-${id}` : null, hint ? `hint-${id}` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        className="input"
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength ?? 120}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required="true"
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && (
        <span id={`hint-${id}`} className="field-hint">
          {hint}
        </span>
      )}
      {error && <FieldError id={`err-${id}`} message={error} />}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="field-error" data-testid="field-error">
      <AlertCircle size={14} aria-hidden="true" />
      {message}
    </span>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  detail,
  price,
  testId,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
  price?: string;
  testId: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label className="choice" htmlFor={id}>
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} data-testid={testId} />
      <span>
        <span className="choice__title">{title}</span>
        <br />
        <span className="choice__detail">{detail}</span>
      </span>
      {price ? <span className="choice__price">{price}</span> : <span />}
    </label>
  );
}

function ReviewBlock({ title, children, onEdit, editLabel = "Edit" }: { title: string; children: ReactNode; onEdit: () => void; editLabel?: string }) {
  return (
    <div className="review-block">
      <h3>{title}</h3>
      <button type="button" className="linkish" onClick={onEdit} data-testid={`edit-${title.split(" ")[0]?.toLowerCase()}`}>
        {editLabel}
        <span className="visually-hidden"> {title.toLowerCase()}</span>
      </button>
      <p>{children}</p>
    </div>
  );
}
