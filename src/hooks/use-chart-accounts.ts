import { useLiveQuery } from "@tanstack/react-db";
import { type Account, accountsCollection } from "@/collections/accounts";
import { financialItemsCollection } from "@/collections/financialItems";
import type { FinancialItem } from "@/components/financial-items/types";
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
 * Computes chart accounts for user-created accounts.
 * Liabilities are displayed as positive values.
 */
function computeUserAccountChartAccounts(
  accounts: Array<Account>,
): ChartAccountConfig[] {
  return accounts
    .filter(
      (account) => account.type === "asset" || account.type === "liability",
    )
    .map((account) => ({
      account: {
        id: account.id,
        name: account.name,
        type: account.type,
      },
      computeValue: (balances: Record<string, number>) => {
        const balance = balances[account.id] ?? 0;
        // Show liabilities as positive values
        return account.type === "liability" ? Math.abs(balance) : balance;
      },
    }));
}

/**
 * Hook that returns chart-ready account data with computed values over time.
 * Combines user accounts with derived accounts from financial items.
 */
export function useChartAccounts(monthsToSimulate = 360): {
  accounts: ChartAccount[];
  data: ChartDataPoint[];
} | null {
  const { data: accounts } = useLiveQuery(accountsCollection);
  const { data: financialItems } = useLiveQuery(financialItemsCollection);
  const simulationResults = useSimulation(monthsToSimulate);

  if (!simulationResults || !accounts || accounts.length === 0) {
    return null;
  }

  // Get mortgage financial items
  const mortgages = (financialItems?.filter(
    (item) => item.data.type === "mortgage",
  ) || []) as FinancialItem<"mortgage">[];

  // Collect all chart account configs
  const chartAccountConfigs: ChartAccountConfig[] = [
    ...computeUserAccountChartAccounts(accounts),
    ...computeMortgageChartAccounts(mortgages),
  ];

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
