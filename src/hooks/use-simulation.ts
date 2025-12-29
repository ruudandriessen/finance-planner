import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/financial-items/collection";
import { plansCollection } from "@/plans/plans";
import { runSimulation } from "@/simulator/run";
import type { SimulationResult } from "@/simulator/types";

type UseSimulationOptions = {
  monthsToSimulate?: number;
  planId?: string;
};

export function useSimulation({ monthsToSimulate = 12, planId }: UseSimulationOptions = {}):
  | SimulationResult[]
  | null {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const { data: plans = [] } = useLiveQuery(plansCollection);

  const plan = planId ? plans.find((p) => p.id === planId) : undefined;
  const events = plan?.events ?? [];

  return runSimulation({
    monthsToSimulate,
    startDate: new Date(),
    financialItems,
    events,
  });
}
