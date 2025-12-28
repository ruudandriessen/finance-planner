import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/collections/financialItems";
import type {
  FinancialItem,
  FinancialItemBase,
} from "@/components/financial-items/types";
import { useSimulation } from "@/hooks/use-simulation";

/**
 * Represents an account to display in the chart
 */
export type ChartAccount = {
  id: string;
  name: string;
  type: "asset" | "liability" | "income" | "expense";
};

/**
 * A single data point for the chart (one month)
 */
export type ChartDataPoint = {
  date: string;
  balances: Record<string, number>;
};

/**
 * Configuration for computing chart values from simulation results
 */
type ChartAccountConfig = {
  account: ChartAccount;
  computeValue: (balances: Record<string, number>) => number;
};

/**
 * Computes chart accounts and value functions for mortgage financial items.
 * Shows equity (house value - remaining debt) instead of separate asset/liability.
 */
function computeMortgageChartAccounts(
  mortgages: FinancialItem<"mortgage">[],
): ChartAccountConfig[] {
  return mortgages.map((item) => {
    const assetId = `asset-${item.id}`;
    const liabilityId = `liability-${item.id}`;

    return {
      account: {
        id: `equity-${item.id}`,
        name: `${item.name} (Equity)`,
        type: "asset" as const,
      },
      computeValue: (balances: Record<string, number>) => {
        const assetValue = balances[assetId] ?? 0;
        const liabilityValue = balances[liabilityId] ?? 0;
        // Equity = house value - debt = assetValue + liabilityValue (liability is negative)
        return assetValue + liabilityValue;
      },
    };
  });
}

/**
 * Computes chart accounts for savings and checking financial items.
 */
function computeAccountItemChartAccounts(
  items: FinancialItemBase[],
): ChartAccountConfig[] {
  return items
    .filter(
      (item) => item.data.type === "savings" || item.data.type === "checking",
    )
    .map((item) => ({
      account: {
        id: item.id,
        name: item.name,
        type: "asset" as const,
      },
      computeValue: (balances: Record<string, number>) => {
        return balances[item.id] ?? 0;
      },
    }));
}

type UseChartAccountsOptions = {
  monthsToSimulate?: number;
  planId?: string;
};

/**
 * Hook that returns chart-ready account data with computed values over time.
 * Uses savings/checking financial items as the account source.
 */
export function useChartAccounts({
  monthsToSimulate = 360,
  planId,
}: UseChartAccountsOptions = {}): {
  accounts: ChartAccount[];
  data: ChartDataPoint[];
} | null {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);
  const simulationResults = useSimulation({ monthsToSimulate, planId });

  if (!simulationResults) {
    return null;
  }

  // Get mortgage financial items
  const mortgages = financialItems.filter(
    (item): item is FinancialItem<"mortgage"> => item.data.type === "mortgage",
  );

  // Collect all chart account configs
  const individualConfigs: ChartAccountConfig[] = [
    ...computeAccountItemChartAccounts(financialItems),
    ...computeMortgageChartAccounts(mortgages),
  ];

  // Add total assets line that sums all individual asset values
  const totalAssetsConfig: ChartAccountConfig = {
    account: {
      id: "total-assets",
      name: "Total Assets",
      type: "asset",
    },
    computeValue: (balances: Record<string, number>) => {
      return individualConfigs.reduce((sum, config) => {
        return sum + config.computeValue(balances);
      }, 0);
    },
  };

  const chartAccountConfigs: ChartAccountConfig[] = [
    ...individualConfigs,
    totalAssetsConfig,
  ];

  if (chartAccountConfigs.length === 0) {
    return null;
  }

  // Extract just the accounts for the chart config
  const chartAccounts = chartAccountConfigs.map((config) => config.account);

  // Compute chart data points
  const chartData = simulationResults.map((result) => {
    const balances: Record<string, number> = {};

    for (const config of chartAccountConfigs) {
      balances[config.account.id] = config.computeValue(result.balances);
    }

    return {
      date: result.date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      balances,
    };
  });

  return {
    accounts: chartAccounts,
    data: chartData,
  };
}
