import type { FinancialItemBase } from "@/financial-items/types";
import type { SimulationResult } from "@/simulator/types";

export type SimulationPreviewPoint = {
  date: Date;
  value: number;
};

export type FinancialItemSimulationPreview = {
  kind: "balance";
  projectedValue: number;
  series: SimulationPreviewPoint[];
};

function supportsBalancePreview(item: FinancialItemBase): boolean {
  return (
    item.data.type === "savings" || item.data.type === "checking" || item.data.type === "investment"
  );
}

export function getFinancialItemSimulationPreview(
  item: FinancialItemBase,
  simulationResults: SimulationResult[] = [],
): FinancialItemSimulationPreview | null {
  if (!supportsBalancePreview(item)) {
    return null;
  }

  if (simulationResults.length === 0) {
    return null;
  }

  const series = simulationResults.map((result) => ({
    date: result.date,
    value: result.balances[item.id] ?? 0,
  }));
  const projectedValue = series.at(-1)?.value ?? 0;

  return {
    kind: "balance",
    projectedValue,
    series,
  };
}
