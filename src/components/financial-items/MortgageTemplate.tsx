import type { DerivedAccount, FinancialItem, Flow } from "./types";

/**
 * Derives accounts and flows from a mortgage financial item
 */
export function deriveMortgage(item: FinancialItem<"mortgage">): {
  accounts: DerivedAccount[];
  flows: Flow[];
} {
  const {
    interestRate,
    loanAmount,
    loanTermYears,
    paymentType,
    paymentSourceAccountId,
  } = item.data;

  // Generate account IDs deterministically
  const liabilityAccountId = `liability-${item.id}`;
  const expenseAccountId = `expense-${item.id}`;
  const assetAccountId = `asset-${item.id}`;

  // Derive accounts (no name field - not needed for simulation)
  const accounts: DerivedAccount[] = [
    {
      id: liabilityAccountId,
      type: "liability",
      amount: -Math.abs(loanAmount), // Negative for liability
    },
    {
      id: expenseAccountId,
      type: "expense",
      amount: 0,
    },
    {
      id: assetAccountId,
      type: "asset",
      amount: loanAmount, // Property value starts at loan amount
    },
  ];

  // Derive flow
  const flow: Flow = {
    id: `flow-${item.id}`,
    name: item.name,
    priorityOrder: item.priorityOrder,
    schedule: item.schedule,
    sourceAccountId: paymentSourceAccountId, // User's checking account
    targetAccountId: liabilityAccountId, // Payment goes to liability
    strategy: {
      type: "mortgage",
      config: {
        liabilityAccountId,
        interestExpenseAccountId: expenseAccountId,
        assetAccountId,
        paymentType,
        loanTermMonths: loanTermYears * 12,
        originalLoanAmount: loanAmount,
        interestCalculation: {
          type: "FIXED_RATE",
          baseAnnualRate: interestRate,
        },
      },
    },
    start: item.start,
    end: item.end,
    modifiers: [],
  };

  return { accounts, flows: [flow] };
}
