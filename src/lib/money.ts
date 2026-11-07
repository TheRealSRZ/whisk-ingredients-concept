/** Money helpers. All values are integer sen; formatting is the only place decimals appear. */

export function assertSen(value: number): number {
  if (!Number.isInteger(value)) throw new Error(`Money must be integer sen, received ${value}`);
  return value;
}

/** Formats integer sen as "RM 1,299.90". Negative values render as "−RM 12.00". */
export function formatRM(sen: number): string {
  assertSen(sen);
  const negative = sen < 0;
  const abs = Math.abs(sen);
  const ringgit = Math.floor(abs / 100);
  const cents = abs % 100;
  const grouped = ringgit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "−" : ""}RM ${grouped}.${cents.toString().padStart(2, "0")}`;
}

/** Percentage of an amount, rounded half-up to the nearest sen. */
export function percentOf(sen: number, percent: number): number {
  assertSen(sen);
  return Math.floor((sen * percent + 50) / 100);
}
