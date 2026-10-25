const CURRENCY = "INR";
const LOCALE = "en-IN";

export function formatMoney(value: string | number) {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY }).format(Number(value));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}