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

const MAPS_QUERY = "Whisk Ingredients @ Taman Melawati, 268 Jalan Bandar 12, Taman Melawati, 53100 Kuala Lumpur";

export const STORE_FACTS = {
  name: "Whisk Ingredients @ Taman Melawati",
  /** Source: spreadsheet; matches Waze and CariCari listings. */
  phoneDisplay: "03-4162 3300",
  phoneE164: "+60341623300",
  /** Source: Waze ("268-269 Jalan Bandar 12") and CariCari ("268, G, Jalan Bandar 12, Taman Melawati 53100"). */
  addressLines: ["268–269, Jalan Bandar 12", "Taman Melawati, 53100 Kuala Lumpur"],
  addressShort: "268–269, Jalan Bandar 12, Taman Melawati, 53100 Kuala Lumpur",
  /** Source: Waze listing (crowd-sourced). Day 0 = Sunday. Times are 24h, Malaysia time. */
  hours: [
    { days: "Monday – Saturday", open: "09:00", close: "19:00", dayIdx: [1, 2, 3, 4, 5, 6] },
    { days: "Sunday", open: "09:00", close: "17:00", dayIdx: [0] },
  ],
  hoursNote: "Mon–Sat 9am–7pm · Sun 9am–5pm (per public listing)",
  /** Source: Waze listing (crowd-sourced). */
  amenities: ["Credit cards accepted", "Air-conditioned"],
  category: "Shops (per research spreadsheet)",
  /**
   * Official Google Maps URLs (Maps URLs API, https://developers.google.com/maps/documentation/urls).
   * They open the Google Maps app on phones and maps.google.com on desktop and resolve to the shop's listing.
   */
  maps: {
    search: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`,
    waze: "https://www.waze.com/live-map/directions/whisk-ingredients-@-taman-melawati-jalan-bandar-12-268-269-kuala-lumpur?to=place.w.66650144.666829121.22619741",
  },
} as const;

/** Whether the shop is open now per its listed hours, evaluated in Malaysia time (UTC+8). */
export function openStatus(now: Date = new Date()): { open: boolean; label: string; todayIdx: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const todayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
  const fmt = (hhmm: string) => {
    const h = Number(hhmm.slice(0, 2));
    return `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
  };
  const today = STORE_FACTS.hours.find((h) => (h.dayIdx as readonly number[]).includes(todayIdx));
  if (today && minutes >= toMin(today.open) && minutes < toMin(today.close))
    return { open: true, label: `Open now · closes ${fmt(today.close)}`, todayIdx };
  if (today && minutes < toMin(today.open)) return { open: false, label: `Closed · opens ${fmt(today.open)} today`, todayIdx };
  const tomorrowIdx = (todayIdx + 1) % 7;
  const tomorrow = STORE_FACTS.hours.find((h) => (h.dayIdx as readonly number[]).includes(tomorrowIdx));
  return { open: false, label: tomorrow ? `Closed · opens ${fmt(tomorrow.open)} tomorrow` : "Closed", todayIdx };
}

export const DEMO_NOTICE = "Interactive concept website · Unofficial demonstration · No real orders or payments";

export type FulfilmentMethod = "pickup" | "delivery";
export type PaymentMethod = "demo-banking" | "demo-card";

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
    detail: "Collect at Taman Melawati. Pickup is simulated in this demo.",
  },
  payments: [
    { id: "demo-banking", label: "Demo online banking", detail: "Simulates a bank redirect. No bank is contacted." },
    { id: "demo-card", label: "Demo card payment", detail: "Simulates a card authorisation. No card details are requested." },
  ] satisfies { id: PaymentMethod; label: string; detail: string }[],
  maxLineQuantity: 99,
} as const;
