import { useLiveQuery } from "@tanstack/react-db";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format-currency";
import { type Currency, userSettingsCollection } from "@/settings/collection";

function useCurrency(): Currency {
  const { data: settings = [] } = useLiveQuery(userSettingsCollection);

  return settings[0]?.currency ?? "EUR";
}

export function useFormatCurrency(): (amount: number) => string {
  const currency = useCurrency();
  return (amount: number) => formatCurrency(amount, currency);
}

export function useFormatCurrencyCompact(): (amount: number) => string {
  const currency = useCurrency();
  return (amount: number) => formatCurrencyCompact(amount, currency);
}
