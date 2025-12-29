import type { FinancialItem } from "@/financial-items/types";
import type { DerivedAccount, DerivedFlow, DeriveResult } from "./derive-accounts-flows";

/**
 * Derives accounts and flows from an income financial item
 */
export function deriveIncome(item: FinancialItem<"income">): DeriveResult {
  // Generate account ID deterministically (based on financial item ID)
  const incomeAccountId = `income-${item.id}`;

  // Derive income account (no name field needed)
  const incomeAccount: DerivedAccount = {
    id: incomeAccountId,
    type: "income",
    amount: 0, // Starts at 0, grows with income
  };

  // Derive flow
  // Income flows FROM the income account TO the user's target account
  const flow: DerivedFlow = {
    id: `flow-${item.id}`,
    name: item.name,
    priorityOrder: item.priorityOrder,
    schedule: item.schedule,
    sourceAccountId: incomeAccountId, // Derived income account (source of money)
    targetAccountId: item.data.targetAccountId, // User's savings/checking account (where money goes)
    strategy: {
      type: "fixed",
      config: {
        amount: item.data.amount,
      },
    },
    start: item.start,
    end: item.end,
    modifiers: [],
  };

  return {
    accounts: [incomeAccount],
    flows: [flow],
  };
}
