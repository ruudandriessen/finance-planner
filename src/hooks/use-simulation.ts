import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/collections/financialItems";
import { deriveAccountsAndFlows } from "@/lib/derive-accounts-flows";
import { runSimulation } from "@/simulate/run";
import type { SimulationResult } from "@/simulate/types";

export function useSimulation(
  monthsToSimulate = 12,
): SimulationResult[] | null {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const { flows, accounts } = deriveAccountsAndFlows(financialItems);

  if (accounts.length === 0 || flows.length === 0) {
    return null;
  }

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    initialAccounts: accounts,
    rules: flows,
  });
}
