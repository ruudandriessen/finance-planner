import type { FinancialItem } from "@/financial-items/types";
import type {
  DerivedAccount,
  DerivedFlow,
  DeriveResult,
} from "./derive-accounts-flows";

/**
 * Derives accounts and flows from an expense financial item
 */
export function deriveExpense(item: FinancialItem<"expense">): DeriveResult {
  const expenseAccountId = `expense-${item.id}`;

  const expenseAccount: DerivedAccount = {
    id: expenseAccountId,
    type: "expense",
    amount: 0, // Starts at 0, tracks expense outflow
  };

  // Derive flow
  // Expense flows FROM the user's checking account TO the expense account
  const flow: DerivedFlow = {
    id: `flow-${item.id}`,
    name: item.name,
    priorityOrder: item.priorityOrder,
    schedule: item.schedule,
    sourceAccountId: item.data.sourceAccountId, // User's checking account (where money comes from)
    targetAccountId: expenseAccountId, // Derived expense account (where money goes)
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
    accounts: [expenseAccount],
    flows: [flow],
  };
}
