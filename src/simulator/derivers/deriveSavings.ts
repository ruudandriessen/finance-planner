import type { FinancialItem } from "@/financial-items/types";
import type { Flow } from "@/flows/flows";
import type { DerivedAccount, DeriveResult } from "./derive-accounts-flows";

/**
 * Derives accounts and flows from a savings financial item.
 * Savings accounts are asset accounts with an initial balance.
 * If an interest rate is specified, an annual interest flow is created.
 */
export function deriveSavings(item: FinancialItem<"savings">): DeriveResult {
  // The account ID is the financial item ID (used for referencing in other items)
  const savingsAccount: DerivedAccount = {
    id: item.id,
    type: "asset",
    amount: item.data.initialBalance,
  };

  const accounts: DerivedAccount[] = [savingsAccount];
  const flows: Flow[] = [];

  // If interest rate is set, create an income account and interest flow
  const interestRate = item.data.interestRate ?? 0;
  if (interestRate > 0) {
    // Create an income account to represent the bank paying interest
    const interestIncomeAccount: DerivedAccount = {
      id: `interest-income-${item.id}`,
      type: "income",
      amount: 0,
    };
    accounts.push(interestIncomeAccount);

    // Create the interest flow (runs monthly to track balance, pays in January)
    const interestFlow: Flow = {
      id: `interest-flow-${item.id}`,
      name: `${item.name} Interest`,
      priorityOrder: item.priorityOrder + 1000, // Run after other flows to capture final balances
      schedule: "monthly", // Must run monthly to track balances
      sourceAccountId: interestIncomeAccount.id,
      targetAccountId: item.id,
      start: item.start,
      end: item.end,
      strategy: {
        type: "savingsInterest",
        config: {
          interestRate,
          savingsAccountId: item.id,
        },
      },
      modifiers: [],
    };
    flows.push(interestFlow);
  }

  return {
    accounts,
    flows,
  };
}
