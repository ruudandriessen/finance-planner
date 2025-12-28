import type { DerivedAccount, FinancialItem, Flow } from "./types";

/**
 * Derives accounts from a checking financial item.
 * Checking accounts are asset accounts with an initial balance.
 */
export function deriveChecking(item: FinancialItem<"checking">): {
  accounts: DerivedAccount[];
  flows: Flow[];
} {
  // The account ID is the financial item ID (used for referencing in other items)
  const checkingAccount: DerivedAccount = {
    id: item.id,
    type: "asset",
    amount: item.data.initialBalance,
  };

  return {
    accounts: [checkingAccount],
    flows: [],
  };
}
