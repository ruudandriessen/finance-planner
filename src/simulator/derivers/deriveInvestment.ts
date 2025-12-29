import type { FinancialItem } from "@/financial-items/types";
import type { DerivedAccount, DeriveResult } from "./derive-accounts-flows";

/**
 * Derives accounts and flows from an investment financial item.
 * Investment portfolios are asset accounts with compound growth.
 */
export function deriveInvestment(
  item: FinancialItem<"investment">,
): DeriveResult {
  // The investment account itself (asset)
  const investmentAccount: DerivedAccount = {
    id: item.id,
    type: "asset",
    amount: item.data.initialValue,
  };

  // Virtual income account for investment growth
  const growthIncomeAccount: DerivedAccount = {
    id: `${item.id}-growth-income`,
    type: "income",
    amount: 0,
  };

  // Flow: Compound interest growth applied annually
  const growthFlow = {
    id: `${item.id}-growth`,
    name: `${item.name} Growth`,
    priorityOrder: item.priorityOrder,
    schedule: "annually" as const,
    sourceAccountId: `${item.id}-growth-income`,
    targetAccountId: item.id,
    start: item.start,
    end: item.end,
    strategy: {
      type: "compound" as const,
      config: {
        growthRate: item.data.yearlyReturnRate,
      },
    },
    modifiers: [],
  };

  return {
    accounts: [investmentAccount, growthIncomeAccount],
    flows: [growthFlow],
  };
}
