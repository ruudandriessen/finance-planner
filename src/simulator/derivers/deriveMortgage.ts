import type { FinancialItem } from "@/financial-items/types";
import type {
  DerivedAccount,
  DerivedFlow,
  DeriveResult,
} from "./derive-accounts-flows";

/**
 * Derives accounts and flows from a mortgage financial item
 */
export function deriveMortgage(item: FinancialItem<"mortgage">): DeriveResult {
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

  const flow: DerivedFlow = {
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
