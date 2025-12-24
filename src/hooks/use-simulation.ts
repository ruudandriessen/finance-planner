import { useLiveQuery } from "@tanstack/react-db";
import { accountsCollection } from "@/collections/accounts";
import { financialItemsCollection } from "@/collections/financialItems";
import { flowsCollection } from "@/collections/flows";
import type { FinancialItem } from "@/components/financial-items/types";
import { deriveAccountsAndFlows } from "@/lib/derive-accounts-flows";
import { runSimulation } from "@/simulate/run";
import type { SimulationResult } from "@/simulate/types";

export function useSimulation(
  monthsToSimulate = 12,
): SimulationResult[] | null {
  // Get both user-created accounts/flows and financial items
  const { data: accounts } = useLiveQuery(accountsCollection);
  const { data: flows } = useLiveQuery(flowsCollection);
  const { data: financialItems } = useLiveQuery(financialItemsCollection);

  // Derive accounts/flows from financial items
  // Filter to only supported types (income, mortgage) for now
  const supportedFinancialItems = (financialItems?.filter(
    (item) => item.type === "income" || item.type === "mortgage",
  ) || []) as Array<FinancialItem<"income"> | FinancialItem<"mortgage">>;

  const derived =
    supportedFinancialItems.length > 0
      ? deriveAccountsAndFlows(supportedFinancialItems)
      : { accounts: [], flows: [] };

  // Convert derived accounts to full Account type (add empty name for type compatibility)
  // The simulation doesn't actually use the name field
  const derivedAccountsWithName = derived.accounts.map((acc) => ({
    ...acc,
    name: "",
  }));

  // Merge user-created accounts with derived accounts
  // User accounts (like "savings", "checking") + derived accounts (from financial items)
  const allAccounts = [...(accounts || []), ...derivedAccountsWithName];

  // Merge user-created flows with derived flows
  // User flows + derived flows (from financial items)
  const allFlows = [...(flows || []), ...derived.flows];

  if (allAccounts.length === 0 || allFlows.length === 0) {
    return null;
  }

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    initialAccounts: allAccounts,
    rules: allFlows,
  });
}
