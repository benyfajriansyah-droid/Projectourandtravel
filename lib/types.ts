export const TRIP_TYPES = ["OPEN_TRIP", "PRIVATE"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const DEPARTURE_STATUSES = [
  "PLANNING",
  "CONFIRMED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type DepartureStatus = (typeof DEPARTURE_STATUSES)[number];

export const COST_CATEGORIES = [
  "TRANSPORT",
  "AKOMODASI",
  "KONSUMSI",
  "GUIDE",
  "TIKET_MASUK",
  "LAINNYA",
] as const;
export type CostCategory = (typeof COST_CATEGORIES)[number];

export const COST_UNITS = ["FLAT", "PER_PAX"] as const;
export type CostUnit = (typeof COST_UNITS)[number];

export const PAYMENT_STATUSES = ["DP", "LUNAS", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const VENDOR_CATEGORIES = [
  "HOTEL",
  "TRANSPORT",
  "KONSUMSI",
  "GUIDE",
  "LAINNYA",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export function isOneOf<T extends readonly string[]>(
  values: T,
  value: string
): value is T[number] {
  return (values as readonly string[]).includes(value);
}
