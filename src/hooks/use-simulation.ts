import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/collections/financialItems";
import { flowsCollection } from "@/collections/flows";
import { deriveAccountsAndFlows } from "@/lib/derive-accounts-flows";
import { runSimulation } from "@/simulate/run";
import type { SimulationResult } from "@/simulate/types";

export function useSimulation(
  monthsToSimulate = 12,
): SimulationResult[] | null {
  const { data: flows } = useLiveQuery(flowsCollection);
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);

  // Derive accounts/flows from financial items
  const derived = deriveAccountsAndFlows(financialItems);

  // Convert derived accounts to full Account type (add empty name for type compatibility)
  // The simulation doesn't actually use the name field
  const derivedAccountsWithName = derived.accounts.map((acc) => ({
    ...acc,
    name: "",
  }));

  // Merge user-created flows with derived flows
  const allFlows = [...(flows ?? []), ...derived.flows];

  if (derivedAccountsWithName.length === 0 || allFlows.length === 0) {
    return null;
  }

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    initialAccounts: derivedAccountsWithName,
    rules: allFlows,
  });
}
