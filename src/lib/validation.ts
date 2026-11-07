import { MY_STATES } from "../data/config";

/*
 * Client-side validation for the simulated checkout. In a real store the same
 * rules must be enforced again on the server; browser checks are UX only.
 */

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes: string;
}

const NAME_RE = /^[\p{L}][\p{L}\p{M}\s.'’@/-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

/** Strips spaces, dashes, dots and brackets, and converts +60/60 prefixes to a leading 0. */
export function normaliseMyPhone(input: string): string {
  let digits = input.trim().replace(/[\s\-().]/g, "");
  if (digits.startsWith("+60")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("60") && digits.length >= 11) digits = `0${digits.slice(2)}`;
  return digits;
}

/**
 * Malaysian numbers: mobiles 010–014 and 016–019 (011 numbers carry 8 more digits),
 * landlines 03–09 with 7–8 subscriber digits.
 */
export function isValidMyPhone(input: string): boolean {
  const n = normaliseMyPhone(input);
  if (!/^\d+$/.test(n)) return false;
  if (/^011\d{8}$/.test(n)) return true;
  if (/^01[02346789]\d{7}$/.test(n)) return true;
  if (/^0[3-9]\d{7,8}$/.test(n)) return true;
  return false;
}

export function isValidPostcode(input: string): boolean {
  const pc = input.trim();
  if (!/^\d{5}$/.test(pc)) return false;
  const n = Number(pc);
  return n >= 1000 && n <= 98999;
}

export function isValidEmail(input: string): boolean {
  const email = input.trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function validateCustomer(info: CustomerInfo): FieldErrors<keyof CustomerInfo> {
  const errors: FieldErrors<keyof CustomerInfo> = {};
  const name = info.name.trim();
  if (!name) errors.name = "Enter your full name.";
  else if (name.length < 2) errors.name = "Your name needs at least 2 characters.";
  else if (name.length > 80) errors.name = "Keep your name under 80 characters.";
  else if (!NAME_RE.test(name)) errors.name = "Use letters, spaces and . ' - @ / only.";

  if (!info.email.trim()) errors.email = "Enter your email address.";
  else if (!isValidEmail(info.email)) errors.email = "Enter an email like name@example.com.";

  if (!info.phone.trim()) errors.phone = "Enter a Malaysian phone number.";
  else if (!isValidMyPhone(info.phone))
    errors.phone = "Enter a Malaysian number, e.g. 012-345 6789 or 03-4162 3300.";
  return errors;
}

export function validateDelivery(info: DeliveryInfo): FieldErrors<keyof DeliveryInfo> {
  const errors: FieldErrors<keyof DeliveryInfo> = {};
  const address = info.address.trim();
  if (!address) errors.address = "Enter your street address.";
  else if (address.length < 5) errors.address = "Add a little more detail to your address.";
  else if (address.length > 160) errors.address = "Keep the address under 160 characters.";

  const city = info.city.trim();
  if (!city) errors.city = "Enter your city or town.";
  else if (city.length > 60) errors.city = "Keep the city under 60 characters.";

  if (!info.state) errors.state = "Choose your state.";
  else if (!(MY_STATES as readonly string[]).includes(info.state)) errors.state = "Choose a state from the list.";

  if (!info.postcode.trim()) errors.postcode = "Enter your 5-digit postcode.";
  else if (!isValidPostcode(info.postcode)) errors.postcode = "Postcodes in Malaysia have 5 digits, e.g. 53100.";

  if (info.notes.length > 200) errors.notes = "Keep delivery notes under 200 characters.";
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
