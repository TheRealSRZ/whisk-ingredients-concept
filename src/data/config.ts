/*
 * Business facts vs. demonstration configuration.
 *
 * STORE_FACTS holds only details that come from the research spreadsheet or
 * that were found in public listings (see docs/BUSINESS_EVIDENCE.md). The
 * owner still needs to confirm them.
 *
 * DEMO_CONFIG is invented for the prototype: delivery fees, the promo code and
 * payment methods are illustrative and are NOT the business's real terms.
 */

export const STORE_FACTS = {
  name: "Whisk Ingredients @ Taman Melawati",
  /** Source: spreadsheet. Also matches public map/directory listings. */
  phoneDisplay: "03-4162 3300",
  phoneE164: "+60341623300",
  /** Source: public listings (Waze / directory). Unit number differs between sources, so it is omitted. */
  addressLines: ["Jalan Bandar 12, Taman Melawati", "53100 Kuala Lumpur"],
  /** Crowd-sourced listing. Unconfirmed. */
  hoursNote: "Listed hours (unconfirmed): Mon–Sat 9am–7pm, Sun 9am–5pm",
  category: "Shops (per research spreadsheet)",
} as const;

export const DEMO_NOTICE = "Interactive concept website · Unofficial demonstration · No real orders or payments";

export type FulfilmentMethod = "pickup" | "delivery";
export type PaymentMethod = "demo-banking" | "demo-ewallet" | "demo-card";

export const MY_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
  "W.P. Labuan",
  "W.P. Putrajaya",
] as const;
export type MyState = (typeof MY_STATES)[number];

const KLANG_VALLEY: ReadonlySet<string> = new Set(["Selangor", "W.P. Kuala Lumpur", "W.P. Putrajaya"]);
const EAST_MALAYSIA: ReadonlySet<string> = new Set(["Sabah", "Sarawak", "W.P. Labuan"]);

export type DeliveryZone = "klang-valley" | "peninsular" | "east-malaysia";

export function zoneForState(state: string): DeliveryZone {
  if (KLANG_VALLEY.has(state)) return "klang-valley";
  if (EAST_MALAYSIA.has(state)) return "east-malaysia";
  return "peninsular";
}

/** All amounts in sen. Illustrative only. */
export const DEMO_CONFIG = {
  promo: {
    code: "BAKE10",
    percentOff: 10,
    label: "Demo code BAKE10: 10% off merchandise",
  },
  delivery: {
    rates: {
      "klang-valley": 1200,
      peninsular: 1800,
      "east-malaysia": 2800,
    } satisfies Record<DeliveryZone, number>,
    /** Klang Valley delivery is free when merchandise after discount reaches this amount. */
    freeThresholdKlangValley: 15000,
    zoneLabels: {
      "klang-valley": "Klang Valley",
      peninsular: "Peninsular Malaysia",
      "east-malaysia": "Sabah, Sarawak & Labuan",
    } satisfies Record<DeliveryZone, string>,
  },
  pickup: {
    label: "Store pickup (demo)",
    detail: "Collect at Taman Melawati. Pickup is simulated in this concept.",
  },
  payments: [
    { id: "demo-banking", label: "Demo online banking", detail: "Simulates a bank redirect. No bank is contacted." },
    { id: "demo-ewallet", label: "Demo e-wallet", detail: "Simulates a QR / wallet approval. No wallet is charged." },
    { id: "demo-card", label: "Demo card payment", detail: "Simulates a card authorisation. No card details are requested." },
  ] satisfies { id: PaymentMethod; label: string; detail: string }[],
  maxLineQuantity: 99,
} as const;
