import { deriveIncome } from "@/components/financial-items/IncomeTemplate";
import { deriveMortgage } from "@/components/financial-items/MortgageTemplate";
import type {
  DerivedAccount,
  FinancialItem,
  FinancialItemData,
  Flow,
} from "@/components/financial-items/types";

/**
 * Derives accounts and flows from financial items for simulation
 */
export function deriveAccountsAndFlows(
  items: FinancialItem<FinancialItemData>[],
): {
  accounts: DerivedAccount[];
  flows: Flow[];
} {
  const allAccounts: DerivedAccount[] = [];
  const allFlows: Flow[] = [];

  for (const item of items) {
    let result: { accounts: DerivedAccount[]; flows: Flow[] };

    switch (item.type) {
      case "income":
        result = deriveIncome(item);
        break;
      case "mortgage":
        result = deriveMortgage(item);
        break;
      default:
        // Skip unknown types for now
        continue;
    }

    allAccounts.push(...result.accounts);
    allFlows.push(...result.flows);
  }

  return {
    accounts: allAccounts,
    flows: allFlows,
  };
}
