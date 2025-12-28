import { deriveChecking } from "@/components/financial-items/CheckingTemplate";
import { deriveExpense } from "@/components/financial-items/ExpenseTemplate";
import { deriveIncome } from "@/components/financial-items/IncomeTemplate";
import { deriveMortgage } from "@/components/financial-items/MortgageTemplate";
import { deriveSavings } from "@/components/financial-items/SavingsTemplate";
import type {
  DerivedAccount,
  DeriveResult,
  FinancialItemBase,
  Flow,
} from "@/components/financial-items/types";

/**
 * Derives accounts and flows from a single financial item
 */
function deriveItem(item: FinancialItemBase): DeriveResult | null {
  switch (item.data.type) {
    case "savings":
      return deriveSavings({ ...item, data: item.data });
    case "checking":
      return deriveChecking({ ...item, data: item.data });
    case "income":
      return deriveIncome({ ...item, data: item.data });
    case "mortgage":
      return deriveMortgage({ ...item, data: item.data });
    case "expense":
      return deriveExpense({ ...item, data: item.data });
    default:
      return null;
  }
}

/**
 * Derives accounts and flows from financial items for simulation
 */
export function deriveAccountsAndFlows(
  items: FinancialItemBase[],
): DeriveResult {
  const allAccounts: DerivedAccount[] = [];
  const allFlows: Flow[] = [];

  for (const item of items) {
    const result = deriveItem(item);
    if (!result) continue;

    allAccounts.push(...result.accounts);
    allFlows.push(...result.flows);
  }

  return {
    accounts: allAccounts,
    flows: allFlows,
  };
}
