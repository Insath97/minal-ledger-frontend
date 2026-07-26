import { CURRENCY_SYMBOLS } from "@/lib/constants";
import type { Currency } from "@/types";

interface CurrencyDisplayProps {
  amount: number;
  currency?: Currency;
  showCents?: boolean;
}

export function CurrencyDisplay({ amount, currency = "USD", showCents = true }: CurrencyDisplayProps) {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  const formatted = showCents
    ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString("en-US");

  return (
    <span>
      {symbol}{formatted}
    </span>
  );
}
