import type { FinancialItemBase } from "@/financial-items/types";
import type { Flow } from "@/flows/flows";
import { deriveChecking } from "./deriveChecking";
import { deriveExpense } from "./deriveExpense";
import { deriveIncome } from "./deriveIncome";
import { deriveInvestment } from "./deriveInvestment";
import { deriveMortgage } from "./deriveMortgage";
import { deriveSavings } from "./deriveSavings";

// Type for derived accounts
export type DerivedAccount = {
  id: string;
  type: "asset" | "liability" | "income" | "expense";
  amount: number;
};

export type DerivedFlow = Flow;

// Result type for derive functions
export interface DeriveResult {
  accounts: DerivedAccount[];
  flows: DerivedFlow[];
}

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
    case "investment":
      return deriveInvestment({ ...item, data: item.data });
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
