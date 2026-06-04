import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const TZ = process.env.DEFAULT_TZ ?? "Asia/Kuala_Lumpur";
export const LOCALE = process.env.DEFAULT_LOCALE ?? "en-MY";
export const CURRENCY = process.env.DEFAULT_CURRENCY ?? "MYR";

const myrFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "RM 0.00";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "RM 0.00";
  return myrFormatter.format(n).replace(/^MYR\s?/, "RM ");
}

export function formatDate(d: Date | string | number, pattern = "dd/MM/yyyy"): string {
  return formatInTimeZone(new Date(d), TZ, pattern);
}

export function formatDateTime(d: Date | string | number): string {
  return formatInTimeZone(new Date(d), TZ, "dd/MM/yyyy HH:mm");
}

export function nowInTZ(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
}

export function invoiceNumber(year: number, sequence: number): string {
  return `OMG-INV-${year}-${String(sequence).padStart(5, "0")}`;
}
