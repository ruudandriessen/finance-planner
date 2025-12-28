import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/collections/financialItems";
import { plansCollection } from "@/collections/plans";
import { deriveAccountsAndFlows } from "@/lib/derive-accounts-flows";
import { runSimulation } from "@/simulate/run";
import type { SimulationResult } from "@/simulate/types";

type UseSimulationOptions = {
  monthsToSimulate?: number;
  planId?: string;
};

export function useSimulation({
  monthsToSimulate = 12,
  planId,
}: UseSimulationOptions = {}): SimulationResult[] | null {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const { data: plans = [] } = useLiveQuery(plansCollection);
  const { flows, accounts } = deriveAccountsAndFlows(financialItems);

  const plan = planId ? plans.find((p) => p.id === planId) : undefined;
  const events = plan?.events ?? [];

  if (accounts.length === 0 || flows.length === 0) {
    return null;
  }

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    initialAccounts: accounts,
    rules: flows,
    events,
  });
}
