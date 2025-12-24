import { useLiveQuery } from "@tanstack/react-db";
import { accountsCollection } from "@/collections/accounts";
import { flowsCollection } from "@/collections/flows";
import { runSimulation } from "@/simulate/run";
import type { SimulationResult } from "@/simulate/types";

export function useSimulation(
  monthsToSimulate = 12,
): SimulationResult[] | null {
  const { data: accounts } = useLiveQuery(accountsCollection);
  const { data: flows } = useLiveQuery(flowsCollection);

  if (!accounts || !flows) {
    return null;
  }

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    initialAccounts: accounts,
    rules: flows,
  });
}
