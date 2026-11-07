import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
  id: string;
  size?: "md" | "sm";
  describedBy?: string;
}

/** Accessible quantity control: buttons plus a typed field, always clamped to min..max. */
export function QuantityStepper({ value, min = 1, max, onChange, label, id, size = "md", describedBy }: Props) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const upper = Math.max(min, max);
  const lowerFirst = label.charAt(0).toLowerCase() + label.slice(1);

  const commit = (raw: string) => {
    const n = Number(raw.trim());
    if (raw.trim() === "" || !Number.isInteger(n)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(upper, Math.max(min, n));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className={`stepper ${size === "sm" ? "stepper--sm" : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${lowerFirst}`}>
        <Minus size={size === "sm" ? 14 : 16} aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={upper}
        step={1}
        value={draft}
        aria-label={label}
        aria-describedby={describedBy}
        onChange={(e) => setDraft(e.target.value.slice(0, 5))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit((e.target as HTMLInputElement).value);
          }
        }}
      />
      <button type="button" onClick={() => onChange(Math.min(upper, value + 1))} disabled={value >= upper} aria-label={`Increase ${lowerFirst}`}>
        <Plus size={size === "sm" ? 14 : 16} aria-hidden="true" />
      </button>
    </div>
  );
}
