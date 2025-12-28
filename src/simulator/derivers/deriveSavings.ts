import type { FinancialItem } from "@/financial-items/types";
import type { DerivedAccount, DeriveResult } from "./derive-accounts-flows";

/**
 * Derives accounts from a savings financial item.
 * Savings accounts are asset accounts with an initial balance.
 */
export function deriveSavings(item: FinancialItem<"savings">): DeriveResult {
  // The account ID is the financial item ID (used for referencing in other items)
  const savingsAccount: DerivedAccount = {
    id: item.id,
    type: "asset",
    amount: item.data.initialBalance,
  };

  return {
    accounts: [savingsAccount],
    flows: [],
  };
}
