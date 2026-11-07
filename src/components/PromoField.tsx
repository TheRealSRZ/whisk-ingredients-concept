import { AlertCircle, Check } from "lucide-react";
import { useId, useState } from "react";
import { DEMO_CONFIG } from "../data/config";
import { useStore } from "../state/store";

const MESSAGES = {
  applied: "BAKE10 applied: 10% off merchandise (demo).",
  "already-applied": "BAKE10 is already applied to this cart.",
  invalid: "That code isn't valid. This demo accepts BAKE10.",
  "empty-code": "Enter a promo code first.",
  "empty-cart": "Add an item before applying a code.",
} as const;

export function PromoField({ compact = false }: { compact?: boolean }) {
  const { cart, applyPromo, removePromo, announce } = useStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const inputId = `promo-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const errorId = `${inputId}-error`;

  if (cart.promoCode) {
    return (
      <div className="promo-applied" data-testid="promo-applied">
        <span className="row" style={{ gap: 8 }}>
          <Check size={16} aria-hidden="true" />
          <span>
            <strong>{cart.promoCode}</strong> applied · {DEMO_CONFIG.promo.percentOff}% off (demo)
          </span>
        </span>
        <button
          type="button"
          className="linkish"
          onClick={() => {
            removePromo();
            announce("Promo code removed.");
          }}
        >
          Remove<span className="visually-hidden"> promo code</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const status = applyPromo(code);
        if (status === "applied") {
          setError(null);
          setCode("");
        } else setError(MESSAGES[status]);
        announce(MESSAGES[status]);
      }}
      noValidate
    >
      <label htmlFor={inputId} className={compact ? "xs muted" : "small"} style={{ fontWeight: 600 }}>
        Promo code <span className="muted" style={{ fontWeight: 400 }}>(try {DEMO_CONFIG.promo.code})</span>
      </label>
      <div className="promo-form" style={{ marginTop: 6 }}>
        <input
          id={inputId}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.slice(0, 20));
            if (error) setError(null);
          }}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          data-testid="promo-input"
        />
        <button type="submit" className="btn btn--ghost btn--sm" data-testid="promo-apply">
          Apply
        </button>
      </div>
      {error && (
        <p id={errorId} className="field-error" data-testid="promo-error" style={{ marginTop: -8, marginBottom: 12 }}>
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </form>
  );
}
