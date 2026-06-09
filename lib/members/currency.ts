import type { PaymentCurrency } from "./types";

export const PAYMENT_CURRENCIES: { value: PaymentCurrency; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "IRR", label: "Toman" },
];

export function formatPayment(
  amount: number | null | undefined,
  currency: PaymentCurrency | null | undefined
): string {
  if (amount == null || !currency) return "—";
  const formatted = amount.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (currency === "USD") return `$${formatted}`;
  if (currency === "GBP") return `£${formatted}`;
  return `${formatted} Toman`;
}
